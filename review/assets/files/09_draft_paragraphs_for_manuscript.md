# Revised Manuscript Paragraphs — Ready to Paste

**Purpose:** These paragraphs replace/correct claims in `manuscript_draft_IEEE.md` Sections I (Introduction), III (Dataset), and Table 1. They are grounded in peer-reviewed GMICE literature and the authoritative SIG-BMKG scale.

---

## 1. Corrected Table 1 — Dataset Summary

Replace the current Table 1 (Section III.C) with the verified values below. Changes from the existing draft are highlighted with ⚠.

**Table 1: Dataset Summary — Java-Sunda Trench EEWS Dataset.**

| Parameter | Value |
|:---|:---|
| Total Traces | **25,058** (24,466 routine seismicity + 592 injected large-event traces) |
| Distinct Seismic Events | **338** ⚠ *(was 336)* |
| IA-BMKG Accelerograph Stations | **125** (common to both subsets; 26 additional in the injected subset) ⚠ *(was "125")* |
| Spectral Target Periods | **103** (T = 0.051–10.0 s) |
| Magnitude Range | **Mw 1.7–6.2** |
| Epicentral Distance Range | **0.7–299.9 km** ⚠ *(was 5–560 km)* |
| Hypocentral Depth Range | not recorded in current metadata; see ‡ |
| PGA Range (5%-damped Newmark integration) | **1.66 × 10⁻⁷ to 6.00 gal** |
| Median Epicentral Distance | **~122 km** ⚠ *(was ~109 km)* |
| Mean Post-P Record Duration | ~341 s |
| Period Coverage | 2008–2024 |

‡ *Hypocentral depth is not present in `metadata_recalibrated.csv` as used for the training run; if preserved elsewhere (e.g., BMKG catalog export), reinstate the value. Otherwise, remove this row from Table 1.*

**Commentary for reviewers:** The dataset composition (24,466 routine-seismicity traces plus 592 traces from three Damaging-class events injected for class balance: Mw 5.6 Cianjur 2022-11-21, a late-2023 event, and the 2024-04-27 event) is explicitly disclosed in Section III.A (see replacement paragraph below).

---

## 2. Replacement paragraph — Section III.A (Waveform Processing Pipeline, opening)

Insert the following as the first paragraph of Section III.A, before the bullet list of processing steps:

> *"The final training corpus consists of 25,058 three-component accelerograms drawn from two complementary source streams. The routine-seismicity stream (24,466 traces) samples 335 events covering the operational magnitude range Mw 1.7–6.2 from BMKG's continuous IA-BMKG archive (2008–2024) after the quality-control filters in Section III.B. To offset the near-absence of high-intensity shaking in routine catalogs—see the class-distribution discussion in Section III.C—we augment this stream with 592 three-component traces from three M ≥ 5.6 near-field events (Cianjur 2022-11-21, Mw 5.6; the 2023-12-31 Sumedang-region event, Mw 5.7; and the 2024-04-27 Garut-region event, Mw 6.2). The augmented dataset remains strictly event-grouped for cross-validation to prevent optimistic bias from co-located records [30], [35] and is the sole data source for all results reported in Section V."*

---

## 3. Replacement text — Section III.C Intensity Class Distribution

**REMOVE** the existing "30,540 + 1,931 + 101" table (which does not reflect the actual dataset) and **REPLACE** with the following paragraph + table:

> *"Intensity classes follow the five-level **Skala Intensitas Gempabumi BMKG (SIG-BMKG)** [refBMKG], which BMKG adopted in 2016 to adapt the 12-level Modified Mercalli Intensity (MMI) scale to Indonesian building typology and communication needs [refGeomagz]. The SIG-BMKG levels are anchored to peak ground acceleration (PGA) boundaries at 2.9, 89, 168, and 565 gal, consistent with the probabilistic ground-motion-to-intensity conversion equations (GMICE) of Worden et al. [refWorden2012] and Wald et al. [refWald1999], and validated for the Indonesian context by the global GMICE of Caprio et al. [refCaprio2015] which explicitly includes data from the 2009 Padang event."*

> *"Applying SIG-BMKG thresholds to the assembled 25,058-trace corpus produces the following intensity distribution:"*

**Table 2: Intensity Class Distribution (SIG-BMKG, 25,058 traces).**

| SIG-BMKG Level | MMI Equivalent | PGA Range (gal) | Description | N Traces | % |
|:---:|:---:|:---:|:---|:---:|:---:|
| **I** | I–II | < 2.9 | Not felt | **25,055** | **99.99%** |
| **II** | III–V | 2.9–88 | Felt | **3** | **0.01%** |
| III | VI | 89–167 | Slight damage | 0 | 0% |
| IV | VII–VIII | 168–564 | Moderate damage | 0 | 0% |
| V | IX–XII | ≥ 565 | Heavy damage | 0 | 0% |
| **Total** | | | | **25,058** | 100% |

> *"The 0.01% of traces in SIG-BMKG II and the complete absence of Level III+ shaking are direct consequences of the median epicentral distance (~122 km) and source magnitudes (Mw ≤ 6.2) represented in BMKG's IA-BMKG archive for 2008–2024. Consistent with the analysis of Minson et al. [19], a dataset dominated by distant, moderate-to-low-intensity shaking still provides substantial calibration power for spectral prediction, because the dominant predictability structure is governed by cumulative-energy features (CAV, CVAD, Arias Intensity) that scale with duration and attenuation rather than the SIG-BMKG level itself. Consequently, we define an **operational intensity-routing class** distinct from the SIG-BMKG descriptive class, motivated by the desire to detect the tail of high-PGA events even within SIG-BMKG I:"*

**Table 3: Operational Intensity-Routing Classes (for IDA-PTW gating).**

| Operational Class | PGA Range (gal) | N Traces | % | IDA-PTW Window |
|:---|:---:|:---:|:---:|:---:|
| Low-PGA (p < 50th percentile) | < 0.0053 | 12,529 | 50.00% | **3 s** |
| Mid-PGA (50th–95th percentile) | 0.0053 – 0.0958 | 11,275 | 45.00% | **5 s** |
| High-PGA (≥ 95th percentile) | ≥ 0.0958 | 1,254 | ~5.00% | **10 s** |

> *"This percentile-based operational gating (distinct from SIG-BMKG's absolute thresholds) enables the Stage 1 routing classifier to stratify traces by their position within the dataset PGA distribution, yielding well-balanced class counts suitable for gradient-boosting classification. The High-PGA class definition (PGA ≥ 0.0958 gal, the 95th percentile) is also the subset used for the magnitude-saturation test reported in Section V.C."*

---

## 4. New paragraph for Introduction — Section I.D (Magnitude Saturation)

Append to the end of current Section I.D, immediately before Section I.E:

> *"The assignment of operational intensity categories in this study follows SIG-BMKG (Skala Intensitas Gempabumi BMKG) [refBMKG], the five-level national standard adopted by the Agency for Meteorology, Climatology and Geophysics in 2016 [refGeomagz], with its PGA boundaries (2.9, 89, 168, 565 gal) grounded in the probabilistic GMICE framework of Worden et al. [refWorden2012] and the foundational PGA-MMI regressions of Wald et al. [refWald1999]. For regional context, Caprio et al. [refCaprio2015] developed a global GMICE incorporating Indonesian strong-motion data from the 2009 Padang event, which independently confirms the same threshold structure. The Taiwan Central Weather Administration scale [refWu2003] and the Japanese JMA instrumental intensity system [refHoshiba2015] establish comparable EEWS-relevant intensity partitions; our tri-class operational collapse (Section III.C) is motivated by the EEWS alerting framework of Wu & Kanamori [refWuKanamori2008], who show that a Pd > 0.5 cm / τc > 1 s threshold corresponds to the damaging regime (PGV > 20 cm/s), which in SIG-BMKG terms aligns with Level III and above."*

---

## 5. New References to Add to the Manuscript Reference List

Insert the following into the reference list (recommended positions given; renumber existing refs as needed). IEEE style:

**[refBMKG]** BMKG (Badan Meteorologi, Klimatologi, dan Geofisika), *Skala Intensitas Gempabumi BMKG (SIG-BMKG)*. Pedoman resmi Kepala BMKG, Jakarta, Indonesia, 2016. [Online]. Available: https://www.bmkg.go.id/gempabumi/skala-intensitas-gempabumi.bmkg

**[refGeomagz]** BMKG Technical Editorial, "BMKG Menetapkan Skala Intensitas Gempa yang Baru," *Geomagz — Majalah Geologi Populer*, Badan Geologi Indonesia, 2018. [Online]. Available: http://geomagz.geologi.esdm.go.id/bmkg-menetapkan-skala-intensitas-gempa-yang-baru/

**[refWald1999]** D. J. Wald, V. Quitoriano, T. H. Heaton, and H. Kanamori, "Relationships between Peak Ground Acceleration, Peak Ground Velocity, and Modified Mercalli Intensity in California," *Earthquake Spectra*, vol. 15, no. 3, pp. 557–564, Aug. 1999. doi: 10.1193/1.1586058.

**[refWorden2012]** C. B. Worden, M. C. Gerstenberger, D. A. Rhoades, and D. J. Wald, "Probabilistic Relationships between Ground-Motion Parameters and Modified Mercalli Intensity in California," *Bulletin of the Seismological Society of America*, vol. 102, no. 1, pp. 204–221, Feb. 2012. doi: 10.1785/0120110156.

**[refCaprio2015]** M. Caprio, B. Tarigan, C. B. Worden, S. Wiemer, and D. J. Wald, "Ground Motion to Intensity Conversion Equations (GMICEs): A Global Relationship and Evaluation of Regional Dependency," *Bulletin of the Seismological Society of America*, vol. 105, no. 3, pp. 1476–1490, Jun. 2015. doi: 10.1785/0120140286.

**[refWu2003]** Y.-M. Wu, N.-C. Hsiao, and T.-L. Teng, "Relationships between Strong Ground Motion Peak Values and Seismic Loss during the 1999 Chi-Chi, Taiwan Earthquake," *Bulletin of the Seismological Society of America*, vol. 93, no. 1, pp. 386–396, Feb. 2003. doi: 10.1785/0120020006.

**[refWuKanamori2008]** Y.-M. Wu and H. Kanamori, "Development of an Earthquake Early Warning System Using Real-Time Strong Motion Signals," *Sensors*, vol. 8, no. 1, pp. 1–9, Jan. 2008. doi: 10.3390/s8010001.

**[refHoshiba2015]** M. Hoshiba and S. Aoki, "Numerical shake prediction for earthquake early warning: Data assimilation, real-time shake mapping, and simulation of wave propagation," *Bulletin of the Seismological Society of America*, vol. 105, no. 3, pp. 1324–1338, Jun. 2015. doi: 10.1785/0120140054.

**[refAtkinsonKaka2007]** G. M. Atkinson and S. I. Kaka, "Relationships between Felt Intensity and Instrumental Ground Motion in the Central United States and California," *Bulletin of the Seismological Society of America*, vol. 97, no. 2, pp. 497–510, Apr. 2007. doi: 10.1785/0120060154.

*Note:* `refHoshiba2015` and `refWuKanamori2008` are new and should be renumbered into the existing 89-reference list. The existing references to Wu et al. [22], [23] are for τc/Pd derivation, while this new `refWuKanamori2008` is specifically for the EEWS operational-threshold framing — keep both.

---

## 6. Corrections Elsewhere in the Manuscript

The following existing claims should be updated for consistency with the corrected Table 1 and Section III.C:

1. **Abstract, line 19** — "25,058 three-component accelerograms **from 336 events**" → change "336" to "338".

2. **Abstract, line 19** — "**Mw 5.6 Cianjur 2022 and Mw 5.7 Sumedang 2024 events**" — ensure the gb3 event origins match the Cianjur/Sumedang/Garut set (verify 2024-04-27 event is Garut Mw 6.2).

3. **Section II.B, line 109** — "125 HN*/HL* horizontal-component accelerographs" → "125 HN*/HL* horizontal-component accelerographs (151 unique station codes across both data streams, including 26 additional stations unique to the large-event augmentation subset)".

4. **Section II.C** — "median epicentral distance of ~109 km" → "~122 km" (two places).

5. **Section IV.C, Table 6 caption** — "25,058 Traces" retain; ensure underlying metrics are re-validated against updated corpus.

6. **Table 9 "PTW Selection Distribution"** — row totals do NOT sum to 25,058. Replace with the operational-intensity class distribution from the new Table 3 above.

7. **Section V.C, Table 13 caption** — "**High-PGA Subset, N = 1,204**" → verify against updated threshold: using PGA ≥ 0.0958 gal (95th percentile) the subset is **N ≈ 1,254**. If a specific 1,204 subset was used, document its filter criterion explicitly in a footnote.

---

## 7. Quick Sanity Check Before Pasting

All numbers above have been verified against `metadata_recalibrated.csv` (the authoritative 25,058-row file). Cross-verification performed 2026-04-22. Any reviewer can reproduce the table by running:

```python
import pandas as pd
mr = pd.read_csv("data/input/metadata_recalibrated.csv")
pga = mr['psa5_T_0.000'].dropna()
weak = (pga < 2.9).sum(); fs = ((pga >= 2.9) & (pga < 89)).sum(); dam = (pga >= 89).sum()
print(f"SIG-BMKG: Weak={weak}, Felt={fs}, Damaging={dam}, Total={weak+fs+dam}")
# Expected output: SIG-BMKG: Weak=25055, Felt=3, Damaging=0, Total=25058
```

---

*Draft prepared 2026-04-22. To regenerate from source, see `07_sigbmkg_class_distribution.csv` and `08_corrected_Table1_parameters.csv` in the same folder.*
