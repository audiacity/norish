// Xcode 27 rejects pod targets below iOS 15; react-native-svg's RNSVGFilters bundle declares 12.4.
const { withPodfile } = require("expo/config-plugins");

module.exports = (config) =>
  withPodfile(config, (c) => {
    const hook = "post_install do |installer|";
    const src = c.modResults.contents;

    if (src.includes("RNSVGFilters-fix")) return c;
    if (src.split(hook).length !== 2)
      throw new Error(`pod-deployment-target: expected exactly one "${hook}" in Podfile`);

    c.modResults.contents = src.replace(
      hook,
      `${hook}
    # RNSVGFilters-fix
    installer.pods_project.targets.each do |t|
      t.build_configurations.each do |bc|
        bc.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1' if bc.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f < 15.0
      end
    end`
    );
    return c;
  });
