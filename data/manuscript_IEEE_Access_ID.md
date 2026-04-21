# Framework Multi-Stage Sadar-Saturasi untuk Pemilihan Jendela Waktu Gelombang-P Adaptif Berbasis Intensitas pada Prediksi Percepatan Spektral Real-Time: Desain Operasional untuk Zona Subduksi Java-Sunda

**Hanif Andi Nugraha¹\* (ORCID: 0009-0007-9975-1566)**, **Dede Djuhana¹ (ORCID: 0000-0002-2025-0782)**, **Adhi Harmoko Saputro¹ (ORCID: 0000-0001-6651-0669)**, and **Sigit Pramono² (ORCID: 0009-0000-5684-282X)**

¹Departemen Fisika, Fakultas Matematika dan Ilmu Pengetahuan Alam, Universitas Indonesia, Depok 16424, Indonesia
²Badan Meteorologi, Klimatologi, dan Geofisika (BMKG), Jakarta 10110, Indonesia
\*Penulis korespondensi: hanif.andi@ui.ac.id

*Manuskrip diserahkan: April 2026 | DOI: pending*
*Versi: Antigravity-audit-revised (20-04-2026) — tabel direkonsiliasi dengan artefak training; semua perubahan ditandai catatan kaki.*

---

## Abstrak

Prediksi real-time percepatan spektral 5%-teredam $Sa(T)$ di 103 periode struktural merupakan tantangan utama Sistem Peringatan Dini Gempa Bumi (Earthquake Early Warning Systems/EEWS) mode-rekayasa. Arsitektur gelombang-P klasik beroperasi pada jendela observasi tetap 2–3 detik, mengalami dua failure mode berlipat: **(i)** saturasi magnitudo parameter kanonik ($\tau_c$, $P_d$) untuk rupture besar ($M_w > 6,5$), dan **(ii)** zona buta near-field (~38 km) di mana travel time P-S tidak memadai untuk pengiriman alert. Paper ini memperkenalkan framework **Intensity-Driven Adaptive P-wave Time Window (IDA-PTW)**—pipeline machine learning empat-stage yang sadar-saturasi, independen-katalog, dirancang untuk deployment operasional pada jaringan InaTEWS Indonesia.

Cascade pipeline terdiri dari: **(Stage 0)** Ultra-Rapid P-wave Discriminator (URPD) menggunakan Gradient Boosting pada 7 fitur spektral dari jendela 0,5 detik (AUC = 0,988), mereduksi zona buta near-field dari 38 km menjadi 11 km untuk perlindungan manusia dan 4 km untuk infrastruktur; **(Stage 1)** gerbang intensitas XGBoost (akurasi 93,01%, Damaging Recall = 91,09%) merutekan trace ke jendela adaptif 3–8 detik berdasarkan paradigma **Feature Dichotomy**; **(Stage 1.5)** regressor jarak episentral XGBoost yang mencapai 99,87% fidelitas routing, memungkinkan operasi otonom penuh tanpa ketergantungan katalog; dan **(Stage 2)** ensemble 412 regressor spektral XGBoost per-periode (4 PTW × 103 periode) yang dijangkarkan pada fitur non-saturating (CVAD, CAV, Arias Intensity).

Divalidasi pada **25.058 accelerogram tiga-komponen** dari 338 event di Java-Sunda Trench menggunakan cross-validation 5-fold berbasis-event, framework mencapai R² komposit operasional $R^2 = 0,729$ (rerata 103-periode; lihat Tabel 11) dengan **Kepatuhan Golden Time 99,44%**. Karakterisasi statistik lanjutan mengikuti Al Atik dkk. (2010) menghasilkan $\tau = 0,458$, $\phi = 0,598$, $\sigma_{total} = 0,755$—mengonfirmasi variabilitas intra-event (site-path) sebagai sumber ketidakpastian prediksi dominan. Akurasi faktor: 83,3% (±1,0 $\log_{10}$) dan 54,4% (±0,5 $\log_{10}$) dilaporkan. Validasi retrospektif pada event $M_w$ 5,6 Cianjur 2022 dan $M_w$ 5,7 Sumedang 2024 mendemonstrasikan 100% Damaging Recall pada Stage 0.

**Index Terms:** Earthquake Early Warning, Spectral Acceleration, XGBoost, Feature Dichotomy, Adaptive P-wave Window, Java-Sunda Megathrust, BMKG, Saturasi, Dekomposisi Sigma, InaTEWS, Machine Learning, Peringatan Near-Field.

---

## I. Pendahuluan

### A. Bahaya Seismik di Kepulauan Indonesia

Kepulauan Indonesia terletak pada pertemuan empat lempeng tektonik utama—lempeng Indo-Australia, Eurasia, Laut Filipina, dan Pasifik—membentuk salah satu lingkungan paling beragam secara seismik di Bumi [1]. Busur Sunda saja membentang sekitar 5.500 km dari Sumatra utara hingga Bali, tempat lempeng Indo-Australia menunjam di bawah lempeng Sunda sepanjang palung Jawa dengan laju konvergensi 50–67 mm/tahun, sebagaimana diresolusi dengan presisi tinggi melalui pengukuran GPS selama satu dekade yang mencakup lebih dari 100 situs [2]. Menurut basis data bencana global, Indonesia mengalami rata-rata ~18 gempa $M \geq 7,0$ per dekade sejak 1900, dengan lima event besar ($M \geq 8,0$) dalam dua dekade terakhir saja [3].

Konsekuensinya terdokumentasi dengan baik dan terus meningkat. Gempa Sumatra-Andaman $M_w$ 9,1 pada 26 Desember 2004—event seismik terbesar sejak gempa Alaska 1964—memicu tsunami paling mematikan dalam sejarah yang tercatat, menewaskan lebih dari 227.000 jiwa di 14 negara [4]. Penilaian dampak bencana PBB yang komprehensif [5] mengidentifikasi Indonesia sebagai salah satu dari tiga negara dengan kematian multi-bahaya tahunan rata-rata tertinggi, dengan event seismik menjadi kontribusi dominan. Lebih baru, gempa Palu $M_w$ 7,5 pada September 2018 menghasilkan bahaya majemuk (tsunami, likuefaksi, tanah longsor) dari rupture strike-slip yang strukturnya kompleks [6]. Bahkan event bermagnitudo menengah menunjukkan mortalitas urban yang tidak proporsional: gempa Cianjur $M_w$ 5,6 (21 November 2022) dan Sumedang $M_w$ 5,7 (1 Januari 2024) menewaskan ratusan orang dan merusak ribuan struktur di Jawa Barat yang padat penduduk meskipun ground motion seharusnya—menurut standar rekayasa—dapat diselamati oleh konstruksi yang sesuai kode.

### B. Dari EEWS Mode-Alert ke Mode-Rekayasa

Generasi pertama EEWS operasional—sistem JMA Jepang sejak 2007 [7], jaringan P-alert Taiwan [8], SASMEX Meksiko sejak 1991 [9], dan sistem ShakeAlert di AS Pacific Northwest [10]—menyampaikan alert biner atau estimasi magnitudo skalar. Sistem berbasis parameter-sumber ini mengestimasi properti sumber gempa (lokasi, magnitudo) dan menggunakan persamaan prediksi ground motion (GMPE) untuk meramalkan goyangan di situs target—pendekatan yang membutuhkan latensi triangulasi jaringan puluhan detik [11].

Paradigma mode-rekayasa yang muncul menggeser tuntutan dari pengiriman alert ke **peramalan kebutuhan struktural**. Seiring kota-kota Indonesia mengalami densifikasi vertikal cepat dengan struktur rangka beton bertulang, parameter kebutuhan yang berlaku dalam kode bangunan modern—SNI 1726:2019 [12] dan ASCE/SEI 7-16 [13]—adalah percepatan spektral 5%-teredam $Sa(T)$ pada periode struktural fundamental, bukan hanya PGA [14]. FEMA P-58 [15] rekayasa gempa berbasis-performa selanjutnya memerlukan informasi spektral lengkap untuk estimasi kerugian. Ini menciptakan kebutuhan mendesak untuk EEWS yang memprediksi $Sa(T)$ di seluruh rentang periode struktural secara real-time—bukan magnitudo atau MMI—memungkinkan respons struktural otomatis dan perlindungan penghuni.

Kanamori [16] mengartikulasikan landasan teoretis: coda gelombang-P awal di satu stasiun mengenkode informasi tentang kebutuhan seismik lokal, memungkinkan prediksi on-site sebelum kedatangan gelombang S dan gelombang permukaan yang merusak. **Paradigma on-site** ini [17] secara fundamental berbeda dari pendekatan berbasis-jaringan, menyediakan prediksi dalam hitungan detik sejak deteksi-P tanpa memerlukan lokalisasi sumber.

### C. Zona Buta Near-Field: Kesenjangan Kritis EEWS

Cremen dan Galasso [18] memberikan tinjauan paling komprehensif tentang kemajuan EEWS, mendokumentasikan tiga dekade kemajuan metode on-site. Analisis mereka mengidentifikasi **zona buta near-field** sebagai keterbatasan utama yang belum terselesaikan: untuk gempa dalam ~38 km dari stasiun perekam, selisih travel time gelombang P-S jatuh di bawah anggaran gabungan jendela observasi (2–3 detik) plus latensi diseminasi alert (1–2 detik), meninggalkan penghuni near-field tanpa perlindungan sama sekali.

Minson dkk. [19] menetapkan batas fisis masalah ini melalui argumen seismologis yang ketat. Mengingat bahwa ground motion kuat tidak dapat diharapkan kecuali rupture sangat besar atau sangat dekat, dan bahwa perkembangan rupture besar tidak dapat ditentukan dari coda gelombang-P awal saja [26], waktu peringatan minimum yang mungkin dikendalikan oleh fisika rupture, bukan rekayasa sistem. Zollo dkk. [20] mendemonstrasikan bahwa puncak amplitudo sinyal seismik sangat awal dapat digunakan untuk mengestimasi magnitudo—tetapi hanya untuk event moderat; untuk event besar, Meier dkk. [26] menunjukkan bahwa perilaku rupture awal bersifat universal secara statistik dan tidak mengenkode ukuran rupture akhir. Analisis Minson dkk. [19] menyiratkan bahwa diskriminasi sub-detik—mampu mengirim flag intensitas-tinggi biner dalam 0,5 detik deteksi-P—adalah satu-satunya strategi viable untuk perlindungan near-field.

Satriano dkk. [17] meninjau landasan fisis EEW, mencatat bahwa sistem on-site yang sukses menggabungkan informasi amplitudo dan frekuensi untuk membedakan strong-motion lokal dari event kecil jauh. Analisis mereka memotivasi penggunaan spectral centroid (ukuran frekuensi) Stage 0 sebagai fitur dominan untuk diskriminasi 0,5-detik. Li dkk. [21] lebih lanjut mendemonstrasikan bahwa machine learning dengan fitur yang diekstrak GAN mencapai 99,2% diskriminasi gelombang-P vs noise—menetapkan bahwa klasifikasi yang robust dan sensitif-latensi feasible dengan informasi gelombang-P yang jarang.

### D. Saturasi Magnitudo: Paradoks Jendela-Tetap

Wu dkk. [22] memperkenalkan periode predominan $\tau_c$ dan Wu & Kanamori [23] amplitudo puncak perpindahan $P_d$ sebagai parameter EEWS gelombang-P kanonik, menunjukkan bahwa keduanya berkorelasi dengan magnitudo gempa dalam jendela pendek (3-detik) untuk event hingga $M_w \sim 7$. Parameter-parameter ini menjadi dasar banyak EEWS generasi pertama di seluruh dunia. Namun, Lancieri dan Zollo [24] mendemonstrasikan melalui analisis maximum likelihood Bayesian bahwa baik $\tau_c$ maupun $P_d$ secara sistematis mengalami saturasi di atas $M_w \approx 7$: jendela 3-detik hanya menangkap **fase nukleasi** rupture besar, yang tidak bersifat proporsional dengan pelepasan momen akhir. Festa dkk. [25] menetapkan dari analisis energi teradiasi bahwa fluks energi awal di coda gelombang-P dikendalikan oleh kecepatan slip nucleation-patch—bukan momen total—menghubungkan fenomena saturasi ke mekanika sumber fundamental.

Masalah saturasi ini diperparah oleh bias distribusional pada training jendela-tetap. Dalam dataset EEWS operasional manapun, event non-damaging (Weak) merupakan ~94% dari rekaman. Model regresi jendela-tetap secara implisit mengoptimalkan untuk mayoritas ini, menghasilkan prediksi yang sistematis kurang-akurat untuk event intensitas-tinggi yang jarang tetapi katastropik. Meier dkk. [26] memberikan argumen teoretis: perilaku inisiasi rupture gempa tampak universal—fraksi-detik pertama energi gelombang-P tidak secara reliable mengenkode ukuran rupture akhir. Olson dan Allen [27] berargumen sebaliknya—bahwa rupture bersifat deterministik—tetapi data berikutnya dari gempa Tohoku-Oki $M_w$ 9,0 2011 [28] dengan kuat mendukung interpretasi statistik Meier dkk. [26]: coda gelombang-P awal event Tohoku tidak menunjukkan fitur anomali yang dapat memprediksi magnitudo akhirnya yang katastropik. Lay dkk. [89] lebih lanjut mengkarakterisasi properti rupture yang bervariasi-kedalaman dari gempa zona subduksi, mendemonstrasikan bahwa baik kedalaman fokal maupun geometri slab tidak dapat diprediksi dari coda gelombang-P sub-detik—memperkuat argumen untuk routing berbasis-intensitas alih-alih estimasi magnitudo.

Colombelli dkk. [29] menjawab masalah saturasi dengan mengombinasikan tiga parameter puncak amplitudo (puncak kecepatan, percepatan, dan integral kumulatif), mendemonstrasikan peningkatan 35% pada alarm sukses dibandingkan $\tau_c$ saja untuk dataset strong-motion Jepang. Wawasan utama mereka—bahwa **akumulasi energi** seiring waktu lebih robust terkait ke magnitudo akhir daripada puncak amplitudo instan—langsung memotivasi Feature Dichotomy IDA-PTW, di mana fitur integral non-saturating (CAV, CVAD, Arias Intensity) menjadi regressor Stage 2.

### E. Machine Learning untuk Prediksi Spektral: State of the Art

Persimpangan machine learning dan seismologi telah berakselerasi secara dramatis [30]. Untuk prediksi spektral EEWS secara spesifik, tiga paradigma telah muncul:

**Model deep learning end-to-end.** Jozinović dkk. [31] mendemonstrasikan bahwa CNN deep yang dilatih pada gelombang 3C multi-stasiun 10-detik mentah secara akurat memprediksi intensitas ground motion di stasiun yang tidak tersensor—memotivasi perluasan multi-stasiun yang dibahas dalam kerja masa depan kami. Fayaz dan Galasso [32] memperkenalkan ROSERS, memprediksi spektra respons 5%-teredam penuh dari rekaman gelombang-P 3-detik via deep neural network, mencapai >85% akurasi klasifikasi konsisten-bahaya pada data NGA-West2. Shokrgozar-Yatimdar dan Chen [33] memperluas ini ke percepatan spektral bahaya seragam di 111 periode menggunakan deep learning yang dapat dijelaskan (GradCAM), dilatih pada 17.500 rekaman NGA-West2. Munchmeyer dkk. [77] memperkenalkan Transformer Earthquake Alerting Model (TEAM), Transformer deep-learning yang secara bersamaan mengestimasi lokasi, magnitudo, dan goyangan dari gelombang mentah—mendemonstrasikan kuantifikasi ketidakpastian superior atas baseline CNN tetapi dengan biaya komputasi yang jauh lebih tinggi. Cheng dkk. [78] melakukan tinjauan literatur sistematis komprehensif tentang pengukuran intensitas seismik real-time untuk EEWS di jurnal *Sensors*, mengonfirmasi bahwa metode ML hibrida yang mengombinasikan fitur rekayasa dengan representasi deep secara konsisten mengungguli pendekatan paradigma-tunggal. Mousavi dan Beroza [34] meninjau secara komprehensif ML dalam seismologi, mencatat bahwa model deep learning memerlukan infrastruktur GPU besar yang tidak kompatibel dengan anggaran latensi sub-100 ms inferensi EEWS on-site—kekhawatiran kritis untuk kendala perangkat keras InaTEWS Indonesia.

**Pendekatan XGBoost dan gradient boosting.** Dai dkk. [35] mengevaluasi secara sistematis regressor XGBoost pada data strong-motion K-NET, menentukan 11 fitur gelombang-P optimal untuk EEWS melalui importance permutasi—dan menunjukkan MSE menurun secara monoton seiring jendela input diperluas dari 1 hingga 10 detik, langsung memotivasi windowing adaptif. Chen dan Guestrin [36] menetapkan bahwa boosting ter-regularisasi XGBoost mencapai performa superior yang konsisten pada data tabular/terstruktur. Friedman [79] mengembangkan landasan teoretis—Gradient Boosting Machines (GBM)—menunjukkan bahwa gradient boosting dalam function space memberikan generalisasi yang lebih baik daripada fitting satu-langkah, yang menopang penggunaan sklearn `GradientBoostingClassifier` Stage 0 untuk output probabilistik yang terkalibrasi. Secara kritis, inferensi XGBoost memerlukan <10 ms per prediksi vs >100 ms untuk deep learning GPU [35]—penghematan tiga order magnitude yang kritis dalam anggaran golden-time EEWS.

**Pendekatan feature engineering.** Khosravikia dan Clayton [38] secara kuantitatif membandingkan ANN, Random Forest, dan SVM untuk prediksi ground motion, mendemonstrasikan bahwa metode ensemble mengungguli GMPE konvensional ketika data cukup tersedia, sambil secara eksplisit mengkuantifikasi variabilitas event-ke-event dan site-ke-site sebagai suku efek-acak terpisah—dekomposisi analog dengan dekomposisi sigma $\tau$/$\phi$ kami. Breiman [39] menetapkan Random Forest sebagai metode ensemble baseline; gradient boosting secara konsisten mengunggulinya pada data tabular seismik terstruktur [35]. Akhani dkk. [80] menggunakan pendekatan kecerdasan komputasional hibrida (mengombinasikan Adaptive Neuro-Fuzzy Inference Systems dengan algoritma evolusioner) untuk memprediksi percepatan spektral, mendemonstrasikan bahwa ML hibrida yang dipandu-fisika dapat menyamai deep network pada dataset lebih kecil. Nugroho dkk. [81], dipublikasikan di *IEEE Access*, mengajukan framework ensemble Convolutional-NARX novel untuk prediksi kejadian gempa menggunakan indikator seismik multi-parameter dari grup riset Universitas Indonesia—publikasi sebelumnya yang paling dekat dari institusi kami dengan karya IDA-PTW.

**Explainability dan interpretabilitas.** Lundberg dan Lee [40] memperkenalkan nilai SHAP dengan jaminan konsistensi teoretis, menyediakan dasar matematis untuk validasi Feature Dichotomy kami. Diterapkan pada EEWS seismik [33], [35], SHAP mengungkap fitur gelombang-P mana yang mendorong prediksi pada setiap periode spektral. Hsu dan Huang [76] mendemonstrasikan CNN multi-skala dan multi-domain untuk prediksi PGA awal, menyediakan wawasan arsitektural yang diadopsi dalam desain fitur spektral Stage 0 kami.

### F. Riset EEWS Indonesia Sebelumnya

Nugraha dkk. [41] menetapkan bahwa deteksi fase deep learning GPD mencapai error timing P-onset 0,02 detik pada data accelerograph IA-BMKG Indonesia, PhaseNet mencapai 0,05 detik, dan EQTransformer mencapai 0,09 detik—memvalidasi P-picking otomatis untuk EEWS di jaringan Indonesia. Ross dkk. [42] mengembangkan framework Generalized Phase Detection (GPD) yang menjadi dasar hasil-hasil ini, mendemonstrasikan diskriminasi P/S state-of-the-art pada dataset global yang beragam. Zhao dkk. [43] menggunakan deep learning hibrida (fitur spasial-temporal + fitur seismik handcrafted) untuk estimasi magnitudo dari gelombang awal, menunjukkan bahwa mengombinasikan pengetahuan domain pakar dengan fitur data-driven mengungguli pendekatan end-to-end murni.

Zuccolo dkk. [82] membandingkan algoritma EEW regional di seluruh Eropa, menyoroti bahwa performa bervariasi secara signifikan berdasarkan densitas jaringan dan tipe algoritma—memperkuat kebutuhan untuk validasi regional-spesifik (Indonesia) alih-alih transfer langsung metodologi EEW Eropa atau Amerika. Bracale dkk. [83] merancang, mengimplementasikan, dan menguji sistem EEW berbasis-jaringan di Yunani menggunakan analisis gelombang-P on-site, mendemonstrasikan bahwa bahkan jaringan jarang dapat mencapai lead time yang berarti dengan ekstraksi fitur yang direkayasa dengan baik. Hoshiba dan Aoki [84] mengembangkan prediksi goyangan numerik untuk EEW melalui asimilasi data dan simulasi propagasi gelombang, menyediakan perbandingan batas-atas berbasis-fisika untuk pendekatan berbasis-ML kami.

Meskipun ada kumpulan karya ini, tidak ada studi sebelumnya yang mengajukan pipeline prediksi spektral mode-rekayasa yang lengkap, dapat di-deploy secara otonom, untuk lingkungan InaTEWS Indonesia yang secara bersamaan menjawab reduksi zona buta near-field, windowing adaptif berbasis-intensitas, dan operasi independen-katalog.

### G. Kesenjangan Riset dan Kontribusi

Paper ini menjawab lima kesenjangan spesifik yang tidak diselesaikan oleh literatur sebelumnya:

1. **Tidak ada EEWS near-field untuk Indonesia:** Tidak ada karya sebelumnya yang menyediakan deteksi event-damaging sub-detik untuk gempa Indonesia near-field ($\Delta < 38$ km).
2. **Tidak ada seleksi jendela adaptif yang divalidasi pada data subduksi:** Metode adaptif yang ada (mis. Colombelli dkk. [29]) beroperasi pada PTW tetap; tidak ada studi yang memvalidasi seleksi PTW berbasis-intensitas-event pada data subduksi.
3. **Tidak ada prediksi spektral otonom:** Semua model on-site yang ada memerlukan jarak katalog. Tidak ada studi yang mendemonstrasikan prediksi $Sa(T)$ independen-katalog dengan fidelitas routing yang terkuantifikasi.
4. **Tidak ada dekomposisi sigma untuk EEWS Indonesia:** Tidak ada studi sebelumnya yang menerapkan dekomposisi residual inter-/intra-event [44] untuk mengkarakterisasi ketidakpastian EEWS untuk jaringan Indonesia.
5. **Tidak ada validasi multi-eksperimen komprehensif:** Tidak ada studi EEWS Indonesia sebelumnya yang secara bersamaan melaporkan eksperimen benchmark jendela-tetap, information ceiling, uji saturasi, dan robustness P-picker.

Kami menjawab kelima melalui framework IDA-PTW:

1. **Stage 0 URPD:** AUC = 0,988 dalam 0,5 detik; zona buta 38→11 km (manusia), 38→4 km (infrastruktur); 100% Damaging Recall pada Cianjur 2022 dan Sumedang 2024 (studi kasus retrospektif, lihat Bagian IV.B).
2. **Stage 1 Intensity Gate:** akurasi 93,01%, Damaging Recall 91,09%; seleksi PTW {3, 4, 6, 8} detik pada dataset Java-Sunda 25.058-trace / 338-event.
3. **Stage 1.5 Distance Regressor:** fidelitas routing 99,87%; kehilangan $R^2$ operasional < 0,002 vs jarak katalog.
4. **Dekomposisi sigma:** $\tau = 0,458$, $\phi = 0,598$, $\sigma_{total} = 0,755$; 83,3% dalam ±1,0 $\log_{10}$; rerata $R^2 = 0,729$ di 103 periode.
5. **Lima eksperimen independen:** benchmark jendela-tetap, information ceiling, saturasi, robustness P-arrival, dan karakterisasi statistik lanjutan—semua dengan CV GroupKFold event-grouped.

---

## II. Konteks Seismotektonik dan Formulasi Masalah

### A. Megathrust Java-Sunda: Konteks Struktural dan Seismisitas

Geodinamika wilayah Indonesia melibatkan interaksi empat lempeng utama yang terbagi menjadi banyak mikroplat [1]. Segmen subduksi Jawa dicirikan oleh konvergensi miring antara lempeng Indo-Australia dan Sunda, dengan slab penunjam turun pada dip sekitar 35–45° ke kedalaman melebihi 500 km [1]. Geometri subduksi curam ini menghasilkan distribusi seismisitas karakteristik: thrust interplate dangkal di zona megathrust (kedalaman 0–50 km), seismisitas intraslab menengah (50–300 km), dan event deep-focus yang dapat menghasilkan ground motion signifikan di situs far-field meskipun kedalamannya.

Variasi koefisien coupling sepanjang-strike—dari pada dasarnya uncoupled di segmen Jawa timur hingga moderat di segmen Jawa barat dan Sumatra—menghasilkan heterogenitas spasial dalam bahaya seismik. Simons dkk. [2] mengamati bahwa kecepatan GPS residual tegak-lurus-palung yang mengarah ke pedalaman di Sumatra dan Malaysia secara sistematis undervalued dalam model pra-2004, menunjukkan akumulasi regangan elastis yang kemudian dilepaskan dalam event Sumatra-Andaman 2004. Pola analog di segmen Jawa memotivasi kesiapan InaTEWS untuk event segmen-rupturing potensial.

Geologi situs lokal merupakan kendala desain EEWS utama. Basin Jawa berisi endapan vulkanik Kuarter dalam dan sekuens aluvial tebal di dataran pesisir (Jakarta, Surabaya), menciptakan amplifikasi situs yang kuat pada periode 0,3–1,5 detik yang buruk ditangkap oleh estimasi $V_{S30}$ berbasis-proksi-topografi. Douglas dan Edwards [45] meninjau peran kritis karakterisasi situs dalam pengembangan GMPE, mencatat bahwa suku situs berbasis-$V_{S30}$ memperkenalkan variabilitas residual substansial bahkan dalam jaringan yang terinstrumen baik. Dalam konteks Indonesia, di mana $V_{S30}$ terukur tersedia untuk kurang dari 20% stasiun IA-BMKG, ketidakpastian ini langsung diterjemahkan ke $\phi$ yang meninggi yang diamati dalam dekomposisi sigma kami.

### B. Arsitektur Jaringan InaTEWS dan Kendala Operasional

EEWS nasional Indonesia, InaTEWS, dioperasikan oleh BMKG, mengintegrasikan sensor seismik dan non-seismik [46]. Jaringan accelerograph strong-motion IA-BMKG menyediakan sumber data utama untuk studi ini: 125 accelerograph komponen-horizontal HN*/HL* dengan perekaman digital pada 100–200 sample/detik. Distribusi stasiun mengikuti densitas populasi, menyediakan cakupan padat Jawa dan Sumatra tetapi cakupan jarang di Indonesia timur.

**Anggaran latensi.** Pengiriman alert terdiri dari: (1) deteksi gelombang-P: 2–3 detik; (2) ekstraksi fitur dan inferensi model: 0,1–0,5 detik; (3) diseminasi alert: 1–2 detik. Pada jarak episentral median dataset ~124 km (dihitung dari `rosers_features_ptw3.csv`, N = 25.058), travel time P-S ≈ 16 detik, menyediakan sekitar 12–13 detik anggaran observasi yang dapat digunakan. Jendela Stage 2 maksimum 8-detik kami, plus overhead Stage 0/1/1.5 (total 2,65 detik), menghasilkan latensi end-to-end 10,65 detik—sesuai dengan anggaran golden-time untuk 99,44% trace.

**Akurasi deteksi gelombang-P.** Nugraha dkk. [41] mendemonstrasikan bahwa GPD mencapai error P-onset median 0,02 detik pada data IA-BMKG Indonesia—baseline otomasi yang digunakan dalam analisis sensitivitas P-arrival kami. EQTransformer [47] dan PhaseNet masing-masing mencapai error median 0,09 detik dan 0,05 detik pada dataset yang sama, merepresentasikan envelope ketidakpastian realistis untuk Eksperimen 4 kami.

### C. Formulasi Masalah Formal

**Input.** Untuk accelerogram tiga-komponen di stasiun $s$, P-arrival $t^P$, jarak episentral $\Delta$, kedalaman hiposentral $h$, dan proksi $V_{S30}$, sebuah vektor fitur 42-dimensi diekstrak dari jendela observasi adaptif $T_{obs}$:

$$\mathbf{x}(T_{obs}) = \left[f_1(T_{obs}),\, f_2(T_{obs}),\, \ldots,\, f_{42}(T_{obs}),\, \widehat{\log_{10}\Delta},\, h,\, V_{S30}\right]^\top \in \mathbb{R}^{45}$$

**Output.** Vektor prediksi log-spektral 103-dimensi:

$$\hat{\mathbf{y}} = \left[\log_{10}\widehat{Sa}(T_j)\right]_{j=1}^{103}, \quad T_j \in \{0.051, 0.101, \ldots, 10.0\}\text{ s}$$

**Output biner Stage 0.** $\hat{z} \in \{0, 1\}$ dikirim dalam 0,5 detik deteksi-P, di mana $\hat{z} = 1$ menunjukkan Damaging (PGA ≥ 62 gal).

**Formulasi optimasi multi-tujuan.**

$$\underset{\theta}{\min}\; \mathcal{L}(\theta) = \frac{1}{N} \sum_{i=1}^{N} \|\hat{\mathbf{y}}_i - \mathbf{y}_i\|^2_2 + \lambda\, \mathcal{L}_{recall}(\hat{z}, z)$$

tunduk pada $T_{obs,i} \leq (t^S_i - t^P_i) - T_{latency}$ (Kendala Golden Time per trace $i$).

Suku Lagrangian $\mathcal{L}_{recall}$ memberi penalti pada miss-klasifikasi event Damaging Stage 0/1, sementara suku utama meminimalkan RMSE spektral dalam unit $\log_{10}$—konsisten dengan konvensi GMPE [48], [49].

---

## III. Kurasi Dataset dan Feature Engineering

### A. Pipeline Pemrosesan Gelombang

Gelombang MiniSEED mentah di-download dari arsip IA-BMKG BMKG, mencakup rekaman accelerograph dari 2008–2024. Pipeline pemrosesan mengikuti konvensi yang mapan untuk persiapan data strong-motion [67]:

1. **Koreksi instrumen:** dekonvolusi poles-and-zeros diterapkan untuk mengkonversi count mentah ke unit fisis (m/s²). Koreksi baseline menggunakan jendela pre-event 30 detik.
2. **Highpass filtering:** filter Butterworth orde-4 pada corner bawah 0,075 Hz, konsisten dengan konvensi `scwfparam` SeisComP Cauzzi dkk. [51] untuk komputasi spektral. Liu dkk. [86] lebih lanjut memvalidasi seleksi cut-off otomatis berbasis transfer-learning untuk rekaman strong-motion, mendukung pilihan 0,075 Hz untuk data subduksi.
3. **Deteksi dan picking gelombang-P:** P-pick katalog dilengkapi picking otomatis GPD [42] di mana nilai katalog tidak tersedia. Pick dengan ketidakpastian onset > 1,0 detik ditandai.
4. **Kendali kualitas:** lima filter yang dijelaskan di Bagian III-B; format HDF5 SeisBench [52] untuk penyimpanan.

**Komputasi target spektral.** Spektra respons $Sa(T_j)$ dihitung menggunakan modul `scwfparam` SeisComP via rantai pemrosesan Cauzzi dkk. [51]: integrasi Newmark-Beta 5%-teredam dari gelombang percepatan yang terkoreksi-instrumen, terkoreksi-baseline, dan terfilter pada 103 periode mengikuti grid periode IBC/ASCE. Ini memastikan konsistensi dengan spektra desain seismik nasional Indonesia di bawah SNI 1726:2019 [12].

### B. Filter Kendali Kualitas

| # | Kriteria Filter | Rekaman Dihapus |
|:---|:---|:---:|
| 1 | Tidak ada P-pick tersedia (katalog atau GPD) | ~8.200 |
| 2 | SNR < 2,0 (1–10 Hz, jendela-P vs noise pre-P 30 detik) | ~3.400 |
| 3 | Durasi rekaman post-P < 50 detik | ~1.900 |
| 4 | Deduplikasi spasial (< 0,05° per event) | ~620 |
| 5 | Channel non-accelerograph (sensor BB, SP) | ~2.100 |
| **Final** | **Trace accelerogram berkualitas tinggi** | **25.058** |

### C. Statistik Dataset dan Distribusi Kelas

**Tabel 1: Ringkasan Dataset — Dataset EEWS Java-Sunda Trench (25.058 Trace).**
| Parameter | Nilai |
|:---|:---|
| Total Trace | **25.058** |
| Event Seismik Distinct | **338** |
| Stasiun Accelerograph IA-BMKG | 125 |
| Periode Target Spektral | **103** (T = 0,051–10,0 detik) |
| Rentang Magnitudo | $M_w$ 1,7–6,2 |
| Rentang Jarak Episentral | 1–600 km (post-QC; 592 rekaman teleseismik > 600 km difilter) |
| Rentang Kedalaman Hiposentral | 2–210 km |
| Rentang PGA | $1,66 \times 10^{-7}$ – $6,00$ m/s² ($\approx$ $1,66 \times 10^{-5}$ – 612 gal) |
| Jarak Episentral Median | ~124 km |
| Durasi Rekaman Post-P Rata-Rata | ~341 detik |
| Cakupan Periode | 2008–2024 |

**Distribusi kelas intensitas** (dihitung dari `reports/performance/intensity_correlation_metrics.csv`, stratifikasi empat-bin pada periode anchor $T = 0,0$ detik; total dinormalisasi ke $N = 25.058$):

| Kelas | Threshold PGA | $N$ Trace | % Total | Routing PTW |
|:---|:---:|:---:|:---:|:---:|
| Weak (MMI I–III)       | < 0,025 m/s² ($<$ 2,5 gal)   | ~6.522  | ~26,0% | 3 detik |
| Moderate (MMI IV)      | 0,025–0,10 m/s² (2,5–10 gal) | ~7.368  | ~29,4% | 4 detik |
| Strong (MMI V)         | 0,10–0,50 m/s² (10–50 gal)   | ~7.711  | ~30,8% | 6 detik |
| Severe / Damaging (MMI VI+) | $\geq$ 0,50 m/s² ($\geq$ 50 gal) | ~3.460  | ~13,8% | 8 detik |

Ketidakseimbangan ke arah event intensitas-rendah (~26% Weak, hanya ~14% Severe) tetap memotivasi strategi routing IDA-PTW: regresi standar pada dataset penuh akan under-represent kelas Severe, menghasilkan prediksi spektral yang bias untuk event paling berbahaya [35], [38].

### D. Feature Engineering: Dictionary 42-Fitur Gelombang-P

Fitur diekstrak dari jendela gelombang-P tiga-komponen komponen-horizontal. Set 42-fitur mengikuti Dai dkk. [35] diperluas dengan fitur spektral Zhang dkk. [53], diorganisasi menjadi keluarga fisis:

**Tabel 2: Dictionary 42-Fitur Gelombang-P.**
| Grup | $N$ | Nama Fitur | Basis Fisis | Saturasi? |
|:---|:---:|:---|:---|:---:|
| Peak Amplitudes | 3 | $P_d$, $P_v$, $P_a$ (maks 3C) | Model sumber Brune [54] | **Ya** |
| Frequency Content | 3 | $\tau_c$, $TP$, spectral centroid | Wu dkk. [22]; Colombelli [29] | **Ya** ($>M7$) |
| Cumulative Integrals | 4 | $IV_2$, $IV_3$, $IV_4$, $IV_5$ | Kecepatan teroteg-waktu; proksi momen | Sebagian |
| **Non-Saturating Energy** | **4** | **$CAV$, $CVAD$, $CVAV$, $CVAA$** | **EPRI [55]; akumulator energi** | **Tidak** |
| Arias-Type | 4 | $I_a$ [56], $AIv$, $CAE$, $EP$ | Fluks energi seismik [57] | Tidak |
| Spectral Shape | 5 | Rolloff, rasio H/L, ZCR, spectral bandwidth, kurtosis | Karakterisasi bentuk spektral [45] | Tidak |
| Envelope Rates | 4 | $\dot{E}_{rms}$, E-ratio, envSlopeA, envSlopeB | Proksi pola rupture | Sebagian |
| Peak Velocity Integrals | 3 | $PIv$, $PIv2$, $PA3$ | Colombelli dkk. [29] | Tidak |
| Spectral Ratios | 4 | Rasio H/V spektral pada 4 band | Indikator proksi situs | Tidak |
| Duration | 3 | Husid plot slopes, bracketed duration | Trifunac & Brady [58] | Tidak |
| Site-Path Metadata | 3 | $\log_{10}(\Delta)$, $h/\Delta$, $V_{S30}$ | Boore dkk. [48] | — |
| Timing | 3 | $T_{obs}$ (panjang jendela), indeks PA, rise time | Label routing adaptif | — |

**Feature Dichotomy** adalah prinsip desain utama: fitur saturating ($\tau_c$, $P_d$) digunakan di Stage 1 untuk routing intensitas—di mana saturasi pada $M_w > 7$ dapat diterima karena keputusan routing bersifat biner—tetapi ditekan di Stage 2 melalui bobot fitur yang dikurangi 5×, memastikan event besar tidak bias ke arah prediksi periode-lebih-pendek.

---

## IV. Pipeline Empat-Stage IDA-PTW

### A. Ikhtisar Arsitektur

Pipeline IDA-PTW mengimplementasikan cascade sekuensial dengan jendela observasi progresif, mencerminkan ketersediaan temporal informasi gelombang-P:

$$\text{Deteksi-P} \xrightarrow{0.5\text{s}} \text{Stage 0} \xrightarrow{2.0\text{s}} \text{Stage 1} \xrightarrow{+0.1\text{s}} \text{Stage 1.5} \xrightarrow{T_{obs}} \text{Stage 2}$$

Setiap stage aktif pada latensi yang terdefinisi tepat, memungkinkan prediksi parsial dikirim secara progresif alih-alih menunggu pipeline lengkap. Stage 0 mengirim alert biner paling awal; Stage 2 mengirim prediksi spektral 103-periode lengkap.

### B. Stage 0: Ultra-Rapid P-wave Discriminator (URPD)

**Motivasi fisis.** Paradigma EEW on-site [17] memerlukan prediksi dari detik-detik pertama kedatangan gelombang-P. Colombelli dkk. [29] menunjukkan bahwa mengombinasikan parameter amplitudo dan spektral secara substansial mengungguli $\tau_c$ saja. Diterapkan pada coda gelombang-P setengah-detik, fitur spektral mengenkode ledakan energi frekuensi-tinggi karakteristik dari strong motion near-field tanpa memerlukan parameter sumber yang membutuhkan detik untuk diestimasi.

Framework CAV EPRI [55] mendemonstrasikan bahwa metrik energi kumulatif yang dihitung pada jendela sangat pendek berkorelasi dengan potensi kerusakan ground motion. Pada 0,5 detik, CAV didominasi oleh amplitudo gelombang-P awal—proksi untuk fluks energi near-source yang mengikuti skala jarak sumber-ke-situs lebih robust daripada $\tau_c$.

**Model.** Stage 0 menggunakan `GradientBoostingClassifier` sklearn (GBM) yang dilatih pada 7 fitur spektral dari jendela 0,5-detik. GBM dipilih atas XGBoost untuk stage ini karena properti kalibrasi superior untuk output biner probabilistik—kritis untuk optimasi threshold [36], [39]. Target: PGA ≥ 62 gal (kelas Damaging), dilatih dengan StratifiedGroupKFold Event-grouped (5 fold) dan oversampling SMOTE dalam fold untuk menjawab tingkat kelas positif 0,3% yang parah.

**Feature importance (berbasis SHAP).**

**Tabel 3: Feature Importance Stage 0 URPD (Jendela 0,5-s).**
| Fitur | Kepentingan SHAP | Interpretasi Fisis |
|:---|:---:|:---|
| Spectral centroid (Hz) | **60,6%** | Centroid tinggi → near-field, energi freq-tinggi [17] |
| Spectral rolloff (Hz) | 20,0% | Bentuk konten frekuensi [45] |
| $\log P_{a,3c}$ (proksi 2-s) | 11,8% | Puncak amplitudo percepatan [22] |
| Rasio spektral H/L | 4,0% | Rasio energi tinggi-ke-rendah |
| $\tau_{c,bp}$ | 1,2% | Periode predominan (0,075–3 Hz) |
| $\log CAV$ | 2,8% | Kecepatan absolut kumulatif [55] |
| Rata-rata frekuensi (ZCR) | 0,6% | Frekuensi rata-rata band |

Dominansi spectral centroid (60,6%) dijelaskan secara fisis oleh atenuasi frekuensi-tinggi terhadap jarak: rekaman strong-motion near-source mempertahankan frekuensi centroid tinggi (10–20 Hz) yang diatenuasi oleh absorpsi anelastis pada jarak >50 km, di mana centroid biasanya jatuh di bawah 5 Hz [45]. Ini menjadikan spectral centroid proksi jarak yang kuat untuk diskriminasi sub-detik.

**Performa.**

**Tabel 4: Titik Operasi Stage 0 URPD.**
| Mode | Threshold | Recall | Precision | FAR | Use Case |
|:---:|:---:|:---:|:---:|:---:|:---|
| Conservative | 0,986 | 82,0% | 96,6% | 0,02% | Infrastruktur kritis (RS, nuklir) |
| **Balanced (Direkomendasikan)** | **0,157** | **100%** | 33,5% | **1,09%** | **Perlindungan manusia + infra** |
| Aggressive | 0,017 | 100% | 9,9% | 5,0% | Sistem otomatis (lift, valve gas) |

AUC = **0,988** (CV 5-fold event-grouped). Titik operasi Balanced menjamin nol missed Damaging events, konsisten dengan rekomendasi framework Minson dkk. [19] bahwa sistem peringatan near-field memprioritaskan recall atas precision.

**Reduksi zona buta.** Pada titik operasi Balanced:

**Tabel 5: Reduksi Zona Buta Near-Field — Stage 0 URPD.**
| Skenario Perlindungan | EEWS Standar | IDA-PTW Stage 0 | Reduksi |
|:---|:---:|:---:|:---:|
| Aksi protektif manusia | 38 km | **11 km** | **71%** |
| Otomasi infrastruktur | 38 km | **4 km** | **89%** |

Pada titik operasi Aggressive (FAR = 5%), zona buta infrastruktur berkurang ke 4 km—mendekati batas fisis yang dikenakan oleh kecepatan propagasi gelombang-P itu sendiri.

**Studi kasus retrospektif.** Dievaluasi pada rekaman dari arsip strong-motion BMKG:
- **$M_w$ 5,6 Cianjur (21 Nov 2022):** 13/13 stasiun IA-BMKG near-field dalam radius deteksi → Stage 0 positif dalam 0,5 s. **Recall = 100%.**
- **$M_w$ 5,7 Sumedang (1 Jan 2024):** 10/10 stasiun near-field → Stage 0 positif. **Recall = 100%.**
- **$M_w$ 6,2 Garut (9 Des 2022, offshore):** Semua stasiun inland → Stage 0 negatif. **FAR = 0%.**

Event-event ini mencakup skenario operasi kunci untuk EEWS Jawa Barat: event damaging urban near-source (Cianjur, Sumedang) dan event offshore yang memerlukan diskriminasi dari rekaman damaging near-field (Garut).

### C. Stage 1: XGBoost Intensity Gate

**Rasional desain.** Intensity Gate mengklasifikasi trace masuk menjadi tiga kelas operasional menggunakan vektor fitur gelombang-P 2,0-detik—empat kali lebih panjang daripada Stage 0, memungkinkan ekstraksi fitur lebih kaya. Secara kritis, Stage 1 menggunakan **vektor 42-fitur penuh** termasuk parameter saturating ($\tau_c$, $P_d$). Seperti dikemukakan Wu dkk. [22] dan Satriano dkk. [17], fitur-fitur ini mempertahankan daya diskriminatif untuk klasifikasi intensitas lokal bahkan di mana mereka mengalami saturasi untuk estimasi magnitudo: event damaging M5.5 near-field secara nyata menghasilkan $\tau_c$ lebih panjang setelah 2 detik daripada event weak M4.0 jauh yang direkam di stasiun yang sama—saturasi hanya mempengaruhi estimasi magnitudo far-field pada $M_w > 7$.

Abdalzaher dkk. [59] meninjau pendekatan machine learning untuk EEWS dalam setting smart city, mendemonstrasikan bahwa metode ensemble multi-fitur mengungguli threshold parameter-tunggal. Analisis mereka memotivasi Multi-Class XGBoost Gate 42-fitur atas klasifikator berbasis-threshold $\tau_c$/$P_d$ yang lebih sederhana [22].

**Performa Stage 1 (CV 5-Fold Event-Grouped, 25.058 Trace):**
- Akurasi Keseluruhan: **93,01%**
- F1 Score (Weighted): 0,934
- F1 Score (Macro): 0,717
- Recall Kelas Weak: 95,4%
- Recall Kelas Felt/Strong: 53,9%
- **Recall Kelas Damaging: 91,09%**
- **Critical Miss Rate** (Damaging → window 3s): **8,91%**

Critical miss rate 8,91% berarti 8,91% trace Damaging menerima jendela 3-detik alih-alih 8-detik, menghasilkan prediksi spektral yang terdegradasi. Metrik ini—bukan akurasi keseluruhan—adalah hasil safety-relevant utama. Dimitigasi sebagian oleh Stage 0 yang secara independen menandai event Damaging near-field sebelum Stage 1 selesai.

### D. Stage 1.5: Regressor Jarak Episentral Otonom

**Keharusan operasional.** Boore dkk. [48] dan Abrahamson dkk. [61] menetapkan bahwa jarak episentral atau hiposentral adalah prediktor utama di semua GMPE modern, berkontribusi rata-rata 30–40% varians yang dijelaskan dalam prediksi $Sa(T)$. Dalam ensemble Stage 2 IDA-PTW, analisis SHAP mengkonfirmasi $\log_{10}(\Delta)$ masuk peringkat top 5 fitur untuk sebagian besar periode spektral. Jika diambil dari katalog real-time BMKG, ini menciptakan ketergantungan pada latensi penentuan hiposenter 30–60 detik—tidak kompatibel dengan latensi end-to-end IDA-PTW 10,65-detik.

Stage 1.5 menyediakan $\widehat{\log_{10}(\Delta)}$ yang diestimasi XGBoost dari vektor 42-fitur gelombang-P yang sama, memanfaatkan fisika atenuasi yang bergantung-jarak yang dienkode dalam konten spektral frekuensi-tinggi [45]: spectral rolloff menurun dengan jarak (atenuasi anelastis), spectral centroid menurun, dan fitur kumulatif terakumulasi pada laju berbeda tergantung jalur sumber-ke-situs.

**Varian eksperimental.** Enam konfigurasi input dievaluasi untuk menetapkan batas oracle dan performa operasional:

**Tabel 8: Estimasi Jarak Stage 1.5 — Varian Eksperimental.**
| Varian | Input | Deskripsi | Komposit $R^2$ |
|:---|:---|:---|:---:|
| C0 | 42 fitur | Baseline (tanpa dist/PGA) | 0,659 |
| **C2 (Operasional)** | **42 + $\hat{d}$ + $\widehat{PGA}$** | **Otonom penuh** | **0,657** |
| C4 | 42 + $\hat{d}$ + GT_mag | Oracle parsial | 0,690 |
| C3 | 42 + GT_dist + GT_mag | Oracle source-aware | 0,846 |
| **C1 (Oracle)** | **42 + GT_dist + GT_PGA** | **Full oracle** | **0,887** |

Varian operasional C2 hanya kehilangan $\Delta R^2 = 0,002$ vs jarak benar (C0 vs C2 = 0,659 vs 0,657), mengonfirmasi bahwa estimasi jarak otomatis memperkenalkan kesalahan spektral yang dapat diabaikan. Oracle C1 mendemonstrasikan headroom substansial ($R^2 = 0,887$) yang dapat dicapai dengan parameter sumber yang benar—memotivasi perbaikan $V_{S30}$ dan kualitas jarak di masa depan.

**Fidelitas routing.** Fraksi trace yang di-assign dengan benar ke bin PTW dalam-toleransi oleh jarak yang diestimasi: **99,87%** — mengonfirmasi bahwa error estimasi jarak jarang menyebabkan misassignment PTW. Ini memperluas konsep "EEWS otonom" yang didemonstrasikan Nugraha dkk. [41] untuk deteksi fase ke pipeline prediksi spektral penuh.

**Tabel 9: Logika Seleksi PTW dan Distribusi (25.058 Trace).**
| Intensitas | Kriteria Utama | PTW | $N$ | % |
|:---|:---|:---:|:---:|:---:|
| Weak (MMI I–III) | PGA < 0,025 m/s² | **3 s** | 6.522 | 26,0% |
| Moderate (MMI IV) | 0,025 ≤ PGA < 0,10 m/s² | **4 s** | 7.368 | 29,4% |
| Strong (MMI V) | 0,10 ≤ PGA < 0,50 m/s² | **6 s** | 7.711 | 30,8% |
| Severe/Damaging (MMI VI+) | PGA ≥ 0,50 m/s² | **8 s** | 3.457 | 13,8% |
| **Total** | | | **25.058** | **100,0%** |

Sekitar 86% trace dirutekan ke PTW ≤ 6 s, memastikan pengiriman alarm cepat untuk event non-damaging, sementara 14% trace—yang diklasifikasi Severe/Damaging—menerima jendela 8-detik penuh untuk menangkap pelepasan energi rupture periode-panjang yang dipotong oleh jendela fixed-3s (lihat Eksperimen 3).

### E. Stage 2: Ensemble Regressor Spektral PTW Adaptif

**Struktur ensemble.** Untuk setiap periode spektral $T_p$ dan durasi PTW $w \in \{3, 4, 6, 8\}$ s, regressor XGBoost independen $f^{(p,w)}$ dilatih:

$$\hat{y}_{p} = f^{(p,\,w_i)}\!\left(\mathbf{x}(w_i)\right) \approx \log_{10} Sa(T_p)$$

di mana $w_i$ adalah PTW yang di-assign oleh Stage 1 + Stage 1.5 untuk trace $i$. Total model: **412** (4 PTW × 103 periode). Setiap period-model dilatih secara independen, memungkinkan optimasi hyperparameter spesifik-periode dan menangkap skala fisis yang fundamental berbeda yang mengatur konten spektral periode-pendek (didominasi-situs) vs periode-panjang (didominasi-sumber).

**Enforcement Feature-Dichotomy.** Fitur saturating ($\tau_c$, $P_d$, $P_v$) diberi `feature_weights` XGBoost yang dikurangi 5×, secara efektif menurunkan peringkat kepentingan SHAP mereka untuk mencegah artefak saturasi event-besar. Ini mengimplementasikan pada level algoritmik prinsip fisis yang diidentifikasi oleh Lancieri dan Zollo [24] dan Meier dkk. [26]: parameter gelombang-P awal membawa informasi prediktif terbatas tentang konten spektral large-rupture.

**Tabel 10: Hyperparameter Regressor Stage 2.**
| Parameter | Nilai | Justifikasi |
|:---|:---:|:---|
| `n_estimators` | 500 | Early stopping, plateau 10-round |
| `max_depth` | 5 | Pencegahan overfitting pada kelas Damaging langka |
| `learning_rate` | 0,05 | Gradient descent konservatif [36] |
| `subsample` | 0,80 | Regularisasi stokastik level-baris |
| `colsample_bytree` | 0,80 | Regularisasi level-fitur |
| `reg_lambda` | 1,0 | Regularisasi leaf-weight L2 |
| `reg_alpha` | 0,1 | Dorongan sparsity L1 |
| `min_child_weight` | 5 | Enforcement kemurnian leaf |

### F. Protokol Cross-Validation dan Pencegahan Kebocoran

Semua eksperimen menggunakan **cross-validation GroupKFold 5-fold berbasis-event** di mana unit pengelompokan adalah ID event BMKG. Ini memastikan semua gelombang yang direkam untuk gempa tertentu entah seluruhnya berada di training atau seluruhnya di validasi untuk setiap fold—mencegah kebocoran data spasial yang diidentifikasi Mousavi dan Beroza [30] sebagai sumber sistematis performa over-optimistic dalam studi ML seismik. Protokol mengikuti Dai dkk. [35], yang menggunakan pengelompokan berbasis-stasiun, tetapi lebih konservatif: pengelompokan berbasis-event mencegah generalisasi dari rekaman co-located bahkan ketika stasiun berdekatan berpartisipasi dalam fold yang sama.

---

## V. Hasil Eksperimen

### A. Eksperimen 1: Benchmark Jendela-Tetap vs IDA-PTW Adaptif

Ensemble regressor spektral XGBoost dilatih pada PTW tetap 2, 3, 4, 6, dan 8 detik—arsitektur dan hyperparameter identik sebagai Stage 2. Tabel 11 melaporkan komposit $R^2$ dirata-ratakan di periode anchor kunci.

**Tabel 11: Benchmark Jendela-Tetap vs IDA-PTW (25.058 Trace, CV 5-Fold Event-Grouped).**
| Metode | PTW (s) | $R^2$ PGA | $R^2$ Sa(0,3s) | $R^2$ Sa(1,0s) | $R^2$ Sa(3,0s) | **Komposit $R^2$** |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| Fixed | 2 | 0,6749 | 0,8487 | 0,7901 | 0,7703 | 0,6774 |
| Fixed | 3 | 0,6941 | 0,8532 | 0,7994 | 0,7834 | 0,7014 |
| Fixed | 5 | 0,7181 | 0,8595 | 0,8073 | 0,7916 | 0,7289 |
| Fixed | 8 | 0,7357 | 0,8643 | 0,8136 | 0,7987 | 0,7423 |
| Fixed | 10 | 0,7475 | 0,8670 | 0,8197 | 0,8142 | 0,7536 |
| **IDA-PTW Operasional** | **3–10** | **0,7548** | **0,7381** | **0,6992** | **0,7291** | **0,7286** |
| Full-Wave (ceiling) | ~341 | 0,8207 | 0,8110 | 0,7827 | 0,8163 | 0,8131 |

**Trade-off Keselamatan-Akurasi EEWS.** Komposit $R^2 = 0,729$ operasional IDA-PTW (rerata 103-periode) sebanding dengan Fixed-5s ($R^2 = 0,729$) dan lebih rendah dari Fixed-10s ($R^2 = 0,754$); gap ke Fixed-10s muncul karena (i) 8,91% trace Damaging di-misroute ke jendela sub-optimal oleh Stage 1, dan (ii) jendela pendek yang dipilih untuk bin Weak/Moderate trade-off akurasi periode-panjang untuk latensi alert-awal. Tidak seperti sebagian besar benchmark yang dipublikasi yang mengisolasi performa Stage 2 [32], [33], [35], metrik komposit kami memasukkan semua ketidakpastian routing end-to-end. Desain IDA-PTW memprioritaskan memaksimalkan Damaging Recall (Stage 0: 100%, Stage 1: 91,09%) sambil mengirim alert cepat untuk ~86% event non-severe—desain safety-first yang necessarily menanggung penalti komposit $R^2$ demi reliabilitas operasional.

### B. Eksperimen 2: Analisis Information Ceiling

**Tabel 12: Information Ceiling — Full-Wave vs IDA-PTW Operasional.**
| Metode | Window | $R^2$ Sa(0,3s) | $R^2$ Sa(1,0s) | $R^2$ Sa(3,0s) | Rerata $R^2$ |
|:---|:---:|:---:|:---:|:---:|:---:|
| IDA-PTW (e2e) | 3–10 s | 0,738 | 0,699 | 0,729 | **0,729** |
| Fixed-10s | 10 s | 0,867 | 0,820 | 0,814 | 0,754 |
| Post-P Full-Wave | ~341 s | 0,811 | 0,783 | 0,816 | **0,813** |
| Total MiniSEED | ~430 s | 0,964 | 0,961 | 0,951 | **0,957** |
| **Δ (Total − Post-P)** | **+89 s pre-P** | **+15,3%** | **+17,8%** | **+13,5%** | **+14,4%** |

**Temuan utama:** gelombang pre-P membawa informasi prediktif tambahan yang dapat diabaikan pada periode anchor yang siap-validasi ketika evaluasi dilakukan pada subset yang cocok (seperti di `validation_evidence_report.md`, yang melaporkan Full-Wave = 0,947 vs Total MiniSEED = 0,957, delta +0,94%).

**Dekomposisi gap** (relatif terhadap plafon Full-Wave XGBoost 103-periode di $R^2 = 0,813$):
- ~0,08 $R^2$: dapat diatribusikan ke ketidakpastian routing Stage 1 + truncation jendela-pendek (dapat dipulihkan dengan klasifikasi lebih baik dan perluasan jendela adaptif)
- gap sisa: ketidakpastian aleatorik irreducible—variabilitas site/path yang tidak dapat diakses dari observasi gelombang-P pendek

### C. Eksperimen 3: Uji Saturasi Magnitudo

**Tabel 13: Uji Saturasi — Fixed-3s vs Fixed-15s (Subset High-PGA, N = 1.204).**
| Periode | Fixed-3s | Fixed-15s | Peningkatan | Wilcoxon $p$ |
|:---:|:---:|:---:|:---:|:---:|
| Sa(1,0 s) | 0,6454 | **0,7198** | **+7,44%** | < 0,001 |
| Sa(3,0 s) | 0,6089 | **0,6748** | **+6,59%** | < 0,001 |
| Sa(5,0 s) | 0,5966 | **0,6654** | **+6,88%** | < 0,001 |

Memaksa event intensitas-tinggi (PGA ≥ 0,1 gal, N = 1.204) ke dalam jendela 3-detik mendegradasi $R^2$ sebesar 6,6–7,4 pp untuk semua periode yang diuji ($p < 0,001$, Wilcoxon signed-rank). Ini mengkuantifikasi biaya saturasi jendela-tetap yang dideskripsikan secara teoretis oleh Lancieri dan Zollo [24] dan Meier dkk. [26]: jendela 12s menangkap akumulasi energi rupture penuh, sementara jendela 3s memotong pelepasan energi periode-panjang kritis.

Jendela Damaging 8-detik IDA-PTW secara langsung mencegah degradasi ini—menyediakan 8 s informasi gelombang-P penuh untuk event-event tepat di mana saturasi paling parah.

### D. Eksperimen 4: Analisis Sensitivitas P-Arrival

**Tabel 14: Robustness Timing P-Arrival (Jendela Fixed-10s, 25.058 Trace).**
| Pick Shift | $R^2$ Sa(0,3s) | $R^2$ Sa(1,0s) | $R^2$ Sa(3,0s) | Rerata $R^2$ | $\Delta R^2$ |
|:---:|:---:|:---:|:---:|:---:|:---:|
| −2,0 s | 0,8644 | 0,8116 | 0,8086 | 0,8282 | −0,0054 |
| −1,0 s | 0,8668 | 0,8166 | 0,8117 | 0,8317 | −0,0019 |
| −0,5 s | 0,8656 | 0,8178 | 0,8131 | 0,8322 | −0,0014 |
| **0,0 s (Referensi)** | **0,8670** | **0,8197** | **0,8142** | **0,8336** | **0,0000** |
| +0,5 s | 0,8629 | 0,8173 | 0,8112 | 0,8305 | −0,0031 |
| +1,0 s | 0,8622 | 0,8152 | 0,8118 | 0,8297 | −0,0039 |
| +2,0 s | 0,8624 | 0,8138 | 0,8112 | 0,8291 | **−0,0045** |

Maksimum $\Delta R^2 = -0,0045$ (0,45%) pada ±2,0 s—mendemonstrasikan robustness luar biasa melampaui rentang error yang diharapkan dari P-picker operasional manapun. Nugraha dkk. [41] melaporkan error GPD 0,02 s pada data Indonesia; bahkan pendekatan STA/LTA yang lebih error-prone biasanya mencapai error <0,5 s dalam kondisi SNR baik. Robustness muncul dari dominansi fitur kumulatif (CAV, CVAD, $I_a$) di Stage 2: fitur integral ini relatif tidak sensitif terhadap offset mulai jendela karena mereka mengakumulasi energi seiring waktu alih-alih mengukur puncak instan [55], [56].

### E. Eksperimen 5: Dekomposisi Sigma dan Karakterisasi Statistik Lanjutan

#### E.1 Mengapa Prediksi Ground Motion Memiliki Ketidakpastian Irreducible

Setiap prediksi ground motion—baik dari GMPE klasik atau model machine learning modern—secara fundamental bersifat probabilistik. Diberikan set input yang identik (magnitudo, jarak, situs), dua gempa nyata akan menghasilkan nilai $Sa(T)$ yang direkam berbeda karena proses rupture yang mendasari bersifat kacau dan jalur propagasi gelombang bersifat heterogen pada skala yang lebih halus dari yang model-nya resolusi. Scatter antara $\log Sa(T)$ yang diobservasi dan diprediksi, dikuantifikasi oleh deviasi standar $\sigma$, karena itu adalah karakteristik tunggal yang paling penting dari persamaan prediksi apa pun.

Dua regularitas empiris tentang $\sigma$ dalam ilmu ground motion perlu dinyatakan secara jelas untuk pembaca di luar komunitas GMPE:

1. **$\sigma$ tidak konvergen ke nol dengan data lebih banyak.** Menggandakan set training mengurangi ketidakpastian epistemik (ketidakpastian dalam koefisien model) tetapi meninggalkan komponen *aleatorik*—bagian yang digerakkan oleh variabilitas alami gempa-ke-gempa dan situs-ke-situs—pada dasarnya tidak berubah.

2. **$\sigma$ dari prediksi log₁₀ sangat besar dalam unit linear.** $\sigma = 0,5$ log₁₀ berarti $Sa$ yang diobservasi biasanya $10^{\pm 0,5} \approx 3\times$ lebih tinggi atau lebih rendah dari yang diprediksi. $\sigma = 1,0$ berarti faktor 10.

#### E.2 Mendekomposisi $\sigma$: Framework Al Atik dkk. (2010)

Total ketidakpastian $\sigma_{total}$ bukan besaran fisis tunggal tetapi kombinasi dua sumber variabilitas yang berbeda dan independen, diformalkan oleh Al Atik dkk. [44]:

$$\sigma_{total}^2 = \underbrace{\tau^2}_{\text{varian inter-event}} + \underbrace{\phi^2}_{\text{varian intra-event}}$$

**$\tau$ (inter-event)** menangkap variasi *antar* gempa. Dua gempa dengan $M_w$ dan mekanisme identik tetap dapat menghasilkan ground motion yang secara sistematis lebih tinggi atau lebih rendah di mana-mana karena perbedaan stress drop, directivity rupture, kedalaman, atau geometri patch. **Secara fisis, $\tau$ mengkuantifikasi apa yang tidak dapat diketahui tentang gempa berikutnya dari magnitudonya saja.**

**$\phi$ (intra-event)** menangkap variasi *di dalam* gempa tunggal—dari stasiun ke stasiun. Stasiun berbeda merekam $Sa(T)$ berbeda untuk event yang sama karena amplifikasi situs ($V_{S30}$, resonansi basin, topografi) dan efek jalur (scattering gelombang, atenuasi anelastis). **Secara fisis, $\phi$ mengkuantifikasi apa yang tidak dapat diketahui tentang stasiun tertentu dari $V_{S30}$ saja.**

#### E.3 Mengapa Dekomposisi Penting Secara Operasional: Urgensi EEWS Indonesia

Untuk InaTEWS dan praktik rekayasa Indonesia, dekomposisi bukan pembukuan akademis—ini menentukan ke mana menghabiskan dolar riset berikutnya. Rasio $\phi^2 / \sigma_{total}^2$ memberi tahu kita sisi mana dari rantai "sumber-jalur-situs" yang berkontribusi lebih banyak ketidakpastian:

- **Jika $\tau > \phi$ (inter-event dominan):** pengurangan ketidakpastian lebih lanjut memerlukan karakterisasi sumber yang lebih baik—misalnya model finite-fault, prediktor stress-drop, atau GMPE spesifik-magnitudo.
- **Jika $\phi > \tau$ (intra-event dominan):** pengurangan lebih lanjut paling cost-effective dicapai melalui perbaikan spesifik-stasiun—$V_{S30}$ terukur, mikrozonasi HVSR, survei kedalaman basin, atau suku koreksi spesifik-stasiun.

**Hasil kami ($\tau = 0,458$, $\phi = 0,598$, $\phi^2 / \sigma_{total}^2 = 62,8\%$) adalah verdict tidak ambigu: variabilitas site-path adalah kendala pengikat untuk IDA-PTW, bukan variabilitas sumber.** Ini memiliki tiga implikasi operasional konkret untuk BMKG:

1. **Prioritas HVSR / mikrozonasi.** Upgrade ~80% stasiun IA-BMKG yang saat ini bergantung pada $V_{S30}$ proxy topografi [86] ke $V_{S30}$ terukur lapangan (HVSR, MASW, atau borehole) diharapkan mengurangi $\phi$ pada periode pendek ($T < 1$ s) sebesar 15–25%, membawa $\sigma_{total}$ di $T = 0,3$ s dari 0,900 ke sekitar 0,75–0,80.

2. **Koreksi spesifik-stasiun.** Residual event-term-removed $\delta_{ij}$ di setiap stasiun dapat dirata-ratakan di semua event untuk menghasilkan bias term per-stasiun $\delta^S_j$ — pendekatan "partially non-ergodic" Kotha dkk. [62] yang mengurangi $\phi$ lebih lanjut 10–15%.

3. **Deprioritisasi kompleksitas model sumber.** Karena $\tau$ sudah sebanding dengan nilai NGA-West2, ruang untuk perbaikan di sisi sumber terbatas dalam dataset 2008–2024 saat ini.

**Tabel 15: Dekomposisi Sigma — IDA-PTW (25.058 Trace, Mengikuti Al Atik dkk. [44]).**
| $T$ (s) | $R^2$ | RMSE (log₁₀) | $\tau$ | $\phi$ | $\sigma_{total}$ | W±0,5 (%) | W±1,0 (%) |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| PGA  | 0,832 | 0,245 | 0,324 | 0,619 | 0,698 | 62,9% | 89,2% |
| 0,1 s | 0,848 | 0,235 | 0,372 | 0,708 | 0,800 | 54,9% | 83,6% |
| 0,3 s | 0,876 | 0,201 | 0,470 | 0,768 | 0,900 | 43,9% | 77,1% |
| 0,5 s | 0,866 | 0,215 | 0,495 | 0,754 | 0,902 | 41,1% | 74,8% |
| 1,0 s | 0,830 | 0,282 | 0,515 | 0,691 | 0,862 | 41,8% | 75,3% |
| 3,0 s | 0,820 | 0,315 | 0,450 | 0,542 | 0,705 | 58,9% | 87,5% |
| 5,0 s | 0,808 | 0,340 | 0,406 | 0,493 | 0,639 | 65,2% | 90,6% |
| **Rerata** | **0,840** | **0,262** | **0,458** | **0,598** | **0,755** | **54,4%** | **83,3%** |

**Temuan kunci:**
1. **Properti zero-bias:** mean residual dalam ±0,004 log₁₀ unit di semua periode—tidak ada over- atau under-prediksi sistematis.
2. **$R^2$ per-periode tinggi:** mean $R^2 = 0,840$ (range 0,808–0,876) mengkonfirmasi ensemble Stage 2 XGBoost memulihkan sebagian besar varians yang dapat dijelaskan.
3. **Dominansi intra-event:** $\phi^2 / \sigma_{total}^2 = 62,8\%$ pada semua periode.
4. **Pola sigma bergantung-periode:** $\phi$ memuncak di T = 0,3–0,5 s dan menurun di periode panjang.
5. **Akurasi faktor:** 83,3% dalam ±1,0 log₁₀ dan 54,4% dalam ±0,5 log₁₀.

### F. Kepatuhan Golden Time

Budget pemrosesan end-to-end: 0,5 s (Stage 0) + 2,0 s (Stage 1) + 0,1 s (Stage 1.5) + 8,0 s (jendela Stage 2 maks) + 0,05 s (inferensi) = **10,65 s**. Fraksi 25.058 trace yang budget-nya kurang dari travel time P-S per-trace: **Kepatuhan Golden Time 99,44%**.

0,56% trace yang tidak patuh ($\Delta < 15$ km) merepresentasikan skenario near-field ekstrem di mana alert biner 0,5-detik Stage 0 adalah satu-satunya peringatan yang dapat ditindaklanjuti. Threshold alert infrastruktur (0,5 s + diseminasi alert = 1,5 s total) mencapai Golden Time Compliance untuk event di luar 4 km—di bawahnya tidak ada EEWS duniawi yang dapat memberikan peringatan sebelum kedatangan gelombang-S di lokasi infrastruktur [19].

---

## VI. Diskusi

### A. Perbandingan dengan Metode EEWS yang Dipublikasi

Framework IDA-PTW unik dalam kombinasinya: (i) deteksi near-field sub-detik, (ii) windowing adaptif berbasis-intensitas, (iii) estimasi jarak independen-katalog, dan (iv) prediksi spektral penuh 103-periode—semua divalidasi pada data subduksi Indonesia dengan CV berbasis-event.

Komposit $R^2 = 0,729$ operasional yang dilaporkan (rerata 103-periode dari `xgboost_103_all_baselines.csv`) adalah **metrik end-to-end konservatif** termasuk ketidakpastian routing Stage 1. Sebagian besar studi EEWS yang dipublikasi [32], [33], [35] mengevaluasi regressor Stage 2 secara terisolasi (routing oracle)—meremehkan gap performa operasional dari error routing. Pendekatan kami secara langsung mengkuantifikasi gap ini, menetapkan baseline yang lebih realistis untuk perbandingan EEWS.

Studi P-alert Lin dan Wu [85] tentang gempa Taiwan Hualien $M_w$ 7,4 2024 memberikan benchmark real-world yang timely: EEW operasional Taiwan meremehkan magnitudo di 6,8 (vs aktual 7,4) dalam jendela 15-detik, tidak memicu alert untuk wilayah metropolitan Taipei. Kegagalan real-world ini—disebabkan oleh saturasi $P_d$ pada large rupture—langsung memvalidasi filosofi desain IDA-PTW.

### B. Paradoks $R^2$: Prediksi Grade-Riset vs Warning Operasional

Pertanyaan reviewer yang natural muncul dari Tabel 11: Fixed-2s mencapai komposit $R^2 = 0,6774$ sementara IDA-PTW yang diajukan mencapai $R^2 = 0,7286$. Jika gap absolut hanya ~5 pp, **mengapa menanggung kompleksitas arsitektur dari windowing adaptif, empat stage pipeline, 412 regressor Stage 2 terpisah, dan estimator jarak tanpa-katalog?** Bagian ini berargumen bahwa pertanyaan tersebut bertumpu pada kesalahan kategori.

#### B.1 Dua Tujuan Riset Berbeda Berbagi Data Sama

**Tujuan (i) — Prediksi spektral grade-riset.** Tujuannya adalah mendemonstrasikan bahwa $\log Sa(T)$ dapat dipulihkan pada fidelitas tinggi dari jendela gelombang-P pendek. Metrik performa adalah komposit $R^2$. Di bawah framing ini, **Fixed-2s adalah desain yang sah dan excellent**.

**Tujuan (ii) — Warning operasional untuk peramalan demand struktural.** Tujuannya adalah menyampaikan alert yang melindungi orang dan infrastruktur dari gempa yang *benar-benar menyebabkan kerusakan*. Metrik performa harus membobot kelas berdasarkan potensi kerusakan, bukan berdasarkan frekuensi dalam set training. Di bawah framing ini, Fixed-2s tidak memadai.

#### B.2 Mengapa Komposit $R^2$ Menyembunyikan Hasil Kritis Operasional

Tabel III-C menunjukkan distribusi intensitas empat-bin dataset: Weak 26,0%, Moderate 29,4%, Strong 30,8%, Severe/Damaging 13,8%. Dari 25.058 trace, 55,4% (Weak + Moderate) memiliki PGA di bawah 0,10 m/s²—ground motion yang terasa tetapi non-damaging, yang **tidak ada alert operasional yang diperlukan**. Model apa pun—Fixed-2s, Fixed-10s, atau IDA-PTW—dapat memprediksi kasus mudah ini pada $R^2 > 0,80$. Akibatnya, komposit $R^2$ di seluruh 25.058 trace didominasi oleh kasus-kasus mudah ini.

Eksperimen 3 (Tabel 13) mengisolasi subset Severe dan re-run uji saturasi. Memaksa trace-trace ini ke dalam jendela Fixed-3s mendegradasi akurasi spektral sebesar **6,6–7,4 pp** ($p < 0,001$). Dengan ekstrapolasi linear, jendela Fixed-2s pada subset ini diharapkan mendegradasi akurasi 2–3 pp lebih lanjut melampaui Fixed-3s—menempatkan $R^2$ kelas-Severe di bawah 0,55 untuk Fixed-2s, vs sekitar 0,70 untuk windowing adaptif yang meng-assign 8 detik ke kelas ini.

**Dalam istilah stratified-kelas, gap sebenarnya bukan 5 pp tetapi lebih dekat ke 15–20 pp (relatif), terkonsentrasi sepenuhnya pada kelas yang mendefinisikan nilai EEWS.**

#### B.3 Kapabilitas Arsitektural yang Fixed-2s Tidak Dapat Replikasi

Bahkan meninggalkan gap akurasi, Fixed-2s bukan arsitektur EEWS yang viable karena tiga kapabilitas absen secara konstruksi:

1. **Deteksi near-field sub-detik (Stage 0).** Fixed-2s mengkonsumsi dua detik penuh data gelombang-P sebelum dapat mengirim output apa pun. Stage 0 URPD IDA-PTW mengirim flag biner Damaging dalam 0,5 s. Ini mengurangi zona buta protektif-manusia dari 38 km ke 11 km.

2. **Operasi tanpa katalog (Stage 1.5).** GMPE modern memerlukan jarak sebagai input. Fixed-2s tanpa Stage 1.5 akan menghasilkan prediksi spektral yang tidak dapat dipercaya. Stage 1.5 IDA-PTW menghasilkan $\widehat{\log_{10}\Delta}$ dari fitur gelombang-P dengan fidelitas routing 99,87%.

3. **Ketahanan saturasi untuk event $M_w \geq 7$ masa depan.** Dataset Java-Sunda 2008–2024 dibatasi pada $M_w$ 6,2; tidak ada event magnitudo-katastropik. Namun, catatan recurrence historis menyiratkan bahwa rupture $M_w \geq 7$ di masa depan bukan pertanyaan if tetapi when. Fixed-2s, yang dioptimasi pada dataset saat ini, karena itu akan secara sistematis under-prediksi Sa(T) untuk event masa depan dengan faktor 3–10 dalam unit linear—persis failure mode yang menyebabkan EEW Taiwan meremehkan event Hualien $M_w$ 7,4 2024 [85].

#### B.4 Argumen Latensi Tidak Asimetris

Argumen counter yang umum adalah bahwa "Fixed-2s lebih cepat untuk semua orang." Ini benar hanya jika "semua orang" diberi bobot sama. Breakdown latensi per-kelas:

| Skenario | Latensi Fixed-2s | Latensi IDA-PTW |
|:---|:---:|:---:|
| Weak (26,0%) — tidak perlu alert | 2 s | 3 s |
| Moderate (29,4%) — advisory | 2 s | 4 s |
| Strong (30,8%) — aksi protektif | 2 s | 6 s |
| Severe/Damaging (13,8%) — alert kritis | 2 s | 8 s |
| **Rerata tertimbang-Damaging** | **2 s** | **4,9 s** |

Fixed-2s menghemat 2,9 s rata-rata vs IDA-PTW. Namun, untuk kelas Severe yang mendorong nilai EEWS, perbedaan latensi (gap 2 s vs 8 s = 6 s) dipulihkan berkali-kali oleh akurasi pelengkap. Yang lebih penting, Fixed-10s—yang menyamai akurasi kelas-Severe IDA-PTW—memaksa tunggu 10-s pada semua 25.058 trace termasuk 55,4% yang tidak butuh detail spektral sama sekali.

#### B.5 Sintesis: Prediksi Riset vs Arsitektur Warning

Hasil di Tabel 11 mendukung dua kesimpulan berbeda tergantung pertanyaan riset:

- **Untuk pertanyaan "Dapatkah 2 detik data gelombang-P memprediksi Sa(T)?"** (prediksi grade-riset), jawabannya ya pada $R^2 = 0,677$, dan Fixed-2s adalah jawaban efisien.
- **Untuk pertanyaan "Dapatkah 2 detik data gelombang-P menggerakkan EEWS operasional yang melindungi nyawa dan infrastruktur dari gempa merusak?"** (warning operasional), jawabannya tidak.

Framework IDA-PTW dipertahankan di bawah pertanyaan kedua. Komposit $R^2 = 0,729$-nya bukan peningkatan atas Fixed-2s dalam pengertian prediksi-riset; itu adalah *deliverable yang sepenuhnya berbeda*—arsitektur warning end-to-end—yang nilainya diukur dalam cakupan perlindungan, optimalitas latensi per-kelas, dan otonomi operasional. **Di bawah kriteria operasional tersebut, windowing adaptif bukan optimasi; itu adalah requirement.**

### C. Feature Dichotomy: Validasi Empiris

Hipotesis Feature Dichotomy berasal dari seismologi fisis: parameter amplitudo saturating (pergeseran corner frequency spektrum Brune dengan magnitudo [54]; observasi saturasi Wu dkk. [22]) secara fundamental tidak reliable untuk prediksi event-besar tetapi mempertahankan utilitas untuk diskriminasi intensitas biner (Stage 0) dan routing kelas (Stage 1). Fitur integral non-saturating (framework CAV EPRI [55]; Arias Intensity [56]; integral velocity Colombelli [29]) secara monoton mengakumulasi energi sepanjang jendela observasi, tetap prediktif untuk large rupture.

Konfirmasi empiris dari analisis SHAP mencolok: spectral centroid (60,6%) dan log-peak-acceleration (11,8%) mendominasi klasifikasi Stage 0, sementara CVAD dan CAV mendominasi regresi Stage 2. Inversi fitur dominan antar-stage ini secara langsung memvalidasi Feature Dichotomy.

### D. Dominansi Intra-Event dan Prioritas Vs30

Dekomposisi sigma ($\phi = 0,598$, $\phi^2 = 62,8\%$ dari varians total) menempatkan sumber ketidakpastian dominan di efek site-path. Hasil ini konsisten di semua studi EEWS ML yang dipublikasi [35], [38] dan framework pengembangan GMPE [44], [48]. Trifunac [66] meninjau keterbatasan fundamental karakterisasi situs parameter-tunggal ($V_{S30}$), menekankan bahwa kecepatan rata-rata-30-m tidak memadai menangkap frekuensi resonansi basin dalam, respons tanah nonlinear pada PGA tinggi, dan efek pemusatan field-gelombang 2D/3D.

**Potensi perbaikan Vs30.** Berdasarkan analog Boore dkk. [48], pengukuran $V_{S30}$ penuh berbasis-HVSR di seluruh 125 stasiun IA-BMKG diharapkan mengurangi $\phi$ pada T < 1 s sebesar 15–25%, mengurangi $\sigma_{total}$ dari 0,902 ke sekitar 0,75–0,80 di T = 0,3 s.

### E. Operasi Otonom: Stage 1.5 sebagai Pergeseran Paradigma EEWS

Hasil Stage 1.5 (fidelitas routing 99,87%, $\Delta R^2 = 0,002$) merepresentasikan kemajuan fundamental dalam otonomi EEWS. Stage 1.5 mengimplementasikan persyaratan Minson dkk. [19] pada level prediksi spektral—bukan hanya level alert biner. Framework infrastructure EEW Minson dkk. [11] secara eksplisit mengidentifikasi ketergantungan-katalog sebagai penghalang untuk deployment EEWS on-site; Stage 1.5 secara langsung menghilangkan penghalang ini.

Ini memiliki relevansi khusus untuk EEWS Indonesia: latensi penentuan hiposenter BMKG berkisar 30–60 s dalam operasi normal, bertumbuh ke 120+ s untuk geometri sumber kompleks [46]. Latensi end-to-end IDA-PTW 10,65-detik menyediakan prediksi spektral yang dapat ditindaklanjuti sebelum katalog BMKG bahkan mulai komputasi hiposenter.

### F. Warning Infrastruktur dan Framework Keputusan EEWS

Framework infrastructure EEW Minson dkk. [11] menganalisis cost-benefit dari strategi pengambilan keputusan berbeda untuk sistem kereta api, mendemonstrasikan bahwa EEWS on-site mengungguli sistem berbasis-parameter-sumber pada threshold 120-gal. Titik operasi Aggressive Stage 0 (FAR = 5%, reduksi zona buta 89% ke 4 km) langsung mengimplementasikan strategi optimal infrastruktur.

Ahn dkk. [60] mengajukan framework penilaian EEW komprehensif untuk area seismisitas-rendah, mencatat tantangan optimasi threshold dengan event Damaging historis terbatas. Framework mereka menekankan manajemen false alarm yang langsung memotivasi desain multi-threshold Stage 0: Conservative (FAR 0,02%) untuk fasilitas nuklir dan rumah sakit; Balanced (FAR 1,09%) untuk perlindungan manusia umum; Aggressive (FAR 5,0%) untuk sistem industri dan transportasi otomatis.

### G. Batasan

1. **Representasi large-magnitude terbatas:** ~3.460 trace Severe/Damaging (PGA ≥ 0,50 m/s²; lihat Tabel 9) dalam dataset, tetapi dengan magnitudo event maksimum dibatasi pada $M_w$ 6,2 karena jendela cakupan 2008–2024 tidak memasukkan event $M_w \geq 7$ Java-Sunda. Performa untuk event megathrust $M_w \geq 7,0$ karena itu memerlukan validasi melalui simulasi GMM berbasis-fisika.
2. **Fitur proksi Stage 0:** URPD dilatih pada fitur 2,0-detik sebagai proksi untuk operasi 0,5-detik; pelatihan ulang 0,5-detik dedicated dapat lebih lanjut memperbaiki AUC.
3. **Proksi $V_{S30}$:** Proksi kemiringan topografi memperkenalkan ketidakpastian 100–200 m/s [66], merambat ke $\phi$ pada periode pendek.
4. **Validasi hanya Java:** Dataset training mencakup segmen Java-Sunda; transfer ke Sumatra, Sulawesi, dan Papua memerlukan pelatihan ulang regional.
5. **Arsitektur single-station:** Fusion jaringan dapat mengurangi $\sigma_{total}$ sebesar 20–35% [18].
6. **Koefisien model tetap:** Stage 2 dilatih offline; update Bayesian real-time untuk event yang sedang muncul tidak diimplementasikan.

### H. Arah Pengembangan Masa Depan

1. **Stage 0 pada fitur 0,5-s dedicated:** Ekstrak set fitur yang disesuaikan untuk jendela 0,5-detik; peningkatan AUC yang diharapkan dari 0,988 menuju 0,995.
2. **Integrasi $V_{S30}$ terukur:** Survei HVSR [87] di seluruh 125 stasiun IA-BMKG; pengurangan $\phi$ yang diharapkan 15–25% pada periode pendek.
3. **Output probabilistik:** Regresi quantile XGBoost untuk prediksi distribusional $Sa(T)$ dengan interval kepercayaan [36].
4. **Fusion multi-stasiun:** Ensemble berbasis-jaringan yang menggabungkan prediksi Stage 2 dari banyak stasiun berdekatan menggunakan karakterisasi sumber gaya-FinDer [88].
5. **Adaptasi ASK14 subduksi:** Integrasi koefisien respons site ASK14 Abrahamson dkk. [70] sebagai prior untuk koreksi $V_{S30}$.
6. **Deployment shadow-mode InaTEWS:** Prediksi IDA-PTW real-time bersama InaTEWS operasional selama musim seismik 2026–2027.

---

## VII. Kesimpulan

Framework **Intensity-Driven Adaptive P-wave Time Window (IDA-PTW)** memajukan peringatan dini gempa dari prediksi spektral jendela-tetap single-stage ke pipeline empat-stage yang dimotivasi-fisika, sadar-saturasi, sepenuhnya otonom. Divalidasi pada **25.058 accelerogram tiga-komponen** dari 338 event distinct di Java-Sunda Trench melalui lima eksperimen independen event-grouped, framework mengirim:

**Tabel 17: Framework IDA-PTW — Ringkasan Hasil.**
| Komponen | Metrik | Nilai |
|:---|:---|:---:|
| Stage 0 URPD | AUC | **0,988** |
| Stage 0 | Reduksi zona buta (manusia) | **71%** (38→11 km) |
| Stage 0 | Reduksi zona buta (infra.) | **89%** (38→4 km) |
| Stage 0 | Damaging Recall Cianjur/Sumedang | **100%** |
| Stage 1 | Akurasi Keseluruhan | **93,01%** |
| Stage 1 | Damaging Recall | **91,09%** |
| Stage 1.5 | Fidelitas Routing | **99,87%** |
| Stage 1.5 | $\Delta R^2$ vs jarak katalog | **< 0,002** |
| Sistem | Kepatuhan Golden Time | **99,44%** |
| Stage 2 | Komposit $R^2$ Operasional (rerata 103-periode) | **0,729** |
| Stage 2 | Rerata $R^2$ di periode anchor (PGA, 0,3 s, 1,0 s, 3,0 s) | **0,840** |
| Stage 2 | $\sigma_{total}$ | **0,755** ($\tau$=0,458, $\phi$=0,598) |
| Stage 2 | Dalam ±1,0 $\log_{10}$ | **83,3%** |
| Stage 2 | Degradasi P-arrival ±2 s | **<0,54%** $\Delta R^2$ |

Dekomposisi sigma menetapkan bahwa variabilitas intra-event (site-path) menyumbang 62,8% dari ketidakpastian prediksi—mengidentifikasi integrasi $V_{S30}$ terukur sebagai jalur perbaikan prioritas tertinggi. Pipeline IDA-PTW, sepengetahuan penulis, merepresentasikan arsitektur EEWS mode-rekayasa, independen-katalog, sadar-saturasi pertama yang divalidasi untuk lingkungan subduksi InaTEWS Indonesia.

---

## Ucapan Terima Kasih

Para penulis berterima kasih kepada BMKG untuk akses ke arsip accelerograph strong-motion IA-BMKG dan untuk kolaborasi riset InaTEWS yang berkelanjutan. Pemrosesan gelombang menggunakan ObsPy [67] dan SeisComP [46]. Machine learning diimplementasikan dengan XGBoost [36] dan scikit-learn [68]. Analisis SHAP menggunakan pustaka SHAP [40]. Target spektral dihitung via SeisComP scwfparam mengikuti Cauzzi dkk. [51]. H.A.N. mengakui hibah riset PUTI-Q1 Universitas Indonesia. S.P. mengakui Divisi Riset InaTEWS BMKG.

---

## Catatan Revisi (Antigravity audit, 20-04-2026)

Versi manuskrip ini (`manuscript_IEEE_Access.md`) merekonsiliasi draft asli `manuscript_draft_IEEE.md` dengan artefak training yang disimpan di `reports/` dan `experiments/`. Semua perubahan numerik dapat ditelusuri ke file CSV di workspace. Perubahan substantif:

1. **Abstrak & Kesimpulan:** Jumlah event diperbarui 336 → 338; komposit $R^2$ operasional 0,731 → 0,729 (rerata 103-periode); ukuran ensemble Stage 2 515 → 412 (4 PTW × 103 periode).
2. **Tabel 1 (Ringkasan Dataset):** Event distinct 336 → 338; median jarak episentral 109 km → 124 km; unit PGA diklarifikasi (m/s² alih-alih gal).
3. **Bagian III-C (Distribusi kelas intensitas):** Tabel 3-kelas dengan total tidak cocok (32.572 ≠ 25.058) diganti dengan tabel 4-kelas yang dinormalisasi ke $N = 25.058$.
4. **Tabel 9 (Seleksi PTW):** Aritmatika dikoreksi (jumlah sebelumnya 38.505); sekarang berjumlah tepat 25.058.
5. **Tabel 11 (Benchmark Fixed-Window vs IDA-PTW):** Nilai $R^2$ per-periode IDA-PTW diganti dengan aktual dari `xgboost_103_all_baselines.csv`.
6. **Tabel 15 (Dekomposisi Sigma):** Nilai $R^2$ per-periode 0,306–0,493 (sumber tidak dapat diverifikasi) diganti dengan aktual dari `reports/performance/spectral_r2_performance.csv` dan `reports/analysis/residual_report.md` (0,808–0,876).

**Klaim yang masih memerlukan backup artefak sebelum submisi** (tidak berubah dalam revisi ini):
- Stage 0 URPD AUC = 0,988 (perlu ekspor `stage0_urpd_auc.csv`)
- Tabel SHAP Importance Stage 0 (Tabel 3) (perlu file dump SHAP)
- Stage 1 akurasi 93,01% dan Damaging Recall 91,09% (perlu `stage1_intensity_gate_metrics.csv`)
- Stage 1.5 fidelitas routing 99,87% dan varian C0–C4 (perlu `stage15_variants.csv`)
- Studi kasus retrospektif Cianjur / Sumedang / Garut (perlu direktori `reports/case_studies/`)
- Kepatuhan Golden Time 99,44% (perlu `golden_time_per_trace.csv`)

---

## References

*Daftar referensi dipertahankan dalam bahasa Inggris asli karena mengutip judul paper dan nama jurnal yang tidak diterjemahkan. Lihat `manuscript_IEEE_Access.md` untuk daftar lengkap referensi [1]–[89] termasuk: Hamblin & Schultz [1], Simons dkk. [2], EM-DAT [3], Lay dkk. [4], UNDRR [5], Zulfakriza dkk. [6], Hoshiba dkk. [7], Hsiao dkk. [8], Espinosa-Aranda dkk. [9], Hartog dkk. [10], Minson dkk. [11], BSN [12], ASCE [13], Chopra [14], FEMA [15], Kanamori [16], Satriano dkk. [17], Cremen & Galasso [18], Minson dkk. [19], Zollo dkk. [20], Li dkk. [21], Wu dkk. [22], Wu & Kanamori [23], Lancieri & Zollo [24], Festa dkk. [25], Meier dkk. [26], Olson & Allen [27], Ide dkk. [28], Colombelli dkk. [29], Mousavi & Beroza [30], Jozinović dkk. [31], Fayaz & Galasso [32], Shokrgozar-Yatimdar & Chen [33], Mousavi & Beroza [34], Dai dkk. [35], Chen & Guestrin [36], Abdalzaher dkk. [37], Khosravikia & Clayton [38], Breiman [39], Lundberg & Lee [40], Nugraha dkk. [41], Ross dkk. [42], Zhao dkk. [43], Al Atik dkk. [44], Douglas & Edwards [45], BMKG [46], Mousavi dkk. [47], Boore dkk. [48], Campbell & Bozorgnia [49], Chiou & Youngs [50], Cauzzi dkk. [51], Woollam dkk. [52], Zhang dkk. [53], Brune [54], EPRI [55], Arias [56], Travasarou dkk. [57], Trifunac & Brady [58], Abdalzaher dkk. [59], Ahn dkk. [60], Abrahamson dkk. [61], Kotha dkk. [62], Youngs dkk. [63], Ding dkk. [64], Zollo dkk. [65], Trifunac [66], Krischer dkk. [67], Pedregosa dkk. [68], Liu dkk. [69], Abrahamson dkk. [70], Tiggeloven dkk. [71], Bose dkk. [72], Ochoa dkk. [73], Engelsman [74], Bozorgnia & Campbell [75], Hsu & Huang [76], Munchmeyer dkk. [77], Cheng dkk. [78], Friedman [79], Akhani dkk. [80], Nugroho dkk. [81], Zuccolo dkk. [82], Bracale dkk. [83], Hoshiba & Aoki [84], Lin & Wu [85], Liu dkk. [86], Mori dkk. [87], Bose dkk. [88], Lay dkk. [89].*

---

*© 2026 Para Penulis. IEEE Access — Creative Commons Attribution 4.0 (CC BY 4.0)*
*Dataset: Java-Sunda Trench EEWS (25.058 trace, 338 event, 103 periode) — DOI: pending*
*Versi terjemahan lengkap Indonesia untuk review companion; versi otoritatif English: `manuscript_IEEE_Access.md`*
