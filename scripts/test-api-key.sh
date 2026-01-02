#!/bin/bash

# Script to test API.Bible key
# Usage: ./scripts/test-api-key.sh YOUR_API_KEY

API_KEY="${1:-}"

if [ -z "$API_KEY" ]; then
  echo "❌ Error: No API key provided"
  echo "Usage: ./scripts/test-api-key.sh YOUR_API_KEY"
  exit 1
fi

echo "🔍 Testing API.Bible key: ${API_KEY:0:10}..."
echo ""

# Test 1: Fetch available Bibles
echo "Test 1: Fetching available Bibles..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "https://rest.api.bible/v1/bibles?language=eng" \
  -H "api-key: $API_KEY")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  COUNT=$(echo "$BODY" | grep -o '"id"' | wc -l)
  echo "✅ Success! Found $COUNT English Bibles"
  echo ""
  echo "Sample response:"
  echo "$BODY" | head -c 500
  echo ""
else
  echo "❌ Failed with HTTP $HTTP_CODE"
  echo "$BODY"
  exit 1
fi

echo ""
echo "Test 2: Fetching John 3:16 from KJV..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "https://rest.api.bible/v1/bibles/de4e12af7f28f599-02/passages/JHN.3.16" \
  -H "api-key: $API_KEY")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Success! Fetched John 3:16"
  echo ""
  echo "Sample response:"
  echo "$BODY" | head -c 500
  echo ""
else
  echo "❌ Failed with HTTP $HTTP_CODE"
  echo "$BODY"
  exit 1
fi

echo ""
echo "✨ All tests passed! Your API key is valid."
echo ""
echo "To use this key in your app, add it to .env:"
echo "EXPO_PUBLIC_API_BIBLE_KEY=$API_KEY"
