# BadMen

Badminton scoring and tournaments. Everything is stored on the device in a local SQLite database, so
the app works fully offline and needs no account.

## Development

```
npm install
npx expo start
```

## Building an Android APK

1. One time: `npm i -g eas-cli`, `eas login`, then `eas init` in this folder.
2. Commit your work (EAS builds from git).
3. `npm run build:apk`. When it finishes, EAS prints a link to download the APK.

`npm run build:prod` makes the Play Store (`.aab`) build.
