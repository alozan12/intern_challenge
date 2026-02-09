#!/bin/bash

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "Testing with curl to the query endpoint..."
curl -X POST https://api-main-poc.aiml.asu.edu/query \
  -H "Authorization: Bearer $CREATE_AI_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"query","query":"What is 2+2?","model_provider":"aws","model_name":"claude4_5_sonnet"}'

echo -e "\n\nTesting with curl to the project endpoint..."
curl -X POST https://api-main-poc.aiml.asu.edu/project \
  -H "Authorization: Bearer $CREATE_AI_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resource":"ai","method":"query","details":{"project_id":"'"$CREATE_AI_PROJECT_ID"'","query":"What is 2+2?","model_provider":"aws","model_name":"claude4_5_sonnet"}}'

echo -e "\n\nTesting WebSocket URL..."
curl -I "https://apiws-main-poc.aiml.asu.edu/?access_token=$CREATE_AI_API_TOKEN"