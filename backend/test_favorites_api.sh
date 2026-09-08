#!/bin/bash

# Test script untuk Favorites & Audio API
# Make sure backend is running on port 5001

API_URL="http://localhost:5001/api"

echo "==================================="
echo "Testing Favorites & Audio API"
echo "==================================="

# Test 1: Login as visitor to get token
echo ""
echo "1. Login as visitor..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "visitor@test.com",
    "password": "visitor123"
  }')

echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token. Creating test visitor..."
  
  # Register a test visitor
  curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
      "nama": "Test Visitor",
      "email": "visitor@test.com",
      "password": "visitor123",
      "role": "visitor"
    }' | python3 -m json.tool 2>/dev/null
  
  # Try login again
  LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "visitor@test.com",
      "password": "visitor123"
    }')
  
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
fi

echo ""
echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to authenticate. Exiting."
  exit 1
fi

# Test 2: Toggle Favorite
echo ""
echo "2. Toggle favorite for virtual tour ID 1..."
TOGGLE_RESPONSE=$(curl -s -X POST "$API_URL/favorites/toggle" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "virtual_tour_id": 1
  }')

echo "$TOGGLE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$TOGGLE_RESPONSE"

# Test 3: Get User Favorites
echo ""
echo "3. Get user favorites..."
FAVORITES_RESPONSE=$(curl -s -X GET "$API_URL/favorites/my-favorites" \
  -H "Authorization: Bearer $TOKEN")

echo "$FAVORITES_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$FAVORITES_RESPONSE"

# Test 4: Check Favorite Status
echo ""
echo "4. Check favorite status for tours 1,2,3..."
STATUS_RESPONSE=$(curl -s -X GET "$API_URL/favorites/status?virtual_tour_ids=1,2,3" \
  -H "Authorization: Bearer $TOKEN")

echo "$STATUS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$STATUS_RESPONSE"

# Test 5: Toggle Favorite Again (remove)
echo ""
echo "5. Toggle favorite again (should remove)..."
TOGGLE2_RESPONSE=$(curl -s -X POST "$API_URL/favorites/toggle" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "virtual_tour_id": 1
  }')

echo "$TOGGLE2_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$TOGGLE2_RESPONSE"

echo ""
echo "==================================="
echo "✅ All tests completed!"
echo "==================================="
