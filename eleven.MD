# Compose music

POST https://api.elevenlabs.io/v1/music
Content-Type: application/json

Compose a song from a prompt or a composition plan.

Reference: https://elevenlabs.io/docs/api-reference/music/compose

## OpenAPI Specification

```yaml
openapi: 3.1.1
info:
  title: Compose Music
  version: endpoint_music.compose
paths:
  /v1/music:
    post:
      operationId: compose
      summary: Compose Music
      description: Compose a song from a prompt or a composition plan.
      tags:
        - - subpackage_music
      parameters:
        - name: output_format
          in: query
          description: >-
            Output format of the generated audio. Formatted as
            codec_sample_rate_bitrate. So an mp3 with 22.05kHz sample rate at
            32kbs is represented as mp3_22050_32. MP3 with 192kbps bitrate
            requires you to be subscribed to Creator tier or above. PCM with
            44.1kHz sample rate requires you to be subscribed to Pro tier or
            above. Note that the μ-law format (sometimes written mu-law, often
            approximated as u-law) is commonly used for Twilio audio inputs.
          required: false
          schema:
            $ref: '#/components/schemas/type_:AllowedOutputFormats'
        - name: xi-api-key
          in: header
          required: false
          schema:
            type: string
      responses:
        '200':
          description: The generated audio file in the format specified
          content:
            application/octet-stream:
              schema:
                type: string
                format: binary
        '422':
          description: Validation Error
          content: {}
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                prompt:
                  type: string
                  description: >-
                    A simple text prompt to generate a song from. Cannot be used
                    in conjunction with `composition_plan`.
                composition_plan:
                  $ref: '#/components/schemas/type_:MusicPrompt'
                  description: >-
                    A detailed composition plan to guide music generation.
                    Cannot be used in conjunction with `prompt`.
                music_length_ms:
                  type: integer
                  description: >-
                    The length of the song to generate in milliseconds. Used
                    only in conjunction with `prompt`. Must be between 3000ms
                    and 600000ms. Optional - if not provided, the model will
                    choose a length based on the prompt.
                model_id:
                  type: string
                  enum:
                    - type: stringLiteral
                      value: music_v1
                  description: The model to use for the generation.
                force_instrumental:
                  type: boolean
                  default: false
                  description: >-
                    If true, guarantees that the generated song will be
                    instrumental. If false, the song may or may not be
                    instrumental depending on the `prompt`. Can only be used
                    with `prompt`.
                respect_sections_durations:
                  type: boolean
                  default: true
                  description: >-
                    Controls how strictly section durations in the
                    `composition_plan` are enforced. Only used with
                    `composition_plan`. When set to true, the model will
                    precisely respect each section's `duration_ms` from the
                    plan. When set to false, the model may adjust individual
                    section durations which will generally lead to better
                    generation quality and improved latency, while always
                    preserving the total song duration from the plan.
                store_for_inpainting:
                  type: boolean
                  default: false
                  description: >-
                    Whether to store the generated song for inpainting. Only
                    available to enterprise clients with access to the
                    inpainting API.
                sign_with_c2pa:
                  type: boolean
                  default: false
                  description: >-
                    Whether to sign the generated song with C2PA. Applicable
                    only for mp3 files.
components:
  schemas:
    type_:AllowedOutputFormats:
      type: string
      enum:
        - value: mp3_22050_32
        - value: mp3_24000_48
        - value: mp3_44100_32
        - value: mp3_44100_64
        - value: mp3_44100_96
        - value: mp3_44100_128
        - value: mp3_44100_192
        - value: pcm_8000
        - value: pcm_16000
        - value: pcm_22050
        - value: pcm_24000
        - value: pcm_32000
        - value: pcm_44100
        - value: pcm_48000
        - value: ulaw_8000
        - value: alaw_8000
        - value: opus_48000_32
        - value: opus_48000_64
        - value: opus_48000_96
        - value: opus_48000_128
        - value: opus_48000_192
    type_:TimeRange:
      type: object
      properties:
        start_ms:
          type: integer
        end_ms:
          type: integer
      required:
        - start_ms
        - end_ms
    type_:SectionSource:
      type: object
      properties:
        song_id:
          type: string
          description: >-
            The ID of the song to source the section from. You can find the song
            ID in the response headers when you generate a song.
        range:
          $ref: '#/components/schemas/type_:TimeRange'
          description: The range to extract from the source song.
        negative_ranges:
          type: array
          items:
            $ref: '#/components/schemas/type_:TimeRange'
          description: The ranges to exclude from the 'range'.
      required:
        - song_id
        - range
    type_:SongSection:
      type: object
      properties:
        section_name:
          type: string
          description: The name of the section. Must be between 1 and 100 characters.
        positive_local_styles:
          type: array
          items:
            type: string
          description: >-
            The styles and musical directions that should be present in this
            section. Use English language for best result.
        negative_local_styles:
          type: array
          items:
            type: string
          description: >-
            The styles and musical directions that should not be present in this
            section. Use English language for best result.
        duration_ms:
          type: integer
          description: >-
            The duration of the section in milliseconds. Must be between 3000ms
            and 120000ms.
        lines:
          type: array
          items:
            type: string
          description: The lyrics of the section. Max 200 characters per line.
        source_from:
          $ref: '#/components/schemas/type_:SectionSource'
          description: >-
            Optional source to extract the section from. Used for inpainting.
            Only available to enterprise clients with access to the inpainting
            API.
      required:
        - section_name
        - positive_local_styles
        - negative_local_styles
        - duration_ms
        - lines
    type_:MusicPrompt:
      type: object
      properties:
        positive_global_styles:
          type: array
          items:
            type: string
          description: >-
            The styles and musical directions that should be present in the
            entire song. Use English language for best result.
        negative_global_styles:
          type: array
          items:
            type: string
          description: >-
            The styles and musical directions that should not be present in the
            entire song. Use English language for best result.
        sections:
          type: array
          items:
            $ref: '#/components/schemas/type_:SongSection'
          description: The sections of the song.
      required:
        - positive_global_styles
        - negative_global_styles
        - sections

```

## SDK Code Examples

```typescript
import { ElevenLabsClient, ElevenLabsEnvironment } from "@elevenlabs/elevenlabs-js";

async function main() {
    const client = new ElevenLabsClient({
        environment: ElevenLabsEnvironment.Production,
    });
    await client.music.compose({});
}
main();

```

```python
from elevenlabs import ElevenLabs
from elevenlabs.environment import ElevenLabsEnvironment

client = ElevenLabs(
    environment=ElevenLabsEnvironment.PRODUCTION
)

client.music.compose()

```

```go
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.elevenlabs.io/v1/music"

	payload := strings.NewReader("{}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.elevenlabs.io/v1/music")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Content-Type"] = 'application/json'
request.body = "{}"

response = http.request(request)
puts response.read_body
```

```java
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.elevenlabs.io/v1/music")
  .header("Content-Type", "application/json")
  .body("{}")
  .asString();
```

```php
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.elevenlabs.io/v1/music', [
  'body' => '{}',
  'headers' => [
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp
using RestSharp;

var client = new RestClient("https://api.elevenlabs.io/v1/music");
var request = new RestRequest(Method.POST);
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["Content-Type": "application/json"]
let parameters = [] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.elevenlabs.io/v1/music")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

***

title: Introduction
subtitle: >-
Explore the ElevenLabs API reference with comprehensive guides, code examples,
and endpoint documentation
hide-feedback: true
-------------------

## Installation

You can interact with the API through HTTP or Websocket requests from any language, via our official Python bindings or our official Node.js libraries.

To install the official Python bindings, run the following command:

```bash
pip install elevenlabs
```

To install the official Node.js library, run the following command in your Node.js project directory:

```bash
npm install @elevenlabs/elevenlabs-js
```

## Tracking generation costs

Access response headers to retrieve generation metadata including character costs.

<CodeBlocks>
  <CodeBlock title="Python">
    ```python
    from elevenlabs.client import ElevenLabs

    client = ElevenLabs(api_key="your_api_key")

    # Get raw response with headers
    response = client.text_to_speech.with_raw_response.convert(
        text="Hello, world!",
        voice_id="voice_id"
    )

    # Access character cost from headers
    char_cost = response.headers.get("x-character-count")
    request_id = response.headers.get("request-id")
    audio_data = response.data
    ```
  </CodeBlock>

  <CodeBlock title="JavaScript">
    ```typescript
    import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

    const client = new ElevenLabsClient({ apiKey: 'your_api_key' });

    // Get raw response with headers
    const { data, rawResponse } = await client.textToSpeech
      .convert('voice_id', {
        text: 'Hello, world!',
        modelId: 'eleven_multilingual_v2',
      })
      .withRawResponse();

    // Access character cost from headers
    const charCost = rawResponse.headers.get('x-character-count');
    const requestId = rawResponse.headers.get('request-id');
    const audioData = data;
    ```
  </CodeBlock>
</CodeBlocks>

The raw response provides access to:

* Response data - The actual API response content
* HTTP headers - Metadata including character costs and request IDs

<div id="overview-wave">
  <ElevenLabsWaveform color="gray" />
</div>

***

title: API Authentication
subtitle: Learn how to authenticate your ElevenLabs API requests
hide-feedback: true
-------------------

## API Keys

The ElevenLabs API uses API keys for authentication. Every request to the API must include your API key, used to authenticate your requests and track usage quota.

Each API key can be scoped to one of the following:

1. **Scope restriction:** Set access restrictions by limiting which API endpoints the key can access.
2. **Credit quota:** Define custom credit limits to control usage.

**Remember that your API key is a secret.** Do not share it with others or expose it in any client-side code (browsers, apps).

All API requests should include your API key in an `xi-api-key` HTTP header as follows:

```bash
xi-api-key: ELEVENLABS_API_KEY
```

### Making requests

You can paste the command below into your terminal to run your first API request. Make sure to replace `$ELEVENLABS_API_KEY` with your secret API key.

```bash
curl 'https://api.elevenlabs.io/v1/models' \
  -H 'Content-Type: application/json' \
  -H 'xi-api-key: $ELEVENLABS_API_KEY'
```

Example with the `elevenlabs` Python package:

```python
from elevenlabs.client import ElevenLabs

elevenlabs = ElevenLabs(
  api_key='YOUR_API_KEY',
)
```

Example with the `elevenlabs` Node.js package:

```javascript
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient({
  apiKey: 'YOUR_API_KEY',
});
```

### Single use tokens

For certain endpoints, you can use single use tokens to authenticate your requests. These tokens are valid for a limited time and can be used to connect to the API without exposing your API key, for example from the client side.

See the [Single use tokens](/docs/api-reference/tokens/create) documentation for more information.

***

title: Streaming
subtitle: >-
Learn how to stream real-time audio from the ElevenLabs API using chunked
transfer encoding
-----------------

The ElevenLabs API supports real-time audio streaming for select endpoints, returning raw audio bytes (e.g., MP3 data) directly over HTTP using chunked transfer encoding. This allows clients to process or play audio incrementally as it is generated.

Our official [Node](https://github.com/elevenlabs/elevenlabs-js) and [Python](https://github.com/elevenlabs/elevenlabs-python) libraries include utilities to simplify handling this continuous audio stream.

Streaming is supported for the [Text to Speech API](/docs/api-reference/text-to-speech/stream), [Voice Changer API](/docs/api-reference/speech-to-speech/stream) & [Audio Isolation API](/docs/api-reference/audio-isolation/stream). This section focuses on how streaming works for requests made to the Text to Speech API.

In Python, a streaming request looks like:

```python
from elevenlabs import stream
from elevenlabs.client import ElevenLabs

elevenlabs = ElevenLabs()

audio_stream = elevenlabs.text_to_speech.stream(
    text="This is a test",
    voice_id="JBFqnCBsd6RMkjVDRZzb",
    model_id="eleven_multilingual_v2"
)

# option 1: play the streamed audio locally
stream(audio_stream)

# option 2: process the audio bytes manually
for chunk in audio_stream:
    if isinstance(chunk, bytes):
        print(chunk)
```

In Node / Typescript, a streaming request looks like:

```javascript maxLines=0
import { ElevenLabsClient, stream } from '@elevenlabs/elevenlabs-js';
import { Readable } from 'stream';

const elevenlabs = new ElevenLabsClient();

async function main() {
  const audioStream = await elevenlabs.textToSpeech.stream('JBFqnCBsd6RMkjVDRZzb', {
    text: 'This is a test',
    modelId: 'eleven_multilingual_v2',
  });

  // option 1: play the streamed audio locally
  await stream(Readable.from(audioStream));

  // option 2: process the audio manually
  for await (const chunk of audioStream) {
    console.log(chunk);
  }
}

main();
```
