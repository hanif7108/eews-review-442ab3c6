# IDA-PTW EEWS Review — Bilingual Site

Static bilingual (English / Bahasa Indonesia) review portal for the IDA-PTW Earthquake Early Warning System validation documents.

**Live URL:** https://hanif7108.github.io/eews-review-442ab3c6/

## Contents

```
.
├── index.html                    # Landing / dashboard
├── 01-crosscheck.html            # CSV cross-check report
├── 02-audit.html                 # Manuscript audit report
├── 03-appendix.html              # Evidence A–D appendix summary + download
├── 04-figure.html                # 4-panel figure viewer + download
├── .nojekyll                     # Tell GitHub Pages to skip Jekyll processing
├── assets/
│   ├── css/style.css             # Shared stylesheet
│   ├── js/i18n.js                # Language toggle (EN / ID)
│   ├── files/
│   │   ├── 03_IDA-PTW_Evidence_Appendix.docx
│   │   ├── figure_4panel.png
│   │   └── figure_4panel.pdf
│   └── img/
│       ├── appendix_p1.jpg       # Appendix preview page 1
│       ├── appendix_p2.jpg       # Appendix preview page 2
│       └── figure_preview.png    # Figure preview
└── README.md                     # This file
```

## Deploy to GitHub Pages

### Option 1 — Fresh repo

```bash
# Clone the empty repo
git clone https://github.com/hanif7108/eews-review-442ab3c6.git
cd eews-review-442ab3c6

# Copy every file from this folder into the repo root
cp -r /path/to/eews-review-site/. .

# Commit and push
git add .
git commit -m "Initial bilingual review site"
git push origin main

# Then on github.com:
#  → Settings → Pages → Source: Deploy from a branch → Branch: main / (root) → Save
```

### Option 2 — Existing repo (overwrite)

```bash
cd eews-review-442ab3c6
rm -rf *        # clean current content (careful!)
cp -r /path/to/eews-review-site/. .
git add -A
git commit -m "Update bilingual review site 2026-04-22"
git push
```

Within a minute, the site will be available at the live URL.

## Language toggle

- Language is auto-detected from browser (`navigator.language`) on first visit. Indonesian browsers default to `?lang=id`, others to `?lang=en`.
- Click the **EN / ID** toggle in the top-right to switch.
- The choice is reflected in the URL (`?lang=id`) so links are shareable in either language.

## Local preview

```bash
# Python 3
python3 -m http.server 8080
# Open http://localhost:8080
```

## Tech stack

- Pure static HTML / CSS / JavaScript — no build step, no external CDN dependencies.
- All assets self-hosted in `assets/`.
- Works offline once downloaded.

## License

© 2026 Hanif Andi Nugraha · Universitas Indonesia & BMKG · All rights reserved.
