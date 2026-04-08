# PUMP. — Gas Price Intelligence

A single-page website that tracks US gas prices in real time during the 2026 US-Iran conflict, with daily AI-generated news updates.

## What it does

- Shows the **live national average gas price** pulled from the US Energy Information Administration (EIA)
- Displays a **12-week price trend chart**
- Shows **gas prices by US region** (East Coast, Midwest, Gulf Coast, Rocky Mtn, West Coast)
- Shows a **4-week price forecast** based on whether the ceasefire holds
- Gives a **timeline of key events** explaining why prices spiked
- Updates the **ticker and alert banner daily** with AI-summarized news headlines

## How the daily update works

A GitHub Action runs every day at 6am UTC:

1. Fetches the latest news about "gas prices" and "Iran war" from NewsAPI
2. Sends the headlines to Claude (Anthropic) to summarize into a ticker line and a 2-sentence banner
3. Updates those two sections in `index.html`
4. Commits and pushes the changes automatically

## Data sources

| Data | Source |
|---|---|
| Gas prices | [EIA API](https://www.eia.gov/opendata/) — updated weekly |
| News headlines | [NewsAPI.org](https://newsapi.org) |
| AI summaries | [Anthropic Claude](https://anthropic.com) |

## Project structure

```
willgaspricesdrop/
├── index.html                  # The entire site (one file)
├── scripts/
│   └── update-news.js          # Daily news fetch + Claude summarize + HTML update
├── .github/
│   └── workflows/
│       └── update.yml          # GitHub Actions cron job
└── package.json
```

## Secrets required (GitHub Actions)

| Secret | Where to get it |
|---|---|
| `NEWS_API_KEY` | newsapi.org → register free account |
| `ANTHROPIC_API_KEY` | console.anthropic.com |

Add them at: **Settings → Secrets and variables → Actions**

## Running the update script locally

```bash
npm install
NEWS_API_KEY=your_key ANTHROPIC_API_KEY=your_key node scripts/update-news.js
```
