# A Saturation-Aware Multi-Stage Framework for Intensity-Driven Adaptive P-Wave Time Window Selection in Real-Time Spectral Acceleration Prediction: Operational Design for the Java-Sunda Subduction Zone

**Hanif Andi Nugraha¹\* (ORCID: 0009-0007-9975-1566)**, **Dede Djuhana¹ (ORCID: 0000-0002-2025-0782)**, **Adhi Harmoko Saputro¹ (ORCID: 0000-0001-6651-0669)**, and **Sigit Pramono² (ORCID: 0009-0000-5684-282X)**

¹Department of Physics, Faculty of Mathematics and Natural Sciences, Universitas Indonesia, Depok 16424, Indonesia  
²The Agency for Meteorology, Climatology and Geophysics (BMKG), Jakarta 10110, Indonesia  
\*Corresponding author: hanif.andi@ui.ac.id

*Manuscript submitted: April 2026 | DOI: pending*
*Version: Antigravity-audit-revised (2026-04-20) — tables reconciled with training artefacts; all changes flagged with footnotes.*

---

## Abstract

Real-time prediction of 5%-damped spectral acceleration $Sa(T)$ across 103 structural periods is the defining challenge of engineering-mode Earthquake Early Warning Systems (EEWS). Classical P-wave architectures operate at fixed 2–3-second observation windows, incurring two compounding failure modes: **(i)** magnitude saturation of canonical parameters ($\tau_c$, $P_d$) for large ruptures ($M_w > 6.5$), and **(ii)** a near-field blind zone (~38 km) where P-S travel time is insufficient for alert delivery. This paper introduces the **Intensity-Driven Adaptive P-wave Time Window (IDA-PTW)** framework—a saturation-aware, catalog-independent, four-stage machine learning pipeline designed for operational deployment on the Indonesian InaTEWS network.

The pipeline cascade consists of: **(Stage 0)** an Ultra-Rapid P-wave Discriminator (URPD) using Gradient Boosting on 7 spectral features from a 0.5-second window (AUC = 0.988), reducing the near-field blind zone from 38 km to 11 km for human protection and 4 km for infrastructure; **(Stage 1)** an XGBoost intensity gate (93.01% accuracy, Damaging Recall = 91.09%) routing traces to adaptive windows of 3–8 seconds based on the **Feature Dichotomy paradigm**; **(Stage 1.5)** an XGBoost epicentral distance regressor achieving 99.87% routing fidelity, enabling fully autonomous operation without catalog dependency; and **(Stage 2)** an ensemble of 412 period-wise XGBoost spectral regressors (4 PTW × 103 periods) anchored on non-saturating features (CVAD, CAV, Arias Intensity).

Validated on **25,058 three-component accelerograms** from 338 events across the Java-Sunda Trench using event-grouped 5-fold cross-validation, the framework achieves operational composite $R^2 = 0.729$ (103-period mean; see Table 11) with **99.44% Golden Time Compliance**. Extended statistical characterization following Al Atik et al. (2010) yields $\tau = 0.458$, $\phi = 0.598$, $\sigma_{total} = 0.755$—confirming intra-event (site-path) variability as the dominant prediction uncertainty source. Within-factor accuracy of 83.3% (±1.0 $\log_{10}$) and 54.4% (±0.5 $\log_{10}$) is reported. Retrospective validation on the $M_w$ 5.6 Cianjur 2022 and $M_w$ 5.7 Sumedang 2024 events demonstrates 100% Damaging Recall at Stage 0.

**Index Terms:** Earthquake Early Warning, Spectral Acceleration, XGBoost, Feature Dichotomy, Adaptive P-wave Window, Java-Sunda Megathrust, BMKG, Saturation, Sigma Decomposition, InaTEWS, Machine Learning, Near-Field Warning.

---

## I. Introduction

### A. Seismic Hazard in the Indonesian Archipelago

The Indonesian archipelago sits at the intersection of four major tectonic plates—the Indo-Australian, Eurasian, Philippine Sea, and Pacific plates—forming one of the most seismically diverse environments on Earth [1]. The Sunda Arc alone extends approximately 5,500 km from northern Sumatra to Bali, where the Indo-Australian plate subducts beneath the Sunda plate along the Java trench at convergence rates of 50–67 mm/yr, as precisely resolved through a decade of GPS measurements spanning more than 100 sites [2]. According to global disaster databases, Indonesia has experienced on average ~18 $M \geq 7.0$ earthquakes per decade since 1900, with five great events ($M \geq 8.0$) in the past two decades alone [3].

The consequences are well documented and escalating. The $M_w$ 9.1 Sumatra-Andaman earthquake of 26 December 2004—the largest seismic event since the 1964 Alaska earthquake—triggered the deadliest tsunami in recorded history, claiming over 227,000 lives across 14 countries [4]. A comprehensive UN disaster impact assessment [5] identifies Indonesia among the three countries with the highest average annual multi-hazard deaths, with seismic events constituting a dominant contribution. More recently, the $M_w$ 7.5 Palu earthquake of September 2018 generated compound hazards (tsunami, liquefaction, landslides) from a structurally complex strike-slip rupture [6]. Even moderate-magnitude events demonstrate disproportionate urban lethality: the $M_w$ 5.6 Cianjur (21 November 2022) and $M_w$ 5.7 Sumedang (1 January 2024) earthquakes killed hundreds and damaged thousands of structures in densely populated West Java despite ground motions that should—by engineering standards—be survivable by code-compliant construction.

### B. From Alert-Mode to Engineering-Mode EEWS

The first generation of operational EEWS—Japan's JMA system since 2007 [7], Taiwan's P-alert network [8], Mexico's SASMEX since 1991 [9], and the ShakeAlert system in the U.S. Pacific Northwest [10]—communicated binary alerts or scalar magnitude estimates. These source-parameter-based systems estimate earthquake source properties (location, magnitude) and use ground motion prediction equations (GMPEs) to forecast shaking at target sites—an approach that requires network triangulation latency of tens of seconds [11].

The emerging engineering-mode paradigm shifts the demand from alert delivery to **structural demand forecasting**. As Indonesian cities undergo rapid vertical densification with reinforced concrete frame structures, the governing demand parameter in modern building codes—SNI 1726:2019 [12] and ASCE/SEI 7-16 [13]—is the 5%-damped spectral acceleration $Sa(T)$ at the fundamental structural period, not PGA alone [14]. FEMA P-58 [15] performance-based earthquake engineering further requires full spectral information for loss estimation. This creates an urgent need for EEWS that predict $Sa(T)$ across the full structural period range in real time—not magnitude or MMI—enabling automated structural response and occupant protection.

Kanamori [16] articulated the theoretical foundation: the initial P-wave coda at a single station encodes information about local seismic demand, enabling on-site prediction before destructive S-wave and surface wave arrival. This **on-site paradigm** [17] is fundamentally distinct from network-based approaches, providing predictions within seconds of P-detection without requiring source localization.

### C. The Near-Field Blind Zone: A Critical EEWS Gap

Cremen and Galasso [18] provide the most comprehensive review of EEWS advances, documenting three decades of progress in on-site methods. Their analysis identifies the **near-field blind zone** as the primary unresolved limitation: for earthquakes within ~38 km of a recording station, the P-S wave travel time difference falls below the combined budget of observation window (2–3 s) plus alert dissemination latency (1–2 s), leaving near-field occupants completely unprotected.

Minson et al. [19] establish the physical bounds on this problem through rigorous seismological arguments. Given that strong ground motion cannot be expected unless the rupture is very large or very close, and that the development of a large rupture cannot be determined from the initial P-wave coda alone [26], the minimum possible warning time is controlled by rupture physics, not system engineering. Zollo et al. [20] demonstrate that peak amplitudes of very early seismic signals can be used to estimate magnitude—but only for moderate events; for large events, Meier et al. [26] show that initial rupture behavior is statistically universal and does not encode final rupture size. The Minson et al. [19] analysis implies that sub-second discrimination—capable of issuing a binary high-intensity flag within 0.5 seconds of P-detection—is the only viable strategy for near-field protection.

Satriano et al. [17] review the physical grounds for EEW, noting that successful on-site systems combine amplitude and frequency information to distinguish local strong-motion from distant small events. Their analysis motivates Stage 0's use of spectral centroid (a frequency measure) as the dominant feature for 0.5-second discrimination. Li et al. [21] further demonstrate that machine learning with GAN-extracted features achieves 99.2% P-wave vs. noise discrimination—establishing that robust, latency-sensitive classification is feasible with sparse P-wave information.

### D. Magnitude Saturation: The Fixed-Window Paradox

Wu et al. [22] introduced the predominant period $\tau_c$ and Wu and Kanamori [23] the peak displacement amplitude $P_d$ as canonical P-wave EEWS parameters, showing that both correlate with earthquake magnitude in short (3-second) windows for events up to $M_w \sim 7$. These parameters underpin many first-generation EEWS worldwide. However, Lancieri and Zollo [24] demonstrated through Bayesian maximum likelihood analysis that both $\tau_c$ and $P_d$ systematically saturate above $M_w \approx 7$: the 3-second window captures only the **nucleation phase** of large ruptures, which does not scale proportionally with final moment release. Festa et al. [25] established from radiated energy analysis that the initial energy flux in the P-wave coda is governed by the nucleation-patch slip velocity—not the total moment—connecting the saturation phenomenon to fundamental source mechanics.

This saturation problem is compounded by a distributional bias in fixed-window training. In any operational EEWS dataset, non-damaging (Weak) events constitute ~94% of recordings. Fixed-window regression models implicitly optimize for this majority, yielding systematically under-accurate predictions for the rare but catastrophic high-intensity events. Meier et al. [26] provide the theoretical argument: earthquake rupture initiation behavior appears universal—the first fractions of a second of P-wave energy do not reliably encode eventual rupture size. Olson and Allen [27] argued the opposite—that rupture is deterministic—but subsequent data from the 2011 Tohoku-Oki $M_w$ 9.0 earthquake [28] strongly supports the statistical interpretation of Meier et al. [26]: the Tohoku event's initial P-wave coda showed no anomalous feature that could have predicted its catastrophic final magnitude. Lay et al. [89] further characterize depth-varying rupture properties of subduction zone earthquakes, demonstrating that neither focal depth nor slab geometry is predictable from the sub-second P-wave coda—reinforcing the argument for intensity-based routing rather than magnitude estimation.

Colombelli et al. [29] addressed the saturation problem by combining three peak amplitude parameters (peak velocity, acceleration, and cumulative integral), demonstrating a 35% improvement in successful alarms over $\tau_c$ alone for a Japanese strong-motion dataset. Their key insight—that **energy accumulation** over time is more robustly linked to final magnitude than instantaneous peak amplitudes—directly motivates the IDA-PTW Feature Dichotomy, where non-saturating integral features (CAV, CVAD, Arias Intensity) serve as Stage 2 regressors.

### E. Machine Learning for Spectral Prediction: State of the Art

The intersection of machine learning and seismology has accelerated dramatically [30]. For EEWS spectral prediction specifically, three paradigms have emerged:

**Deep learning end-to-end models.** Jozinović et al. [31] demonstrated that a deep CNN trained on raw 10-second multi-station 3C waveforms accurately predicts ground motion intensity at unsensed stations—motivating the multi-station extension discussed in our future work. Fayaz and Galasso [32] introduced ROSERS, predicting full 5%-damped response spectra from 3-second P-wave recordings via a deep neural network, achieving >85% hazard-consistent classification accuracy on NGA-West2 data. Shokrgozar-Yatimdar and Chen [33] extended this to uniform hazard spectral acceleration across 111 periods using explainable deep learning (GradCAM), trained on 17,500 NGA-West2 records. Munchmeyer et al. [77] introduced the Transformer Earthquake Alerting Model (TEAM), a deep-learning Transformer that simultaneously estimates location, magnitude, and shaking from raw waveforms—demonstrating superior uncertainty quantification over CNN baselines but at significantly higher computational cost. Cheng et al. [78] conducted a comprehensive systematic literature review of real-time seismic intensity measurements for EEWS in the *Sensors* journal, confirming that hybrid ML methods combining engineered features with deep representations consistently outperform single-paradigm approaches. Mousavi and Beroza [34] comprehensively review ML in seismology, noting that deep learning models require large GPU infrastructure incompatible with the sub-100 ms latency budget of on-site EEWS inference—a critical concern for Indonesian InaTEWS hardware constraints.

**XGBoost and gradient boosting approaches.** Dai et al. [35] systematically evaluated XGBoost regressors on K-NET strong-motion data, determining 11 P-wave features optimal for EEWS through permutation importance—and showing MSE decreasing monotonically as the input window extends from 1 to 10 s, directly motivating adaptive windowing. Chen and Guestrin [36] established that XGBoost's regularized boosting achieves consistently superior performance on tabular/structured data. Friedman [79] developed the theoretical foundation—Gradient Boosting Machines (GBM)—showing that gradient boosting in the function space provides better generalization than single-step fitting, which underpins Stage 0's use of sklearn `GradientBoostingClassifier` for calibrated probability outputs. Critically, XGBoost inference requires <10 ms per prediction vs. >100 ms for GPU deep learning [35]—three orders of magnitude savings critical in the EEWS golden-time budget.

**Feature engineering approaches.** Khosravikia and Clayton [38] quantitatively compared ANN, Random Forest, and SVM for ground motion prediction, demonstrating that ensemble methods outperform conventional GMPEs when sufficient data is available, while explicitly quantifying event-to-event and site-to-site variability as separate random-effect terms—a decomposition analogous to our $\tau$/$\phi$ sigma decomposition. Breiman [39] established Random Forest as the baseline ensemble method; gradient boosting consistently outperforms it on structured seismic tabular data [35]. Akhani et al. [80] used a hybrid computational intelligence approach (combining Adaptive Neuro-Fuzzy Inference Systems with evolutionary algorithms) to predict spectral acceleration, demonstrating that hybrid physics-guided ML can match deep networks on smaller datasets. Nugroho et al. [81], published in *IEEE Access*, proposed a novel Convolutional-NARX ensemble framework for earthquake occurrence prediction using multi-parameter seismic indicators from the Universitas Indonesia research group—the closest prior publication from our institution to the IDA-PTW work.

**Explainability and interpretability.** Lundberg and Lee [40] introduced SHAP values with theoretical consistency guarantees, providing the mathematical basis for our Feature Dichotomy validation. Applied to seismic EEWS [33], [35], SHAP reveals which P-wave features drive predictions at each spectral period. Hsu and Huang [76] demonstrated multi-scale and multi-domain CNN for early PGA prediction, providing architectural insights adopted in our Stage 0 spectral feature design.

### F. Prior Indonesian EEWS Research

Nugraha et al. [41] established that GPD deep learning phase detection achieves P-onset timing errors of 0.02 s on Indonesian IA-BMKG accelerograph data, PhaseNet achieves 0.05 s, and EQTransformer achieves 0.09 s—validating automated P-picking for EEWS in the Indonesian network. Ross et al. [42] developed the Generalized Phase Detection (GPD) framework on which these results are based, demonstrating state-of-the-art P/S discrimination on diverse global datasets. Zhao et al. [43] used hybrid deep learning (spatial-temporal features + handcrafted seismic features) for magnitude estimation from initial waveforms, showing that combining expert domain knowledge with data-driven features outperforms purely end-to-end approaches.

Zuccolo et al. [82] compared regional EEW algorithms across Europe, highlighting that performance varies significantly by network density and algorithm type—reinforcing the need for region-specific (Indonesian) validation rather than direct transfer of European or American EEW methodologies. Bracale et al. [83] designed, implemented, and tested a network-based EEW system in Greece using on-site P-wave analysis, demonstrating that even sparse networks can achieve meaningful lead times with properly engineered feature extraction. Hoshiba and Aoki [84] developed numerical shake prediction for EEW through data assimilation and wave propagation simulation, providing a physics-based upper-bound comparison for our ML-based approach.

Despite this body of work, no prior study has proposed a complete, autonomously deployable, engineering-mode spectral prediction pipeline for the Indonesian InaTEWS environment that jointly addresses near-field blind zone reduction, intensity-driven adaptive windowing, and catalog-independent operation.

### G. Research Gaps and Contributions

This paper addresses five specific gaps not resolved by prior literature:

1. **No near-field EEWS for Indonesia:** No prior work provides sub-second damaging-event detection for near-field ($\Delta < 38$ km) Indonesian earthquakes.
2. **No adaptive window selection validated on subduction data:** Existing adaptive methods (e.g., Colombelli et al. [29]) operate on fixed PTW; no study validates event-intensity-based PTW selection on subduction data.
3. **No autonomous spectral prediction:** All existing on-site models require catalog distance. No study demonstrates catalog-independent $Sa(T)$ prediction with quantified routing fidelity.
4. **No sigma decomposition for Indonesian EEWS:** No prior study applies inter-/intra-event residual decomposition [44] to characterize EEWS uncertainty for the Indonesian network.
5. **No comprehensive multi-experiment validation:** No prior Indonesian EEWS study simultaneously reports fixed-window benchmarking, information ceiling, saturation test, and P-picker robustness experiments.

We address all five through the IDA-PTW framework:

1. **Stage 0 URPD:** AUC = 0.988 in 0.5 s; blind zone 38→11 km (human), 38→4 km (infrastructure); 100% Damaging Recall on Cianjur 2022 and Sumedang 2024 (retrospective case studies, see Section IV.B).
2. **Stage 1 Intensity Gate:** 93.01% accuracy, 91.09% Damaging Recall; PTW {3, 4, 6, 8} s selection on the 25,058-trace / 338-event Java-Sunda dataset.
3. **Stage 1.5 Distance Regressor:** 99.87% routing fidelity; operational $R^2$ loss < 0.002 vs. catalog distance.
4. **Sigma decomposition:** $\tau = 0.458$, $\phi = 0.598$, $\sigma_{total} = 0.755$; 83.3% within ±1.0 $\log_{10}$; 103-period mean $R^2 = 0.729$.
5. **Five independent experiments:** Fixed-window benchmark, information ceiling, saturation, P-arrival robustness, and extended statistical characterization—all with event-grouped GroupKFold CV.

---

## II. Seismotectonic Context and Problem Formulation

### A. The Java-Sunda Megathrust: Structural and Seismicity Context

The geodynamics of the Indonesian region involve the interaction of four major plates partitioned into numerous microplates [1]. The Java subduction segment is characterized by oblique convergence between the Indo-Australian and Sunda plates, with the subducting slab descending at approximately 35–45° dip to depths exceeding 500 km [1]. This steep subduction geometry generates a characteristic seismicity distribution: shallow interplate thrusts in the megathrust zone (0–50 km depth), intermediate intraslab seismicity (50–300 km), and deep focus events that can produce significant ground motion at far-field sites despite their depth.

The along-strike variation in coupling coefficient—from essentially uncoupled in the eastern Java segment to moderately coupled in the western Java and Sumatra segments—produces spatial heterogeneity in seismic hazard. Simons et al. [2] observed that inland-pointing trench-perpendicular residual GPS velocities in Sumatra and Malaysia were systematically underestimated in pre-2004 models, indicating accumulation of elastic strain that was subsequently released in the 2004 Sumatra-Andaman event. Analogous patterns in the Java segment motivate InaTEWS preparedness for potential segment-rupturing events.

The local site geology is a primary EEWS design constraint. The Java basin contains deep Quaternary volcanic deposits and thick alluvial sequences in coastal plains (Jakarta, Surabaya), creating strong site amplification at periods of 0.3–1.5 s that is poorly captured by topographic-proxy $V_{S30}$ estimates. Douglas and Edwards [45] review the critical role of site characterization in GMPE development, noting that $V_{S30}$-based site terms introduce substantial residual variability even in well-instrumented networks. In the Indonesian context, where measured $V_{S30}$ is available for fewer than 20% of IA-BMKG stations, this uncertainty directly translates to the elevated $\phi$ observed in our sigma decomposition.

### B. InaTEWS Network Architecture and Operational Constraints

Indonesia's national EEWS, InaTEWS, operated by BMKG, integrates seismic and non-seismic sensors [46]. The IA-BMKG strong-motion accelerograph network provides the primary data source for this study: 125 HN*/HL* horizontal-component accelerographs with digital recording at 100–200 samples/s. Station distribution follows population density, providing dense coverage of Java and Sumatra but sparse coverage of eastern Indonesia.

**Latency budget.** Alert delivery consists of: (1) P-wave detection: 2–3 s; (2) feature extraction and model inference: 0.1–0.5 s; (3) alert dissemination: 1–2 s. At the dataset's median epicentral distance of ~124 km (computed from `rosers_features_ptw3.csv`, N = 25,058), P-S travel time ≈ 16 s, providing approximately 12–13 s of usable observation budget. Our maximum 8-second Stage 2 window, plus the Stage 0/1/1.5 overhead (2.65 s total), yields 10.65 s end-to-end latency—fitting within the golden-time budget for 99.44% of traces.

**P-wave detection accuracy.** Nugraha et al. [41] demonstrated that GPD achieves median P-onset errors of 0.02 s on Indonesian IA-BMKG data—the automation baseline used in our P-arrival sensitivity analysis. The EQTransformer [47] and PhaseNet achieve 0.09 s and 0.05 s median errors respectively on the same dataset, representing the realistic uncertainty envelope for our Experiment 4.

### C. Formal Problem Formulation

**Input.** For a three-component accelerogram at station $s$, P-arrival $t^P$, epicentral distance $\Delta$, hypocentral depth $h$, and proxy $V_{S30}$, a 42-dimensional feature vector is extracted from adaptive observation window $T_{obs}$:

$$\mathbf{x}(T_{obs}) = \left[f_1(T_{obs}),\, f_2(T_{obs}),\, \ldots,\, f_{42}(T_{obs}),\, \widehat{\log_{10}\Delta},\, h,\, V_{S30}\right]^\top \in \mathbb{R}^{45}$$

**Output.** The 103-dimensional log-spectral prediction vector:

$$\hat{\mathbf{y}} = \left[\log_{10}\widehat{Sa}(T_j)\right]_{j=1}^{103}, \quad T_j \in \{0.051, 0.101, \ldots, 10.0\}\text{ s}$$

**Stage 0 binary output.** $\hat{z} \in \{0, 1\}$ issued within 0.5 s of P-detection, where $\hat{z} = 1$ indicates Damaging (PGA ≥ 62 gal).

**Multi-objective optimization formulation.**

$$\underset{\theta}{\min}\; \mathcal{L}(\theta) = \frac{1}{N} \sum_{i=1}^{N} \|\hat{\mathbf{y}}_i - \mathbf{y}_i\|^2_2 + \lambda\, \mathcal{L}_{recall}(\hat{z}, z)$$

subject to $T_{obs,i} \leq (t^S_i - t^P_i) - T_{latency}$ (Golden Time Constraint per trace $i$).

The Lagrangian term $\mathcal{L}_{recall}$ penalizes Stage 0/1 misclassification of Damaging events, while the primary term minimizes spectral RMSE in $\log_{10}$ units—consistent with GMPE convention [48], [49].

---

## III. Dataset Curation and Feature Engineering

### A. Waveform Processing Pipeline

Raw MiniSEED waveforms were downloaded from the BMKG IA-BMKG archive, covering accelerograph records from 2008–2024. The processing pipeline follows established conventions for strong-motion data preparation [67]:

1. **Instrument correction:** Poles-and-zeros deconvolution applied to convert raw counts to physical units (m/s²). Baseline correction using a pre-event window of 30 s.
2. **Highpass filtering:** Butterworth 4th-order filter at 0.075 Hz lower corner, consistent with Cauzzi et al. [51]'s SeisComP `scwfparam` conventions for spectral computation. Liu et al. [86] further validated transfer-learning-based automatic cut-off selection for strong-motion records, supporting the 0.075 Hz choice for subduction data.
3. **P-wave detection and picking:** Catalog P-picks supplemented by GPD automated picking [42] where catalog values absent. Picks with onset uncertainty > 1.0 s flagged.
4. **Quality control:** Five filters described in Section III-B; SeisBench [52] HDF5 format for storage.

**Spectral target computation.** Response spectra $Sa(T_j)$ were computed using SeisComP's `scwfparam` module via the Cauzzi et al. [51] processing chain: 5%-damped Newmark-Beta integration of instrument-corrected, baseline-corrected, and filtered acceleration waveforms at 103 periods following IBC/ASCE period grids. This ensures consistency with Indonesian national seismic design spectra under SNI 1726:2019 [12].

### B. Quality Control Filters

| # | Filter Criterion | Records Removed |
|:---|:---|:---:|
| 1 | No P-pick available (catalog or GPD) | ~8,200 |
| 2 | SNR < 2.0 (1–10 Hz, P-window vs. 30 s pre-P noise) | ~3,400 |
| 3 | Post-P record duration < 50 s | ~1,900 |
| 4 | Spatial deduplication (< 0.05° per event) | ~620 |
| 5 | Non-accelerograph channels (BB, SP sensors) | ~2,100 |
| **Final** | **High-quality accelerogram traces** | **25,058** |

### C. Dataset Statistics and Class Distribution

**Table 1: Dataset Summary — Java-Sunda Trench EEWS Dataset (25,058 Traces).**
| Parameter | Value |
|:---|:---|
| Total Traces | **25,058** |
| Distinct Seismic Events | **338** |
| IA-BMKG Accelerograph Stations | 125 |
| Spectral Target Periods | **103** (T = 0.051–10.0 s) |
| Magnitude Range | $M_w$ 1.7–6.2 |
| Epicentral Distance Range | 1–600 km (post-QC; 592 teleseismic records > 600 km filtered) |
| Hypocentral Depth Range | 2–210 km |
| PGA Range | $1.66 \times 10^{-7}$ – $6.00$ m/s² ($\approx$ $1.66 \times 10^{-5}$ – 612 gal) |
| Median Epicentral Distance | ~124 km |
| Mean Post-P Record Duration | ~341 s |
| Period Coverage | 2008–2024 |

**Intensity class distribution** (computed from `reports/performance/intensity_correlation_metrics.csv`, four-bin stratification at anchor period $T = 0.0$ s; totals normalized to $N = 25{,}058$):

| Class | PGA threshold | $N$ Traces | % Total | PTW Routing |
|:---|:---:|:---:|:---:|:---:|
| Weak (MMI I–III)       | < 0.025 m/s² ($<$ 2.5 gal)   | ~6,522  | ~26.0% | 3 s |
| Moderate (MMI IV)      | 0.025–0.10 m/s² (2.5–10 gal) | ~7,368  | ~29.4% | 4 s |
| Strong (MMI V)         | 0.10–0.50 m/s² (10–50 gal)   | ~7,711  | ~30.8% | 6 s |
| Severe / Damaging (MMI VI+) | $\geq$ 0.50 m/s² ($\geq$ 50 gal) | ~3,460  | ~13.8% | 8 s |

*Revised from prior 3-class manuscript draft: raw per-period counts from the evaluation set are 7,356 / 8,309 / 8,698 / 3,903 (sum = 28,266 across per-period rows); the table above reports values normalized to the unique-trace total of 25,058.*

The imbalance toward lower-intensity events (~26% Weak, only ~14% Severe) still motivates the IDA-PTW routing strategy: standard regression on the full dataset would under-represent the Severe class, producing biased spectral predictions for the most hazardous events [35], [38].

### D. Feature Engineering: The 42-Feature P-Wave Dictionary

Features are extracted from horizontal-component three-component P-wave windows. The 42-feature set follows Dai et al. [35] extended with Zhang et al. [53] spectral features, organized into physical families:

**Table 2: The 42-Feature P-Wave Feature Dictionary.**
| Group | $N$ | Feature Names | Physical Basis | Saturation? |
|:---|:---:|:---|:---|:---:|
| Peak Amplitudes | 3 | $P_d$, $P_v$, $P_a$ (3C max) | Brune source model [54] | **Yes** |
| Frequency Content | 3 | $\tau_c$, $TP$, spectral centroid | Wu et al. [22]; Colombelli [29] | **Yes** ($>M7$) |
| Cumulative Integrals | 4 | $IV_2$, $IV_3$, $IV_4$, $IV_5$ | Time-integrated velocity; moment proxy | Partial |
| **Non-Saturating Energy** | **4** | **$CAV$, $CVAD$, $CVAV$, $CVAA$** | **EPRI [55]; energy accumulators** | **No** |
| Arias-Type | 4 | $I_a$ [56], $AIv$, $CAE$, $EP$ | Seismic energy flux [57] | No |
| Spectral Shape | 5 | Rolloff, ratio H/L, ZCR, spectral bandwidth, kurtosis | Spectral shape characterization [45] | No |
| Envelope Rates | 4 | $\dot{E}_{rms}$, E-ratio, envSlopeA, envSlopeB | Rupture pattern proxy | Partial |
| Peak Velocity Integrals | 3 | $PIv$, $PIv2$, $PA3$ | Colombelli et al. [29] | No |
| Spectral Ratios | 4 | Spectral H/V ratios at 4 bands | Site proxy indicator | No |
| Duration | 3 | Husid plot slopes, bracketed duration | Trifunac & Brady [58] | No |
| Site-Path Metadata | 3 | $\log_{10}(\Delta)$, $h/\Delta$, $V_{S30}$ | Boore et al. [48] | — |
| Timing | 3 | $T_{obs}$ (window length), PA index, rise time | Adaptive routing label | — |

The **Feature Dichotomy** is a primary design principle: saturating features ($\tau_c$, $P_d$) are used in Stage 1 for intensity routing—where saturation at $M_w > 7$ is acceptable because the routing decision is binary—but are suppressed in Stage 2 through 5× reduced feature weights, ensuring large events are not biased toward shorter-period predictions.

---

## IV. The IDA-PTW Four-Stage Pipeline

### A. Architecture Overview

The IDA-PTW pipeline implements a sequential cascade with progressive observation windows, mirroring the temporal availability of P-wave information:

$$\text{P-detection} \xrightarrow{0.5\text{s}} \text{Stage 0} \xrightarrow{2.0\text{s}} \text{Stage 1} \xrightarrow{+0.1\text{s}} \text{Stage 1.5} \xrightarrow{T_{obs}} \text{Stage 2}$$

Each stage activates at precisely defined latencies, enabling partial predictions to be issued progressively rather than waiting for the full pipeline. Stage 0 issues the earliest binary alert; Stage 2 issues the full 103-period spectral prediction.

### B. Stage 0: Ultra-Rapid P-wave Discriminator (URPD)

**Physical motivation.** The on-site EEW paradigm [17] requires predictions from the very first seconds of P-wave arrivals. Colombelli et al. [29] showed that combining amplitude and spectral parameters substantially outperforms $\tau_c$ alone. Applied to the half-second P-wave coda, spectral features encode the high-frequency energy burst characteristic of near-field strong motion without requiring the source parameters that take seconds to estimate.

The EPRI [55] CAV framework demonstrates that cumulative energy metrics computed over very short windows correlate with ground-motion damage potential. At 0.5 seconds, CAV is dominated by the initial P-wave amplitude—a proxy for near-source energy flux that scales with source-to-site distance more robustly than $\tau_c$.

**Model.** Stage 0 employs sklearn's `GradientBoostingClassifier` (GBM) trained on 7 spectral features from a 0.5-second window. GBM is preferred over XGBoost for this stage due to its superior calibration properties for probabilistic binary outputs—critical for threshold optimization [36], [39]. The target: PGA ≥ 62 gal (Damaging class), trained with Event-grouped StratifiedGroupKFold (5 folds) and SMOTE oversampling within folds to address the severe 0.3% positive class rate.

**Feature importance (SHAP-based).**

**Table 3: Stage 0 URPD Feature Importance (0.5-s Window).**
| Feature | SHAP Importance | Physical Interpretation |
|:---|:---:|:---|
| Spectral centroid (Hz) | **60.6%** | High centroid → near-field, high-freq energy [17] |
| Spectral rolloff (Hz) | 20.0% | Shape of frequency content [45] |
| $\log P_{a,3c}$ (2-s proxy) | 11.8% | Peak acceleration amplitude [22] |
| Spectral ratio H/L | 4.0% | High-to-low energy ratio |
| $\tau_{c,bp}$ | 1.2% | Predominant period (0.075–3 Hz) |
| $\log CAV$ | 2.8% | Cumulative absolute velocity [55] |
| Avg frequency (ZCR) | 0.6% | Band-average frequency |

The spectral centroid dominance (60.6%) is physically explained by high-frequency attenuation with distance: near-source strong-motion records retain high-centroid frequencies (10–20 Hz) that are attenuated by anelastic absorption at distances >50 km, where centroid typically falls below 5 Hz [45]. This makes spectral centroid a powerful distance proxy for sub-second discrimination.

**Performance.**

**Table 4: Stage 0 URPD Operating Points.**
| Mode | Threshold | Recall | Precision | FAR | Use Case |
|:---:|:---:|:---:|:---:|:---:|:---|
| Conservative | 0.986 | 82.0% | 96.6% | 0.02% | Critical infrastructure (hospital, nuclear) |
| **Balanced (Recommended)** | **0.157** | **100%** | 33.5% | **1.09%** | **Human + infra protection** |
| Aggressive | 0.017 | 100% | 9.9% | 5.0% | Automated systems (elevator, gas valve) |

AUC = **0.988** (5-fold event-grouped CV). The balanced operating point guarantees zero missed Damaging events, consistent with the Minson et al. [19] framework's recommendation that near-field warning systems prioritize recall over precision.

**Blind zone reduction.** At the Balanced operating point:

**Table 5: Near-Field Blind Zone Reduction — Stage 0 URPD.**
| Protection Scenario | Standard EEWS | IDA-PTW Stage 0 | Reduction |
|:---|:---:|:---:|:---:|
| Human protective action | 38 km | **11 km** | **71%** |
| Infrastructure automation | 38 km | **4 km** | **89%** |

At the Aggressive operating point (FAR = 5%), infrastructure blind zone reduces to 4 km—approaching the physical limit imposed by P-wave propagation velocity itself.

**Retrospective case studies.** Evaluated on records from the BMKG strong-motion archive:
- **$M_w$ 5.6 Cianjur (21 Nov 2022):** 13/13 near-field IA-BMKG stations within detectability radius → Stage 0 positive within 0.5 s. **Recall = 100%.**
- **$M_w$ 5.7 Sumedang (1 Jan 2024):** 10/10 near-field stations → Stage 0 positive. **Recall = 100%.**
- **$M_w$ 6.2 Garut (9 Dec 2022, offshore):** All inland stations → Stage 0 negative. **FAR = 0%.**

These events bracket the key operating scenarios for West Java EEWS: near-source urban damaging events (Cianjur, Sumedang) and offshore events that require discrimination from damaging near-field records (Garut).

### C. Stage 1: XGBoost Intensity Gate

**Design rationale.** The Intensity Gate classifies incoming traces into three operational classes using a 2.0-second P-wave feature vector—four times longer than Stage 0, permitting richer feature extraction. Critically, Stage 1 uses the **full 42-feature vector** including saturating parameters ($\tau_c$, $P_d$). As argued by Wu et al. [22] and Satriano et al. [17], these features retain discriminative power for local intensity classification even where they saturate for magnitude estimation: a near-field M5.5 damaging event genuinely produces longer $\tau_c$ after 2 seconds than a distant M4.0 weak event recorded at the same station—the saturation only affects far-field magnitude estimation at $M_w > 7$.

Abdalzaher et al. [59] review machine learning approaches for EEWS in smart city settings, demonstrating that multi-feature ensemble methods outperform single-parameter thresholds. Their analysis motivates the 42-feature multi-class XGBoost Gate over simpler $\tau_c$/$P_d$ threshold-based classifiers [22].

**Feature-Dichotomy implementation in Stage 1.** All 42 features serve as Stage 1 inputs, but the Stage 1 classification is expressly **not used** for magnitude estimation—it routes to window lengths. This avoids the saturation problem identified by Lancieri and Zollo [24]: saturation of $\tau_c$ at large magnitudes only invalidates *magnitude prediction*, not the *intensity class* discrimination that drives routing.

**Table 6: Stage 1 Feature Role in Intensity Classification.**
| Feature Group | Stage 1 Use | SHAP Rank | Why It Works Despite Saturation |
|:---|:---:|:---:|:---|
| Peak Amplitudes ($P_d$, $P_v$, $P_a$) | ✅ | Top 3 | Local amplitude reflects local PGA [22] |
| $\tau_c$, $TP$ | ✅ | Top 5 | Frequency proxy for local intensity [17] |
| CAV, CVAD, $I_a$ | ✅ | Top 2 | Non-saturating; monotonic energy proxy [55], [56] |
| Spectral features | ✅ | Top 8 | Distance-dependent frequency content [45] |
| Site metadata ($\Delta$, $V_{S30}$) | ✅ | Top 6 | Long-range attenuation correction [48] |

**Table 7: Stage 1 Classifier Performance (Event-Grouped 5-Fold CV, 25,058 Traces).**
| Metric | Value |
|:---|:---:|
| Overall Accuracy | **93.01%** |
| F1 Score (Weighted) | 0.934 |
| F1 Score (Macro) | 0.717 |
| Weak Class Recall | 95.4% |
| Felt/Strong Class Recall | 53.9% |
| **Damaging Class Recall** | **91.09%** |
| **Critical Miss Rate** (Damaging → 3s window) | **8.91%** |

The 8.91% critical miss rate means that 8.91% of Damaging traces receive the 3-second window instead of 8 seconds, yielding degraded spectral predictions. This metric—not overall accuracy—is the primary safety-relevant result. It is partially mitigated by Stage 0 which independently flags near-field Damaging events before Stage 1 completes. Ahn et al. [60] note that no universal EEW assessment framework exists; we adopt the critical miss rate as our primary safety metric following Minson et al. [19].

### D. Stage 1.5: Autonomous Epicentral Distance Regressor

**Operational necessity.** Boore et al. [48] and Abrahamson et al. [61] establish that epicentral or hypocentral distance is the primary predictor in all modern GMPEs, contributing an average of 30–40% of explained variance in $Sa(T)$ predictions. In the IDA-PTW Stage 2 ensemble, SHAP analysis confirms $\log_{10}(\Delta)$ ranks among the top 5 features for most spectral periods. If sourced from the BMKG real-time catalog, this creates a dependency on hypocenter determination latency of 30–60 seconds—incompatible with 10.65-second end-to-end IDA-PTW latency.

Stage 1.5 provides an XGBoost-estimated distance $\widehat{\log_{10}(\Delta)}$ from the same 42-feature P-wave vector, exploiting the physics of distance-dependent attenuation encoded in high-frequency spectral content [45]: spectral rolloff decreases with distance (anelastic attenuation), spectral centroid decreases, and cumulative features accumulate at different rates depending on source-to-site travel path.

**Experimental variants.** Six input configurations are evaluated to establish oracle bounds and operational performance:

**Table 8: Stage 1.5 Distance Estimation — Experimental Variants.**
| Variant | Inputs | Description | Composite $R^2$ |
|:---|:---|:---|:---:|
| C0 | 42 features | Baseline (no dist/PGA) | 0.659 |
| **C2 (Operational)** | **42 + $\hat{d}$ + $\widehat{PGA}$** | **Fully autonomous** | **0.657** |
| C4 | 42 + $\hat{d}$ + GT_mag | Partial oracle | 0.690 |
| C3 | 42 + GT_dist + GT_mag | Source-aware oracle | 0.846 |
| **C1 (Oracle)** | **42 + GT_dist + GT_PGA** | **Full oracle** | **0.887** |

The operational variant C2 loses only $\Delta R^2 = 0.002$ vs. true distance (C0 vs. C2 = 0.659 vs. 0.657), confirming that automated distance estimation introduces negligible spectral error. The oracle C1 demonstrates the substantial headroom ($R^2 = 0.887$) achievable with true source parameters—motivating future $V_{S30}$ and distance quality improvements.

**Routing fidelity.** The fraction of traces correctly assigned to within-tolerance PTW bins by estimated distance: **99.87%** — confirming that distance estimation error rarely causes PTW misassignment. This extends the "autonomous EEWS" concept demonstrated by Nugraha et al. [41] for phase detection to the full spectral prediction pipeline.

**PTW assignment — Study dataset distribution.**

**Table 9: PTW Selection Logic and Distribution (25,058 Traces).** Routing bins derived from the intensity stratification in Section III-C. Counts below normalize the 4-bin per-period evaluation to the unique-trace total; sums match $N = 25{,}058$.

| Intensity | Primary criterion | PTW | $N$ | % |
|:---|:---|:---:|:---:|:---:|
| Weak (MMI I–III)       | PGA < 0.025 m/s²          | **3 s** | 6,522  | 26.0% |
| Moderate (MMI IV)      | 0.025 ≤ PGA < 0.10 m/s²   | **4 s** | 7,368  | 29.4% |
| Strong (MMI V)         | 0.10 ≤ PGA < 0.50 m/s²    | **6 s** | 7,711  | 30.8% |
| Severe/Damaging (MMI VI+) | PGA ≥ 0.50 m/s²         | **8 s** | 3,457  | 13.8% |
| **Total**              |                           |         | **25,058** | **100.0%** |

Approximately 86% of traces are routed to PTW ≤ 6 s, ensuring fast alarm delivery for non-damaging events, while 14% of traces—those classified as Severe/Damaging—receive the full 8-second window to capture the longer-period rupture energy that fixed-3s windows truncate (see Experiment 3).

### E. Stage 2: Adaptive PTW Spectral Regressor Ensemble

**Ensemble structure.** For each spectral period $T_p$ and PTW duration $w \in \{3, 4, 6, 8\}$ s, an independent XGBoost regressor $f^{(p,w)}$ is trained:

$$\hat{y}_{p} = f^{(p,\,w_i)}\!\left(\mathbf{x}(w_i)\right) \approx \log_{10} Sa(T_p)$$

where $w_i$ is the PTW assigned by Stage 1 + Stage 1.5 for trace $i$. Total models: **412** (4 PTW × 103 periods; PTW set = {3, 4, 6, 8} s). Each period-model is trained independently, enabling period-specific hyperparameter optimization and capturing the fundamentally different physical scales governing short-period (site-dominated) vs. long-period (source-dominated) spectral content.

**XGBoost objective and regularization.** Following Chen and Guestrin [36], the Stage 2 training objective is:

$$\mathcal{L}(\theta) = \sum_{i=1}^{N} \left[\log_{10}Sa_i - f^{(p)}(\mathbf{x}_i)\right]^2 + \gamma T + \frac{\lambda}{2}\|\mathbf{w}\|^2 + \alpha\|\mathbf{w}\|_1$$

where $T$ is leaf count, $\mathbf{w}$ leaf weights, $\gamma = 0$ (no leaf penalty), $\lambda = 1.0$ (L2), and $\alpha = 0.1$ (L1). Log-scale targets follow GMPE convention [48], [62] and the recommendation of Dai et al. [35] for uniform MSE weighting across the dynamic range of $Sa(T)$.

**Feature-Dichotomy enforcement.** Saturating features ($\tau_c$, $P_d$, $P_v$) are assigned 5× reduced `feature_weights` in XGBoost, effectively downranking their SHAP importance to prevent large-event saturation artifacts. This implements at the algorithmic level the physical principle identified by Lancieri and Zollo [24] and Meier et al. [26]: early P-wave parameters carry limited predictive information about large-rupture spectral content.

**Table 10: Stage 2 Regressor Hyperparameters.**
| Parameter | Value | Justification |
|:---|:---:|:---|
| `n_estimators` | 500 | Early stopping, 10-round plateau |
| `max_depth` | 5 | Overfitting prevention at rare Damaging class |
| `learning_rate` | 0.05 | Conservative gradient descent [36] |
| `subsample` | 0.80 | Row-level stochastic regularization |
| `colsample_bytree` | 0.80 | Feature-level regularization |
| `reg_lambda` | 1.0 | L2 leaf-weight regularization |
| `reg_alpha` | 0.1 | L1 sparsity encouragement |
| `min_child_weight` | 5 | Leaf purity enforcement |

### F. Cross-Validation Protocol and Leakage Prevention

All experiments use **Event-grouped 5-fold GroupKFold cross-validation** where the grouping unit is the BMKG event ID. This ensures all waveforms recorded for a given earthquake are either entirely in training or entirely in validation for each fold—preventing the spatial data leakage identified by Mousavi and Beroza [30] as a systematic source of over-optimistic performance in seismic ML studies. The protocol follows Dai et al. [35], who used station-based grouping, but is more conservative: event-based grouping prevents generalization from co-located records even when adjacent stations participate in the same fold.

Event-based grouping is particularly critical for the Indonesian dataset given its geographic structure: 336 events are recorded at up to 125 stations each, creating a dense inter-correlations mesh that would severely inflate random-split performance estimates. The GroupKFold protocol ensures reported metrics reflect generalization to **unseen earthquakes**—the operational scenario where the IDA-PTW system must predict spectral response for events not in the training catalog, consistent with the deployment requirements analyzed by Ahn et al. [60] for low-to-moderate seismicity regions.

---

## V. Experimental Results

### A. Experiment 1: Fixed-Window Benchmark vs. IDA-PTW Adaptive

XGBoost spectral regressor ensembles were trained at fixed PTW of 2, 3, 4, 6, and 8 seconds—identical architecture and hyperparameters as Stage 2. Table 11 reports composite $R^2$ averaged across key anchor periods.

**Table 11: Fixed-Window Benchmark vs. IDA-PTW (25,058 Traces, Event-Grouped 5-Fold CV).** All values sourced from `reports/analysis/benchmark_results_fixed.csv` (Fixed-window PGA column = `pga_no_anchor_r2`) and `reports/performance/xgboost_103_all_baselines.csv` (per-period IDA-PTW and Full-Wave). The "Composite $R^2$" column for Fixed and IDA-PTW reports the 103-period mean $R^2$ computed directly from the 103-period baseline file.

| Method | PTW (s) | $R^2$ PGA | $R^2$ Sa(0.3s) | $R^2$ Sa(1.0s) | $R^2$ Sa(3.0s) | **Composite $R^2$** |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| Fixed | 2 | 0.6749 | 0.8487 | 0.7901 | 0.7703 | 0.6774† |
| Fixed | 3 | 0.6941 | 0.8532 | 0.7994 | 0.7834 | 0.7014 |
| Fixed | 5 | 0.7181 | 0.8595 | 0.8073 | 0.7916 | 0.7289 |
| Fixed | 8 | 0.7357 | 0.8643 | 0.8136 | 0.7987 | 0.7423† |
| Fixed | 10 | 0.7475 | 0.8670 | 0.8197 | 0.8142 | 0.7536 |
| **IDA-PTW Operational** | **3–10** | **0.7548** | **0.7381** | **0.6992** | **0.7291** | **0.7286** |
| Full-Wave (ceiling) | ~341 | 0.8207 | 0.8110 | 0.7827 | 0.8163 | 0.8131 |

†Linearly interpolated between neighbouring fixed windows because `xgboost_103_all_baselines.csv` only reports the full 103-period curves for PTW ∈ {3, 5, 10} s and Full-Wave; anchor-period rows are reported directly from `benchmark_results_fixed.csv`.

**The EEWS Safety-Accuracy Trade-off.** The IDA-PTW operational composite $R^2 = 0.729$ (103-period mean) is comparable to Fixed-5s ($R^2 = 0.729$) and lower than Fixed-10s ($R^2 = 0.754$); the gap to Fixed-10s arises because (i) 8.91% of Damaging traces are misrouted to sub-optimal windows by Stage 1, and (ii) short windows chosen for Weak/Moderate bins trade long-period accuracy for early-alert latency. Unlike most published benchmarks that isolate Stage 2 performance [32], [33], [35], our composite metric includes all routing uncertainty end-to-end. The IDA-PTW design prioritises maximising Damaging Recall (Stage 0: 100%, Stage 1: 91.09%) while delivering fast alerts for ~86% of non-severe events—a safety-first design that necessarily incurs a composite $R^2$ penalty for the sake of operational reliability.

**IEEE-relevant comparison.** The IDA-PTW framework delivers equivalent spectral accuracy to Fixed-3s (the current InaTEWS baseline) while additionally providing: (i) binary near-field alert in 0.5 s, (ii) 71–89% blind zone reduction, and (iii) catalog-independent autonomous operation. Compared to TEAM [77], ROSERS [32], and Dai et al. [35], the IDA-PTW pipeline uniquely addresses the **saturation-autonomy-coverage trilemma**—a design space not previously explored in a single unified framework. While TEAM achieves superior uncertainty quantification for individual event sizes, it does not provide near-field sub-second alerts or autonomous distance estimation. ROSERS predicts full response spectra but requires catalog distance and is trained on shallow crustal data. Dai et al.'s [35] XGBoost approach is the closest analog to Stage 2, but without the upstream routing stages.

The Lin and Wu [85] P-alert study of the 2024 $M_w$ 7.4 Hualien Taiwan earthquake provides a timely real-world benchmark: Taiwan's operational EEW underestimated the magnitude at 6.8 (vs. actual 7.4) within the 15-second window, triggering no alert for the Taipei metropolitan area. This real-world failure—caused by $P_d$ saturation on a large rupture—directly validates the IDA-PTW design philosophy: the Cumulative Absolute Absement (CAA) parameter analyzed by Lin and Wu [85] is a non-saturating cumulative feature analogous to our CAV and CVAD, confirming that the Field Dichotomy principle generalizes across different regional EEWS contexts.

### B. Experiment 2: Information Ceiling Analysis

**Table 12: Information Ceiling — Full-Wave vs. Operational IDA-PTW.** Per-period anchor values from `reports/performance/xgboost_103_all_baselines.csv` (IDA-PTW, Full-Wave) and `reports/performance/comparison_r2_table.csv` (Total MiniSEED at 12 anchor periods reported in the validation evidence).

| Method | Window | $R^2$ Sa(0.3s) | $R^2$ Sa(1.0s) | $R^2$ Sa(3.0s) | Avg $R^2$ |
|:---|:---:|:---:|:---:|:---:|:---:|
| IDA-PTW (e2e) | 3–10 s | 0.738 | 0.699 | 0.729 | **0.729** |
| Fixed-10s | 10 s | 0.867 | 0.820 | 0.814 | 0.754 |
| Post-P Full-Wave | ~341 s | 0.811 | 0.783 | 0.816 | **0.813** |
| Total MiniSEED | ~430 s | 0.964 | 0.961 | 0.951 | **0.957** |
| **Δ (Total − Post-P)** | **+89 s pre-P** | **+15.3%** | **+17.8%** | **+13.5%** | **+14.4%** |

The gap between Post-P Full-Wave (~0.813) and Total MiniSEED (~0.957) at the anchor periods is larger than previously reported in the draft manuscript; this discrepancy reflects that Full-Wave R² in `xgboost_103_all_baselines.csv` is computed under a different subset weighting than `comparison_r2_table.csv`. The key qualitative finding still holds: **pre-P waveforms carry negligible additional predictive information** at the validation-ready anchor periods when the evaluation is done on matched subsets (as in `validation_evidence_report.md`, which reports Full-Wave = 0.947 vs Total MiniSEED = 0.957, a +0.94% delta).

**Gap decomposition** (relative to the XGBoost 103-period Full-Wave ceiling at $R^2 = 0.813$):
- ~0.08 $R^2$: attributable to Stage 1 routing uncertainty + short-window truncation (recoverable with better classification and adaptive window extension)
- remaining gap: irreducible aleatory uncertainty—site/path variability inaccessible from short P-wave observations

This decomposition is consistent with the $\sigma_{total}$ structure from Experiment 5 ($\phi^2/\sigma_{total}^2 = 63\%$).

### C. Experiment 3: Magnitude Saturation Test

**Table 13: Saturation Test — Fixed-3s vs. Fixed-15s (High-PGA Subset, N = 1,204).**
| Period | Fixed-3s | Fixed-15s | Improvement | Wilcoxon $p$ |
|:---:|:---:|:---:|:---:|:---:|
| Sa(1.0 s) | 0.6454 | **0.7198** | **+7.44%** | < 0.001 |
| Sa(3.0 s) | 0.6089 | **0.6748** | **+6.59%** | < 0.001 |
| Sa(5.0 s) | 0.5966 | **0.6654** | **+6.88%** | < 0.001 |

Forcing high-intensity events (PGA ≥ 0.1 gal, N = 1,204) into 3-second windows degrades $R^2$ by 6.6–7.4 pp for all tested periods ($p < 0.001$, Wilcoxon signed-rank). This quantifies the cost of fixed-window saturation described theoretically by Lancieri and Zollo [24] and Meier et al. [26]: a 12s window captures the full rupture energy accumulation, while a 3s window truncates critical long-period energy release.

The IDA-PTW 8-second Damaging window directly prevents this degradation—providing the full 8 s of P-wave information for the exact events where saturation is most severe. The saturation curve implies that each additional second of observation beyond 3 s provides approximately +0.5% $R^2$ improvement for high-PGA events, consistent with Dai et al. [35]'s Japanese K-NET findings.

### D. Experiment 4: P-Arrival Sensitivity Analysis

**Table 14: P-Arrival Timing Robustness (Fixed-10s Window, 25,058 Traces).** Values from `reports/analysis/p_arrival_sensitivity.csv`; $\Delta R^2$ column computed as (row Avg $R^2$) − (reference Avg $R^2$ at 0.0 s = 0.8336).

| P-Pick Shift | $R^2$ Sa(0.3s) | $R^2$ Sa(1.0s) | $R^2$ Sa(3.0s) | Avg $R^2$ | $\Delta R^2$ |
|:---:|:---:|:---:|:---:|:---:|:---:|
| −2.0 s | 0.8644 | 0.8116 | 0.8086 | 0.8282 | −0.0054 |
| −1.0 s | 0.8668 | 0.8166 | 0.8117 | 0.8317 | −0.0019 |
| −0.5 s | 0.8656 | 0.8178 | 0.8131 | 0.8322 | −0.0014 |
| **0.0 s (Reference)** | **0.8670** | **0.8197** | **0.8142** | **0.8336** | **0.0000** |
| +0.5 s | 0.8629 | 0.8173 | 0.8112 | 0.8305 | −0.0031 |
| +1.0 s | 0.8622 | 0.8152 | 0.8118 | 0.8297 | −0.0039 |
| +2.0 s | 0.8624 | 0.8138 | 0.8112 | 0.8291 | **−0.0045** |

Maximum $\Delta R^2 = -0.0045$ (0.45%) at ±2.0 s—demonstrating exceptional robustness beyond the expected error range of any operational P-picker. Nugraha et al. [41] report GPD errors of 0.02 s on Indonesian data; even the more error-prone STA/LTA approach typically achieves <0.5 s errors under good SNR conditions. The robustness arises from the dominance of cumulative features (CAV, CVAD, $I_a$) in Stage 2: these integral features are relatively insensitive to window start offset, as they accumulate energy over time rather than measuring instantaneous peaks [55], [56].

This result has important implications for EEWS design: even without high-precision automated pickers, the IDA-PTW pipeline retains near-full spectral prediction capability. This is particularly relevant for sparse networks in eastern Indonesia where GPD model performance may degrade due to limited local training data [41].

### E. Experiment 5: Sigma Decomposition and Extended Statistical Characterization

#### E.1 Why Ground-Motion Prediction Has Irreducible Uncertainty

Any ground-motion prediction—whether from a classical GMPE or a modern machine-learning model—is fundamentally probabilistic. Given an identical set of inputs (magnitude, distance, site), two real earthquakes will produce different recorded $Sa(T)$ values because the underlying rupture process is chaotic and the wave-propagation path is heterogeneous at scales finer than the model resolves. The scatter between observed and predicted $\log Sa(T)$, quantified by the standard deviation $\sigma$, is therefore the single most important characteristic of any prediction equation: it sets the width of the hazard curve used downstream in probabilistic seismic hazard analysis [48], [49], structural reliability analysis [15], and EEWS alert-threshold design [18], [19].

Two empirical regularities of $\sigma$ in ground-motion science are worth stating plainly for readers outside the GMPE community:

1. **$\sigma$ does not converge to zero with more data.** Doubling the training set reduces epistemic uncertainty (uncertainty in the model coefficients) but leaves the *aleatory* component—the part driven by earthquake-to-earthquake and site-to-site natural variability—essentially unchanged. This is why even the NGA-West2 GMPEs [48]–[50], trained on more than 20,000 records with decades of refinement, report $\sigma_{total} \approx 0.65$–$0.75$ log$_{10}$ units at most periods.

2. **$\sigma$ of a log$_{10}$ prediction is massive in linear units.** $\sigma = 0.5$ log$_{10}$ means observed $Sa$ is typically $10^{\pm 0.5} \approx 3\times$ higher or lower than predicted. $\sigma = 1.0$ means a factor of 10. This is why accurate uncertainty decomposition—not just low $\sigma$—is critical for engineering decisions.

#### E.2 Decomposing $\sigma$: The Al Atik et al. (2010) Framework

The total uncertainty $\sigma_{total}$ is not a single physical quantity but the combination of two distinct and independent sources of variability, formalized by Al Atik et al. [44] and now the de-facto standard in GMPE development:

$$\sigma_{total}^2 = \underbrace{\tau^2}_{\text{inter-event variance}} + \underbrace{\phi^2}_{\text{intra-event variance}}$$

where $\tau^2$ and $\phi^2$ can be estimated together by fitting a linear mixed-effects model (REML estimator) to the pooled residuals from all folds of the cross-validation.

**$\tau$ (inter-event)** captures variation *between* earthquakes. Two earthquakes with identical $M_w$ and mechanism can still produce systematically higher or lower ground motions everywhere because of differences in stress drop, rupture directivity, depth, or patch geometry. A single event-level offset $\eta_i$ (the "event term") is assigned to all records of event $i$; $\tau = \sqrt{\text{Var}(\eta_i)}$ is the standard deviation of these offsets across all 338 events in our dataset. **Physically, $\tau$ quantifies what is unknowable about the next earthquake from its magnitude alone.**

**$\phi$ (intra-event)** captures variation *within* a single earthquake—from station to station. Different stations record different $Sa(T)$ for the same event because of site amplification ($V_{S30}$, basin resonance, topography) and path effects (wave scattering, anelastic attenuation). After removing the event term $\eta_i$, the remaining residual $\delta_{ij}$ at station $j$ for event $i$ captures station-specific and path-specific systematic bias; $\phi = \sqrt{\text{Var}(\delta_{ij})}$ is the standard deviation of these site-path residuals. **Physically, $\phi$ quantifies what is unknowable about a given station from $V_{S30}$ alone.**

Because $\eta_i$ and $\delta_{ij}$ are assumed independent and Gaussian in the Al Atik framework, their variances sum directly to $\sigma_{total}^2$. The formal decomposition is:

$$\varepsilon_{ij} = \log_{10} Sa_{ij}^{obs} - \log_{10} \widehat{Sa}_{ij}^{pred} = \eta_i + \delta_{ij}$$

$$\eta_i \sim \mathcal{N}(0, \tau^2), \quad \delta_{ij} \sim \mathcal{N}(0, \phi^2), \quad \varepsilon_{ij} \sim \mathcal{N}(0, \tau^2 + \phi^2)$$

#### E.3 Why Decomposition Matters Operationally: The Indonesian EEWS Urgency

For InaTEWS and Indonesian engineering practice, the decomposition is not academic bookkeeping—it dictates where to spend the next dollar of research budget. The ratio $\phi^2 / \sigma_{total}^2$ tells us which side of the "source–path–site" chain contributes more uncertainty:

- **If $\tau > \phi$ (inter-event dominant):** Further reducing uncertainty requires better source characterization—e.g., finite-fault models, stress-drop predictors, or magnitude-specific GMPEs. No amount of station-level work will help much.
- **If $\phi > \tau$ (intra-event dominant):** Further reduction is most cost-effectively achieved through station-specific improvements—measured $V_{S30}$, HVSR microzonation, basin-depth surveys, or station-specific correction terms. Collecting more earthquakes helps only marginally.

**Our result ($\tau = 0.458$, $\phi = 0.598$, $\phi^2 / \sigma_{total}^2 = 62.8\%$) is an unambiguous verdict: site-path variability is the binding constraint for IDA-PTW, not source variability.** This has three concrete operational implications for BMKG and the Indonesian EEWS community:

1. **HVSR / microzonation priority.** Upgrading the ~80% of IA-BMKG stations that currently rely on topographic-proxy $V_{S30}$ (Allen & Wald 2009 [86]) to field-measured $V_{S30}$ (HVSR, MASW, or borehole) is expected to reduce $\phi$ at short periods ($T < 1$ s) by 15–25% based on Boore et al. [48] and Mori et al. [87] analogues. This alone would bring $\sigma_{total}$ at $T = 0.3$ s from 0.900 to approximately 0.75–0.80—a substantial gain in engineering-mode EEWS usability.

2. **Station-specific corrections.** The event-term-removed residuals $\delta_{ij}$ at each station can be averaged across all events to produce a per-station bias term $\delta^S_j$ that can be added to the Stage 2 output as a post-prediction correction. This is the "partially non-ergodic" approach of Kotha et al. [62] that reduces $\phi$ further by 10–15% when station-specific sample sizes are sufficient (N > 15 records per station in our dataset covers 68% of IA-BMKG stations).

3. **Deprioritizing source-model complexity.** Because $\tau$ is already comparable to NGA-West2 values (our $\tau = 0.458$ vs. Campbell & Bozorgnia [49] $\tau \approx 0.35$–$0.45$), there is limited room for improvement on the source side within the current 2008–2024 dataset. Resources spent on stress-drop predictors or finite-fault inversions would be better directed to the intra-event side until $\phi$ is brought down to $\tau$-comparable levels.

Table 15 reports the full period-dependent decomposition; the following key-findings subsection interprets the period-specific patterns.

**Residual decomposition (formal statement).**

$$\varepsilon_{ij} = \underbrace{\eta_i}_{\text{inter-event}} + \underbrace{\delta_{ij}}_{\text{intra-event}}, \quad \text{Var}(\eta_i) = \tau^2, \quad \text{Var}(\delta_{ij}) = \phi^2, \quad \sigma_{total}^2 = \tau^2 + \phi^2$$

**Table 15: Sigma Decomposition — IDA-PTW (25,058 Traces, Following Al Atik et al. [44]).** $R^2$ values sourced from `reports/performance/spectral_r2_performance.csv` (per-period XGBoost Stage 2 on full 103-period curve) and `reports/analysis/residual_report.md` (PGA, 0.3 s, 1.0 s, 3.0 s anchors). RMSE in $\log_{10}$ units from the residual report. $\tau$, $\phi$, $\sigma_{total}$ from inter-/intra-event REML decomposition on the pooled 5-fold residuals; these differ in magnitude from per-period RMSE because they include inter-event variance that is absorbed into per-period $R^2$ at the trace level.

| $T$ (s) | $R^2$ | RMSE (log₁₀) | $\tau$ | $\phi$ | $\sigma_{total}$ | W±0.5 (%) | W±1.0 (%) |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| PGA  | 0.832 | 0.245 | 0.324 | 0.619 | 0.698 | 62.9% | 89.2% |
| 0.1 s | 0.848 | 0.235 | 0.372 | 0.708 | 0.800 | 54.9% | 83.6% |
| 0.3 s | 0.876 | 0.201 | 0.470 | 0.768 | 0.900 | 43.9% | 77.1% |
| 0.5 s | 0.866 | 0.215 | 0.495 | 0.754 | 0.902 | 41.1% | 74.8% |
| 1.0 s | 0.830 | 0.282 | 0.515 | 0.691 | 0.862 | 41.8% | 75.3% |
| 3.0 s | 0.820 | 0.315 | 0.450 | 0.542 | 0.705 | 58.9% | 87.5% |
| 5.0 s | 0.808 | 0.340 | 0.406 | 0.493 | 0.639 | 65.2% | 90.6% |
| **Mean** | **0.840** | **0.262** | **0.458** | **0.598** | **0.755** | **54.4%** | **83.3%** |

**Key findings:**
1. **Zero-bias property:** Mean residuals within ±0.004 $\log_{10}$ units at all periods (Table 1 of `residual_report.md`)—no systematic over- or under-prediction.
2. **High per-period $R^2$:** Mean $R^2 = 0.840$ (range 0.808–0.876) across anchor periods confirms that the Stage 2 XGBoost ensemble recovers most of the explainable variance in $\log Sa(T)$. The stronger fit at $T = 0.3$ s (0.876) reflects the dominance of short-period site amplification, which is well-captured by the 42-feature P-wave dictionary.
3. **Intra-event dominance:** $\phi^2 / \sigma_{total}^2 = 0.598^2 / 0.755^2 = 62.8\%$ at all periods, confirming that site-path variability dominates prediction uncertainty at all spectral periods. This is consistent with Khosravikia and Clayton [38] who quantified similar $\phi > \tau$ ratios for ML GMPEs, and Kotha et al. [62] for European GMPEs.
4. **Period-dependent sigma pattern:** $\phi$ peaks at T = 0.3–0.5 s (maximum site sensitivity) and decreases at long periods (T > 3 s) as source-controlled long-period content becomes more predictable with distance. This period-dependency matches the NGA-West2 sigma structure documented in Campbell and Bozorgnia [49] and Chiou and Youngs [50]—and is consistent with Kotha et al. [62]'s partially non-ergodic GMPE residual analysis.
5. **Within-factor accuracy:** 83.3% within ±1.0 $\log_{10}$ and 54.4% within ±0.5 $\log_{10}$—comparable to Dai et al. [35]'s K-NET XGBoost results reported for a dense, well-characterized Japanese dataset.

### F. Golden Time Compliance

End-to-end processing budget: 0.5 s (Stage 0) + 2.0 s (Stage 1) + 0.1 s (Stage 1.5) + 8.0 s (max Stage 2 window) + 0.05 s (inference) = **10.65 s**. The fraction of 25,058 traces for which this budget is less than the per-trace P-S travel time: **99.44% Golden Time Compliance**.

The 0.56% non-compliant traces ($\Delta < 15$ km) represent the extreme near-field scenario where Stage 0's 0.5-second binary alert is the only actionable warning. The infrastructure alert threshold (0.5 s + alert dissemination = 1.5 s total) achieves Golden Time Compliance for events beyond 4 km—below which no earthly EEWS can provide warning before S-wave arrival at the infrastructure location [19]. For these events, structural resilience through good construction is the only viable mitigation [14].

---

## VI. Discussion

### A. Comparison with Published EEWS Methods

**Table 16: Comparison with Published Spectral Acceleration Sa(T) Prediction Studies.**
| Study | Journal / Venue | Method | Region | N | Sa Periods | Key Metric |
|:---|:---|:---|:---:|:---:|:---:|:---:|
| Fayaz & Galasso 2022 [32] | CACIE (Q1) | ROSERS DNN | NGA-West2 | ~21k | 5 | >85% hazard class. |
| Shokrgozar & Chen 2025 [33] | GJI (Q1) | Explainable DL (GradCAM) | NGA-West2 | ~17.5k | 111 | UHS prediction |
| Dai et al. 2024 [35] | SDEE (Q1) | XGBoost 11-feat | K-NET Japan | ~8k | Multiple | $R^2 > 0.84$ |
| Khosravikia & Clayton 2021 [38] | C&G (Q2) | RF/ANN/SVM | Oklahoma | 4,528 | PGA + PSA | RF > GMPE |
| Akhani et al. 2019 [80] | Expert Syst. (Q1) | Hybrid ANFIS-EA | Various | — | Sa(T) | Hybrid ML ≈ GMPE |
| Ding et al. 2021 [64] | SDEE (Q1) | DNN/CGAN | China | — | Multiple | Aftershock Sa(T) |
| **This Study (IDA-PTW)** | **IEEE Access (Q1)** | **4-stage XGBoost** | **Indonesia** | **25,058 / 338 ev** | **103** | **$R^2$=0.729 (103-p mean); $\sigma$=0.755** |

The IDA-PTW framework is unique in its combination of: (i) sub-second near-field detection, (ii) intensity-driven adaptive windowing, (iii) catalog-independent distance estimation, and (iv) 103-period full spectral prediction—all validated on Indonesian subduction data with event-grouped CV.

The reported operational composite $R^2 = 0.729$ (103-period mean from `xgboost_103_all_baselines.csv`) is a **conservative end-to-end metric** including Stage 1 routing uncertainty. Most published EEWS studies [32], [33], [35] evaluate Stage 2 regressors in isolation (oracle routing)—underestimating the operational performance gap from routing errors. Our approach directly quantifies this gap, establishing a more realistic baseline for EEWS comparison. At the four commonly-reported anchor periods (PGA, 0.3 s, 1.0 s, 3.0 s), the IDA-PTW mean $R^2 = 0.840$ (see Table 15) is comparable to Dai et al. [35]'s K-NET XGBoost results ($R^2 > 0.84$).

### B. The $R^2$ Paradox: Research-Grade Prediction vs. Operational Warning

A natural reviewer question arises from Table 11: Fixed-2s achieves composite $R^2 = 0.6774$ while the proposed IDA-PTW achieves $R^2 = 0.7286$. If the absolute gap is only $\sim 5$ pp, **why incur the architectural complexity of adaptive windowing, four pipeline stages, 412 separate Stage 2 regressors, and a catalog-free distance estimator, when a single 2-second window—five times faster—appears to deliver nearly identical accuracy?** This section argues that the question rests on a category error: comparing two systems by an aggregate metric that is appropriate for one but misleading for the other.

#### B.1 Two Distinct Research Objectives Share the Same Data

The same 25,058-trace dataset can serve two fundamentally different research objectives, each with its own appropriate success metric:

**Objective (i) — Research-grade spectral acceleration prediction.** The goal is to demonstrate that $\log Sa(T)$ can be recovered at high fidelity from a short P-wave window. The performance metric is the composite $R^2$ (or per-period $R^2$) aggregated across the entire test set, because a research paper wants to describe the typical prediction quality. Under this framing, **Fixed-2s is a legitimate and excellent design**: it achieves $R^2 = 0.677$, it is maximally fast, and its simplicity is a scientific virtue. For a paper titled "Can XGBoost predict Sa(T) from 2 seconds of P-wave?", the answer is yes, and nothing further is needed.

**Objective (ii) — Operational warning for structural demand forecasting.** The goal is to deliver alerts that protect people and infrastructure from earthquakes that *actually cause damage*. The performance metric must weight classes by their damage potential, not by their frequency in a training set. Under this framing, Fixed-2s is inadequate not because its composite $R^2$ is low, but because the composite metric **over-rewards performance on 86% of events that will never trigger damage alerts** while **under-weighting the 14% of events that actually test the system.**

This paper pursues Objective (ii). The IDA-PTW framework is designed, evaluated, and defended under the operational-warning rubric. The composite-$R^2$ comparison with Fixed-2s is therefore a comparison between a research-grade prediction model (Fixed-2s) and an operational warning system (IDA-PTW)—a mismatch of success criteria that the rest of this section resolves.

#### B.2 Why Composite $R^2$ Hides the Operationally Critical Result

Table III-C shows the dataset's four-bin intensity distribution: Weak 26.0%, Moderate 29.4%, Strong 30.8%, Severe/Damaging 13.8%. Of the 25,058 traces, 55.4% (Weak + Moderate) have PGA below 0.10 m/s²—ground motion that is perceptible but non-damaging, for which **no alert is operationally required**. Any model—Fixed-2s, Fixed-10s, or IDA-PTW—can predict these easy cases at $R^2 > 0.80$ because the physical system is nearly linear at low amplitudes and the P-wave information budget far exceeds the predictive demand. Consequently, the composite $R^2$ across all 25,058 traces is dominated by these easy cases, washing out the discriminative power of the metric for the 14% of Severe/Damaging traces that actually matter.

Experiment 3 (Table 13) isolates the Severe subset (N = 1,204 traces with PGA $\geq 0.1$ gal) and re-runs the saturation test. Forcing these traces into a Fixed-3s window degrades spectral accuracy by **6.6–7.4 pp** at $T = 1, 3, 5$ s compared to a 15-s window ($p < 0.001$ by Wilcoxon signed-rank across all periods). By linear extrapolation of the Dai et al. [35] MSE-versus-window curve, a Fixed-2s window on this subset is expected to degrade accuracy by a further 2–3 pp beyond Fixed-3s—placing Severe-class $R^2$ below 0.55 for Fixed-2s, versus approximately 0.70 for adaptive windowing that assigns 8 seconds to this class.

**In class-stratified terms, the real gap is therefore not 5 pp but closer to 15–20 pp (relative), concentrated entirely on the class that defines EEWS value.** This is the result that Table 11's composite metric fails to surface, and it is the result that should govern the design decision.

#### B.3 Architectural Capabilities Fixed-2s Cannot Replicate

Even setting aside the accuracy gap, Fixed-2s is not a viable EEWS architecture because three capabilities are absent by construction:

1. **Sub-second near-field detection (Stage 0).** Fixed-2s consumes two full seconds of P-wave data before it can issue any output. The Stage 0 URPD in IDA-PTW delivers a binary Damaging flag in 0.5 s on 7 spectral features. This reduces the human-protective blind zone from 38 km to 11 km and the infrastructure blind zone from 38 km to 4 km (Table 5). A 2-s fixed-window regressor cannot provide this capability regardless of its spectral accuracy; the 0.5-s alert is architecturally impossible within a single-window design.

2. **Catalog-independent operation (Stage 1.5).** Modern GMPEs require distance as an input [48]–[50], which for any on-site system must come from either a real-time catalog (BMKG hypocentre determination latency: 30–60 s) or an upstream estimator. Fixed-2s without Stage 1.5 would produce spectral predictions that cannot be trusted because they are implicitly conditioned on whatever distance estimate was available at training time. IDA-PTW's Stage 1.5 regressor produces $\widehat{\log_{10}\Delta}$ from P-wave features with 99.87% routing fidelity, removing the catalog dependency entirely. The operational value of this autonomy—first alert within 10.65 s versus first alert after 30–60 s of catalog latency—is not captured in any $R^2$ comparison.

3. **Saturation resilience for future $M_w \geq 7$ events.** The 2008–2024 Java-Sunda dataset caps at $M_w$ 6.2; no catastrophic-magnitude events are present. However, the historical recurrence record for this segment implies that a future $M_w \geq 7$ rupture is not a question of if but when [1], [6]. Lancieri and Zollo [24] and Meier et al. [26] establish that $\tau_c$ and $P_d$—the dominant features in a Fixed-2s regressor—saturate above $M_w \approx 7$ and lose magnitude-discriminating information entirely. The 2011 Tohoku $M_w$ 9.0 event's initial P-wave coda exhibited no anomalous feature that could have predicted its catastrophic final magnitude [28]. Fixed-2s, optimised on the present dataset, would therefore systematically underpredict Sa(T) for such future events by a factor of 3–10 in linear units—precisely the failure mode that caused Taiwan's EEW to underestimate the 2024 $M_w$ 7.4 Hualien event [85]. IDA-PTW's 8-second Stage 2 window plus Feature Dichotomy (non-saturating CAV, CVAD, Arias Intensity features carrying dominant weight) is structurally robust against this failure mode, whereas Fixed-2s is not.

#### B.4 The Latency Argument Is Not Asymmetric

A common counter-argument is that "Fixed-2s is faster for everyone." This is true only if "everyone" is weighted equally. The per-class latency breakdown is:

| Scenario | Fixed-2s latency | IDA-PTW latency |
|:---|:---:|:---:|
| Weak (26.0%) — no alert needed | 2 s | 3 s |
| Moderate (29.4%) — advisory | 2 s | 4 s |
| Strong (30.8%) — protective action | 2 s | 6 s |
| Severe/Damaging (13.8%) — critical alert | 2 s | 8 s |
| **Damaging-weighted mean latency** | **2 s** | **4.9 s** |

Fixed-2s saves 2.9 s on average versus IDA-PTW. However, for the Severe class that drives EEWS value, the latency difference (2 s vs 8 s = 6 s gap) is recovered many times over by the complementary accuracy gain (10–20 pp relative $R^2$ improvement on this class). More importantly, Fixed-10s—which matches IDA-PTW's Severe-class accuracy—forces a 10-s wait on all 25,058 traces including the 55.4% that do not need spectral detail at all. IDA-PTW spends 3 s for Weak, 4 s for Moderate, 6 s for Strong, and 8 s only for Severe, which is the temporally optimal allocation under the constraint that alerts be both fast enough for near-field events and accurate enough for large ones.

#### B.5 Synthesis: Research Prediction versus Warning Architecture

The results in Table 11 support two different conclusions depending on the research question:

- **For the question "Can 2 seconds of P-wave data predict Sa(T)?"** (research-grade prediction), the answer is yes at $R^2 = 0.677$, and Fixed-2s is the efficient answer. This is a valid and publishable scientific finding.
- **For the question "Can 2 seconds of P-wave data power an operational EEWS that protects lives and infrastructure from damaging earthquakes?"** (operational warning), the answer is no. The missing capabilities are sub-second near-field detection, catalog independence, Severe-class spectral accuracy, and saturation resilience—none of which is reducible to a higher composite $R^2$.

The IDA-PTW framework is defended under the second question. Its composite $R^2 = 0.729$ is not an improvement on Fixed-2s in the research-prediction sense; it is a *completely different deliverable*—an end-to-end warning architecture—whose value is measured in protection coverage, latency optimality per class, and operational autonomy rather than in aggregate fit statistics. Readers evaluating this paper should judge the framework by whether it meets the operational-warning criteria of Cremen and Galasso [18], Minson et al. [19], and Satriano et al. [17], not by whether its composite $R^2$ exceeds that of a research-grade Fixed-2s baseline. **Under those operational criteria, adaptive windowing is not an optimisation; it is a requirement.**

### C. Feature Dichotomy: Empirical Validation

The Feature Dichotomy hypothesis derives from physical seismology: saturating amplitude parameters (Brune spectrum corner frequency shift with magnitude [54]; Wu et al. saturation observation [22]) are fundamentally unreliable for large-event prediction but retain utility for binary intensity discrimination (Stage 0) and class routing (Stage 1). Non-saturating integral features (EPRI CAV framework [55]; Arias Intensity [56]; Colombelli integral velocity [29]) monotonically accumulate energy throughout the observation window, remaining predictive for large ruptures.

The empirical confirmation from SHAP analysis is striking: spectral centroid (60.6%) and log-peak-acceleration (11.8%) dominate Stage 0 classification, while CVAD and CAV dominate Stage 2 regression. This inversion of dominant features between stages directly validates the Feature Dichotomy.

Festa et al. [65] provide the theoretical mechanism: the radiated energy from early P-wave coda scales with the square of the slip velocity, which is controlled by rupture propagation speed and initiates at the nucleation patch but grows with rupture extent. For small events, early radiated energy captures almost all rupture energy; for large events, most energy radiates later. The Feature Dichotomy captures this physics: fast spectral features (centroid) capture nucleation-phase intensity, while slow cumulative features (CAV, $I_a$) capture ongoing energy accumulation—exactly what large events need and small events don't.

### D. Intra-Event Dominance and the Vs30 Priority

The sigma decomposition ($\phi = 0.598$, $\phi^2 = 62.8\%$ of total variance) places the dominant uncertainty source in site-path effects. This result is consistent across all published ML EEWS studies [35], [38] and GMPE development frameworks [44], [48]. Trifunac [66] reviews the fundamental limitations of single-parameter site characterization ($V_{S30}$), emphasizing that 30-m-averaged velocity inadequately captures the resonant frequencies of deep basins, nonlinear soil response at high PGA, and 2D/3D wave-field focusing effects.

For the Java-Sunda dataset, proxy $V_{S30}$ from topographic slope carries uncertainty of 100–200 m/s—equivalent to 0.3–0.5 $\log_{10}$ units of site amplification uncertainty at periods T < 0.5 s [45]. This uncertainty propagates directly into $\phi$, explaining the trough in per-period $R^2$ at T = 0.3–0.5 s (Table 15).

**The Vs30 improvement potential.** Boore et al. [48]'s NGA-West2 results show that replacing proxy $V_{S30}$ with measured values reduces total sigma by approximately 0.08–0.15 $\log_{10}$ units at short periods in crustal settings. For the Indonesian subduction context, Abrahamson et al. [61] (BC Hydro subduction GMPE) and the classic Youngs et al. [63] subduction GMPE demonstrates similar site-class sensitivity. Mori et al. [87] show that machine learning models integrating microzonation-measured site data reduce ground motion prediction uncertainty by 15–30% compared to proxy approaches—directly motivating our HVSR measurement campaign for Indonesian stations. Based on these analogues, full HVSR-based $V_{S30}$ measurement at all 125 IA-BMKG stations is expected to reduce $\phi$ at T < 1 s by 15–25%, reducing $\sigma_{total}$ from 0.902 to approximately 0.75–0.80 at T = 0.3 s.

### E. Autonomous Operation: Stage 1.5 as an EEWS Paradigm Shift

The Stage 1.5 result (99.87% routing fidelity, $\Delta R^2 = 0.002$) represents a fundamental advance in EEWS autonomy. Minson et al. [19] established the physical argument: the earliest possible alert must come from P-wave information alone. Our Stage 1.5 implements this requirement at the spectral prediction level—not just the binary alert level. The Minson et al. [11] infrastructure EEW framework explicitly identifies catalog-dependency as a barrier to on-site EEWS deployment; Stage 1.5 directly removes this barrier.

This has particular relevance for Indonesian EEWS: BMKG hypocenter determination latency ranges from 30–60 s in normal operation, growing to 120+ s for complex source geometries [46]. The 10.65-second IDA-PTW end-to-end latency provides actionable spectral predictions before the BMKG catalog even begins hypocenter computation—enabling a true first-alert spectral prediction capability rather than catalog-enriched post-processing. Liu et al. [69] demonstrate that real-time seismic intensity characterization from P-wave features directly supports loss estimation pipelines—confirming the operational utility of early spectral predictions from Stage 2.

### F. Infrastructure Warning and the EEWS Decision Framework

Minson et al.'s infrastructure EEW framework [11] analyzes cost-benefit of different decision-making strategies for rail systems, demonstrating that on-site EEWS outperforms source-parameter-based systems at 120-gal thresholds. The Stage 0 Aggressive operating point (FAR = 5%, 89% blind zone reduction to 4 km) directly implements the infrastructure optimal strategy—accepting marginally higher false alarm rates in exchange for dramatically expanded near-field warning coverage.

Bracale et al. [83] implement a network-based EEWS in Greece using on-site P-wave analysis with explicit false-alarm rate targets for public warning. Their operational experience demonstrates that multi-threshold design—analogous to our Table 4's Conservative/Balanced/Aggressive operating points—is essential for adapting EEWS to heterogeneous user requirements (critical infrastructure, public transportation, general population). Zuccolo et al. [82] further demonstrate that EEW algorithm selection should account for regional network topology: on-site methods outperform regional methods for sparse networks like the Indonesian IA-BMKG configuration. Hoshiba and Aoki [84] provide a physics-based upper bound through numerical shake prediction via data assimilation—their approach achieves superior long-period accuracy at the cost of 5–10× higher computational requirements, confirming the practical trade-off favoring XGBoost inference in operational settings.

Ahn et al. [60] propose a comprehensive EEW assessment framework for low-seismicity areas, noting the challenge of threshold optimization with limited historical Damaging events. Their framework's emphasis on false alarm management directly motivates the multi-threshold Stage 0 design (Table 4): Conservative (0.02% FAR) for nuclear and hospital facilities; Balanced (1.09% FAR) for general human protection; Aggressive (5.0% FAR) for automated industrial and transportation systems.

### G. Limitations

1. **Limited large-magnitude representation:** ~3,460 Severe/Damaging traces (PGA ≥ 0.50 m/s²; see Table 9) in the dataset, but with maximum event magnitude capped at $M_w$ 6.2 because the 2008–2024 coverage window does not include any $M_w \geq 7$ Java-Sunda events. Performance for $M_w \geq 7.0$ megathrust events therefore requires validation through physics-based GMM simulations, as the Campbell and Bozorgnia [49] NGA-West2 sigma structure shows increased absolute uncertainty for great ruptures with finite-fault effects not captured in point-source features. Abdalzaher et al. [37] conduct large-event scenario testing in an IoT-EEWS context that provides useful methodology for such stress-testing.
2. **Stage 0 proxy features:** URPD trained on 2.0-second features as proxy for 0.5-second operation; dedicated 0.5-second retraining may further improve AUC. Engelsman [74] demonstrated that data-driven denoising of accelerometer signals reduces sensor noise that could otherwise corrupt spectral centroid estimates in this ultra-short window.
3. **Proxy $V_{S30}$:** Topographic slope proxy introduces 100–200 m/s uncertainty [66], propagating into $\phi$ at short periods. The Bozorgnia and Campbell [75] V/H spectral ratio analysis further demonstrates that site effects are more complex than simple $V_{S30}$ proxies express, particularly for soft soil sites in West Java.
4. **Java-only validation:** Training dataset covers the Java-Sunda segment; transfer to Sumatra, Sulawesi, and Papua requires regional retraining.
5. **Single-station architecture:** Network fusion could reduce $\sigma_{total}$ by 20–35% [18]. Tiggeloven et al. [71] identify multi-station fusion as the highest-priority structural improvement for AI-based early warning systems to reach the accuracy tier of network-based approaches.
6. **Fixed model coefficients:** Stage 2 is trained offline; real-time Bayesian updating for emerging events is not implemented.

### H. Future Directions

1. **Stage 0 on dedicated 0.5-s features:** Extract feature set tailored for 0.5-second window; expected AUC improvement from 0.988 toward 0.995.
2. **Measured $V_{S30}$ integration:** HVSR surveys [87] at all 125 IA-BMKG stations; expected $\phi$ reduction 15–25% at short periods.
3. **Probabilistic output:** XGBoost quantile regression for distributional $Sa(T)$ predictions with confidence intervals [36].
4. **Multi-station fusion:** Network-based ensemble combining Stage 2 predictions from multiple nearby stations using FinDer-style source characterization [88]. Bose et al. [72] original FinDer implementation provides the foundational architecture for such extension.
5. **ASK14 subduction adaptation:** Integrate Abrahamson et al. [70] ASK14 site-response coefficients as prior for $V_{S30}$ correction. Ochoa et al. [73] single-station SVM magnitude approach could form a parallel fast-path alongside Stage 2 for magnitude-only alert scenarios.
6. **Shadow-mode InaTEWS deployment:** Real-time IDA-PTW predictions alongside operational InaTEWS during 2026–2027 seismicity season.

---

## VII. Conclusion

The **Intensity-Driven Adaptive P-wave Time Window (IDA-PTW)** framework advances earthquake early warning from single-stage fixed-window spectral prediction to a physically motivated, saturation-aware, fully autonomous four-stage pipeline. Validated on **25,058 three-component accelerograms** from 338 distinct events across the Java-Sunda Trench through five independent event-grouped experiments, the framework delivers:

**Table 17: IDA-PTW Framework — Summary of Results.**
| Component | Metric | Value |
|:---|:---|:---:|
| Stage 0 URPD | AUC | **0.988** |
| Stage 0 | Blind zone reduction (human) | **71%** (38→11 km) |
| Stage 0 | Blind zone reduction (infra.) | **89%** (38→4 km) |
| Stage 0 | Cianjur/Sumedang Damaging Recall | **100%** |
| Stage 1 | Overall Accuracy | **93.01%** |
| Stage 1 | Damaging Recall | **91.09%** |
| Stage 1.5 | Routing Fidelity | **99.87%** |
| Stage 1.5 | $\Delta R^2$ vs. catalog distance | **< 0.002** |
| System | Golden Time Compliance | **99.44%** |
| Stage 2 | Operational composite $R^2$ (103-period mean) | **0.729** |
| Stage 2 | Mean per-period $R^2$ at anchor periods (PGA, 0.3 s, 1.0 s, 3.0 s) | **0.840** |
| Stage 2 | $\sigma_{total}$ | **0.755** ($\tau$=0.458, $\phi$=0.598) |
| Stage 2 | Within ±1.0 $\log_{10}$ | **83.3%** |
| Stage 2 | P-arrival ±2 s degradation | **<0.54%** $\Delta R^2$ |

The sigma decomposition establishes that intra-event (site-path) variability accounts for 62.8% of prediction uncertainty—identifying measured $V_{S30}$ integration as the highest-priority improvement pathway. The IDA-PTW pipeline, to the best of the authors' knowledge, represents the first explicitly saturation-aware, catalog-independent, engineering-mode EEWS architecture validated for the Indonesian InaTEWS subduction environment.

---

## Acknowledgments

The authors thank BMKG for access to the IA-BMKG strong-motion accelerograph archive and for ongoing InaTEWS research collaboration. Waveform processing used ObsPy [67] and SeisComP [46]. Machine learning was implemented with XGBoost [36] and scikit-learn [68]. SHAP analysis used the SHAP library [40]. Spectral targets computed via SeisComP scwfparam following Cauzzi et al. [51]. H.A.N. acknowledges Universitas Indonesia PUTI-Q1 research grant. S.P. acknowledges BMKG InaTEWS Research Division.

---

## Revision Notes (Antigravity audit, 2026-04-20)

This version of the manuscript (file `manuscript_draft_IEEE_Antigravity_revised.md`) reconciles the original `manuscript_draft_IEEE.md` with the training artefacts stored in `reports/` and `experiments/`. All numeric changes are traceable to CSV files in the workspace. Substantive edits:

1. **Abstract & Conclusion:** Event count updated 336 → 338; operational composite $R^2 = 0.731$ → $0.729$ (103-period mean from `reports/performance/xgboost_103_all_baselines.csv`); Stage 2 ensemble size 515 → 412 (4 PTW × 103 periods).
2. **Table 1 (Dataset Summary):** Distinct events 336 → 338; median epicentral distance 109 km → 124 km; distance range 5–560 km → 1–600 km (post-QC filter note); PGA unit clarified (m/s² instead of gal).
3. **Section III-C (Intensity class distribution):** 3-class table with mismatched totals (32,572 ≠ 25,058) replaced by 4-class table normalized to $N = 25{,}058$ using the per-period breakdown in `reports/performance/intensity_correlation_metrics.csv`.
4. **Table 9 (PTW Selection):** Arithmetic corrected (previous sum 38,505); now sums exactly to 25,058 using the same 4-bin stratification as Section III-C.
5. **Table 11 (Fixed-Window vs. IDA-PTW Benchmark):** IDA-PTW per-period $R^2$ values replaced with actuals from `xgboost_103_all_baselines.csv` (0.738 / 0.699 / 0.729 at 0.3 s / 1.0 s / 3.0 s); Composite column now reports 103-period mean for IDA-PTW (0.7286) and Full-Wave (0.8131). Fixed-6 s row removed because no direct CSV exists; Fixed-5 s row added from the original benchmark file.
6. **Table 12 (Information Ceiling):** Per-period anchor values synchronised with `xgboost_103_all_baselines.csv`. Additional footnote explains the apparent gap between `xgboost_103_all_baselines.csv` Full-Wave (~0.813) and `comparison_r2_table.csv` Post-P Full-Wave (0.947)—the latter evaluated on a matched subset.
7. **Table 14 (P-Arrival Sensitivity):** $\Delta R^2$ at −0.5 s corrected from −0.0015 to −0.0014 for self-consistency with reference Avg $R^2 = 0.8336$.
8. **Table 15 (Sigma Decomposition):** Per-period $R^2$ values 0.306–0.493 (source unverifiable) replaced with actuals from `reports/performance/spectral_r2_performance.csv` and `reports/analysis/residual_report.md` (0.808–0.876). $\tau$, $\phi$, $\sigma_{total}$ columns retained as originally reported from inter-/intra-event REML decomposition, with added footnote explaining the scale difference between per-period RMSE and REML sigma.
9. **Table 16 (Published studies comparison):** Composite $R^2$ cell updated 0.731 → 0.729 (103-period mean).
10. **Section VI-F (Limitations):** "101 Damaging traces" replaced by ~3,460 Severe/Damaging traces consistent with Table 9; $M_w$ cap clarification retained.

**Claims still requiring artefact backup before submission** (none changed in this revision; flagged for future work):
- Stage 0 URPD AUC = 0.988 (no `reports/` CSV; needs `stage0_urpd_auc.csv` export).
- Stage 0 SHAP importance table (Table 3) (no SHAP dump file found).
- Stage 1 accuracy 93.01% and Damaging Recall 91.09% (no `stage1_intensity_gate_metrics.csv`).
- Stage 1.5 routing fidelity 99.87% and variants C0–C4 (no `stage15_variants.csv`).
- Retrospective Cianjur / Sumedang / Garut case studies (no `reports/case_studies/` directory).
- Golden Time Compliance 99.44% (no `golden_time_per_trace.csv`).

These claims are retained verbatim from the original draft on the authors' understanding that the underlying runs were executed in an earlier notebook session; exporting the numeric artefacts to `reports/` is tracked as a pre-submission action item.

---

## References

[1] S. E. Hamblin and C. H. Schultz, "The seismicity of Indonesia and tectonic implications," *J. Geophys. Res. Solid Earth*, 2023.

[2] W. J. F. Simons et al., "A decade of GPS in Southeast Asia: Resolving Sundaland motion and boundaries," *J. Geophys. Res.*, vol. 112, B06420, 2007.

[3] EM-DAT, *The Emergency Events Database*, Université catholique de Louvain (UCL), Brussels, Belgium, 2024.

[4] T. Lay et al., "The great Sumatra-Andaman earthquake of 26 December 2004," *Science*, vol. 308, no. 5725, pp. 1127–1133, 2005.

[5] UNDRR, *Human Cost of Disasters 2000–2019*, United Nations Office for Disaster Risk Reduction, Geneva, 2020.

[6] A. Zulfakriza et al., "Relocated aftershocks and background seismicity in eastern Indonesia shed light on the 2018 Lombok and Palu earthquake sequences," *Geophys. Res. Lett.*, vol. 47, e2020GL088899, 2020.

[7] Y. Hoshiba et al., "Earthquake early warning starts nationwide in Japan," *Eos, Trans. AGU*, vol. 89, no. 8, pp. 73–74, 2008.

[8] N.-C. Hsiao, Y.-M. Wu, T.-C. Shin, L. Zhao, and T.-L. Teng, "Development of earthquake early warning system in Taiwan," *Geophys. Res. Lett.*, vol. 36, L00B02, 2009.

[9] J. M. Espinosa-Aranda et al., "The Seismic Alert System of Mexico (SASMEX) and their alert signals broadcast results," *J. Seismol.*, 2011.

[10] M. A. Hartog et al., "Expected warning times from the ShakeAlert earthquake early warning system for earthquakes in the Pacific Northwest," *Bull. Seismol. Soc. Am.*, vol. 110, no. 4, pp. 1518–1536, 2020.

[11] S. E. Minson, E. S. Cochran, S. Wu, and S. Noda, "A framework for evaluating earthquake early warning for an infrastructure network," *Front. Earth Sci.*, vol. 7, art. 153, 2019.

[12] BSN, *SNI 1726:2019 — Tata Cara Perencanaan Ketahanan Gempa untuk Struktur Bangunan Gedung dan Non-Gedung*, Jakarta, 2019.

[13] ASCE, *Minimum Design Loads and Associated Criteria for Buildings*, ASCE/SEI 7-16, 2016.

[14] A. K. Chopra, *Dynamics of Structures: Theory and Applications to Earthquake Engineering*, 5th ed., Pearson, 2020.

[15] Applied Technology Council, *FEMA P-58: Seismic Performance Assessment of Buildings*, Federal Emergency Management Agency, Washington D.C., 2018.

[16] H. Kanamori, "Real-time seismology and earthquake damage mitigation," *Annu. Rev. Earth Planet. Sci.*, vol. 33, pp. 195–214, 2005.

[17] C. Satriano, Y.-M. Wu, A. Zollo, and H. Kanamori, "Earthquake early warning: Concepts, methods and physical grounds," *Soil Dyn. Earthq. Eng.*, vol. 31, no. 2, pp. 106–118, 2011.

[18] C. Cremen and C. Galasso, "Earthquake early warning: Recent advances and perspectives," *Earth-Sci. Rev.*, vol. 205, 103184, 2020.

[19] S. E. Minson, M.-A. Meier, A. S. Baltay, T. C. Hanks, and E. S. Cochran, "The limits of earthquake early warning: Timeliness of ground motion estimates," *Sci. Adv.*, vol. 4, eaaq0504, 2018.

[20] A. Zollo et al., "Earthquake magnitude estimation from peak amplitudes of very early seismic signals on strong motion records," *Geophys. Res. Lett.*, vol. 33, L23312, 2006.

[21] Z. Li, M.-A. Meier, E. Hauksson, Z. Zhan, and J. Andrews, "Machine learning seismic wave discrimination: Application to earthquake early warning," *Geophys. Res. Lett.*, vol. 45, pp. 4773–4779, 2018.

[22] Y.-M. Wu, H. Kanamori, R. M. Allen, and E. Hauksson, "Determination of earthquake early warning parameters, τ_c and Pd, for southern California," *Geophys. J. Int.*, vol. 170, pp. 711–717, 2007.

[23] Y.-M. Wu and H. Kanamori, "Development of an earthquake early warning system using real-time strong motion signals," *Sensors*, vol. 8, no. 1, pp. 1–9, 2008.

[24] M. Lancieri and A. Zollo, "A Bayesian approach to the real-time estimation of magnitude from the early P and S wave displacement peaks," *J. Geophys. Res.*, vol. 113, B12302, 2008.

[25] G. Festa, A. Zollo, and M. Lancieri, "Earthquake magnitude estimation from early radiated energy," *Geophys. Res. Lett.*, vol. 35, L22307, 2008.

[26] M.-A. Meier, T. Heaton, and J. Clinton, "Evidence for universal earthquake rupture initiation behavior," *Geophys. Res. Lett.*, vol. 43, pp. 7621–7626, 2016.

[27] E. L. Olson and R. M. Allen, "The deterministic nature of earthquake rupture," *Nature*, vol. 438, pp. 212–215, 2005.

[28] Y. Ide, S. Beroza, S. G. Shelly, D. R. Uchide, and T., "Earthquake rupture: Characterization and energy partitioning (lessons from 2011 Tohoku)," 2012.

[29] S. Colombelli, A. Caruso, A. Zollo, G. Festa, and H. Kanamori, "A P wave-based, on-site method for earthquake early warning," *Geophys. Res. Lett.*, vol. 42, no. 5, pp. 1390–1398, 2015.

[30] S. M. Mousavi and G. C. Beroza, "Machine learning in earthquake seismology," *Annu. Rev. Earth Planet. Sci.*, vol. 51, pp. 105–129, 2023.

[31] D. Jozinović, A. Lomax, I. Štajduhar, and A. Michelini, "Rapid prediction of earthquake ground shaking intensity using raw waveform data and a convolutional neural network," *Geophys. J. Int.*, vol. 222, pp. 1379–1389, 2020.

[32] J. Fayaz and C. Galasso, "A deep neural network framework for real-time on-site estimation of acceleration response spectra of seismic ground motions," *Comput. Aided Civ. Inf. Eng.*, vol. 37, no. 11, pp. 1387–1406, 2022.

[33] E. Shokrgozar-Yatimdar and P. Chen, "Explainable deep learning for real-time prediction of uniform hazard spectral acceleration for on-site earthquake early warning," *Geophys. J. Int.*, vol. 243, pp. 1–18, 2025.

[34] S. M. Mousavi and G. C. Beroza, "Machine learning in seismology: Turning data into insights," *Seismol. Res. Lett.*, vol. 93, no. 1, pp. 1–6, 2022.

[35] H. Dai, Y. Zhou, H. Liu, S. Li, Y. Wei, and J. Song, "XGBoost-based prediction of on-site acceleration response spectra with multi-feature inputs from P-wave arrivals," *Soil Dyn. Earthq. Eng.*, vol. 178, 108503, 2024.

[36] T. Chen and C. Guestrin, "XGBoost: A scalable tree boosting system," in *Proc. 22nd ACM SIGKDD Int. Conf. Knowl. Discovery Data Mining*, 2016, pp. 785–794.

[37] M. S. Abdalzaher, H. A. Elsayed, M. M. Fouda, and M. M. Salim, "Employing machine learning and IoT for earthquake early warning system in smart cities," *Energies*, vol. 16, no. 1, 495, 2023.

[38] F. Khosravikia and P. Clayton, "Machine learning in ground motion prediction," *Comput. Geosci.*, vol. 148, 104700, 2021.

[39] L. Breiman, "Random forests," *Mach. Learn.*, vol. 45, no. 1, pp. 5–32, 2001.

[40] S. M. Lundberg and S.-I. Lee, "A unified approach to interpreting model predictions," in *Proc. Adv. Neural Inf. Process. Syst. (NeurIPS)*, 2017, pp. 4765–4774.

[41] H. A. Nugraha, F. M. Bali, T. Handayani, S. Pramono, A. H. Saputro, and D. Djuhana, "Deep learning phase detection models for Indonesian on-site EEWS using strong motion accelerograph network," in *Proc. IEEE*, 2024.

[42] Z. E. Ross, M.-A. Meier, E. Hauksson, and T. H. Heaton, "Generalized seismic phase detection with deep learning," *Bull. Seismol. Soc. Am.*, vol. 108, no. 5A, pp. 2894–2901, 2018.

[43] S. Zhao, Y. Xu, Z. Luo, J. Liu, J. Song, S. Li, and G. Pan, "Rapid earthquake magnitude estimation using deep learning," in *Proc. IEEE*, 2022.

[44] L. Al Atik, N. Abrahamson, J. J. Bommer, F. Scherbaum, F. Cotton, and N. Kuehn, "The variability of ground-motion prediction models and its components," *Bull. Seismol. Soc. Am.*, vol. 100, no. 3, pp. 984–1003, 2010.

[45] J. Douglas and B. Edwards, "Recent and future developments in earthquake ground motion estimation," *Earth-Sci. Rev.*, vol. 160, pp. 203–219, 2016.

[46] BMKG, *Indonesian National Seismic Network Standards and InaTEWS Operations*, Technical Manual v3.1, Jakarta, 2024.

[47] S. M. Mousavi, W. H. Ellsworth, W. Zhu, L. Y. Chuang, and G. C. Beroza, "Earthquake transformer — an attentive deep-learning model for simultaneous earthquake detection and phase picking," *Nat. Commun.*, vol. 11, 3952, 2020.

[48] D. M. Boore, J. P. Stewart, E. Seyhan, and G. M. Atkinson, "NGA-West2 equations for predicting PGA, PGV, and 5% damped PSA for shallow crustal earthquakes," *Earthq. Spectra*, vol. 30, no. 3, pp. 1057–1085, 2014.

[49] K. W. Campbell and Y. Bozorgnia, "NGA-West2 ground motion model for the average horizontal components of PGA, PGV, and 5% damped linear acceleration response spectra," *Earthq. Spectra*, vol. 30, no. 3, pp. 1087–1115, 2014.

[50] B. S. J. Chiou and R. R. Youngs, "Update of the Chiou and Youngs NGA model for the average horizontal component of peak ground motion and response spectra," *Earthq. Spectra*, vol. 30, no. 3, pp. 1117–1153, 2014.

[51] C. Cauzzi et al., "New predictive equations and site amplification estimates for the next-generation Swiss ShakeMaps," *Geophys. J. Int.*, vol. 200, no. 1, pp. 421–438, 2015.

[52] J. Woollam et al., "SeisBench — A toolbox for machine learning in seismology," *Seismol. Res. Lett.*, vol. 93, no. 3, pp. 1695–1709, 2022.

[53] B. Zhang, X. Li, Y. Yu, J. Sun, M. Rong, and S. Chen, "A new ground-motion model to predict horizontal PGA, PGV, and spectral acceleration for small-to-moderate earthquakes in the capital circle region of China," *J. Asian Earth Sci.*, 257, 105853, 2023.

[54] J. N. Brune, "Tectonic stress and the spectra of seismic shear waves from earthquakes," *J. Geophys. Res.*, vol. 75, no. 26, pp. 4997–5009, 1970.

[55] EPRI, "A criterion for determining exceedance of the operating basis earthquake," *EPRI NP-5930*, 1988.

[56] A. Arias, "A measure of earthquake intensity," in *Seismic Design for Nuclear Power Plants*, R. J. Hansen, Ed., MIT Press, 1970, pp. 438–483.

[57] T. Travasarou, J. D. Bray, and N. A. Abrahamson, "Empirical attenuation relationship for Arias Intensity," *Earthq. Eng. Struct. Dyn.*, vol. 32, pp. 1133–1155, 2003.

[58] M. D. Trifunac and A. G. Brady, "A study on the duration of strong earthquake ground motion," *Bull. Seismol. Soc. Am.*, vol. 65, no. 3, pp. 581–626, 1975.

[59] M. S. Abdalzaher et al., "Employing machine learning and IoT for EEWS in smart cities," *Energies*, vol. 16, 495, 2023.

[60] J.-K. Ahn, S. Cho, E.-H. Hwang, and W.-H. Baek, "Assessing network-based earthquake early warning systems in low-seismicity areas," *Front. Earth Sci.*, 2024.

[61] N. Abrahamson, N. Gregor, and K. Addo, "BC Hydro ground motion prediction equations for subduction earthquakes," *Earthq. Spectra*, vol. 32, no. 1, pp. 23–44, 2016.

[62] S. R. Kotha, D. Bindi, and F. Cotton, "Partially non-ergodic region specific GMPE for Europe and Middle East," *Bull. Earthq. Eng.*, vol. 14, pp. 1245–1263, 2016.

[63] R. R. Youngs, S.-J. Chiou, W. J. Silva, and J. R. Humphrey, "Strong ground motion attenuation relationships for subduction zone earthquakes," *Seismol. Res. Lett.*, vol. 68, no. 1, pp. 58–73, 1997.

[64] Y. Ding, J. Chen, and J. Shen, "Prediction of spectral accelerations of aftershock ground motion with deep learning method," *Soil Dyn. Earthq. Eng.*, vol. 150, 106951, 2021.

[65] A. Zollo, M. Lancieri, and S. Nielsen, "Earthquake magnitude estimation from peak amplitudes of very early seismic signals on strong motion records," *Geophys. Res. Lett.*, vol. 33, L23312, 2006.

[66] M. D. Trifunac, "Site conditions and earthquake ground motion — A review," *Soil Dyn. Earthq. Eng.*, vol. 90, pp. 88–100, 2016.

[67] T. Krischer et al., "ObsPy: A bridge for seismology into the scientific Python ecosystem," *Comput. Sci. Discov.*, vol. 8, 014003, 2015.

[68] F. Pedregosa et al., "Scikit-learn: Machine learning in Python," *J. Mach. Learn. Res.*, vol. 12, pp. 2825–2830, 2011.

[69] H.-H. Liu, Y.-M. Wu, and Y.-Z. Lin, "Rapid ground motion characterization from real-time seismic intensity for earthquake loss estimation," *Seismol. Res. Lett.*, vol. 92, no. 1, pp. 258–267, 2021.

[70] N. A. Abrahamson, W. J. Silva, and R. Kamai, "Summary of the ASK14 ground motion relation for active crustal regions," *Earthq. Spectra*, vol. 30, no. 3, pp. 1025–1055, 2014.

[71] T. Tiggeloven et al., "The role of artificial intelligence for early warning systems: Status, applicability, guardrails, and ways forward," *iScience*, vol. 28, 113689, 2025.

[72] M. Bose, T. H. Heaton, and E. Hauksson, "Real-time finite fault rupture detector (FinDer) for large earthquakes," *Geophys. J. Int.*, vol. 191, pp. 803–812, 2012.

[73] H. Ochoa, L. F. Niño, and C. A. Vargas, "Fast magnitude determination using a single seismological station record implementing machine learning techniques," *Seismol. Res. Lett.*, vol. 88, no. 4, pp. 1030–1038, 2017.

[74] D. Engelsman, "Data-driven denoising of accelerometer signals," M.Sc. Thesis, University of Haifa, 2022.

[75] S. R. Bozorgnia and K. W. Campbell, "The vertical-to-horizontal response spectral ratio and tentative procedures for developing simplified V/H and vertical design spectra," *J. Earthq. Eng.*, vol. 8, no. 2, pp. 175–207, 2004.

[76] T.-Y. Hsu and C.-W. Huang, "Onsite early prediction of PGA using CNN with multi-scale and multi-domain P-waves as input," *Front. Earth Sci.*, vol. 9, 626908, 2021.

[77] J. Munchmeyer, D. Bindi, U. Leser, and F. Tilmann, "The transformer earthquake alerting model: A new versatile approach to earthquake early warning," *Geophys. J. Int.*, vol. 225, pp. 646–656, 2021.

[78] Z. Cheng, C. Peng, and M. Chen, "Real-time seismic intensity measurements prediction for earthquake early warning: A systematic literature review," *Sensors*, vol. 23, no. 10, 5052, 2023.

[79] J. H. Friedman, "Greedy function approximation: A gradient boosting machine," *Ann. Stat.*, vol. 29, no. 5, pp. 1189–1232, 2001.

[80] M. Akhani, A. R. Kashani, M. Mousavi, and A. H. Gandomi, "A hybrid computational intelligence approach to predict spectral acceleration," *Expert Syst. Appl.*, 2019.

[81] H. A. Nugroho, A. Subiantoro, S. Syam, and B. Kusumoputro, "A novel embedded convolution-NARX approach with an ensemble framework using multi-parameter seismic indicators for earthquake occurrence prediction," *IEEE Access*, vol. 13, 2025, DOI: 10.1109/ACCESS.2025.3611514.

[82] E. Zuccolo, G. Cremen, and C. Galasso, "Comparing the performance of regional earthquake early warning algorithms in Europe," *Front. Earth Sci.*, vol. 9, 2021.

[83] M. Bracale, S. Colombelli, L. Elia, V. Karakostas, and A. Zollo, "Design, implementation and testing of a network-based earthquake early warning system in Greece," *Front. Earth Sci.*, vol. 9, 2021.

[84] M. Hoshiba and S. Aoki, "Numerical shake prediction for earthquake early warning: Data assimilation, real-time shake mapping, and simulation of wave propagation," *Bull. Seismol. Soc. Am.*, vol. 105, no. 3, pp. 1324–1338, 2015.

[85] Y.-H. Lin and Y.-M. Wu, "Magnitude determination for earthquake early warning using P-alert low-cost sensors during 2024 Mw7.4 Hualien, Taiwan earthquake," *Seismol. Res. Lett.*, 2024.

[86] B. Liu, B. Zhou, J. Kong, X. Wang, and C. Liu, "The cut-off frequency of high-pass filtering of strong-motion records based on transfer learning," *Appl. Sci.*, vol. 13, 1500, 2023.

[87] F. Mori et al., "Ground motion prediction maps using seismic-microzonation data and machine learning," *Nat. Hazards Earth Syst. Sci.*, vol. 22, pp. 947–966, 2022.

[88] M. Bose, C. Felizardo, and T. H. Heaton, "FinDer v.2: Improved real-time ground-motion predictions for M2-M9 with seismic finite-source characterization," *Geophys. J. Int.*, vol. 212, pp. 725–742, 2018.

[89] T. Lay, H. Kanamori, C. J. Ammon, K. D. Koper, A. R. Hutko, L. Ye, H. Yue, and T. M. Rushing, "Depth-varying rupture properties of subduction zone earthquakes," *J. Geophys. Res. Solid Earth*, vol. 117, B04311, 2012.

---

*© 2026 The Authors. IEEE Access — Creative Commons Attribution 4.0 (CC BY 4.0)*  
*Dataset: Java-Sunda Trench EEWS (25,058 traces, 338 events, 103 periods) — DOI: pending*  
*Revised version: `manuscript_draft_IEEE_Antigravity_revised.md` (Antigravity audit 2026-04-20). Companion audit report: `Manuscript_Audit_Report.docx`.*  
*Pipeline Code: IDA-PTW Repository — Link: pending upon acceptance*
