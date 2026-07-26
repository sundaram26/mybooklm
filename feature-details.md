# NotebookLM Backend: Complete Feature Details & Integration Guide

This document provides a highly detailed breakdown of all the current features, mechanics, and endpoints available on the backend to help the frontend leverage the full capabilities of our NotebookLM clone.

---

## 📋 Third-Party Setup & API Keys Required

Other than **Backblaze B2** (which is already configured), the following third-party credentials and services are needed:

### 1. Core Services (Docker Compose)
* **PostgreSQL**: Primary transactional database. Mapped to port `5432` by compose configuration.
* **Qdrant**: High-performance vector database. Mapped to port `6333` by compose configuration.

### 2. Authentication (Better Auth Credentials)
* **`BETTER_AUTH_SECRET`**: A random 32-character string used to hash and encrypt auth session tokens.
* **`BETTER_AUTH_URL`**: The public base URL of the backend (e.g. `http://localhost:3000`).
* **OAuth Credentials (Social logins)**:
  * **Google OAuth**: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Get this from Google Cloud Console.
  * **GitHub OAuth**: `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. Get this from GitHub Developer Settings.

### 3. LLM API Keys & Configurable Models
These keys and configurations drive RAG query optimization, HyDE documents, embedding generation, reranking, and synthesis. We support:
* **`GEMINI_API_KEY`** (Google AI Studio) - *Primary default*
* **`OPENAI_API_KEY`** (OpenAI platform)
* **`ANTHROPIC_API_KEY`** (Anthropic Console)

You can also customize the exact model IDs used by the backend in your `.env` file:
* **`GEMINI_MODEL`** (Optional, defaults to `"gemini-2.0-flash"`)
* **`OPENAI_MODEL`** (Optional, defaults to `"gpt-4o-mini"`)
* **`ANTHROPIC_MODEL`** (Optional, defaults to `"claude-3-5-haiku-20241022"`)

---

## 🛠️ Complete Feature Details

### 1. 🔐 Authentication System (Better Auth + Guest Mode)
The backend uses **Better Auth** with a unified session middleware system (`res.locals.user`).
* **Anonymous Sessions**: The backend integrates Better Auth's `anonymous` plugin. When users browse the frontend without registering, the frontend can request an anonymous session. These sessions behave like temporary guest profiles, which can be linked/upgraded to permanent accounts later.
* **User vs Guest Routing**:
  * `requireAuth` routes: Require a valid session (anonymous or registered). Blocks pure unauthenticated traffic with `401`.
  * `optionalAuth` routes: Allow guest users without a session header to access endpoints.
* **Middleware Context**: Both middlewares attach `res.locals.user` and `res.locals.session` to the request when present.

---

### 2. 📁 Notebook Management
Notebooks represent logical workspaces or "folders" containing documents and chat sessions.
* **Database fields**:
  * `userId`: Reference to a registered user.
  * `guestId`: A client-side generated UUID (e.g. stored in local storage) used to identify unauthenticated guest users.
* **Endpoints**:
  * **Create**: `POST /api/notebooks` (body: `{ title: string, guestId?: string }`)
  * **List**: `GET /api/notebooks?guestId=uuid` (queries notebooks matching either current `userId` OR `guestId`)
  * **Retrieve**: `GET /api/notebooks/:id` (returns notebook with documents list)
  * **Rename**: `PUT /api/notebooks/:id` (body: `{ title: string }`)
  * **Delete**: `DELETE /api/notebooks/:id`
* **Cascading Cleanup**: Deleting a notebook triggers a cascade cleanup of all associated files, DB records, chat sessions, messages, and Qdrant vector points.

---

### 3. 📄 Document Ingestion Pipeline
Documents can be uploaded in four formats and are processed asynchronously.
* **Endpoints**:
  * **File Upload**: `POST /api/notebooks/:notebookId/documents/file` (form-data: `file: File`). Supports PDF, Word (`.doc`/`.docx`), Plain Text (`.txt`/`.md`/`.csv`), Subtitles (`.srt`/`.vtt`). Max size: 50MB.
  * **Image Upload**: `POST /api/notebooks/:notebookId/documents/image` (form-data: `image: File`). Supports JPEG, PNG, WEBP, GIF. Max size: 10MB.
  * **Text Clip**: `POST /api/notebooks/:notebookId/documents/text` (json: `{ content: string, title?: string }`)
  * **Web/YouTube Link**: `POST /api/notebooks/:notebookId/documents/link` (json: `{ url: string }`). Automatically parses web articles or YouTube video transcripts.
* **Status States**:
  Every document has a `status` field: `"PENDING"` ➔ `"PROCESSING"` ➔ `"COMPLETED"` or `"FAILED"`.
* **Mechanical Steps**:
  1. The document DB record is created as `"PENDING"`.
  2. The document is pushed to an in-memory task queue (limited to 2 concurrent workers).
  3. Raw files are uploaded to Backblaze B2 (or local fallback storage) under the key `{notebookId}/{documentId}-{filename}`.
  4. The parser parses content based on type:
     * **PDFs**: Extracts text page-by-page.
     * **Word/DOCX**: Extracts textual content.
     * **Plain Text**: Reads raw string.
     * **Subtitles**: Parses subtitles.
     * **Images**: Runs Gemini 1.5 Flash (or GPT-4o Mini) visual transcription to generate markdown details of diagrams, text, and charts.
  5. The raw text is chunked using a `RecursiveCharacterTextSplitter` (chunkSize: 1000, overlap: 200).
  6. Batch embeddings are generated for all chunks.
  7. Vector points are upserted into Qdrant containing the payload metadata (`documentId`, `notebookId`, page indicators, source references, text snippet).
  8. DB state is marked `"COMPLETED"`.
* **Stuck Queue Recovery**: On backend restart, a background hook queries documents left in `"PENDING"` or `"PROCESSING"` states and re-queues them automatically.

---

### 4. 🔒 Secure Streaming View Proxy
* **Endpoint**: `GET /api/notebooks/documents/:id/view`
* **Mechanics**: Documents are stored in private S3/Backblaze B2 buckets for user privacy. The frontend must not link to raw cloud storage URLs. Instead, the frontend calls the view proxy.
* **Features**:
  * Automatically downloads the raw file from cloud storage.
  * Sets the correct `Content-Type` (e.g. `application/pdf`).
  * Sets `Content-Disposition: inline; filename="..."` with URL-safe encoding so PDFs, images, and texts open directly in-browser tabs with correct default names when downloaded.

---

### 5. 🔒 Grounded RAG Retrieval
* **Endpoints**:
  * `GET /api/notebooks/:notebookId/retrieve?query=xyz&useHyde=true&limit=5`
  * `POST /api/notebooks/:notebookId/retrieve` (body: `{ query: string, useHyde?: boolean, limit?: number }`)
* **Advanced Pipeline stages**:
  1. **Query Optimization**: Re-writes the search query using an LLM to formulate it cleanly for semantic retrieval.
  2. **HyDE (Hypothetical Document Embeddings)**: If `useHyde: true` is sent, generates a hypothetical LLM answer first, gets the embedding of that paragraph, and searches using the answer vector (substantially improves zero-shot retrieval).
  3. **Recall Vector Search**: Fetches the Top 30 candidate chunks matching the notebook filter from Qdrant.
  4. **LLM Reranking**: Passes the user query and candidate chunks to an LLM to rate each snippet's relevance (0 to 10). Re-sorts the list and returns the top `limit` results.

---

### 6. 💬 Grounded Chat Synthesis & Branching

#### RAG Synthesis Response
* **Endpoints**:
  * Non-streaming: `POST /api/notebooks/:notebookId/chats/:sessionId/messages` (body: `{ query: string, parentId?: string, apiKey?: string, modelId?: string }`)
  * Streaming (SSE): `POST /api/notebooks/:notebookId/chats/:sessionId/messages` (body: `{ query: string, stream: true, ... }`)
* **SSE Event Payloads**:
  1. Returns `data: {"sources": [...]}` containing the retrieved grounded sources.
  2. Streams token chunks: `data: {"chunk": "..."}`.
  3. Returns final status: `data: {"done": true, "messageId": "msg-uuid", "userMessageId": "user-uuid"}`.
* **inline Citations**: The LLM automatically inserts `[1]`, `[2]`, etc. inline. The controller appends a **Sources** footer containing names and locators (e.g. `Page 4`, `Timestamp 120s`).

#### Chat Branching (Tree Structure)
* **How it works**: Every `ChatMessage` stores a `parentId`. Assistant responses store the user query's ID as parent, and user queries store the previous message node as parent.
* **Context building**: When `parentId` is passed in the request body, the backend recursively walks up the parent tree back to the root to build a chronological context history of that exact branch. It bypasses linear database records.
* **Branch traversal**:
  * **Fetch branches**: `GET /api/notebooks/:notebookId/chats/:sessionId/messages/:messageId/replies`
  * Returns all direct replies branching from any message node.

#### Custom API Keys
* **apiKey & modelId**: Users can input their own keys in the frontend UI.
  * If both `apiKey` and `modelId` (e.g. `gpt-4o`, `gemini-2.0-flash`, `claude-3-5-sonnet-20241022`) are sent in `sendMessage`, the backend bypasses global server configurations and routes requests directly using the user's key.

#### Guest Prompt limits
* Unauthenticated/guest users can upload any number of documents but are **limited to 10 chat prompts per notebook**.
* Once exceeded, chat synthesizers return `429 Too Many Requests` with:
  `{ success: false, code: "GUEST_LIMIT_REACHED", message: "..." }`.
* Successful guest turns return the count of used and limit prompts: `guestPromptsUsed` & `guestPromptLimit`.

---

### 7. 🛡️ Abuse Protection Rate Limiting
A custom, zero-dependency Token Bucket rate limiter regulates traffic on the backend.
* **Rate Limits Configured**:
  * **Standard CRUD (Notebooks / lists)**: Max `100` reqs/min per IP.
  * **Chat Synthesis (RAG chats)**: Max `20` reqs/min per IP.
  * **Ingestions (Uploads)**: Max `10` uploads/min per IP.
* **Headers**: Every response returns standard rate limiting headers:
  * `X-RateLimit-Limit`: Max limit
  * `X-RateLimit-Remaining`: Remaining bucket tokens
