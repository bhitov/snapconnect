#!/bin/bash

# Test script for Firebase emulator connection
# Uses hardcoded emulator configuration in admin.ts

echo "🔧 Firebase emulator configuration is hardcoded in admin.ts"
echo "   • Project ID: snapconnect-d75c6"
echo "   • Database URL: http://localhost:9000?ns=snapconnect-d75c6"
echo "   • Auth Emulator: 0.0.0.0:9099"
echo ""

# Check if emulators are running
echo "🔍 Checking if Firebase emulators are running..."

# Check database emulator
if curl -s http://localhost:9000/ > /dev/null 2>&1; then
    echo "   ✅ Database emulator is running on localhost:9000"
else
    echo "   ❌ Database emulator is not running on localhost:9000"
    echo "   💡 Start emulators with: firebase emulators:start"
    echo ""
fi

# Check auth emulator
if curl -s http://localhost:9099/ > /dev/null 2>&1; then
    echo "   ✅ Auth emulator is running on localhost:9099"
else
    echo "   ❌ Auth emulator is not running on localhost:9099"
    echo "   💡 Start emulators with: firebase emulators:start"
    echo ""
fi

# Check emulator UI
if curl -s http://localhost:4000/ > /dev/null 2>&1; then
    echo "   ✅ Emulator UI is running on localhost:4000"
else
    echo "   ❌ Emulator UI is not running on localhost:4000"
    echo "   💡 Start emulators with: firebase emulators:start"
    echo ""
fi

echo ""
echo "🚀 Running emulator test..."
echo ""

# Run the test script
npx ts-node datagen/script.ts 