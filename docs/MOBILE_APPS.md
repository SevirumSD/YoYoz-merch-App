# Mobile apps (iOS + Android)

This web app is wrapped with [Capacitor](https://capacitorjs.com/) so the same React/Vite
codebase ships as native Android and iOS apps. Capacitor loads the built `dist/` web
bundle inside a native shell and exposes native APIs (status bar, splash screen, etc.)
to the web code via JS plugins already wired up in `src/main.jsx`.

- App name: **Boogie & The Yo-Yoz**
- App ID / package name: `com.boogieyoyoz.merch`
- Native projects: `android/` (Gradle) and `ios/App/` (Xcode, Swift Package Manager —
  no CocoaPods/Podfile in this Capacitor version)

## Local development loop

```bash
npm run build        # builds dist/
npx cap sync          # copies dist/ into android/ and ios/, updates native plugin registrations
npx cap open android  # opens Android Studio
npx cap open ios      # opens Xcode (macOS only)
```

Run this after every change to web code, config, or when adding/removing a Capacitor plugin.
`npx cap sync` alone (without `open`) is enough before a CI build.

Whenever you touch `capacitor.config.ts`, `android/app/build.gradle`, or icons/splash
screens, re-run `npx cap sync` and commit the regenerated files under `android/` and `ios/`.

## Why builds don't happen in this container

This development container's network policy blocks `dl.google.com`, which both the
Android SDK installer and Gradle's `google()` Maven repository require — so Android
Gradle builds cannot run here. iOS builds require Xcode, which only runs on macOS.
Both are set up to build in **GitHub Actions** instead (see below), which has normal
internet access and, for iOS, a macOS runner.

## Icons and splash screens

Generated from `src/assets/logo-icon.png` (the guitar-figure mark) and
`src/assets/logo-full.png` (full logo with wordmark), composited onto the app's
`#0A0A0A` dark background to match the in-app theme. They were built with ImageMagick
rather than `@capacitor/assets` because that tool's `sharp` dependency needs a GitHub
release binary download that this container's network policy also blocks — no
functional difference, just a different local tool.

Source art is small (150×150 / 250×250) and upscaled — good enough to see the app for
real, but before a real store submission, ask whoever designed the logo for a
1024×1024+ vector or high-res master and regenerate:

- iOS icon: `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png` (1024×1024, opaque, no alpha)
- Android legacy icon: `android/app/src/main/res/mipmap-*/ic_launcher*.png`
- Android adaptive icon foreground (transparent bg): `android/app/src/main/res/mipmap-*/ic_launcher_foreground.png`
- Adaptive icon background color: `android/app/src/main/res/values/ic_launcher_background.xml`
- Splash screens: `ios/App/App/Assets.xcassets/Splash.imageset/*.png` and `android/app/src/main/res/drawable*/splash.png`

## Product data source: Shopify, not Supabase

This repo also contains `src/lib/supabase.js` and a provisioned Supabase project
("SevirumSD's Project YoYoz", with a real `Products` table), but **nothing in the
app currently reads from it** — `Shop.jsx`, `Home.jsx`, and `ProductDetail.jsx` all
import from `src/lib/shopifyClient.js` instead, which talks to Shopify's Storefront
API. Without `VITE_SHOPIFY_STORE_URL`/`VITE_SHOPIFY_STOREFRONT_TOKEN` set, it falls
back to a hardcoded mock catalog (`MOCK_CUSTOM_PRODUCTS`, imported from
`supabase.js` purely for its data, not its Supabase client) — that's what you see
in the app today. `supabase.js`'s `getProducts`/`createOrder`/etc. are dead code.

This was a deliberate choice (confirmed with the user 2026-07-07) — Shopify stays
the intended backend. To go live with real inventory, set up a Shopify Storefront
API token (Shopify admin → Settings → Apps and integrations → Develop apps) and
add it as the two secrets above; no code changes needed since `shopifyClient.js`
already implements the full integration.

## GitHub Actions secrets you need to add

Go to the repo's **Settings → Secrets and variables → Actions** and add:

| Secret | Used by | Required for |
|---|---|---|
| `VITE_SHOPIFY_STORE_URL`, `VITE_SHOPIFY_STOREFRONT_TOKEN` | both workflows | building the web bundle against your real Shopify catalog instead of the mock fallback — see the "Product data source" note below |
| `ANDROID_KEYSTORE_BASE64` | android-release.yml | signed Android builds (`base64 -w0 release.keystore`) |
| `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` | android-release.yml | signed Android builds |
| `PLAY_SERVICE_ACCOUNT_JSON` | android-release.yml | uploading directly to Google Play |
| `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_CONTENT` | ios-build.yml | App Store Connect API key (TestFlight upload) |
| `APPLE_TEAM_ID`, `APP_STORE_CONNECT_TEAM_ID` | ios-build.yml | Apple Developer team identifiers |
| `MATCH_GIT_URL`, `MATCH_PASSWORD` | ios-build.yml | fastlane `match` — a private git repo holding your iOS signing certs/profiles |

Without the Android keystore secrets, `android-release.yml` still produces an
**unsigned** AAB you can inspect but not submit. Without the Apple secrets,
`ios-build.yml` still runs `verify_simulator_build`, proving the Xcode project compiles,
but skips the signed TestFlight lane.

## Android: Google Play submission (you already have a Play Console account)

1. **Generate a release keystore** (do this once, store it somewhere safe — losing it
   means you can never update the app again under the same listing):
   ```bash
   keytool -genkey -v -keystore release.keystore -alias boogieyoyoz \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Base64-encode it and add it plus the passwords/alias as the `ANDROID_KEYSTORE_*`
   secrets above.
3. In Play Console, create the app, fill in the store listing (description,
   screenshots, feature graphic, content rating questionnaire, data safety form,
   privacy policy URL — required even for a simple merch store since it touches
   checkout/personal data).
4. Create a **service account** for automated publishing: Play Console →
   Setup → API access → link a Google Cloud project → create a service account
   with the "Release manager" role → download its JSON key → add as
   `PLAY_SERVICE_ACCOUNT_JSON`.
5. Run the **Android Release Build** workflow from the Actions tab. Leave `track`
   blank to just produce a downloadable AAB, or pick `internal`/`alpha`/`beta`/`production`
   to publish straight to that Play Console track.

## iOS: what's needed before you can submit

You don't yet have an Apple Developer Program membership (confirmed earlier in this
conversation). Before an actual App Store submission you need:

1. Enroll at [developer.apple.com/programs](https://developer.apple.com/programs/) — $99/year, requires a legal entity or individual identity verification (can take a day or two).
2. Create the app in [App Store Connect](https://appstoreconnect.apple.com/) with bundle ID `com.boogieyoyoz.merch`.
3. Create an **App Store Connect API key** (Users and Access → Integrations → App Store Connect API) — gives you `ASC_KEY_ID`, `ASC_ISSUER_ID`, and a downloaded `.p8` key file (base64-encode its contents for `ASC_KEY_CONTENT`).
4. Set up [fastlane match](https://docs.fastlane.tools/actions/match/) once, locally on a Mac or via `fastlane match init`, pointing at a private git repo to store your signing certificate and provisioning profile — that repo URL/password become `MATCH_GIT_URL`/`MATCH_PASSWORD`.
5. Run the **iOS Build** workflow with `upload_to_testflight: true` to build, sign, and push a build to TestFlight for internal testing before submitting for App Store review.

Until step 1 is done, the iOS workflow will still run and confirm the project builds
(`verify_simulator_build`), which is useful for catching regressions as you keep
developing — it just can't produce a signed, submittable build yet.

## First-run checklist before either store submission

- [ ] Replace placeholder app icon/splash art with final high-res brand assets
- [ ] Fill in real `VITE_SHOPIFY_STORE_URL` / `VITE_SHOPIFY_STOREFRONT_TOKEN` secrets
      (the app currently falls back to mock product data without them — see
      "Product data source" above)
- [ ] Write a privacy policy and host it somewhere public (both stores require the URL)
- [ ] Decide on push notifications / deep linking if you want them — `@capacitor/app`
      is already installed for basic lifecycle/back-button handling but nothing beyond that is wired up
- [ ] Test on a real device via `npx cap open android` / `npx cap open ios` before
      submitting — this container has never run the app on an actual emulator or
      simulator, only compiled it in CI
