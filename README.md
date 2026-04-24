# IDA-PTW EEWS Review — Bilingual Site

Static bilingual (English / Bahasa Indonesia) portal for the **Intensity-Driven Adaptive P-wave Time Window (IDA-PTW)** Earthquake Early Warning System, validated on the Indonesian Java-Sunda Subduction Zone.

**Live URL:** https://hanif7108.github.io/eews-review-442ab3c6/

**Latest update: 2026-04-24 — Task 15 final results integrated.**

## Status Snapshot

- **Composite R² = 0.7091** (103 spectral periods, marginalised over Stage-1 posterior, GroupKFold 5-fold, seed 42)
- **Oracle upper bound: R² = 0.7779**
- **Stage-1 OOF accuracy: 79.64 % (balanced 81.68 %)** — MMI-hybrid 3-class ensemble (XGB + LGB soft voting, SMOTE minority oversampling, Optuna Bayesian tuning)
- **Stage-0 URPD AUC = 0.9136**, 100 % Damaging Recall in 0.5 s
- **Blind-zone reduction:** 38 km → 11 km (Balanced) / 4 km (Aggressive)
- **Golden Time Compliance:** 99.44 %
- **Dataset:** 25,058 traces / 338 events (Stage 0) · 23,537 / 335 events (Stages 1-2)
- **Submission target:** IEEE Access (Q1)

## Contents

```
.
├── index.html                    # Dashboard (updated 2026-04-24)
├── 07-final-results.html         # ★ Primary — Task 15 final (NEW)
├── 01-crosscheck.html            # Legacy CSV cross-check audit
├── 02-audit.html                 # Legacy manuscript audit
├── 03-appendix.html              # Evidence A–D appendix summary + download
├── 04-figure.html                # 4-panel figure viewer + download
├── 05-readiness.html             # Legacy Go/No-Go scorecard
├── 06-sigbmkg.html               # SIG-BMKG intensity analysis (motivated MMI-hybrid classes)
├── .nojekyll                     # Tell GitHub Pages to skip Jekyll processing
├── assets/
│   ├── css/style.css             # Shared stylesheet
│   ├── js/i18n.js                # Language toggle (EN / ID)
│   ├── files/                    # Downloadable source files (appendix, figure, tables)
│   └── img/                      # Thumbnail previews
└── README.md                     # This file
```

### What's New in 07-final-results.html

The new primary page consolidates:

- **Headline performance table** (R² composite, oracle UB, Stage-1 accuracy, blind-zone metrics, Golden Time Compliance)
- **Pipeline optimisation journey** — task 11 → 12 → 14 → 15 progression with +0.102 total R² gain
- **90-feature architecture breakdown** — 34 base + 2 site + 30 Dai multi-window + 24 frequency-domain
- **4-stage pipeline at-a-glance** — Stage 0 URPD, Stage 1 MMI-hybrid gate, Stage 1.5 ablation, Stage 2 marginalised regressor
- **Authoritative source file map** — Python scripts and CSV outputs
- **Retrospective event validation** — Cianjur 2022 & Sumedang 2024 (100 % Stage-0 Damaging Recall)
- **Submission status** — manuscript v2, cover letter, Zenodo DOI pending

## Authoritative Source Files (outside the site, in the main repo)

- `review_deliverables/task15_stage1_ensemble_optuna.py` — main training pipeline (Task 15 final)
- `review_deliverables/task15a_extract_freq_features.py` — 3 s-PTW frequency-domain feature extractor
- `review_deliverables/task13_extract_multiwindow_features.py` — Dai multi-window feature extractor (2, 5, 10 s post-P)
- `reports/performance/ida_ptw_task15.json` — summary JSON (headline numbers)
- `reports/performance/ida_ptw_task15.csv` — per-period R² for 103 spectral periods
- `reports/performance/ida_ptw_task15_anchors.csv` — anchor periods (T = 0.303, 1.010, 3.030 s)
- `reports/performance/ida_ptw_task15_per_fold.csv` — per-fold breakdown
- `reports/performance/ida_ptw_task15_optuna_trials.csv` — Optuna hyperparameter search log
- `manuscript_draft_IEEE_v2.md` — final submission manuscript (924 lines)
- `IEEE_cover_letter.md` — cover letter for IEEE Access

## Deploy Updated Version to GitHub Pages

```bash
# Navigate to your GitHub Pages repo clone
cd eews-review-442ab3c6

# Copy the updated static files (from this folder)
cp -r /Users/hanif/DL_Spectra/review_deliverables/eews-review-site/. .

# Commit with clear changelog
git add -A
git commit -m "Update 2026-04-24: Task 15 final results integrated.

- New 07-final-results.html (primary page, composite R² = 0.7091)
- index.html rewritten with Task 15 headline numbers
- Navigation updated in all 7 existing pages
- README.md updated with new status snapshot
"
git push

# Page will be live within ~1 minute at:
# https://hanif7108.github.io/eews-review-442ab3c6/
```

## Language toggle

- Language is auto-detected from browser (`navigator.language`) on first visit. Indonesian browsers default to `?lang=id`, others to `?lang=en`.
- Click the **EN / ID** toggle in the top-right to switch.
- The choice is reflected in the URL (`?lang=id`) so links are shareable in either language.

## Local preview

```bash
cd /Users/hanif/DL_Spectra/review_deliverables/eews-review-site
python3 -m http.server 8080
# Open http://localhost:8080 in browser
```

## Tech stack

- Pure static HTML / CSS / JavaScript — no build step, no external CDN dependencies.
- All assets self-hosted in `assets/`.
- Works offline once downloaded.

## Authors

- **Hanif Andi Nugraha** (corresponding) — Department of Physics, Universitas Indonesia, Depok · hanif.andi@ui.ac.id · ORCID: 0009-0007-9975-1566
- **Dede Djuhana** — Department of Physics, Universitas Indonesia / BMKG Jakarta · ORCID: 0000-0002-2025-0782
- **Adhi Harmoko Saputro** — Department of Physics, Universitas Indonesia · ORCID: 0000-0001-6651-0669
- **Sigit Pramono** — BMKG Jakarta · ORCID: 0009-0000-5684-282X

## License

© 2026 Hanif Andi Nugraha · Universitas Indonesia & BMKG · All rights reserved.

Prepared for the IDA-PTW EEWS dissertation / manuscript review. Reproducibility bundle (scripts + CSVs + feature files) scheduled for Zenodo archival.
