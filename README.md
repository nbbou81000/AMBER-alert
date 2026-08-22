# TRMNL AMBER Alerts (USA)

Polls active US AMBER Alerts from the NWS API and displays them on a TRMNL
e-ink device, filterable by state. No self-hosted detail page — QR codes
point to embedded URLs in the bulletin or to missingkids.org.

Everything below is done through the GitHub website and the TRMNL website.
No terminal, no local install.

## 1. Create the repo (github.com)

1. Go to github.com → **New repository** → name it `trmnl-amber-alerts` → **Public** → Create.
2. On the new repo page, click **Add file → Upload files**.
3. Drag in every file from this package, **keeping the folder structure**:
   - `fetch-amber.js`
   - `package.json`
   - `.github/workflows/fetch.yml`
   - `docs/amber-alerts.json`
   - (keep `settings.yml` and the 4 `.liquid` files aside — those go into TRMNL directly in step 4, not into the repo)
4. Commit directly to `main`.

## 2. Enable GitHub Pages

1. Repo → **Settings → Pages**.
2. Source: **Deploy from a branch**.
3. Branch: `main`, folder: `/docs`. Save.
4. Your JSON will be live at:
   `https://YOUR-USERNAME.github.io/trmnl-amber-alerts/amber-alerts.json`

## 3. Run the fetch workflow

1. Repo → **Actions** tab → you should see "Fetch AMBER Alerts".
2. If Actions are disabled, click the banner to enable them.
3. Click **Run workflow** once manually to confirm it works — check the run
   log, then open the Pages URL above to confirm the JSON updated (it won't
   change contents unless there's an active alert, but the `generated_at`
   timestamp should move off `1970-01-01`).
4. The workflow also has a built-in `schedule: cron` (every 20 min), so it
   runs on its own — you don't strictly need cron-job.org for this one,
   though you can still point cron-job.org at the GitHub API to trigger
   `workflow_dispatch` if you want tighter timing than GitHub's schedule
   (which can drift a few minutes under load).

## 4. Create the TRMNL plugin (trmnl.com / editor.trmnl.com)

1. **Create Private Plugin**.
2. Open `settings.yml` from this package, copy its contents into the
   plugin's settings screen — replace `YOUR-USERNAME` in `polling_url`
   with your actual GitHub username.
3. Copy each `.liquid` file into its matching tab:
   - `full.liquid` → **Full**
   - `half_horizontal.liquid` → **Half horizontal**
   - `half_vertical.liquid` → **Half vertical**
   - `quadrant.liquid` → **Quadrant**
4. In the **Data** tab, paste a sample JSON (0/1/5 alerts) to preview
   before a real alert ever fires. Example for "5 alerts":

   ```json
   {
     "generated_at": "2026-08-22T12:00:00Z",
     "count": 5,
     "alerts": [
       { "state": "TX", "headline": "AMBER Alert — Dallas County", "description": "Sample.", "phone": "911", "official_url": "https://www.missingkids.org/gethelpnow/amber", "sent": "2026-08-22T11:00:00Z" },
       { "state": "OH", "headline": "AMBER Alert — Franklin County", "description": "Sample.", "phone": "911", "official_url": "https://www.missingkids.org/gethelpnow/amber", "sent": "2026-08-22T11:00:00Z" },
       { "state": "FL", "headline": "AMBER Alert — Miami-Dade County", "description": "Sample.", "phone": "911", "official_url": "https://www.missingkids.org/gethelpnow/amber", "sent": "2026-08-22T11:00:00Z" },
       { "state": "AZ", "headline": "AMBER Alert — Maricopa County", "description": "Sample.", "phone": "911", "official_url": "https://www.missingkids.org/gethelpnow/amber", "sent": "2026-08-22T11:00:00Z" },
       { "state": "NC", "headline": "AMBER Alert — Wake County", "description": "Sample.", "phone": "911", "official_url": "https://www.missingkids.org/gethelpnow/amber", "sent": "2026-08-22T11:00:00Z" }
     ]
   }
   ```

5. Add the plugin to a device/playlist, and set the **"States to watch"**
   custom field (e.g. `TX,OH,FL`) or leave it empty for national mode.

## Files in this package

| File | Goes to |
|---|---|
| `fetch-amber.js` | GitHub repo root |
| `package.json` | GitHub repo root |
| `.github/workflows/fetch.yml` | GitHub repo, exact path |
| `docs/amber-alerts.json` | GitHub repo, exact path (seed file) |
| `settings.yml` | Pasted into TRMNL plugin settings |
| `full.liquid` | Pasted into TRMNL "Full" tab |
| `half_horizontal.liquid` | Pasted into TRMNL "Half horizontal" tab |
| `half_vertical.liquid` | Pasted into TRMNL "Half vertical" tab |
| `quadrant.liquid` | Pasted into TRMNL "Quadrant" tab |
