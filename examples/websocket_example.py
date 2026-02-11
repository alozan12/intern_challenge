#!/usr/bin/env python3
import uuid
import json
import asyncio
import websockets
import os

# Sample payload for the query endpoint
payload = {
    "action": "query",
    "session_id": str(uuid.uuid4()),
    "query": "What is 2+2?",
    "model_provider": "aws",
    "model_name": "claude4_5_sonnet",
    "model_params": {
        "temperature": 0.7,
        "enable_search": False,
        "stream": True,
        "system_prompt": "You are the ASU Study Coach, an AI-powered study assistant that helps students with their courses."
    }
}

# Get token from environment or use the one provided
TOKEN = os.getenv("CREATE_AI_API_TOKEN", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhc3VyaXRlIjoiYWxvemFuMTIiLCJrZXlfaWQiOiI5YTg4YmM2Ny1mYWYyLTRkYWMtYWMwZi01MmNmOWVhMjM2NTUiLCJ0eXBlIjoiZGV2ZWxvcGVyIiwiYXBpIjoibWFpbiIsImlhdCI6MTc1NzUyMDY5NywiaXNzIjoiYWRtaW4tcG9jIn0.SbkZTQrDgJSZNZUG6ocLj5bMOe-Qps2bmgJ-z8KgbME")
WS_URL = f"wss://apiws-main-poc.aiml.asu.edu/?access_token={TOKEN}"

payload_str = json.dumps(payload)
print(f"Payload size: {len(payload_str)} bytes")
print(f"Connecting to: {WS_URL}")
print(f"Payload: {payload_str[:100]}...")

async def connect():
    try:
        print(f"Connecting to WebSocket at {WS_URL}")
        async with websockets.connect(
            WS_URL,
            max_size=None,
            ping_interval=10,
            ping_timeout=10,
        ) as ws:
            print("Connected to CreateAI WebSocket.")

            await ws.send(payload_str)
            print("Sent query payload.\n")
            
            # Process messages until we get EOS marker
            async for message in ws:
                if message.strip().endswith("<EOS>"):
                    print("\nGeneration complete. Closing connection.")
                    break
                print(message, end="", flush=True)

    except websockets.ConnectionClosedError as e:
        print(f"\nConnection closed with error: {e.code} - {e.reason}")
    except Exception as e:
        print(f"\nUnexpected error: {e}")

if __name__ == "__main__":
    asyncio.run(connect())