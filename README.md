# Injection

A comprehensive React Native mobile application for healthcare services, offering seamless booking, insurance management, vendor services, and personalized user dashboards.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Development](#development)
- [Building](#building)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## 🎯 Overview

**Injection** is a feature-rich React Native application designed to simplify healthcare service management. It provides users with an intuitive interface for booking medical services, managing insurance information, tracking orders, and accessing vendor services. The application supports dual-platform deployment (iOS and Android) with a modern, responsive UI and robust backend integration.

### Key Capabilities

- **User Authentication & Profile Management**: Secure login and comprehensive user profiles
- **Service Booking System**: Easy scheduling and management of medical services
- **Insurance Integration**: Streamlined insurance information and claims management
- **Vendor Marketplace**: Browse and interact with healthcare vendors
- **Real-time Order Tracking**: Track service deliveries and appointments
- **Coupon & Promotion Management**: Apply discounts and manage promotional offers
- **Laboratory Partner Network**: Access to partner laboratory services
- **Responsive Dashboard**: Personalized user dashboard with key metrics

---

## ✨ Features

### Core Features

✅ **Authentication**
- Secure user registration and login
- Session management with persistent storage
- Token-based authentication

✅ **Booking Management**
- Browse available medical services
- Schedule appointments and services
- Manage existing bookings
- Cancellation and rescheduling

✅ **Insurance**
- View and manage insurance policies
- Claims submission
- Policy details and coverage information

✅ **Dashboard**
- Personalized user dashboard
- Quick access to frequent services
- Activity history and statistics

✅ **Vendor Services**
- Discover healthcare service providers
- View vendor profiles and ratings
- Direct service requests

✅ **Order Tracking**
- Real-time order status updates
- Order history
- Service delivery confirmation

✅ **Coupon & Promotions**
- Available promotions and coupon codes
- Discount application at checkout
- Promotion history

✅ **Lab Partners**
- Partner laboratory listings
- Service offerings
- Direct booking integration

---

## 🛠 Tech Stack

### Frontend
- **React Native** 0.84.1 - Cross-platform mobile framework
- **React** 19.2.3 - UI library
- **TypeScript** 5.8.3 - Type-safe JavaScript
- **React Navigation** 7.x - Navigation & routing
  - Bottom tabs, native stack, drawer navigation

### State Management & Storage
- **Zustand** 5.0.12 - Lightweight state management
- **AsyncStorage** 2.2.0 - Persistent local storage

### UI & Styling
- **React Native Linear Gradient** 2.8.3 - Gradient components
- **React Native Vector Icons** 10.3.0 - Icon library
- **React Native Safe Area Context** 5.5.2 - Safe area handling

### API & Network
- **Axios** 1.14.0 - HTTP client

### Development Tools
- **Babel** 7.25.2 - JavaScript transpiler
- **ESLint** 8.19.0 - Code linting
- **Jest** 29.6.3 - Testing framework
- **Prettier** 2.8.8 - Code formatting
- **Metro** - React Native bundler

### Platform-Specific
- **Android**: Gradle build system, proguard obfuscation
- **iOS**: CocoaPods dependency management, Xcode build

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 22.11.0
- **npm** or **Yarn** (package manager)
- **Git** (version control)

### Platform-Specific Requirements

**For Android Development:**
- Android Studio or Android SDK
- Java Development Kit (JDK) 11+
- Android SDK API level 21+

**For iOS Development:**
- macOS 12.0+
- Xcode 14.0+
- CocoaPods
- Ruby 2.7+

### Optional Tools
- Visual Studio Code with React Native extensions
- Android Emulator or physical Android device
- iOS Simulator or physical iOS device

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/injection.git
cd injection
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Platform-Specific Setup

#### Android Setup

```bash
# Android dependencies are typically installed automatically
# If needed, configure Android SDK paths in local.properties
```

#### iOS Setup

```bash
# Install Ruby dependencies
bundle install

# Install CocoaPods
bundle exec pod install --repo-update
```

### 4. Environment Configuration

Create a `.env` file in the root directory with required API endpoints:

```env
API_BASE_URL=https://your-api-endpoint.com
API_TIMEOUT=30000
```

---

## 📁 Project Structure

```
injection/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── CustomAlert.tsx
│   │   ├── CustomTabBar.tsx
│   │   ├── FieldInput.tsx
│   │   ├── Loader.tsx
│   │   └── LoaderShowcase.tsx
│   ├── context/             # React Context providers
│   │   └── AlertContext.tsx
│   ├── features/            # Feature modules
│   │   ├── auth/            # Authentication
│   │   ├── booking/         # Booking services
│   │   ├── coupon/          # Coupon management
│   │   ├── dashboard/       # User dashboard
│   │   ├── Insurance/       # Insurance services
│   │   ├── labPartner/      # Lab partnerships
│   │   ├── profile/         # User profile
│   │   └── vendorService/   # Vendor services
│   ├── navigation/          # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── TabNavigator.tsx
│   │   └── VendorTabNavigation.tsx
│   ├── screens/             # Standalone screens
│   │   ├── OrderTrackingScreen.tsx
│   │   └── SplashScreen.tsx
│   ├── service/             # API & business logic
│   │   ├── apiClient.ts
│   │   └── apis/
│   │       ├── bookingService.ts
│   │       ├── dashboardService.ts
│   │       ├── medicalServices.ts
│   │       ├── prescriptionService.ts
│   │       ├── userService.ts
│   │       └── vendorService.ts
│   ├── store/               # State management (Zustand)
│   │   └── useAuthStore.ts
│   ├── theme/               # Design system
│   │   └── colors.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── Alert.ts
│   │   ├── ApiError.ts
│   │   ├── booking.ts
│   │   ├── Loader.ts
│   │   └── RootStackParamList.ts
│   └── assets/              # Static assets
├── android/                 # Android native code
├── ios/                     # iOS native code
├── __tests__/               # Test files
├── app.json                 # App configuration
├── App.tsx                  # Root component
├── babel.config.js          # Babel configuration
├── tsconfig.json            # TypeScript configuration
├── jest.config.js           # Jest testing configuration
├── metro.config.js          # Metro bundler configuration
├── package.json             # Dependencies & scripts
└── README.md                # This file
```

---

## 💻 Development

### Starting the Development Server

#### 1. Start Metro Bundler

```bash
npm start
# or
yarn start
```

Metro is the JavaScript bundler for React Native. It will compile your code and serve it to the devices/emulators.

#### 2. Run on Android

In a new terminal window:

```bash
npm run android
# or
yarn android
```

Requires Android Emulator running or connected Android device.

#### 3. Run on iOS

In a new terminal window:

```bash
npm run ios
# or
yarn ios
```

### Hot Reload & Fast Refresh

Changes are automatically reflected during development. For a full reload:

- **Android**: Press `R` twice or `Ctrl + M` → Reload
- **iOS**: Press `R` in Simulator

### Code Quality

#### Linting

```bash
npm run lint
# or
yarn lint
```

Fix linting issues automatically:

```bash
npm run lint -- --fix
```

#### Code Formatting

```bash
npx prettier --write src/
```

---

## 🏗 Building

### Android Build

#### Development Build

```bash
npm run android
```

#### Release Build

```bash
cd android
./gradlew assembleRelease
# APK will be generated at: app/build/outputs/apk/release/app-release.apk
```

### iOS Build

#### Development Build

```bash
npm run ios
```

#### Release Build

```bash
cd ios
xcodebuild -scheme Injection -configuration Release -derivedDataPath build
# IPA will be generated in build directory
```

---

## 🧪 Testing

### Running Tests

```bash
npm test
# or
yarn test
```

### Test Coverage

```bash
npm test -- --coverage
```

### Test Files

Test files are located in `__tests__/` directory with `.test.tsx` extension.

### Running Specific Tests

```bash
npm test -- App.test.tsx
```

### Watch Mode

```bash
npm test -- --watch
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Metro Bundler Issues

```bash
# Clear cache and restart
npm start -- --reset-cache
```

#### Dependency Problems

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Android Build Issues

```bash
cd android
./gradlew clean
./gradlew build
```

#### iOS Build Issues

```bash
cd ios
rm -rf Pods Podfile.lock
bundle exec pod install --repo-update
cd ..
npm run ios
```

#### Port Already in Use

```bash
# Metro defaults to port 8081
npm start -- --port 8082
```

#### TypeScript Errors

```bash
# Verify TypeScript configuration
npx tsc --noEmit
```

#### Device/Emulator Not Detected

```bash
# Android: List connected devices
adb devices

# iOS: List simulators
xcrun simctl list devices
```

### Debug Mode

Enable debug menu:
- **Android**: `Ctrl + M` (Windows/Linux) or `Cmd + M` (macOS)
- **iOS**: `Cmd + D` in Simulator

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 📝 Version History

**v0.0.1** - Initial Release
- Core authentication system
- Booking management
- Dashboard implementation
- Insurance integration
- Vendor services
- Order tracking
- Coupon management
- Lab partner integration

---

## 🔗 References

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Axios Documentation](https://axios-http.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Last Updated**: June 2024

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
