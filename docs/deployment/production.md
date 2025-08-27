# 🚀 Deployment Guide

This guide covers the complete deployment process for the Finanza mobile application across different environments and platforms.

## 📋 Overview

Finanza supports deployment to multiple platforms:
- **📱 iOS**: App Store and TestFlight
- **🤖 Android**: Google Play Store and APK distribution
- **🌐 Web**: Progressive Web App (PWA)
- **⚡ Expo**: Expo Go for development

## 🏗️ Build Environments

### Development Environment
```json
{
  "name": "finanza-dev",
  "slug": "finanza-dev",
  "version": "1.0.0",
  "orientation": "portrait",
  "icon": "./assets/images/icon-dev.png",
  "scheme": "finanza-dev",
  "userInterfaceStyle": "automatic",
  "newArchEnabled": true,
  "ios": {
    "bundleIdentifier": "com.finanza.app.dev"
  },
  "android": {
    "package": "com.finanza.app.dev"
  },
  "extra": {
    "eas": {
      "projectId": "your-dev-project-id"
    },
    "apiUrl": "https://api-dev.finanza.app",
    "environment": "development"
  }
}
```

### Staging Environment
```json
{
  "name": "finanza-staging",
  "slug": "finanza-staging", 
  "version": "1.0.0",
  "orientation": "portrait",
  "icon": "./assets/images/icon-staging.png",
  "scheme": "finanza-staging",
  "userInterfaceStyle": "automatic",
  "newArchEnabled": true,
  "ios": {
    "bundleIdentifier": "com.finanza.app.staging"
  },
  "android": {
    "package": "com.finanza.app.staging"
  },
  "extra": {
    "eas": {
      "projectId": "your-staging-project-id"
    },
    "apiUrl": "https://api-staging.finanza.app",
    "environment": "staging"
  }
}
```

### Production Environment
```json
{
  "name": "Finanza",
  "slug": "finanza",
  "version": "1.0.0",
  "orientation": "portrait",
  "icon": "./assets/images/icon.png",
  "scheme": "finanza",
  "userInterfaceStyle": "automatic",
  "newArchEnabled": true,
  "splash": {
    "image": "./assets/images/splash-icon.png",
    "resizeMode": "contain",
    "backgroundColor": "#1a1a2e"
  },
  "ios": {
    "bundleIdentifier": "com.finanza.app",
    "buildNumber": "1",
    "supportsTablet": true,
    "infoPlist": {
      "CFBundleAllowMixedLocalizations": true,
      "NSFaceIDUsageDescription": "Use Face ID to authenticate and secure your financial data"
    }
  },
  "android": {
    "package": "com.finanza.app",
    "versionCode": 1,
    "adaptiveIcon": {
      "foregroundImage": "./assets/images/adaptive-icon.png",
      "backgroundColor": "#ffffff"
    },
    "permissions": [
      "USE_FINGERPRINT",
      "USE_BIOMETRIC"
    ]
  },
  "extra": {
    "eas": {
      "projectId": "your-production-project-id"
    },
    "apiUrl": "https://api.finanza.app",
    "environment": "production"
  }
}
```

## 🔧 EAS Build Configuration

### eas.json Configuration
```json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium",
        "simulator": true
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium",
        "autoIncrement": "buildNumber"
      },
      "android": {
        "autoIncrement": "versionCode",
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-id",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./path/to/service-account-key.json",
        "track": "production"
      }
    }
  }
}
```

## 📱 iOS Deployment

### Prerequisites
```bash
# Install iOS dependencies
npm install -g @expo/cli
npm install -g eas-cli

# Login to Expo and Apple Developer
eas login
eas device:create
```

### Build Process
```bash
# Development build
eas build --platform ios --profile development

# Preview build for TestFlight
eas build --platform ios --profile preview

# Production build
eas build --platform ios --profile production
```

### App Store Connect Configuration
```typescript
// app.config.ts - iOS specific settings
export default {
  expo: {
    ios: {
      bundleIdentifier: "com.finanza.app",
      buildNumber: "1",
      supportsTablet: true,
      requireFullScreen: false,
      userInterfaceStyle: "automatic",
      infoPlist: {
        CFBundleAllowMixedLocalizations: true,
        NSFaceIDUsageDescription: "Use Face ID to secure your financial data",
        NSCameraUsageDescription: "Use camera to scan receipts and documents",
        NSPhotoLibraryUsageDescription: "Access photos to upload receipts",
        NSLocationWhenInUseUsageDescription: "Location helps categorize transactions automatically",
        ITSAppUsesNonExemptEncryption: false
      },
      associatedDomains: [
        "applinks:finanza.app",
        "applinks:www.finanza.app"
      ],
      entitlements: {
        "com.apple.developer.associated-domains": [
          "applinks:finanza.app",
          "applinks:www.finanza.app"
        ]
      }
    }
  }
};
```

### TestFlight Deployment
```bash
# Upload to TestFlight
eas submit --platform ios --profile production

# Check submission status
eas submit:list --platform ios
```

## 🤖 Android Deployment

### Prerequisites
```bash
# Generate upload key
keytool -genkeypair -v -storetype PKCS12 -keystore upload-keystore.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000

# Add keystore to project
mkdir -p android/app/keystores/
cp upload-keystore.keystore android/app/keystores/
```

### Keystore Configuration
```javascript
// app.config.js - Android signing
module.exports = {
  expo: {
    android: {
      package: "com.finanza.app",
      versionCode: 1,
      buildType: "aab",
      keystorePath: "./android/app/keystores/upload-keystore.keystore",
      keystorePassword: process.env.ANDROID_KEYSTORE_PASSWORD,
      keyAlias: "upload",
      keyPassword: process.env.ANDROID_KEY_PASSWORD
    }
  }
};
```

### Build Process
```bash
# Development APK
eas build --platform android --profile development

# Preview APK
eas build --platform android --profile preview

# Production AAB
eas build --platform android --profile production
```

### Google Play Console Setup
```bash
# Create service account key
# Download from Google Cloud Console
# Place at: ./google-services-key.json

# Submit to Google Play
eas submit --platform android --profile production
```

## 🌐 Web Deployment

### PWA Configuration
```javascript
// app.config.js - Web PWA settings
module.exports = {
  expo: {
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
      name: "Finanza - Personal Finance Manager",
      shortName: "Finanza",
      lang: "en",
      scope: "/",
      themeColor: "#1a1a2e",
      backgroundColor: "#ffffff",
      display: "standalone",
      orientation: "portrait",
      startUrl: "/",
      preferRelatedApplications: true,
      relatedApplications: [
        {
          platform: "play",
          url: "https://play.google.com/store/apps/details?id=com.finanza.app",
          id: "com.finanza.app"
        },
        {
          platform: "itunes", 
          url: "https://apps.apple.com/app/finanza/id123456789"
        }
      ]
    }
  }
};
```

### Static Export
```bash
# Build for web
npx expo export -p web

# Deploy to hosting platform
# Example: Vercel
vercel --prod

# Example: Netlify
netlify deploy --prod --dir dist

# Example: Firebase Hosting
firebase deploy --only hosting
```

### Service Worker Configuration
```javascript
// Custom service worker for offline support
// public/sw.js
const CACHE_NAME = 'finanza-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/build-and-deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linting
        run: npm run lint
      
      - name: Type check
        run: npm run type-check

  build-preview:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build for iOS (Preview)
        run: eas build --platform ios --profile preview --non-interactive
      
      - name: Build for Android (Preview)  
        run: eas build --platform android --profile preview --non-interactive

  build-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build for iOS (Production)
        run: eas build --platform ios --profile production --non-interactive
      
      - name: Build for Android (Production)
        run: eas build --platform android --profile production --non-interactive
      
      - name: Submit to App Store
        run: eas submit --platform ios --profile production --non-interactive
        env:
          EXPO_APPLE_PASSWORD: ${{ secrets.EXPO_APPLE_PASSWORD }}
      
      - name: Submit to Google Play
        run: eas submit --platform android --profile production --non-interactive

  deploy-web:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build web app
        run: npx expo export -p web
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./dist
```

### Environment Variables
```bash
# Required secrets in GitHub Actions
EXPO_TOKEN=your_expo_access_token
EXPO_APPLE_PASSWORD=your_apple_app_specific_password
ANDROID_KEYSTORE_PASSWORD=your_keystore_password
ANDROID_KEY_PASSWORD=your_key_password
VERCEL_TOKEN=your_vercel_token
ORG_ID=your_vercel_org_id
PROJECT_ID=your_vercel_project_id

# Environment-specific variables
API_URL_DEV=https://api-dev.finanza.app
API_URL_STAGING=https://api-staging.finanza.app
API_URL_PRODUCTION=https://api.finanza.app
SENTRY_DSN=your_sentry_dsn
MIXPANEL_TOKEN=your_mixpanel_token
```

## 📊 Release Management

### Version Numbering
```javascript
// Semantic versioning strategy
const versionStrategy = {
  major: "Breaking changes (new app architecture)",
  minor: "New features (new screens, major functionality)",
  patch: "Bug fixes and minor improvements"
};

// Example versions:
// 1.0.0 - Initial release
// 1.1.0 - Add budgeting feature
// 1.1.1 - Fix transaction sync bug
// 2.0.0 - Complete UI redesign
```

### Release Checklist
```markdown
## Pre-Release Checklist
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security audit passed
- [ ] Performance testing completed
- [ ] Accessibility testing passed
- [ ] Translation updates completed
- [ ] App Store screenshots updated
- [ ] Release notes prepared
- [ ] Crash reporting configured
- [ ] Analytics tracking verified

## Release Process
- [ ] Create release branch
- [ ] Update version numbers
- [ ] Build and test on all platforms
- [ ] Deploy to staging environment
- [ ] Conduct final testing
- [ ] Submit to app stores
- [ ] Monitor for issues
- [ ] Update documentation
```

### Rollback Strategy
```bash
# Emergency rollback procedure
# 1. Identify problematic version
eas build:list --platform all --status finished

# 2. Revert to previous working build
eas submit --platform ios --id [PREVIOUS_BUILD_ID]
eas submit --platform android --id [PREVIOUS_BUILD_ID]

# 3. Notify users (if critical)
# Send push notification about temporary rollback

# 4. Investigate and fix issues
# Create hotfix branch from main
git checkout -b hotfix/critical-bug main

# 5. Deploy fixed version
eas build --platform all --profile production
eas submit --platform all --profile production
```

## 🔍 Monitoring & Analytics

### Crash Reporting (Sentry)
```javascript
// app/_layout.tsx
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableInExpoDevelopment: false,
  debug: __DEV__,
  environment: process.env.EXPO_PUBLIC_ENVIRONMENT,
  beforeSend(event) {
    // Filter out sensitive information
    if (event.extra) {
      delete event.extra.password;
      delete event.extra.pin;
      delete event.extra.token;
    }
    return event;
  }
});
```

### Performance Monitoring
```javascript
// Performance tracking setup
import { Mixpanel } from 'mixpanel-react-native';

const trackEvent = Mixpanel.getInstance();

// Track app performance
export const trackPerformance = {
  appStart: () => {
    trackEvent.track('App Started', {
      platform: Platform.OS,
      version: Constants.expoConfig?.version
    });
  },
  
  screenLoad: (screenName: string, loadTime: number) => {
    trackEvent.track('Screen Loaded', {
      screen: screenName,
      loadTime,
      timestamp: new Date().toISOString()
    });
  },
  
  apiCall: (endpoint: string, duration: number, success: boolean) => {
    trackEvent.track('API Call', {
      endpoint,
      duration,
      success,
      timestamp: new Date().toISOString()
    });
  }
};
```

## 🛠️ Deployment Scripts

### Automated Deployment Script
```bash
#!/bin/bash
# deploy.sh - Automated deployment script

set -e

# Configuration
ENVIRONMENT=${1:-production}
PLATFORM=${2:-all}

echo "🚀 Starting deployment for $ENVIRONMENT environment..."

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."
npm run test
npm run lint
npm run type-check

# Build application
echo "🏗️ Building application..."
if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "all" ]; then
  eas build --platform ios --profile $ENVIRONMENT --non-interactive
fi

if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "all" ]; then
  eas build --platform android --profile $ENVIRONMENT --non-interactive
fi

# Submit to app stores (production only)
if [ "$ENVIRONMENT" = "production" ]; then
  echo "📤 Submitting to app stores..."
  
  if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "all" ]; then
    eas submit --platform ios --profile production --non-interactive
  fi
  
  if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "all" ]; then
    eas submit --platform android --profile production --non-interactive
  fi
fi

# Deploy web version
if [ "$PLATFORM" = "web" ] || [ "$PLATFORM" = "all" ]; then
  echo "🌐 Deploying web version..."
  npx expo export -p web
  vercel --prod
fi

echo "✅ Deployment completed successfully!"
```

### Usage
```bash
# Deploy to production (all platforms)
./deploy.sh production all

# Deploy iOS only to staging
./deploy.sh staging ios

# Deploy web only
./deploy.sh production web
```

## 📚 Deployment Resources

### Official Documentation
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo EAS Submit](https://docs.expo.dev/submit/introduction/)
- [App Store Connect](https://developer.apple.com/app-store-connect/)
- [Google Play Console](https://play.google.com/console/)

### Tools & Services
- **Build Service**: Expo EAS Build
- **App Store Submission**: EAS Submit
- **Web Hosting**: Vercel, Netlify, Firebase
- **Monitoring**: Sentry, Mixpanel, Bugsnag
- **CI/CD**: GitHub Actions, GitLab CI, CircleCI

### Troubleshooting
- [Common Build Issues](https://docs.expo.dev/build-reference/troubleshooting/)
- [iOS Deployment Issues](https://docs.expo.dev/build-reference/ios-builds/)
- [Android Deployment Issues](https://docs.expo.dev/build-reference/android-builds/)

---

For deployment questions or issues, please check our [troubleshooting guide](./DEVELOPMENT.md#troubleshooting) or contact the development team.
