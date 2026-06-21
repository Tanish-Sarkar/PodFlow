### Migration to Google GenAI SDK — `migration.md`

> **From the source document:**  
> *Starting with the Gemini 2.0 release in late 2024, we introduced a new set of libraries called the Google GenAI SDK.*  
> *The Google GenAI SDK is now in General Availability (GA) across all supported platforms.* 

---

## Summary
This migration guide lists **what changed**, **what’s new**, and **concrete code edits** your agent should apply across a codebase that uses the legacy `google-generativeai` SDK. It is organized so an automated agent can follow the checklist and apply changes reliably.

---

## Key changes (high level)

| **Area** | **Legacy behavior** | **New behavior (GenAI SDK)** |
|---|---:|---|
| **Client model** | Direct use of `GenerativeModel` objects | Single central `Client()` object; services under `client` |
| **Authentication** | `genai.configure(api_key=...)` or implicit | `GEMINI_API_KEY` env var or `genai.Client(api_key=...)` |
| **API calls** | Methods on model instances | `client.models.*`, `client.chats.*`, `client.files.*`, `client.caches.*` |
| **Config objects** | `GenerationConfig` from legacy module | `google.genai.types` pydantic config classes or dicts |
| **Streaming** | `model.generate_content(..., stream=True)` | `client.models.generate_content_stream(...)` |
| **Async** | `generate_content_async` on model | `client.aio.models.generate_content(...)` (awaitable) |
| **Function calling** | Chat-only automatic function calling | Automatic function calling by default in `generate_content`; configurable via `config` |
| **Tools (code, search)** | Tools passed as strings or ad-hoc | `types.Tool(...)` objects inside `GenerateContentConfig` |
| **Files & caching** | `genai.upload_file`, `caching.CachedContent` | `client.files.upload`, `client.caches.create`, `client.files.list/get/delete` |
| **JSON schema parsing** | `response_schema` + `response_mime_type` | Pydantic models as schema; parsed result in `response.parsed` |
| **Images & embeddings** | Separate image model classes | `client.models.generate_images(...)`, `client.models.embed_content(...)` |

---

## Migration checklist (agent actionable steps)

1. **Replace imports**
   - **Before:** `import google.generativeai as genai`
   - **After:** `from google import genai`  
   - **Also add:** `from google.genai import types` where config classes are used.

2. **Create and use a central client**
   - Add `client = genai.Client()` at module entry points or factory functions.
   - Replace direct `GenerativeModel(...)` instantiations and calls with `client.models.*` or `client.chats.*`.

3. **Authentication**
   - Ensure environment variable `GEMINI_API_KEY` is set in deployment and CI.
   - Optionally, replace any `genai.configure(api_key=...)` calls with `client = genai.Client(api_key="...")`.

4. **Update API call signatures**
   - Convert positional/legacy calls to keyword args and `config` objects.
   - Replace streaming loops with `client.models.generate_content_stream(...)`.

5. **Config objects**
   - Replace `genai.GenerationConfig(...)` with `types.GenerateContentConfig(...)` or pass a dict to `config=`.
   - Map fields (e.g., `max_output_tokens` → `max_output_tokens`, `system_instruction` → `system_instruction`).

6. **Function calling & tools**
   - Wrap tools in `types.Tool(...)` or pass Python callables in `config.tools`.
   - To disable automatic function calling, set `config=types.GenerateContentConfig(automatic_function_calling={'disable': True})`.

7. **Files & caching**
   - Replace `genai.upload_file(...)` with `client.files.upload(file=...)`.
   - Replace caching APIs with `client.caches.create(...)` and reference `cached_content` by name in `GenerateContentConfig`.

8. **Async**
   - Replace `generate_content_async` with `await client.aio.models.generate_content(...)`.

9. **JSON schema**
   - Convert typed dict schemas to pydantic `BaseModel` classes and pass them as `response_schema` in `config`.
   - Read parsed results from `response.parsed`.

10. **Images & embeddings**
    - Replace legacy image model usage with `client.models.generate_images(...)`.
    - Replace `genai.embed_content(...)` with `client.models.embed_content(...)`.

11. **Token counting**
    - Replace `model.count_tokens(...)` with `client.models.count_tokens(model=..., contents=...)`.

12. **Testing**
    - Add unit tests for each replaced call, verifying the new `client` call is invoked with expected args.
    - Add integration tests for file upload/list/get/delete and caching flows.

---

## Concrete code diffs (representative examples)

### 1) Basic text generation

**Before**
```python
import google.generativeai as genai

model = genai.GenerativeModel('gemini-3.5-flash')
response = model.generate_content('Tell me a story in 300 words')
print(response.text)
```

**After**
```python
from google import genai

client = genai.Client()
response = client.models.generate_content(
    model='gemini-3.5-flash',
    contents='Tell me a story in 300 words.'
)
print(response.text)
```

---

### 2) Image input + text generation (PIL auto-conversion)

**Before**
```python
import google.generativeai as genai
from PIL import Image

model = genai.GenerativeModel('gemini-3.5-flash')
response = model.generate_content([
    'Tell me a story based on this image',
    Image.open(image_path)
])
print(response.text)
```

**After**
```python
from google import genai
from PIL import Image

client = genai.Client()
response = client.models.generate_content(
    model='gemini-3.5-flash',
    contents=[
        'Tell me a story based on this image',
        Image.open(image_path)
    ]
)
print(response.text)
```

---

### 3) Streaming

**Before**
```python
response = model.generate_content("Write a cute story about cats.", stream=True)
for chunk in response:
    print(chunk.text)
```

**After**
```python
from google import genai
client = genai.Client()

for chunk in client.models.generate_content_stream(
    model='gemini-3.5-flash',
    contents='Write a cute story about cats.'
):
    print(chunk.text)
```

---

### 4) Safety settings (example)

**After**
```python
from google import genai
from google.genai import types

client = genai.Client()
response = client.models.generate_content(
    model='gemini-3.5-flash',
    contents='say something bad',
    config=types.GenerateContentConfig(
        safety_settings=[
            types.SafetySetting(
                category='HARM_CATEGORY_HATE_SPEECH',
                threshold='BLOCK_ONLY_HIGH'
            )
        ]
    )
)
```

---

### 5) Files upload and use

**Before**
```python
file = genai.upload_file(path='a11.txt')
response = model.generate_content(['Can you summarize this file:', file])
```

**After**
```python
from google import genai
client = genai.Client()

my_file = client.files.upload(file='a11.txt')
response = client.models.generate_content(
    model='gemini-3.5-flash',
    contents=['Can you summarize this file:', my_file]
)
```

---

## Files to update in your repo (agent tasks)
- **Replace** any module-level imports of `google.generativeai` with `from google import genai`.
- **Search & replace** patterns:
  - `GenerativeModel(` → remove and replace with `client.models.*` calls.
  - `genai.configure(` → remove; ensure `GEMINI_API_KEY` or `Client(api_key=...)`.
  - `generate_content_async` → `client.aio.models.generate_content`.
  - `upload_file(` → `client.files.upload`.
  - `list_files()` → `client.files.list()`.
  - `delete_file(` → `client.files.delete(name=...)`.
  - `embed_content(` → `client.models.embed_content`.
- **Add** `from google.genai import types` where `config` or `Tool` objects are used.

---

## Testing & validation checklist
- Unit tests assert that:
  - `client` is created once per process or per request context.
  - Calls use keyword args and `config` objects.
- Integration tests:
  - File upload → list → get → delete roundtrip.
  - Streaming endpoint yields chunks.
  - Async calls succeed under `client.aio`.
  - Function-calling flows: tool invocation and disabling automatic function calling.
- Manual smoke tests:
  - Generate text, images, embeddings, and token counts against a staging API key.

---

## Notes, gotchas, and recommendations
- **Pydantic models:** New SDK returns pydantic objects; use `.model_dump_json()` or `.parsed` for structured outputs.
- **Automatic function calling:** Now default for `generate_content`. If your code relied on manual parsing, explicitly disable or adapt to the new default.
- **Environment variable:** Ensure `GEMINI_API_KEY` is set in CI/CD and runtime environments.
- **One client per process:** Prefer a single `genai.Client()` instance reused across modules to centralize config and credentials.
- **Tool objects:** When using tools (code execution, google_search), wrap them in `types.Tool(...)` and include in `GenerateContentConfig`.
- **Versioning:** Update `requirements` or `pyproject` to install the new package name if applicable (`google-genai`) and pin the SDK version used in your environment.

---

## Example agent task list (to run sequentially)
1. Add `client = genai.Client()` to `app/__init__.py` or equivalent bootstrap.
2. Replace imports and update all call sites (apply automated regex transforms).
3. Convert config objects to `types.GenerateContentConfig` or dicts.
4. Replace file and cache APIs.
5. Update tests and run CI.
6. Deploy to staging and run integration smoke tests.

---

## References
- Migration source: *Migrate to the Google GenAI SDK (Gemini API) — Google AI for Developers.* 

---