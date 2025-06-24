# Android Emulator Firebase Troubleshooting Guide

## Issue: `auth/network-request-failed` Error

You're getting this error because the Android emulator cannot connect to Firebase services. This is a common issue with specific solutions.

## ✅ What We've Already Fixed

1. **Updated Firebase emulator configuration** to use `10.0.2.2` instead of `localhost` for Android
2. **Added debug utilities** to help diagnose connection issues
3. **Added platform-specific host detection**

## 🔧 Step-by-Step Solutions

### Option 1: Use Firebase Emulators (Recommended)

1. **Start Firebase Emulators** (in a separate terminal):
```bash
firebase emulators:start
```

2. **Verify emulators are running** at:
   - Auth: http://localhost:9099
   - Database: http://localhost:9000
   - Storage: http://localhost:9199
   - UI: http://localhost:4000

3. **Test the app** - it should now connect to emulators using `10.0.2.2`

### Option 2: Use Production Firebase (if emulators aren't working)

1. **Create a Firebase project** (if you haven't):
   - Go to https://console.firebase.google.com
   - Create new project
   - Enable Authentication (Email/Password)
   - Enable Realtime Database
   - Enable Storage

2. **Add your environment variables** in a `.env` file:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:android:abc123
```

3. **Temporarily disable emulator connection**:
In `src/shared/services/firebase/config.ts`, comment out:
```typescript
// if (__DEV__) {
//   connectToEmulators();
// }
```

### Option 3: Fix Android Emulator Network Settings

1. **Check emulator network settings**:
```bash
# In Android Studio, go to:
# Tools > AVD Manager > Edit AVD > Advanced Settings
# Network Speed: Full
# Network Latency: None
```

2. **Use a different emulator**:
   - Try Google Pixel 3a API 30 (known to work well)
   - Avoid older API levels (< 28)

3. **Reset emulator network**:
```bash
# Wipe emulator data
emulator -avd YOUR_AVD_NAME -wipe-data
```

## 📱 Android Emulator Network Basics

**Key Addresses:**
- `10.0.2.2` = Your host machine (where emulators run)
- `10.0.2.1` = Router/Gateway
- `127.0.0.1` = Emulator's localhost (not your machine!)

## 🐛 Debug Steps

1. **Check the debug output** in your Metro bundler console
2. **Test network connectivity**:
```bash
# In Android emulator browser, try visiting:
http://10.0.2.2:9099  # Should show Firebase Auth emulator
http://10.0.2.2:4000  # Should show Firebase UI
```

3. **Check if emulators are accessible**:
```bash
# On your host machine:
curl http://localhost:9099  # Should return emulator info
curl http://10.0.2.2:9099   # May not work from host, but should from emulator
```

## 🔍 What the Debug Output Should Show

When you start the app, you should see:
```
🚀 Starting Firebase Debug Suite...

🔧 Firebase Emulator URLs:
  auth: http://10.0.2.2:9099
  database: http://10.0.2.2:9000
  storage: http://10.0.2.2:9199
  functions: http://10.0.2.2:5001
  ui: http://10.0.2.2:4000

🌐 Platform: android
🔧 Connecting to Firebase emulators on 10.0.2.2
✅ Connected to Firebase emulators successfully
```

## ❌ Common Issues & Solutions

### Issue: "Failed to connect to emulators"
**Solution**: Make sure Firebase emulators are running:
```bash
firebase emulators:start
```

### Issue: Still getting network errors
**Solution**: Use production Firebase (Option 2 above)

### Issue: Emulators work but login still fails
**Solution**: Check authentication is enabled in Firebase console

### Issue: "ECONNREFUSED" errors
**Solution**: 
1. Check Windows Firewall/Antivirus
2. Try different emulator
3. Use production Firebase temporarily

## 🚀 Quick Test

Run this in your terminal to test if emulators are accessible:
```bash
# These should all return something (not errors):
curl -s http://localhost:9099 | head -5
curl -s http://localhost:9000 | head -5
curl -s http://localhost:9199 | head -5
```

## 📞 If Nothing Works

1. **Use production Firebase** temporarily (Option 2)
2. **Try iOS simulator** - usually has fewer network issues
3. **Use physical Android device** - often works better than emulator
4. **Check your network setup** - corporate networks sometimes block emulator traffic

## 🔄 Next Steps

1. Try Option 1 (emulators) first
2. If that fails, use Option 2 (production)
3. Once login works, we can continue with the rest of Phase 2

The debug output will help us identify exactly what's failing! 