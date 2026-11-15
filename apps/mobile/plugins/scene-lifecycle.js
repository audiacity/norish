// iOS 27 crashes apps without UIScene lifecycle: move window creation + RN start into a SceneDelegate.
const fs = require("fs");
const path = require("path");
const {
  IOSConfig,
  withInfoPlist,
  withAppDelegate,
  withDangerousMod,
  withXcodeProject,
} = require("expo/config-plugins");

const MARKER = "// scene-lifecycle-plugin";
const OLD = `#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif
`;

const SCENE_DELEGATE = `import UIKit
import React

// Creates the window and starts React Native (moved out of AppDelegate for UIScene lifecycle).
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  private var appDelegate: AppDelegate? { UIApplication.shared.delegate as? AppDelegate }

  func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
    guard let windowScene = scene as? UIWindowScene, let appDelegate else { return }
    let window = UIWindow(windowScene: windowScene)
    self.window = window
    appDelegate.window = window
    // shortcut: launchOptions nil; cold-start links are forwarded below instead, revisit if a module reads launchOptions.
    appDelegate.reactNativeFactory?.startReactNative(withModuleName: "main", in: window, launchOptions: nil)

    // Cold-start links: forward after RN is up (AppDelegate.open already hits Expo subscribers + RCTLinkingManager).
    for context in connectionOptions.urlContexts {
      _ = appDelegate.application(UIApplication.shared, open: context.url, options: [:])
    }
    for activity in connectionOptions.userActivities {
      _ = appDelegate.application(UIApplication.shared, continue: activity, restorationHandler: { _ in })
    }
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    for context in URLContexts {
      _ = appDelegate?.application(UIApplication.shared, open: context.url, options: [:])
    }
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    _ = appDelegate?.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
  }
}
`;

module.exports = (config) => {
  config = withInfoPlist(config, (c) => {
    c.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "Default Configuration",
            UISceneDelegateClassName: "$(PRODUCT_MODULE_NAME).SceneDelegate",
          },
        ],
      },
    };
    return c;
  });

  config = withAppDelegate(config, (c) => {
    if (c.modResults.language !== "swift")
      throw new Error("scene-lifecycle: AppDelegate must be Swift");
    const src = c.modResults.contents;
    if (src.includes(MARKER)) return c;
    if (!src.includes(OLD))
      throw new Error("scene-lifecycle: expected window/startReactNative snippet not found in AppDelegate.swift");
    c.modResults.contents = src.replace(OLD, `    ${MARKER}: window + startReactNative live in SceneDelegate\n`);
    return c;
  });

  config = withDangerousMod(config, [
    "ios",
    (c) => {
      const dir = path.join(c.modRequest.platformProjectRoot, c.modRequest.projectName);
      fs.writeFileSync(path.join(dir, "SceneDelegate.swift"), SCENE_DELEGATE);
      return c;
    },
  ]);

  return withXcodeProject(config, (c) => {
    const name = c.modRequest.projectName;
    const file = `${name}/SceneDelegate.swift`;
    if (!c.modResults.hasFile(file))
      IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
        filepath: file,
        groupName: name,
        project: c.modResults,
      });
    return c;
  });
};
