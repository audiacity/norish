# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Domain glossary: `CONTEXT.md`. Decisions: `docs/adr/<area>/`. Setup and gates: `CONTRIBUTING.md`.

## Commands

```sh
pnpm install --frozen-lockfile        # root workspace (apps/mobile is NOT part of it)
pnpm run docker:up                    # Postgres, Valkey, Obscura for local dev
pnpm dev                              # web app + server (turbo watch)
pnpm lint | pnpm typecheck | pnpm test:run | pnpm i18n:check | pnpm build   # the gates
pnpm deps:cycles                      # circular / cross-workspace import check
pnpm --filter @norish/<pkg> exec vitest run <path-or-pattern>               # single test
```

Prettier for a single file: `tooling/prettier/node_modules/.bin/prettier --write <file>` (not on the root path). Tests in `packages/auth` and `packages/db` that use testcontainers need Docker.

## Mobile app (`apps/mobile`, branch `feat/mobile-revival`)

On this branch the app runs on iOS against a 0.26 server; `AGENTS.md`'s "expected to break" describes upstream `main`. Build steps and signing: `apps/mobile/README.md`.

```sh
pnpm --dir apps/mobile install --ignore-workspace
cd apps/mobile
npx tsc --noEmit
npx vitest run [__tests__/<dir>]
npx expo prebuild -p ios --clean
npx expo start --dev-client --clear --port 8081
```

Non-obvious behaviour:

- **Metro serves stale code** after edits in this setup; restart with `--clear` when a change does not show up. Check the bundle: `curl 'http://localhost:8081/.expo/.virtual-metro-entry.bundle?platform=ios&dev=true' | grep -c <symbol>`.
- **`npx expo run:ios` fails at its AppleScript step** here. Build with `xcodebuild -workspace ios/Norish.xcworkspace -scheme Norish -sdk iphonesimulator -derivedDataPath ios/build CODE_SIGN_IDENTITY=- build`, then `xcrun simctl install/launch booted eu.audiacity.norish`. Unsigned builds (`CODE_SIGNING_ALLOWED=NO`) break the keychain (SecureStore). Open the dev-client URL only ~15 s after launch, or the bundle loads twice and trips a Reanimated debug assert.
- **Package resolution:** the app sits outside the workspace but imports `packages/*` via `link:`. `metro.config.js` forces singletons (react, react-native, tanstack query, trpc) to resolve from `apps/mobile`, and remaps dev lazy-chunk paths starting with `./packages/` to the repo root. `vitest.config.ts` dedupes `@trpc/*` for the same reason. Keep catalogue versions in `apps/mobile/package.json` aligned with root `pnpm-workspace.yaml`.
- **React Compiler is on:** a hook alias must be named `use*` (e.g. `const useSharedX = shared.useX`), otherwise the call is memoized and its hooks are skipped on re-render (hook-order crash).
- **iOS 27 / Xcode 27:** `plugins/scene-lifecycle.js` adopts UIScene (without it the app aborts at launch); `plugins/pod-deployment-target.js` lifts pods to iOS 15.1; `plugins/no-push-entitlement.js` keeps a free Personal Team able to sign.
- **Auth:** `@better-auth/expo` 1.7's `getCookie()` is async; use `getStoredAuthCookie()` (`src/lib/auth-client.ts`) for headers, including media (`expo-image`, `expo-video`), which the server redirects to `/login` without the cookie. Server side needs `MOBILE_APP_ENABLED=true` (`packages/auth/src/auth.ts`); scheme is `norish://`.
- **Recipe data:** `recipeIngredients` and `steps` hold one copy per measurement system (`systemUsed`); always filter to `recipe.systemUsed` (the shared recipe-detail context does). A PATCH of a list replaces only that system's copy and must carry step `images`/`stepIngredients` through.
- **i18n:** locale comes from the stored app preference, then the server default, not the device. Non-React code formats via `getIntl()` from `src/lib/i18n/locale-store.ts`.

## Fork

Remote `fork` = `audiacity/norish` (default branch `feat/mobile-revival`). `.github/workflows/mobile-image.yml` builds the server image to `ghcr.io/audiacity/norish:mobile` on manual dispatch only: `gh workflow run mobile-image.yml -R audiacity/norish -f arch=amd64`.
