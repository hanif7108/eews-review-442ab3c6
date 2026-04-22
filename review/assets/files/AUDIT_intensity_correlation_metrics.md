# Audit Result: intensity_correlation_metrics.csv N = 28,266

**Investigation date:** 2026-04-22
**Source file:** reports/performance/intensity_correlation_metrics.csv
**Producer:** src/pipeline/analyze_intensity_accuracy.py

## Findings

1. **Sum across 4 intensity bins = 28,266** at every period (all periods show same totals)
2. **Base dataset = 25,058** (rosers_features_ptw3.csv)
3. **Excess = 3,208 rows** above the base dataset

## Likely Cause

The excess is consistent with **PTW-multi-window double-counting**: the analyze_intensity_accuracy.py 
script concatenates per-PTW (3s, 5s, 8s, 10s) predictions AND applies intensity binning per-PTW. 
Traces with valid predictions at multiple PTW values get counted in multiple rows, inflating N.

Alternative hypothesis: the merge with metadata might duplicate rows due to multi-channel 
records (HNE, HNN, HNZ) — but rosers already has one row per trace so this is less likely.

## Recommendation

1. **For manuscript Table 1 / III.C intensity distribution**, do NOT cite this file. 
   Use directly: `pandas.read_csv('metadata_recalibrated.csv')['psa5_T_0.000']` with SIG-BMKG thresholds
   (which produces 25,055 Weak + 3 Felt + 0 Damaging on 25,058 dataset — see 07_sigbmkg_class_distribution.csv).

2. **For per-intensity R²** (if cited in manuscript):
   - Re-run analyze_intensity_accuracy.py with explicit per-trace grouping
   - OR cite values but explicitly note N represents "trace-PTW observations" not "unique traces"
   - Flag this in manuscript with footnote

3. **Code fix:** In analyze_intensity_accuracy.py, add de-duplication:
   ```python
   merged = merged.drop_duplicates(subset=['trace_name','intensity_bin'])
   ```
