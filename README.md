# RepoPulse: GitHub Repository Health Analyzer

RepoPulse is a zero-dependency CLI tool built with native Node.js. It aggregates data from the GitHub API to provide a "Health Snapshot" of a public repository, calculating metrics like commit velocity and highlighting core repository statistics.

## Prerequisites

- Node.js (v18 or higher required for native `fetch` support)

## How to Run

Since this project has zero external dependencies, you do not even need to run `npm install`.

Provide the repository in `<owner>/<repo>` format:
\`\`\`bash
node src/index.js facebook/react
\`\`\`

## Handling Rate Limits (Optional)

The GitHub public API enforces a strict rate limit for unauthenticated requests (60 per hour). If you encounter a `403 Rate limit exceeded` error, you can provide a personal access token to bypass it:

**Mac/Linux:**
\`\`\`bash
GITHUB_TOKEN=your_token_here node src/index.js facebook/react
\`\`\`

**Windows (Command Prompt):**
\`\`\`cmd
set GITHUB_TOKEN=your_token_here
node src/index.js facebook/react
\`\`\`

## Resilience Features Tested

- **Bad Input:** Handled via strict Regex validation before any network calls are made.
- **API Error (404 / 409):** Catches missing repositories (404) and handles brand-new empty repositories (409) gracefully without crashing.
- **Slow API / Timeouts:** Uses `AbortController` set to 5000ms. If the API hangs, the request is terminated to prevent terminal lockup.
