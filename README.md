# AMBER Alerts USA — TRMNL plugin

**Live U.S. AMBER Alerts on your TRMNL e-ink display, nationwide or for the states you choose, with a QR code to the official information.**

[![Install on TRMNL](https://img.shields.io/badge/TRMNL-Install%20recipe-black?style=flat-square)](https://trmnl.com/recipes/453038)
![Source](https://img.shields.io/badge/source-National%20Weather%20Service-blue?style=flat-square)
![Updates](https://img.shields.io/badge/updates-every%2020%20min-orange?style=flat-square)
![No API key](https://img.shields.io/badge/API%20key-none-brightgreen?style=flat-square)

![AMBER Alerts USA on a TRMNL display](https://trmnl-public.s3.us-east-2.amazonaws.com/jq3z5tgg0henydnq4zkxqrr5o5po)

---

## What it does

When a child abduction alert is active, the screen shows it: state, affected areas, the bulletin text, the phone number to call, and a QR code to the official page.

When no alert is active — which is most of the time — the screen says so plainly.

An e-ink screen on a wall or a desk is seen many times a day. That is exactly the kind of attention AMBER Alerts rely on.

## Settings

| Setting | Example | Notes |
|---|---|---|
| **States to watch** | `TX,OH,FL` | Two-letter state codes, comma-separated. Leave empty for nationwide mode. |

Works in all four TRMNL layouts: Full, Half horizontal, Half vertical and Quadrant.

## Installation

1. Open the recipe page: **[trmnl.com/recipes/453038](https://trmnl.com/recipes/453038)**
2. Click **Install**, enter your states (or leave empty), and add it to a playlist.

No account, no API key.

---

## How it works

```
NWS API (Child Abduction Emergency) ──► GitHub Actions (every 20 min) ──► docs/amber-alerts.json ──► GitHub Pages ──► TRMNL
```

AMBER Alerts are relayed by the National Weather Service as *Child Abduction Emergency* events. `fetch-amber.js` reads them from the public NWS endpoint:

```
https://api.weather.gov/alerts/active?event=Child%20Abduction%20Emergency
```

For each alert it:

- extracts the **state** from the affected areas;
- cleans and truncates the bulletin (900 characters), instructions (250) and areas (180) to fit an e-ink screen;
- extracts the **phone number** to call from the text, falling back to `911`;
- finds the **official link** embedded in the bulletin, falling back to [missingkids.org](https://www.missingkids.org/gethelpnow/amber) — this is what the QR code points to;
- sorts alerts from newest to oldest.

There is no self-hosted detail page: the QR code always leads to an official source.

### Data endpoint

`https://nbbou81000.github.io/AMBER-alert/amber-alerts.json`

```json
{
  "generated_at": "2026-10-08T07:25:37Z",
  "count": 1,
  "alerts": [
    {
      "id": "urn:oid:…",
      "state": "CA",
      "areas": "Alameda, CA, Santa Clara, CA",
      "headline": "AMBER Alert",
      "description": "…",
      "instruction": "…",
      "phone": "911",
      "official_url": "https://www.missingkids.org/gethelpnow/amber",
      "sent": "…",
      "expires": "…"
    }
  ]
}
```

`docs/amber-alerts-1.json` and `docs/amber-alerts-2.json` are sample files with fictional alerts, used to test the layouts when no real alert is active.

---

## Repository layout

| Path | Role |
|---|---|
| `fetch-amber.js` | Fetches active alerts from the NWS API and writes the JSON |
| `package.json` | Node project file (no dependency) |
| `docs/amber-alerts.json` | The JSON polled by TRMNL |
| `docs/amber-alerts-1.json`, `docs/amber-alerts-2.json` | Test samples |
| `.github/workflows/fetch.yml` | Runs the script every 20 minutes (and on demand) |

## Run your own

1. Fork the repo.
2. **Settings › Pages**: deploy from the `main` branch, `/docs` folder.
3. **Actions** tab: enable workflows, then **Run workflow** once. The `generated_at` date in the JSON should update.
4. In TRMNL, point the Polling URL to `https://YOUR-USERNAME.github.io/AMBER-alert/amber-alerts.json`.

## Important

This plugin is an **unofficial relay** of public NWS data, refreshed every 20 minutes. It is not an emergency notification system and can miss or delay an alert. If you have information about an AMBER Alert, call **911** or the number given in the alert.

## Credits

- Data from the [National Weather Service API](https://www.weather.gov/documentation/services-web-api) (U.S. government, public domain).
- Official information: [National Center for Missing & Exploited Children](https://www.missingkids.org/).
- Not affiliated with or endorsed by the NWS or NCMEC.
- Built for [TRMNL](https://trmnl.com).

## Author

Made by **Nicolas Bouteiller** — [@nbbou81000](https://github.com/nbbou81000) · nb.bouteiller@gmail.com

## License

MIT License — see [`LICENSE`](LICENSE).
