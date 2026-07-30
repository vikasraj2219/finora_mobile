# Finora Mobile — Phase 1

React Native (Expo) app for personal use, built against your existing Node/Express
backend (`finora_backend` — **unchanged, zero modifications needed**).

## What's in Phase 1

- Project scaffold, Finora branding (logo, navy/teal theme matching the web app exactly)
- Full navigation shell: bottom tabs (Dashboard / Transactions / Accounts / Import / More)
  matching `MobileBottomNav.jsx` from the web app, with a "More" menu for the
  less-frequent destinations (Allocation, Categories, Types, Subcategories, Merchants,
  Reports, Settings) — same split the web app uses between bottom nav and the sidebar drawer
- Working auth: Login, Register, JWT access/refresh stored in `expo-secure-store`
  (the native equivalent of the web app's `localStorage` + auto-refresh-on-401 pattern)
- Working Settings screen (profile, logout) so the whole login → app → logout loop
  is testable right now
- All other tabs show a "Coming in Phase N" placeholder — they'll be replaced screen
  by screen in the next phases

All API modules (`src/api/*.js`) are copied straight from your web frontend's
`src/api/` — same endpoints, same request/response shapes. Nothing backend-side changes.

## 1. Backend

Already pointed at your deployed backend: `https://finora-backend-d7rl.onrender.com/api/v1`
(set in `src/api/axiosInstance.js`) — no LAN IP, no same-Wi-Fi requirement, works from
anywhere. If you ever redeploy to a new URL, that's the one line to change.

One thing to know: Render's free tier spins the server down after inactivity, so the
**first request after it's been idle can take 30-60 seconds** while it wakes up (login
might just spin for a bit) — normal, not a bug on the app side.

## 2. Run it during development (Expo Go — instant, no build)

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app (App Store / Play Store). Good for quick
iteration — every change reloads instantly.

## 3. Build a real installable APK (no Play Store)

This produces an actual `.apk` you install like any Android app — no store, no review.

```bash
npm install -g eas-cli
eas login              # free Expo account — create one if you don't have it
eas build --platform android --profile preview
```

- First run will ask to link/create an EAS project for this app — say yes, it's automatic.
- The build runs on Expo's servers (a few minutes), then gives you a **download link**
  for the `.apk`.
- Download it on your phone (or download on your computer and AirDrop/transfer it over),
  tap to install. Android will warn about "unknown sources" the first time — that's
  expected for any app installed outside the Play Store; allow it for this install.

iOS is more restrictive without the App Store — building a personal-use `.ipa` requires
a free Apple ID registered as a development device, and re-signing every ~7 days unless
you pay for the $99/yr Apple Developer Program. For iOS, using Expo Go (step 2) day-to-day
is the frictionless option; let me know if you want the sideload route set up too.

## What's built

All 5 phases complete — every module from the web app now has a mobile counterpart:

- **Auth** — Login, Register, JWT with auto-refresh, logout
- **Dashboard** — stats, trends, category breakdown, cash flow, payment method split, account usage, yearly summary, highlights
- **Accounts** — Bank / UPI / Cash, full CRUD, balance adjust
- **Transactions** — full form (all 5 types), filters, receipt attach/view, edit/delete
- **Allocation** — status tabs, bulk-classify, bulk-delete
- **Types, Categories, Subcategories** — full CRUD, cascading tabs/pickers
- **Merchants** — full CRUD with usage stats
- **Import Statement** — 3-step wizard: pick bank + file → review/categorize → confirm
- **Reports** — CSV/Excel/PDF export + financial summary PDF, via the native share sheet
- **Notifications** — full list, mark read / mark all read
- **Settings** — Profile, Security (password), Activity Log, logout

## What's next

App is feature-complete against the current web app. Possible follow-ups if you want them later:
- Push notifications (native, instead of only in-app list)
- Offline caching / optimistic updates
- Biometric login (Face ID / fingerprint) using expo-local-authentication
- App icon / splash polish, dark mode
