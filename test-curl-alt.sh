#!/bin/bash

# Alternative token from the Python example
ALT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhc3VyaXRlIjoiYWxvemFuMTIiLCJrZXlfaWQiOiI5YTg4YmM2Ny1mYWYyLTRkYWMtYWMwZi01MmNmOWVhMjM2NTUiLCJ0eXBlIjoiZGV2ZWxvcGVyIiwiYXBpIjoibWFpbiIsImlhdCI6MTc1NzUyMDY5NywiaXNzIjoiYWRtaW4tcG9jIn0.SbkZTQrDgJSZNZUG6ocLj5bMOe-Qps2bmgJ-z8KgbME"
PROJECT_ID="33fa940f53cc436bb42747c4b7c5a8ca"

echo "Testing with curl to the query endpoint using alternative token..."
curl -X POST https://api-main-poc.aiml.asu.edu/query \
  -H "Authorization: Bearer $ALT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"query","query":"What is 2+2?","model_provider":"aws","model_name":"claude4_5_sonnet"}'

echo -e "\n\nTesting with curl to the project endpoint using alternative token..."
curl -X POST https://api-main-poc.aiml.asu.edu/project \
  -H "Authorization: Bearer $ALT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resource":"ai","method":"query","details":{"project_id":"'"$PROJECT_ID"'","query":"What is 2+2?","model_provider":"aws","model_name":"claude4_5_sonnet"}}'

echo -e "\n\nTesting WebSocket URL with alternative token..."
curl -I "https://apiws-main-poc.aiml.asu.edu/?access_token=$ALT_TOKEN"