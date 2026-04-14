import { mkdir, readFile, writeFile } from "node:fs/promises";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const reportsDir = path.join(repoRoot, "reports", "prospecting");
const latestMarkdownPath = path.join(reportsDir, "latest.md");
const latestJsonPath = path.join(reportsDir, "latest.json");
const statePath = path.join(reportsDir, "state.json");
const PREFERRED_SUBREDDIT_SCORES = {
  ClaudeAI: 5,
  ChatGPT: 5,
  GeminiAI: 4,
  OpenAI: 3,
};
const TITLE_INTENT_TERMS = [
  "how do you",
  "how are you",
  "does anyone",
  "anyone here",
  "why doesn't",
  "why doesnt",
  "need folders",
  "need folder",
  "too many chats",
  "too many conversations",
  "can't find",
  "cannot find",
  "find old chat",
  "lost a chat",
  "use both",
  "switch between",
  "juggling multiple",
  "fragmented",
  "chat clutter",
  "chat cluttering",
  "worth it",
  "stop",
  "stuck",
];
const CORE_USE_CASE_TERMS = [
  "folders",
  "folder",
  "organize chats",
  "organize conversations",
  "chat history",
  "save prompts",
  "saved prompts",
  "best prompts",
  "prompt library",
  "reusable prompts",
  "chat clutter",
  "chat cluttering",
  "too many chats",
  "too many conversations",
  "can't find",
  "cannot find",
  "find old chat",
  "find old chats",
  "lost a chat",
  "sidebar",
  "search chats",
  "search conversations",
];
const MULTI_TOOL_TERMS = [
  "use both",
  "switch between",
  "multiple ai tools",
  "juggling multiple",
  "fragmented",
  "fragmentation",
];
const PAIN_SIGNAL_TERMS = [
  "how do you",
  "does anyone",
  "anyone here",
  "why doesn't",
  "why doesnt",
  "struggling",
  "overwhelmed",
  "messy",
  "chaos",
  "chaotic",
  "clutter",
  "cluttering",
  "broken",
  "lost",
  "buried",
  "can't find",
  "cannot find",
  "need folders",
  "need folder",
  "what do you do",
];
const SHOWCASE_TERMS = [
  "i built",
  "we built",
  "i made",
  "we made",
  "launch",
  "launched",
  "now live",
  "are here",
  "is here",
  "dropped today",
  "github",
  "open source",
  "open-source",
  "source available",
  "free to try",
  "check it out",
  "demo",
  "walkthrough",
  "feedback welcome",
  "roast me",
];
const HARD_BLOCK_TERMS = [
  "cli",
  "claude code",
  "cursor",
  "codex",
  "terminal",
  "command line",
  "android",
  "iphone",
  "ipad",
  "ios",
  "mobile app",
  "app only",
];

const args = new Set(process.argv.slice(2));
const useSample = args.has("--sample");
const includeSeen = args.has("--include-seen");

const config = await loadConfig();
const state = await loadState();
const runDate = new Date();

const redditPosts = useSample
  ? await loadSamplePosts()
  : await fetchRedditPosts(config.reddit, config.reddit.userAgent);

const scoredPosts = redditPosts
  .map((post) => scorePost(post, config.scoring, runDate))
  .filter((post) => post.qualified)
  .filter((post) => post.score >= config.scoring.minimumScore)
  .filter((post) => includeSeen || !state.seenRedditPostIds.includes(post.id))
  .sort((left, right) => right.score - left.score || right.createdUtc - left.createdUtc);

const leads = scoredPosts.slice(0, 12).map((post) => ({
  ...post,
  draft: buildDraft(post, config.project),
}));

const xWatchlist = buildXWatchlist(config.x.queries);

const report = {
  generatedAt: runDate.toISOString(),
  mode: useSample ? "sample" : "live",
  totals: {
    scannedPosts: redditPosts.length,
    matchingPosts: scoredPosts.length,
    surfacedLeads: leads.length,
  },
  leads,
  xWatchlist,
};

await mkdir(reportsDir, { recursive: true });

const dateStamp = runDate.toISOString().slice(0, 10);
const markdown = renderMarkdownReport(report, config);
const json = JSON.stringify(report, null, 2);

await writeFile(path.join(reportsDir, `${dateStamp}.md`), markdown, "utf8");
await writeFile(path.join(reportsDir, `${dateStamp}.json`), json, "utf8");
await writeFile(latestMarkdownPath, markdown, "utf8");
await writeFile(latestJsonPath, json, "utf8");

const nextState = {
  seenRedditPostIds: dedupe([
    ...state.seenRedditPostIds,
    ...leads.map((lead) => lead.id),
  ]),
  lastRunAt: runDate.toISOString(),
};

await writeFile(statePath, JSON.stringify(nextState, null, 2), "utf8");

console.log(`Prospecting digest generated: ${path.relative(repoRoot, latestMarkdownPath)}`);
console.log(`Surfaced ${leads.length} leads from ${redditPosts.length} scanned posts.`);

async function loadConfig() {
  const configPath = path.join(__dirname, "config.json");
  const fallbackPath = path.join(__dirname, "config.example.json");

  try {
    return JSON.parse(await readFile(configPath, "utf8"));
  } catch {
    return JSON.parse(await readFile(fallbackPath, "utf8"));
  }
}

async function loadState() {
  try {
    return JSON.parse(await readFile(statePath, "utf8"));
  } catch {
    return {
      seenRedditPostIds: [],
      lastRunAt: null,
    };
  }
}

async function loadSamplePosts() {
  const samplePath = path.join(__dirname, "fixtures", "reddit-new-sample.json");
  const payload = JSON.parse(await readFile(samplePath, "utf8"));
  return normalizeRedditPayload(payload);
}

async function fetchRedditPosts(redditConfig, userAgent) {
  const posts = [];
  const seenIds = new Set();

  for (const subreddit of redditConfig.subreddits) {
    const searchQueries = redditConfig.queries ?? [];

    if (redditConfig.mode === "search" && searchQueries.length > 0) {
      for (const query of searchQueries) {
        const url = new URL(`https://www.reddit.com/r/${subreddit.name}/search.json`);
        url.searchParams.set("q", query);
        url.searchParams.set("restrict_sr", "on");
        url.searchParams.set("sort", "new");
        url.searchParams.set("t", String(redditConfig.timeWindow ?? "month"));
        url.searchParams.set("limit", String(redditConfig.postsPerQuery ?? 10));
        url.searchParams.set("raw_json", "1");

        const payload = await fetchJson(url, {
          "User-Agent": userAgent || "orenivo-prospecting/0.1",
        });

        const normalized = normalizeRedditPayload(payload).map((post) => ({
          ...post,
          subredditFocus: subreddit.focus,
          matchedQuery: query,
        }));

        for (const post of normalized) {
          if (seenIds.has(post.id)) continue;
          seenIds.add(post.id);
          posts.push(post);
        }

        await sleep(300);
      }

      continue;
    }

    const url = new URL(`https://www.reddit.com/r/${subreddit.name}/new.json`);
    url.searchParams.set("limit", String(redditConfig.postsPerSubreddit ?? 25));
    url.searchParams.set("raw_json", "1");

    const payload = await fetchJson(url, {
      "User-Agent": userAgent || "orenivo-prospecting/0.1",
    });
    const normalized = normalizeRedditPayload(payload).map((post) => ({
      ...post,
      subredditFocus: subreddit.focus,
    }));

    for (const post of normalized) {
      if (seenIds.has(post.id)) continue;
      seenIds.add(post.id);
      posts.push(post);
    }

    await sleep(300);
  }

  return posts;
}

async function fetchJson(url, headers, attempt = 0) {
  if (typeof fetch === "function") {
    const response = await fetch(url, { headers });

    if (response.status === 429 && attempt < 3) {
      const retryAfter = Number(response.headers.get("retry-after") ?? "2");
      await sleep(Math.max(1000, retryAfter * 1000));
      return fetchJson(url, headers, attempt + 1);
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers,
      },
      (response) => {
        const statusCode = response.statusCode ?? 0;
        const retryAfterHeader = response.headers["retry-after"];
        let body = "";

        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          if (statusCode === 429 && attempt < 3) {
            const retryAfterSeconds = Number(retryAfterHeader ?? "2");
            sleep(Math.max(1000, retryAfterSeconds * 1000))
              .then(() => fetchJson(url, headers, attempt + 1))
              .then(resolve)
              .catch(reject);
            return;
          }

          if (statusCode < 200 || statusCode >= 300) {
            reject(new Error(`Request failed: ${statusCode}`));
            return;
          }

          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    request.on("error", reject);
  });
}

function normalizeRedditPayload(payload) {
  return (payload?.data?.children ?? []).map((child) => {
    const post = child.data;
    return {
      id: String(post.id),
      subreddit: String(post.subreddit),
      title: String(post.title ?? ""),
      body: String(post.selftext ?? ""),
      url: `https://www.reddit.com${post.permalink}`,
      comments: Number(post.num_comments ?? 0),
      createdUtc: Number(post.created_utc ?? 0),
    };
  });
}

function scorePost(post, scoringConfig, now) {
  const titleHaystack = post.title.toLowerCase();
  const haystack = `${post.title}\n${post.body}`.toLowerCase();
  let score = 0;
  const positives = [];
  const negatives = [];

  for (const [term, weight] of Object.entries(scoringConfig.positiveTerms ?? {})) {
    if (haystack.includes(term)) {
      score += weight;
      positives.push(term);
    }
  }

  for (const [term, weight] of Object.entries(scoringConfig.negativeTerms ?? {})) {
    if (haystack.includes(term)) {
      score += weight;
      negatives.push(term);
    }
  }

  const ageHours = Math.max(0, (now.getTime() - post.createdUtc * 1000) / 36e5);
  if (ageHours <= 24) score += 3;
  else if (ageHours <= 72) score += 2;
  else if (ageHours <= 168) score += 1;

  if (post.comments >= 15) score += 3;
  else if (post.comments >= 5) score += 1;

  const platforms = detectPlatforms(haystack);
  if (platforms.length >= 2) score += 3;

  const titleIntentMatches = findMatchingTerms(titleHaystack, TITLE_INTENT_TERMS);
  const useCaseMatches = findMatchingTerms(haystack, CORE_USE_CASE_TERMS);
  const multiToolMatches = findMatchingTerms(haystack, MULTI_TOOL_TERMS);
  const painMatches = findMatchingTerms(haystack, PAIN_SIGNAL_TERMS);
  const showcaseMatches = findMatchingTerms(titleHaystack, SHOWCASE_TERMS);
  const hardBlockMatches = findMatchingTerms(haystack, HARD_BLOCK_TERMS);
  const subredditScore = PREFERRED_SUBREDDIT_SCORES[post.subreddit] ?? -4;
  const isQuestionTitle = titleHaystack.includes("?");
  const isShowcaseTitle = looksLikeShowcaseTitle(titleHaystack);

  score += subredditScore;

  if (titleIntentMatches.length > 0) score += 6;
  if (useCaseMatches.length > 0) score += 6;
  if (painMatches.length > 0) score += 4;

  if (isQuestionTitle) score += 2;

  if (platforms.length === 0 && multiToolMatches.length === 0) {
    score -= 8;
  }

  if (titleIntentMatches.length === 0 && !isQuestionTitle) {
    score -= 6;
  }

  if (useCaseMatches.length === 0) {
    score -= 10;
  }

  if (painMatches.length === 0) {
    score -= 6;
  }

  if (showcaseMatches.length > 0 || isShowcaseTitle) {
    score -= 14;
    negatives.push(...showcaseMatches);
  }

  if (hardBlockMatches.length > 0) {
    score -= hardBlockMatches.length * 8;
    negatives.push(...hardBlockMatches);
  }

  const angle = classifyAngle(haystack, platforms);
  const fit = score >= (scoringConfig.highFitScore ?? 14) ? "high" : "medium";
  const hasStrongOrganizationFit = useCaseMatches.length > 0;
  const hasStrongMultiToolFit =
    multiToolMatches.length > 0 &&
    platforms.length >= 2 &&
    painMatches.length > 0;
  const qualified =
    score >= (scoringConfig.minimumScore ?? 0) &&
    (titleIntentMatches.length > 0 || isQuestionTitle) &&
    (hasStrongOrganizationFit || hasStrongMultiToolFit) &&
    painMatches.length > 0 &&
    showcaseMatches.length === 0 &&
    !isShowcaseTitle &&
    hardBlockMatches.length === 0 &&
    (platforms.length > 0 || multiToolMatches.length > 0);

  return {
    ...post,
    angle,
    fit,
    qualified,
    score,
    positives,
    negatives,
    platforms,
    titleIntentMatches,
    useCaseMatches,
    multiToolMatches,
    painMatches,
    hardBlockMatches,
    showcaseMatches,
    why: buildWhy(post, positives, negatives, platforms, {
      titleIntentMatches,
      useCaseMatches,
      multiToolMatches,
      painMatches,
      hardBlockMatches,
      subredditScore,
      isQuestionTitle,
    }),
  };
}

function detectPlatforms(haystack) {
  const platforms = [];
  for (const platform of ["ChatGPT", "Claude", "Gemini", "DeepSeek"]) {
    if (haystack.includes(platform.toLowerCase())) {
      platforms.push(platform);
    }
  }
  return platforms;
}

function classifyAngle(haystack, platforms) {
  if (
    haystack.includes("prompt") ||
    haystack.includes("save prompts") ||
    haystack.includes("prompt library")
  ) {
    return "prompts";
  }

  if (
    platforms.length >= 2 ||
    haystack.includes("multiple ai tools") ||
    haystack.includes("switch between") ||
    haystack.includes("use both")
  ) {
    return "multi-tool";
  }

  if (haystack.includes("search") || haystack.includes("find")) {
    return "retrieval";
  }

  return "organization";
}

function buildWhy(post, positives, negatives, platforms, diagnostics) {
  const reasons = [];

  if (positives.length > 0) {
    reasons.push(`Matched terms: ${dedupe(positives).slice(0, 5).join(", ")}`);
  }

  if (diagnostics.titleIntentMatches.length > 0) {
    reasons.push(`Title intent: ${dedupe(diagnostics.titleIntentMatches).slice(0, 3).join(", ")}`);
  }

  if (diagnostics.useCaseMatches.length > 0) {
    reasons.push(`Use case: ${dedupe(diagnostics.useCaseMatches).slice(0, 4).join(", ")}`);
  }

  if (diagnostics.multiToolMatches.length > 0) {
    reasons.push(`Multi-tool: ${dedupe(diagnostics.multiToolMatches).slice(0, 3).join(", ")}`);
  }

  if (diagnostics.painMatches.length > 0) {
    reasons.push(`Pain: ${dedupe(diagnostics.painMatches).slice(0, 4).join(", ")}`);
  }

  if (diagnostics.isQuestionTitle) {
    reasons.push("Question title");
  }

  if (platforms.length > 0) {
    reasons.push(`Mentions platforms: ${platforms.join(", ")}`);
  }

  if (negatives.length > 0) {
    reasons.push(`Downranked by: ${dedupe(negatives).join(", ")}`);
  }

  if (post.comments > 0) {
    reasons.push(`${post.comments} comments already on the thread`);
  }

  reasons.push(`Subreddit weight: ${diagnostics.subredditScore}`);

  return reasons;
}

function findMatchingTerms(haystack, terms) {
  return terms.filter((term) => haystack.includes(term));
}

function looksLikeShowcaseTitle(titleHaystack) {
  return (
    titleHaystack.startsWith("how i ") ||
    (titleHaystack.startsWith("i ") &&
      (titleHaystack.includes(" built ") ||
        titleHaystack.includes(" used ") ||
        titleHaystack.includes(" made ") ||
        titleHaystack.includes(" launched ") ||
        titleHaystack.includes(" organized "))) ||
    (titleHaystack.startsWith("we ") &&
      (titleHaystack.includes(" built ") ||
        titleHaystack.includes(" made ") ||
        titleHaystack.includes(" launched ")))
  );
}

function buildDraft(post, project) {
  const platformLabel =
    post.platforms.length > 0 ? post.platforms.join(" + ") : "AI";

  if (post.angle === "prompts") {
    return `I ran into the same issue once my best ${platformLabel} prompts were buried inside old threads. What helped was separating reusable prompts from chat history, then making the chats themselves easy to search later. I ended up building ${project.name}, a local-first Chrome extension for the desktop web apps, because Notes/Docs never matched how I actually worked. ${project.shareLine}`;
  }

  if (post.angle === "multi-tool") {
    return `This is exactly the pain I felt using ${platformLabel} side by side. The real cost wasn't the subscriptions, it was the fragmentation: good prompts in one sidebar, useful answers in another, and no shared retrieval layer. I built ${project.name} to fix that for the desktop web apps with folders, search and saved prompts. ${project.shareLine}`;
  }

  if (post.angle === "retrieval") {
    return `I hit the same wall once I had a lot of ${platformLabel} chats. The hard part wasn't generating answers, it was finding them later when I remembered the insight but not the thread title. I ended up building ${project.name} for the desktop web apps so I could folder/search chats and keep reusable prompts separate. ${project.shareLine}`;
  }

  return `Same here. Once the chat count gets high, native history stops being enough and everything starts to feel like sidebar chaos. What helped me was treating chats like files I should be able to folder and search later, and keeping reusable prompts separate from the conversation itself. I built ${project.name} around that for desktop Chrome/Edge. ${project.shareLine}`;
}

function buildXWatchlist(queries) {
  return queries.map((query) => ({
    ...query,
    url: `https://x.com/search?q=${encodeURIComponent(query.query)}&src=typed_query&f=live`,
  }));
}

function renderMarkdownReport(report, config) {
  const lines = [];
  lines.push(`# ${config.project.name} Prospecting Digest`);
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Mode: ${report.mode}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Reddit posts scanned: ${report.totals.scannedPosts}`);
  lines.push(`- Matching posts: ${report.totals.matchingPosts}`);
  lines.push(`- Surfaced leads: ${report.totals.surfacedLeads}`);
  lines.push(`- Product qualifier: ${config.project.qualifier}`);
  lines.push("");

  if (report.leads.length === 0) {
    lines.push("## Leads");
    lines.push("");
    lines.push("No new high-signal Reddit posts matched the current ICP on this run.");
    lines.push("");
  } else {
    lines.push("## Leads");
    lines.push("");

    report.leads.forEach((lead, index) => {
      lines.push(`### ${index + 1}. [${escapeMarkdown(lead.title)}](${lead.url})`);
      lines.push("");
      lines.push(`- Subreddit: r/${lead.subreddit}`);
      lines.push(`- Score: ${lead.score} (${lead.fit})`);
      lines.push(`- Angle: ${lead.angle}`);
      lines.push(`- Comments: ${lead.comments}`);
      lines.push(`- Age: ${formatAge(lead.createdUtc, report.generatedAt)}`);
      if (lead.matchedQuery) lines.push(`- Matched query: ${lead.matchedQuery}`);
      lines.push(`- Why it fits: ${lead.why.join(" | ")}`);
      lines.push("");
      lines.push("Draft comment:");
      lines.push("");
      lines.push(`> ${lead.draft}`);
      lines.push("");
    });
  }

  lines.push("## X Watchlist");
  lines.push("");

  for (const item of report.xWatchlist) {
    lines.push(`- [${escapeMarkdown(item.label)}](${item.url})`);
  }

  lines.push("");
  lines.push("## Manual Checklist");
  lines.push("");
  lines.push("- Review the top 3 leads only.");
  lines.push("- Skip anything that is clearly mobile-only or CLI-first after reading the thread.");
  lines.push("- Do not drop the link in the first reply.");
  lines.push("- Only share Orenivo if the person asks or the thread context clearly invites it.");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function formatAge(createdUtc, generatedAtIso) {
  const deltaHours = Math.max(
    0,
    (Date.parse(generatedAtIso) - createdUtc * 1000) / 36e5,
  );

  if (deltaHours < 1) return "<1h";
  if (deltaHours < 24) return `${Math.round(deltaHours)}h`;
  return `${Math.round(deltaHours / 24)}d`;
}

function escapeMarkdown(value) {
  return value.replaceAll("[", "\\[").replaceAll("]", "\\]");
}

function dedupe(values) {
  return [...new Set(values)];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
