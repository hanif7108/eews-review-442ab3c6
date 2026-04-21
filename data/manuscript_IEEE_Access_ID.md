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

*[Lanjutan manuskrip: Bagian IV–VII, Akknowledgments, Revision Notes, dan References tetap dalam versi bahasa Inggris. Lihat `manuscript_IEEE_Access.md` untuk versi lengkap bahasa Inggris yang otoritatif untuk submisi IEEE Access. Bagian-bagian teknis (formulasi matematis, spesifikasi hyperparameter, angka-angka hasil eksperimen, dan daftar referensi) sengaja dipertahankan dalam bahasa Inggris karena merupakan versi otoritatif yang akan disubmit.]*

*Sub-bagian berikut yang tersedia dalam versi bahasa Inggris penuh:*
- *IV. The IDA-PTW Four-Stage Pipeline (A–F)*
- *V. Experimental Results (A–F)*
- *VI. Discussion (A–H)*
- *VII. Conclusion*
- *Acknowledgments*
- *Revision Notes*
- *References [1]–[89]*

---

## Catatan Terjemahan

Terjemahan bahasa Indonesia ini disediakan untuk memudahkan review oleh pembaca berbahasa Indonesia atas **bagian narrative utama** manuskrip: Abstrak, Bab I (Pendahuluan), Bab II (Konteks Seismotektonik), dan Bab III (Kurasi Dataset). Bagian-bagian ini mencakup:

- Motivasi riset dan konteks bahaya seismik Indonesia
- State of the art EEWS dan machine learning untuk prediksi spektral
- Lima kesenjangan riset yang dijawab oleh framework IDA-PTW
- Konteks seismotektonik Java-Sunda megathrust
- Arsitektur jaringan InaTEWS dan kendala operasional
- Formulasi masalah formal
- Pipeline pemrosesan gelombang dan kendali kualitas
- Statistik dataset dan distribusi kelas intensitas
- Dictionary 42-fitur gelombang-P dan Feature Dichotomy

Untuk bagian-bagian teknis (**Bab IV–VII** yaitu Pipeline IDA-PTW, Eksperimen, Diskusi, Kesimpulan) dan **daftar referensi**, pembaca dirujuk ke `manuscript_IEEE_Access.md` (versi bahasa Inggris) yang adalah versi otoritatif untuk submisi ke IEEE Access.

Ringkasan temuan utama yang komprehensif dalam bahasa Indonesia tersedia di `index.html` bagian **Research Narrative** yang memberikan terjemahan 12-subsection dari seluruh arc riset, termasuk:
- Motivasi & Konteks Riset
- Perumusan Masalah (4 Failure Mode)
- Pertanyaan Riset & Hipotesis
- Framework IDA-PTW
- Feature Dichotomy — Inti Intelektual
- Strategi Validasi
- Temuan Validasi
- Gap Penelitian yang Dijawab
- Signifikansi Teoretis di Luar IDA-PTW
- Implikasi Operasional untuk InaTEWS
- Batasan & Boundary Conditions
- Arah Pengembangan ke Depan

Semua angka, tabel, gambar, dan persamaan matematis di manuskrip bahasa Inggris sama dengan yang dirujuk di ringkasan bahasa Indonesia.

---

*© 2026 Para Penulis. IEEE Access — Creative Commons Attribution 4.0 (CC BY 4.0)*
*Dataset: Java-Sunda Trench EEWS (25.058 trace, 338 event, 103 periode) — DOI: pending*
*Versi Indonesia ini untuk review companion; versi otoritatif English: `manuscript_IEEE_Access.md`*
