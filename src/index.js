const GITHUB_API_BASE = "https://api.github.com/repos";

async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers = {
    "User-Agent": "RepoPulse-CLI",
    Accept: "application/vnd.github.v3+json",
  };

  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(url, { signal: controller.signal, headers });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 409 && url.includes("/commits")) {
        return [];
      }
      if (response.status === 404) {
        throw new Error(`Repository not found (404). Check your spelling.`);
      }
      if (response.status === 403 || response.status === 429) {
        throw new Error(
          `GitHub API rate limit exceeded. Set a GITHUB_TOKEN environment variable.`,
        );
      }
      throw new Error(
        `GitHub API Error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error(
        `API request timed out after ${timeoutMs}ms. The GitHub API is currently too slow.`,
      );
    }
    throw error;
  }
}

async function analyzeRepo(repoPath) {
  console.log(`\n Analyzing health for: \x1b[36m${repoPath}\x1b[0m...`);

  try {
    const [repoData, commitsData] = await Promise.all([
      fetchWithTimeout(`${GITHUB_API_BASE}/${repoPath}`),
      fetchWithTimeout(`${GITHUB_API_BASE}/${repoPath}/commits?per_page=30`),
    ]);

    console.log(`\n \x1b[1mRepository Snapshot\x1b[0m`);
    console.log(`----------------------------------------`);
    console.log(` Stars:        ${repoData.stargazers_count.toLocaleString()}`);
    console.log(
      ` Open Issues:  ${repoData.open_issues_count.toLocaleString()}`,
    );
    console.log(`🍴 Forks:        ${repoData.forks_count.toLocaleString()}`);

    if (commitsData && commitsData.length > 0) {
      const latestCommitDate = new Date(commitsData[0].commit.author.date);
      const oldestCommitDate = new Date(
        commitsData[commitsData.length - 1].commit.author.date,
      );
      const timeSpanDays = Math.max(
        1,
        (latestCommitDate.getTime() - oldestCommitDate.getTime()) /
          (1000 * 3600 * 24),
      );
      const commitsPerDay = (commitsData.length / timeSpanDays).toFixed(2);

      console.log(`\n  \x1b[1mCommit Velocity (Last 30 commits)\x1b[0m`);
      console.log(`----------------------------------------`);
      console.log(`Velocity:        ~${commitsPerDay} commits/day`);
      console.log(
        `Latest commit:   ${latestCommitDate.toISOString().split("T")[0]}`,
      );
    } else {
      console.log(`\n  \x1b[1mCommit Velocity\x1b[0m`);
      console.log(`----------------------------------------`);
      console.log(`No commits found in this repository.`);
    }

    console.log(`\n Analysis complete.\n`);
  } catch (error) {
    console.error(`\n \x1b[31mOperation Failed:\x1b[0m ${error.message}\n`);
    process.exit(1);
  }
}

function validateRepoInput(input) {
  if (!input) {
    console.error(" Error: Repository input is required.");
    console.error("Usage: node src/index.js <owner>/<repo>");
    process.exit(1);
  }

  const repoRegex = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
  if (!repoRegex.test(input)) {
    console.error(
      ` Error: Invalid input format "${input}". Expected format: <owner>/<repo> (e.g., facebook/react)`,
    );
    process.exit(1);
  }

  return input;
}

const targetRepo = process.argv[2];
const validatedRepo = validateRepoInput(targetRepo);

analyzeRepo(validatedRepo);
