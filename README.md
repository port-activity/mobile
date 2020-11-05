# Port Activity App

## Developing

See:
- https://expo.io/learn
- https://docs.expo.io/versions/latest/
- https://facebook.github.io/react-native/docs/getting-started.html

### Install node.js lts
- https://nodejs.org/en/
- Thumbs up for `nvm` (https://github.com/nvm-sh/nvm)

### Install expo cli
- `npm install expo-cli --global` or `yarn global add expo-cli`

### Run project
- copy .env.template to .env
- set LOCALHOST to your computer's ip
- set LOCALPORT if required
- set SENTRY_DSN if you want to develop with sentry
- set TRANSLATIONS_API_KEY if you want to send missing translations to the backend
  (apikey can be created from webui)
- `expo start` or `expo r -c` (clear cache)

### Publishing project to expo release-channel `testing`
- `yarn publish-test`


### Install Android emulator
- Install Android Studio
  - Run Android Studio
  - Configure Android Virtual Device (AVD): Configure -> AVD
  - Launch AVD
- Start emulation after `expo r -c` from browser: `Run on Android device/emulator`

### Install iOS simulator
- Install XCode
  - Open Developer Tool -> Simulator
  - Select device
- Start simulation after `expo r -c` from browser: `Run on iOS simulator`

## Build production build

Note: this "native" build is required only when SDK version changes. Other OTA changes (when only jsVersion changes) could be deployed with
```
#> yarn publish-qa-gavle
#> yarn publish-prod-gavle
```
and so on.

When full app build is required there is scripts to that will builds. Script triggers builds for both android and ios. After build are completed build artifact (*.ipa and *.aab) can be downloaded from expo UI.

### Rauma
See ./build-prod-rauma.sh script:
```
#> ./build-prod-rauma.sh
Usage: ./build-prod-rauma.sh <android keystore path> <android keystore alias> <ios dist cert path> <ios push id> <ios push p8 path> <ios prov profile path>

```

Full command is something like this:
```
EXPO_ANDROID_KEYSTORE_PASSWORD=xxx EXPO_ANDROID_KEY_PASSWORD=xxx EXPO_IOS_DIST_P12_PASSWORD=xxx ./build-prod-rauma.sh /path/to/portactivity-rauma.jks xxx /path/to/cert.p12 xxx /path/to/key.p8 /path/to/rauma.mobileprovision
```

### Gavle
See ./build-prod-galve.sh script:
```
#> ./build-prod-gavle.sh
Usage: ./build-prod-gavle.sh <android keystore path> <android keystore alias> <ios dist cert path> <ios push id> <ios push p8 path> <ios prov profile path>

```

Full command is something like this:
```
EXPO_ANDROID_KEYSTORE_PASSWORD=xxx EXPO_ANDROID_KEY_PASSWORD=xxx EXPO_IOS_DIST_P12_PASSWORD=xxx ./build-prod-gavle.sh /path/to/portactivity-gavle.jks xxx /path/to/cert.p12 xxx /path/to/key.p8 /path/to/gavle.mobileprovision
```


## Deploying build

### iOS
Upload *.ipa file to appple developer account with Transporter application.

### Android
Upload *.aab file to Google play store via play console.
