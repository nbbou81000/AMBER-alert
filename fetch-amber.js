// fetch-amber.js
// Poll active "Child Abduction Emergency" (AMBER) alerts from the NWS API
// and write a compact static JSON file for TRMNL.
//
// Trigger: GitHub Actions, called by cron-job.org every 15-30 min (same
// pattern as Geek Almanac / Souvenir Map / Ciné Poster).
//
// Output: ./docs/amber-alerts.json  (served via GitHub Pages)
//
// QR / "official page" design note: no info is self-hosted. Each alert
// links to either (a) a URL found embedded in the bulletin's own text
// (most specific, straight from the issuing agency), or (b) the NCMEC
// clearinghouse page, which always lists current active US AMBER Alerts.

import fs from "node:fs";

const NWS_URL =
  "https://api.weather.gov/alerts/active?event=Child%20Abduction%20Emergency";

const OUTPUT_DIR = "./docs";
const OUTPUT_PATH = `${OUTPUT_DIR}/amber-alerts.json`;

const MAX_DESCRIPTION_LEN = 320;
const MAX_INSTRUCTION_LEN = 250;
const MAX_AREA_LEN = 180;

const OFFICIAL_URL_DEFAULT = "https://www.missingkids.org/gethelpnow/amber";

function cleanText(t) {
  return (t || "").replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(s, n) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1).trim() + "\u2026" : s;
}

// areaDesc like "Dallas, TX; Tarrant, TX" -> first state code
function extractState(areaDesc) {
  const m = (areaDesc || "").match(/,\s*([A-Z]{2})\b/);
  return m ? m[1] : "";
}

// First phone-like sequence in the text, default to 911 if none found
function extractPhone(text) {
  const m = (text || "").match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  return m ? m[0] : "911";
}

// If the bulletin itself contains a URL, that's the most specific and most
// official destination. Otherwise fall back to the NCMEC clearinghouse.
function resolveOfficialUrl(description, instruction) {
  const combined = `${description} ${instruction}`;
  const urlMatch = combined.match(/https?:\/\/[^\s)]+/i);
  if (urlMatch) return urlMatch[0].replace(/[.,;]+$/, "");
  return OFFICIAL_URL_DEFAULT;
}

async function main() {
  const res = await fetch(NWS_URL, {
    headers: {
      "User-Agent": "(trmnl-amber-alerts-plugin, github.com/nicolas)",
      Accept: "application/geo+json",
    },
  });
  if (!res.ok) throw new Error(`NWS API error: ${res.status}`);
  const data = await res.json();

  const alerts = (data.features || []).map((f) => {
    const p = f.properties || {};
    const description = cleanText(p.description);
    const instruction = cleanText(p.instruction);
    return {
      id: p.id,
      state: extractState(p.areaDesc),
      areas: truncate(cleanText(p.areaDesc), MAX_AREA_LEN),
      headline: cleanText(p.headline) || "AMBER Alert",
      description: truncate(description, MAX_DESCRIPTION_LEN),
      instruction: truncate(instruction, MAX_INSTRUCTION_LEN),
      phone: extractPhone(instruction || description),
      official_url: resolveOfficialUrl(description, instruction),
      sent: p.sent,
      expires: p.expires,
    };
  });

  alerts.sort((a, b) => new Date(b.sent) - new Date(a.sent));

  const output = {
    generated_at: new Date().toISOString(),
    count: alerts.length,
    alerts,
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output));

  const sizeKb = (Buffer.byteLength(JSON.stringify(output)) / 1024).toFixed(1);
  console.log(`Wrote ${alerts.length} alert(s) to ${OUTPUT_PATH} (${sizeKb} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
