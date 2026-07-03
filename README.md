# Selbstbild

Generate an LLM-written personality assessment of any public **Hacker News**, **Reddit**, **Bluesky** or
**Mastodon** account — with your own API key, entirely in your browser.

*Selbstbild* (German: "self-image") fetches an account's public history, runs a multi-stage analysis pipeline
(parallel evidence readers → analyst passes → synthesis), and renders a report: an essay with verbatim quotes,
trait meters, activity and topic charts, a word cloud, and top-five lists. Reports can optionally be shared via
short link. See the [demo report](https://github.com/Topfi/selbstbild) (`/demo` route in the app).

## Privacy

- Your API key stays in the browser (memory by default, localStorage opt-in) and is sent only to
  `api.anthropic.com` or `openrouter.ai`.
- The fetched history is analyzed client-side and never uploaded.
- Sharing is opt-in and uploads only the finished report to Cloudflare KV. Shares carry a deletion token,
  expire after 180 days, and are not indexed.
- No cookies, no analytics, no third-party embeds. Social "post to" buttons are plain intent links that load
  nothing until clicked.

## Usage

1. Pick a provider (Anthropic or OpenRouter) and paste your key.
2. Enter a username (`user@instance` for Mastodon).
3. Pick a depth. An exact cost estimate is shown before any tokens are spent.

| Depth | Pipeline | Anthropic default models |
|---|---|---|
| Quick | single pass | Haiku 4.5 |
| Standard | readers → synthesis | Haiku 4.5 → Sonnet 5 |
| Deep | readers → 3 analysts → synthesis | Haiku 4.5 → Sonnet 5 → Opus 4.8 |
| ★ Fable 5 | full pipeline | Haiku 4.5 readers → Fable 5 |
| ✳ Ultra | full pipeline | Fable 5 for every call |

Caveats: Reddit needs a one-click OAuth authorization and is capped by Reddit at ~1000 recent items per type.
Mastodon history is only complete on the account's home instance. The Fable 5 tiers require an Anthropic org
with standard (30-day) data retention and fall back to Opus 4.8 if a call is declined.

## Development

```sh
npm install
npm run dev          # SPA on :5173, share/OG endpoints proxied to :8787
npm run dev:worker   # wrangler dev (share Worker + KV, local)
npm test
```

Deploy on Cloudflare Workers:

```sh
npx wrangler login
npx wrangler kv namespace create SHARES   # put the id into wrangler.jsonc
npm run deploy
```

For Reddit support, register an "installed app" at [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
with redirect URI `https://<your-domain>/reddit-callback` and build with `VITE_REDDIT_CLIENT_ID=<id>`
(a second app + `VITE_REDDIT_CLIENT_ID_DEV` for localhost).

## Architecture

Everything except sharing runs in the browser: platform adapters fetch public history over CORS, the pipeline
calls the LLM provider directly, and chart data (activity, word cloud, counts) is computed locally rather than
by the model. The Cloudflare Worker only stores opt-in shares (zod-validated, size-capped, rate-limited, hashed
deletion tokens) and renders share pages with OG meta and a preview image.

New platform adapters implement the `PlatformAdapter` interface in `src/lib/platforms/`. One rule: user data
must be fetched client-side — no server proxies.

## License

[EUPL-1.2](LICENSE)
