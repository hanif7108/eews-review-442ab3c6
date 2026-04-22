# PROVENANCE.md — CSV Artifacts in `reports/`

**Last updated:** 2026-04-22
**Purpose:** Map every CSV in `reports/analysis/` and `reports/performance/` to its producing script, dataset size, cross-validation configuration, model hyperparameters, and run date. This file is the authoritative source for reproducing any result cited in `manuscript_draft_IEEE.md`.

---

## Three Distinct Model Runs

The repository contains results from **three distinct XGBoost configurations**. Previous versions of reports mixed outputs from these runs without clear labeling; this PROVENANCE.md establishes the authoritative mapping.

| Run ID | Config | Producer Script(s) | Intended Use |
|:---:|---|---|---|
| **RUN-A** (Heavy Stratified) | `n_estimators=800, max_depth=12, lr=0.03, subsample=0.8, min_child_weight=10` | `train_stratified_ida.py`, `train_golden_ida.py`, `train_eews_windows.py` | **AUTHORITATIVE** for published Fixed PTW + IDA-PTW results |
| **RUN-B** (Fast Marathon) | `n_estimators=150, max_depth=8, lr=0.05, subsample=0.7, colsample_bytree=0.8` | `train_xgboost_103_marathon_all.py` | Preliminary exploratory 103-period sweep only |
| **RUN-C** (End-to-end Operational) | Stage 1 routing + Stage 2 prediction ensemble | **No current script** — referenced in manuscript Table 11/12 only | Needs reproducible implementation |

---

## `reports/analysis/`

| CSV | Producer | Dataset N | CV | Run | Trustworthiness |
|:---|:---|:---:|:---|:---:|:---|
| `benchmark_results_fixed.csv` | Benchmark script (deleted, but output preserved) | 25,058 | GroupKFold 5-fold | RUN-A | ✅ Authoritative for Evidence A (Fixed PTW 2/3/5/8/10 s) |
| `benchmark_results_ida.csv` | Manual summary — combines `benchmark_results_fixed.csv` + `spectral_r2_performance.csv` values | 25,058 / 2,747 | Mixed (inherits sources) | RUN-A | ⚠ Mixed-N; OK for Evidence A summary but re-benchmark on unified N=2,747 subset recommended |
| `saturation_test_results.csv` | Saturation test script (not found, but output preserved) | 1,204 | 3-fold GroupKFold | RUN-A sibling | ✅ Authoritative for Evidence C (high-PGA subset PGA ≥ 0.1 gal) |
| `p_arrival_sensitivity.csv` | P-arrival shift script (not found, but output preserved) | 25,058 | 3-fold GroupKFold | RUN-A sibling | ✅ Authoritative for Evidence D (shifts ±2s) |
| `scwfparam_equivalence_golden.csv` | `src/analysis/generate_golden_report.py` | 21,704 | N/A (deterministic physics) | Physics-only | ✅ Authoritative for Newmark-Beta Fisis R² ceiling |
| `scwfparam_equivalence.csv` / `_v2.csv` | Earlier iterations | varies | N/A | Superseded | 🗑 Deprecated — use `_golden.csv` |
| `scwfparam_psa_comparison_golden.csv` | Companion to `scwfparam_equivalence_golden.csv` | 21,704 | N/A | Physics-only | ✅ Row-level predicted-vs-stored PSA |
| `ida_vs_fixed_ptw_evidence.md` | Manual summary by author | — | — | RUN-A | ⚠ Mixed-N — apple-to-orange IDA (N=2,747) vs Fixed (N=25,058) — re-benchmark recommended |
| `residual_report.md` | Earlier draft | — | — | — | ⚠ Legacy |

---

## `reports/performance/`

| CSV | Producer | Dataset N | Run | Trustworthiness |
|:---|:---|:---:|:---:|:---|
| `spectral_r2_performance.csv` | Early IDA-PTW stratified run | 2,747 | RUN-A | ✅ Authoritative for IDA-PTW per-period (103 periods) |
| `comparison_r2_table.csv` | Manual table combining RUN-A values | mixed | RUN-A | ⚠ Full-Wave & Total MiniSEED columns are **placeholders** (round numbers 0.9450, 0.9510 etc.) — not from real runs |
| **`comparison_marathon_metrics_preliminary.csv`** (renamed from `comparison_golden_metrics.csv` on 2026-04-22) | `src/visualization/plot_comparison_all_methods.py` | 25,058 | **RUN-B** | ⚠ Preliminary only — do NOT cite as "Golden" reference |
| `xgboost_103_all_baselines.csv` | `train_xgboost_103_marathon_all.py` | 25,058 | RUN-B | ✅ Authoritative for RUN-B 103-period Fixed 3s/10s/IDA/50s (note: "Full_Wave" column is actually 50s, NOT 341s) |
| `xgboost_103_periods_r2.csv` | Derived from RUN-B | 25,058 | RUN-B | ⚠ Redundant with `xgboost_103_all_baselines.csv` |
| `xgboost_103_gated_r2.csv` | `train_stage2_gated_marathon.py` | varies | RUN-B gated | Separate experiment (gated Stage-2 comparison, Fig. 7) |
| `intensity_correlation_metrics.csv` | `src/pipeline/analyze_intensity_accuracy.py` | 28,266 (sums) ≠ 25,058 | RUN-B + intensity strata | ⚠ Sum exceeds dataset size — investigate double-counting across PTW outputs |

---

## MISSING — Required for Publication

The following CSV artifacts are **cited in the manuscript but not present in the repo**. These must be produced before submission:

| Manuscript reference | Missing CSV | Script needed |
|:---|:---|:---|
| Table 4 (Stage 0 URPD — AUC 0.988, 3 operating points) | `stage0_urpd_metrics.csv` | No `train_stage0*.py` exists yet |
| Table 7 (Stage 1 Intensity Gate — 93.01% accuracy, 91.09% Damaging Recall) | `stage1_classifier_metrics.csv` + `stage1_confusion_matrix.csv` | No Stage 1 classifier script exists yet |
| Table 8 (Stage 1.5 Distance Regressor — C0-C4 variants) | `stage1p5_distance_variants.csv` | No Stage 1.5 script exists yet |
| Table 11 "IDA-PTW Operational" row (R²=0.7309 with routing uncertainty) | `ida_ptw_end_to_end_operational.csv` | Needs Stage 1 + Stage 2 pipeline integration |
| Table 12 Post-P Full-Wave (~341 s, R²=0.9477) | `fullwave_341s_r2.csv` | Re-run `train_stratified_ida.py` with full-duration feature extraction; retain per-period output |
| Table 12 Total MiniSEED (~430 s, R²=0.9570) | `totalminiseed_430s_r2.csv` | Same as above with longer window |
| Table 15 Sigma Decomposition (Al Atik τ/φ/σ per period) | `sigma_decomposition.csv` | Fit mixed-effects model on OOF residuals from RUN-A |

**Estimated effort to produce all 7 missing CSVs:** 1–2 weeks on a CPU/GPU machine.

---

## Verifying CSV Consistency

To check a specific CSV's provenance, look up its row in the tables above. To verify the numeric values are reproducible from the producing script, re-run the script with fixed random seed:

```bash
# Example: reproduce RUN-A Fixed PTW benchmark
cd DL_Spectra
python src/pipeline/train_eews_windows.py --seed 42
# Output should match benchmark_results_fixed.csv within floating-point tolerance
```

---

## Changelog

- **2026-04-22** — Initial PROVENANCE.md created. Renamed `comparison_golden_metrics.csv` → `comparison_marathon_metrics_preliminary.csv` to stop the "Golden" label confusion. See `reports/performance/README_RENAME.md` for detail.
