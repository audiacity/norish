# Norish mobile (parked Expo SDK 56 app)

Lives outside the pnpm workspace; native `ios/` is generated and git-ignored.

## Build

```sh
pnpm install --frozen-lockfile --ignore-scripts      # repo root
pnpm --dir apps/mobile install --ignore-workspace    # this app
cd apps/mobile
npx expo prebuild -p ios --clean
npx expo run:ios                                     # simulator
```

The server must run with `MOBILE_APP_ENABLED=true`.

## Gotchas

- The repo path must not contain spaces: `pod install` and Xcode script phases break.
- `prebuild --clean` wipes `ios/`, so the signing team must be re-selected in Xcode (or let `npx expo run:ios --device` pick it).
- `plugins/pod-deployment-target.js` raises pod targets below iOS 15 to 15.1 (Xcode 27 rejects them; react-native-svg's RNSVGFilters declares 12.4).
- The URL scheme is `norish://`. Never put it in the server's `TRUSTED_ORIGINS`; `MOBILE_APP_ENABLED` handles it.

## Real device with a free Apple ID

1. Open `ios/*.xcworkspace` once, select the app target, Signing & Capabilities: tick "Automatically manage signing", choose your Personal Team (bundle id `eu.audiacity.norish`).
2. On the iPhone enable Developer Mode (Settings > Privacy & Security), then after the first install trust the profile (Settings > General > VPN & Device Management).
3. `npx expo run:ios --device --configuration Release` produces a build that runs without Metro.
4. Free profiles expire after 7 days: re-run the same command to renew; installing over the existing app keeps its data, so do not delete it.

## Disabled features

`expo-widgets` (Live Activity) and the `expo-notifications` config plugin are off. They add the `aps-environment` push entitlement and an App Group, which a free Personal Team cannot sign. Local notifications (cooking timers) still work; Live Activity and remote push do not.
