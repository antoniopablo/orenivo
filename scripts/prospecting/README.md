# Orenivo Prospecting Automation

This is a safe `v1` for daily outreach support:

- pulls recent Reddit posts from the subreddits that matter
- scores each post against the current Orenivo ICP
- generates draft comments for the best matches
- writes a daily Markdown + JSON digest locally
- adds X search links as a manual watchlist

It does **not** auto-post. That is intentional.

## What data it collects right now

- **Reddit:** live data collection from the configured subreddits using Reddit JSON feeds
- **X:** watchlist queries only, as clickable search URLs inside the digest

So today the automation **does collect Reddit data** and **does not collect X posts yet**. X is left as manual review on purpose because reliable collection there usually means API setup and a different risk/cost tradeoff.

## Default subreddits

The default high-affinity list is:

- `r/ClaudeAI`
- `r/ChatGPT`
- `r/GeminiAI`
- `r/OpenAI`

That is intentional. Broader subreddits like generic AI, founder, or side-project communities produce much more noise and much less direct fit for Orenivo.

## Why this shape

`Orenivo` is a browser-first product. The best early users are people who:

- use ChatGPT / Claude / Gemini / DeepSeek on desktop web
- work in Chrome or Edge
- complain about folders, search, prompts, sidebar chaos or switching between tools

The script filters toward that profile and downranks mobile-only and CLI-first threads.

## Usage

1. Copy the config:

```bash
cp scripts/prospecting/config.example.json scripts/prospecting/config.json
```

2. Adjust the subreddit list, scoring, or X searches if you want.

3. Run the daily digest:

```bash
npm run prospecting:run
```

4. Open the newest report under `reports/prospecting/`.

## How it works technically

At a high level:

1. `run.mjs` loads `config.json` or falls back to `config.example.json`.
2. It fetches posts from each configured subreddit using Reddit's public JSON feeds.
   - by default it uses subreddit search, not the raw `new` feed
   - this is much higher signal for Orenivo because it looks for posts about folders, prompt saving, chat history, multi-tool switching, etc.
3. Each post is normalized into a simple shape:
   - `id`
   - `subreddit`
   - `title`
   - `body`
   - `url`
   - `comments`
   - `createdUtc`
4. It scores each post against the Orenivo ICP using weighted keywords:
   - positive examples: `folders`, `search`, `prompt library`, `use both`, `desktop`
   - negative examples: `mobile`, `android`, `terminal`, `CLI`, `Claude Code`
5. It classifies the post angle:
   - `organization`
   - `retrieval`
   - `prompts`
   - `multi-tool`
6. It generates a draft reply for the best matches.
7. It writes the output to local files under `reports/prospecting/`.
8. It updates `state.json` so the next run does not keep surfacing the same Reddit posts.

This means the system is doing:

- collection
- filtering
- prioritization
- draft generation

And it is **not** doing:

- auto-commenting
- auto-DM
- auto-posting on Reddit or X

## Sample mode

Use fixture data to test the pipeline without network access:

```bash
npm run prospecting:sample
```

## Output

Each run writes:

- `reports/prospecting/YYYY-MM-DD.md`
- `reports/prospecting/YYYY-MM-DD.json`
- `reports/prospecting/latest.md`
- `reports/prospecting/latest.json`
- `reports/prospecting/state.json`

The state file is used to avoid resurfacing the same Reddit posts every day.

The file you will usually open is:

- `reports/prospecting/latest.md`

If you want the structured data version, open:

- `reports/prospecting/latest.json`

## Automation

Run this from cron, LaunchAgent, GitHub Actions, or whatever scheduler you prefer.

Example cron:

```cron
0 9 * * * cd /absolute/path/to/orenivo && npm run prospecting:run
```

### macOS LaunchAgent at 08:00 Europe/Madrid

This repo also includes:

- `scripts/prospecting/launchd/com.orenivo.prospecting.plist.template`
- `scripts/prospecting/install-launchagent.mjs`

The installer writes a `launchd` job that runs every day at `08:00` local machine time and stores logs in:

- `reports/prospecting/logs/stdout.log`
- `reports/prospecting/logs/stderr.log`

## Limits

- Reddit collection is read-only.
- X is watchlist-only here because reliable automation on X requires API access and raises more account-risk tradeoffs.
- You should still review each draft before posting.
