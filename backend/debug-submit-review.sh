#!/bin/bash

echo "================================================"
echo "🔍 DEBUGGING VIRTUAL TOUR SUBMIT REVIEW"
echo "================================================"
echo ""

# Check if backend is running
echo "1️⃣  Checking backend server status..."
BACKEND_PID=$(ps aux | grep "node src/server.js" | grep -v grep | awk '{print $2}')

if [ -z "$BACKEND_PID" ]; then
  echo "   ❌ Backend server NOT running"
  echo "   💡 Start with: node src/server.js"
else
  echo "   ✅ Backend running (PID: $BACKEND_PID)"
  echo "   ⚠️  Need to restart to apply changes!"
  echo "   💡 Kill with: kill $BACKEND_PID"
fi

echo ""

# Check controller code
echo "2️⃣  Checking submitForReview code..."
if grep -q "req.user.role_id !== 2" src/controllers/virtualTour.controller.js 2>/dev/null; then
  echo "   ❌ USING OLD CODE (role_id check)"
  echo "   💡 Code needs to be updated"
elif grep -q "req.user.role?.toLowerCase()" src/controllers/virtualTour.controller.js 2>/dev/null; then
  echo "   ✅ USING NEW CODE (role string check)"
else
  echo "   ⚠️  Cannot determine - check manually"
fi

echo ""

# Check if changes are applied
echo "3️⃣  Server restart required?"
if [ ! -z "$BACKEND_PID" ]; then
  echo "   ⚠️  YES - Server is running with old code"
  echo "   📝 Steps to fix:"
  echo "      1. Kill server: kill $BACKEND_PID"
  echo "      2. Restart: node src/server.js"
  echo "      3. Try submit review again"
else
  echo "   ℹ️  Server not running - just start it"
fi

echo ""
echo "================================================"
echo "🧪 TESTING GUIDE"
echo "================================================"
echo ""
echo "After restart:"
echo "1. Login as pengelola"
echo "2. Create virtual tour"
echo "3. Click 'Submit Review'"
echo "4. Should succeed ✅"
echo ""
echo "Expected success message:"
echo "   'Virtual tour berhasil disubmit untuk review'"
echo ""
echo "================================================"
