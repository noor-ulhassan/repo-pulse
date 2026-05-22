# Technical Assessment Answers

### 1. How to run:

Run the following command on a fresh machine (requires Node v18+). No `npm install` is required:
\`node src/index.js <owner>/<repo>\` (e.g., \`node src/index.js vercel/next.js\`)

### 2. Stack choice:

I chose **Vanilla Node.js (JavaScript)**.

- **Why:** I wanted a zero-dependency architecture. By using Node 18+, I could leverage the native `fetch` API and `AbortController` without relying on heavy third-party libraries like Axios. It keeps the project lightweight and secure.
- **Worse choice:** Building a Single Page Application (React/Vue) or a heavy TypeScript backend. A UI would expose API keys to the browser and run into CORS issues. TypeScript (which I initially considered) required too much configuration overhead (`ts-node`, `tsconfig`) for a simple script where pure JS handles the logic just as cleanly.

### 3. One real edge case:

**Edge Case:** Querying a brand-new, completely empty repository.

- **Where it's handled:** `src/index.js`, lines 28-30.
- **Explanation:** If a repo has no commits, the GitHub `/commits` API does not return an empty array `[]`. It returns a `409 Conflict` error. Without my specific check catching the 409 status, the app would fall through to the generic error handler and crash. My code intercepts the 409 and explicitly returns an empty array so the rest of the CLI can still render the basic repository stats gracefully.

### 4. AI usage:

- **Tool:** Gemini
- **What I asked:** "Help me structure a CLI that consumes the GitHub API and handles timeouts using modern Node features."
- **What it gave me:** It provided a boilerplate using TypeScript, `ts-node`, and complex compiler configurations.
- **What I changed & Why:** I completely stripped out the TypeScript implementation. While TS is great for large codebases, the tooling overhead was getting in the way of the core logic for this assessment. I refactored the AI's output into pure, vanilla JavaScript to achieve a true zero-dependency architecture.

### 5. Honest gap:

**The Gap:** The tool currently has no caching mechanism.
**The Fix:** If I query `facebook/react`, and then query it again 5 seconds later, it hits the GitHub API twice, unnecessarily eating into the rate limit. With another day, I would implement a local caching layer (writing the JSON response to a temporary `.repopulse_cache.json` file with a TTL of 5 minutes). The script would check the cache file's modified date before making a network request, drastically improving speed and respecting the API's limits.
