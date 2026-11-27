/* ==================== SIYA COSMODERMA HUB CLINIC — 3D, AI & ADMIN ENGINE (app.js) ==================== */

const CLINIC_WHATSAPP_NUMBER = '918390020346';
const STORAGE_KEY_APPTS = 'siya_clinic_appointments';
const STORAGE_KEY_RX = 'siya_clinic_prescriptions';

let latestPassData = null;
let selectedWizardProtocol = '03 • Hydra-Infusion Glass Skin Ritual';
let baZoomed = false;
let activeCaseIdx = 0;

// AI Camera & Photo State
let aiMediaStream = null;
let hasFaceOrPhotoInput = false;

// Admin & Rx State
let currentRxId = generateRxCode();
let draftMedications = [];

const protocolFeeMap = {
  'Private Dermatology & Skin Architecture Consultation': 800,
  '00 • Private Dermatology Consultation': 800,
  '01 • Medical Acne & Scar Remodeling': 2500,
  '02 • Melasma & Cellular Brightening': 2200,
  '03 • Hydra-Infusion Glass Skin Ritual': 3500,
  '04 • Bridal Radiance Couture Program': 6500,
  '05 • PRP & Exosome Hair Restoration': 4500,
  '06 • Triple-Wavelength Laser Hair Reduction': 3000,
  '07 • Pico-Laser Pigmentation & Rejuvenation': 4000,
  '08 • Anti-Aging & Collagen Lift': 5500
};

const wizardProtocolsList = [
  '01 • Medical Acne & Scar Remodeling',
  '02 • Melasma & Cellular Brightening',
  '03 • Hydra-Infusion Glass Skin Ritual',
  '04 • Bridal Radiance Couture Program',
  '05 • PRP & Exosome Hair Restoration',
  '06 • Triple-Wavelength Laser Hair Reduction',
  '07 • Pico-Laser Pigmentation & Rejuvenation',
  '08 • Anti-Aging & Collagen Lift'
];

const quickDermatologyMeds = [
  { label: 'Tab. Doxycycline 100mg', name: 'Tab. Doxycycline 100mg', freq: '1 - 0 - 1 (Morning & Night)', duration: '15 Days', instruction: 'After food with full glass of water' },
  { label: 'Cap. Isotretinoin 20mg', name: 'Cap. Isotretinoin 20mg', freq: '0 - 0 - 1 (At Bedtime)', duration: '30 Days', instruction: 'After dinner; keep lips & skin moisturized' },
  { label: 'Tab. Biotin + Zinc + Amino', name: 'Tab. Biotin 10mg + Zinc + Amino Acids', freq: '1 - 0 - 0 (Morning Only)', duration: '30 Days', instruction: 'After breakfast' },
  { label: 'Adapalene 0.1% Gel', name: 'Adapalene 0.1% Microsphere Gel', freq: 'Apply Thin Layer at Night', duration: '30 Days', instruction: 'Pea-sized amount on dry face 20 mins after washing' },
  { label: 'Azelaic Acid 15% Cream', name: 'Azelaic Acid 15% Cream', freq: 'Apply Twice Daily (AM & PM)', duration: '30 Days', instruction: 'Apply over hyperpigmented / acne-prone zones' },
  { label: 'SPF 50+ PA++++ Sunscreen', name: 'Silicone Matte Sunscreen Gel SPF 50+ PA++++', freq: 'Apply Every Morning (Sunscreen)', duration: '30 Days', instruction: 'Two-finger rule 20 mins before sun exposure' },
  { label: 'Ketoconazole 2% Shampoo', name: 'Ketoconazole 2% + ZPTO Medicated Shampoo', freq: 'Twice Weekly Scalp Wash', duration: '4 Weeks', instruction: 'Leave lather on scalp for 5 minutes before rinsing' }
];

const faceHotspotsData = [
  { label: 'Acne', zone: 'Zone 01 • T-Zone & Cheeks', title: 'Acne & Sebum Control', desc: 'Medical comedone care, salicylic-mandelic peels, and phototherapy to calm active breakouts while protecting barrier integrity.', treatment: '01 • Medical Acne & Scar Remodeling' },
  { label: 'Pigmentation', zone: 'Zone 02 • Malar & Brow', title: 'Pigmentation & Sunspots', desc: 'Calibrated picosecond pulses and tyrosinase-inhibiting infusions to disperse stubborn melanin clusters safely.', treatment: '07 • Pico-Laser Pigmentation & Rejuvenation' },
  { label: 'Dark Circles', zone: 'Zone 03 • Periorbital', title: 'Periorbital Brightening', desc: 'Gentle peptide eye infusions, vascular drainage care, and micro-dosed brightening for tired under-eye hollows.', treatment: '02 • Melasma & Cellular Brightening' },
  { label: 'Fine Lines', zone: 'Zone 04 • Forehead & Crow’s Feet', title: 'Fine Lines & Elastin Lift', desc: 'Collagen-stimulating radiofrequency and hydrating biostimulators to smooth expression lines naturally.', treatment: '08 • Anti-Aging & Collagen Lift' },
  { label: 'Hair Loss', zone: 'Zone 05 • Crown & Hairline', title: 'Follicular & Trichology Care', desc: 'Dermoscopic scalp mapping paired with concentrated PRP and regenerative exosomes to strengthen thinning follicles.', treatment: '05 • PRP & Exosome Hair Restoration' },
  { label: 'Scars', zone: 'Zone 06 • Mid-Cheek', title: 'Atrophic Scar Remodeling', desc: 'Subcision and fractional RF energy break fibrotic tethers and rebuild smooth dermal collagen.', treatment: '01 • Medical Acne & Scar Remodeling' },
  { label: 'Lips', zone: 'Zone 07 • Vermilion Border', title: 'Lip Hydration & Soft Tint', desc: 'Deep hyaluronic moisture infusions and gentle depigmentation for soft, supple, natural-looking lips.', treatment: '03 • Hydra-Infusion Glass Skin Ritual' },
  { label: 'Jawline', zone: 'Zone 08 • Mandibular Contour', title: 'Jawline Definition & Firming', desc: 'Non-invasive thermal collagen tightening to refine lower-face contour and dermal elasticity.', treatment: '08 • Anti-Aging & Collagen Lift' }
];

const skinStagesData = [
  { step: '01', name: 'Healthy Skin Appears', desc: 'Intact stratum corneum, balanced sebum, and organized dermal collagen fibers.', color: '#10B981' },
  { step: '02', name: 'Acne Develops', desc: 'Follicular hyperkeratinization and sebum buildup trigger localized inflammation.', color: '#EF4444' },
  { step: '03', name: 'Pigmentation Forms', desc: 'Melanocytes overproduce melanin in response to UV stress or post-inflammatory response.', color: '#D97706' },
  { step: '04', name: 'Laser Treatment Works', desc: 'US-FDA photoacoustic & fractional energy targets pigment and micro-columns precisely.', color: '#0284C7' },
  { step: '05', name: 'Collagen Regenerates', desc: 'Fibroblasts synthesize fresh Type I & III collagen and elastin networks.', color: '#BFA065' },
  { step: '06', name: 'Healthy Glowing Skin Returns', desc: 'Luminous, even-toned, resilient skin barrier restored under Dr. Vaishnavi Gayake’s care.', color: '#059669' }
];

const journeyStepsData = [
  { num: '01', title: 'Book Consultation', desc: 'Reserve online or via WhatsApp (8390020346) for your preferred suite slot in Kannad.' },
  { num: '02', title: 'Skin Analysis', desc: 'Digital dermoscopy, trichoscopy & AI biomarker assessment of hydration, pigment, and pores.' },
  { num: '03', title: 'Doctor Consultation', desc: 'Unhurried one-on-one evaluation with Dr. Vaishnavi Gayake.' },
  { num: '04', title: 'Treatment Plan', desc: 'Custom phased protocol combining clinical dermatology, lasers, or cosmetology.' },
  { num: '05', title: 'Treatment Sessions', desc: 'Performed in hygienic private suites using US-FDA certified platforms.' },
  { num: '06', title: 'After Care', desc: 'Tailored barrier-repair skincare & A4 prescription guidance.' },
  { num: '07', title: 'Follow Up', desc: 'Progress tracking and maintenance rituals for lasting luminosity.' }
];

const transformationCases = [
  {
    title: 'Acne Scar Remodeling',
    sessions: '4 Sessions • Fractional RF + PRP',
    notes: 'Illustrative dermal remodeling demonstrating softened atrophic scar depth, refined pore architecture, and restored epidermal luminosity.',
    beforeSvg: `<svg class="w-full h-full object-cover" viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice"><rect width="600" height="360" fill="#B8836A"/><g opacity="0.55"><ellipse cx="185" cy="142" rx="18" ry="12" fill="#6E3524"/><ellipse cx="242" cy="178" rx="22" ry="14" fill="#5E2B1C"/><ellipse cx="295" cy="134" rx="15" ry="10" fill="#6E3524"/><ellipse cx="348" cy="196" rx="20" ry="13" fill="#5E2B1C"/></g><text x="50%" y="88%" text-anchor="middle" fill="#FFF" fill-opacity="0.9" font-size="12" letter-spacing="1.5" font-family="sans-serif">BASELINE ATROPHIC SCARS &amp; TEXTURE</text></svg>`,
    afterSvg: `<svg class="w-full h-full object-cover" viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice"><rect width="600" height="360" fill="#E4BE9F"/><circle cx="300" cy="165" r="150" fill="#FFF" fill-opacity="0.26"/><text x="50%" y="88%" text-anchor="middle" fill="#11241E" font-size="12" letter-spacing="1.5" font-weight="700" font-family="sans-serif">SMOOTHED COLLAGEN &amp; LUMINOUS BARRIER</text></svg>`
  },
  {
    title: 'Melasma & Tone Clarity',
    sessions: '5 Sessions • Pico-Laser + Cellular Peel',
    notes: 'Illustrative melanin dispersion demonstrating visibly softened malar hyperpigmentation and luminous, uniform epidermal tone.',
    beforeSvg: `<svg class="w-full h-full object-cover" viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice"><rect width="600" height="360" fill="#C4967B"/><path d="M135 152C165 112 242 122 268 166C292 210 212 245 158 220Z" fill="#6B3E2A" fill-opacity="0.6"/><path d="M338 148C376 118 450 132 465 176C480 220 410 245 360 215Z" fill="#6B3E2A" fill-opacity="0.58"/><text x="50%" y="88%" text-anchor="middle" fill="#FFF" fill-opacity="0.9" font-size="12" letter-spacing="1.5" font-family="sans-serif">MALAR PIGMENTATION &amp; MELASMA</text></svg>`,
    afterSvg: `<svg class="w-full h-full object-cover" viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice"><rect width="600" height="360" fill="#E8C7B0"/><circle cx="300" cy="170" r="160" fill="#FFF" fill-opacity="0.32"/><text x="50%" y="88%" text-anchor="middle" fill="#11241E" font-size="12" letter-spacing="1.5" font-weight="700" font-family="sans-serif">EVEN SKIN TONE &amp; RADIANT CLARITY</text></svg>`
  },
  {
    title: 'Follicular Hair Density',
    sessions: '4 Months • Exosome + PRP Trichology',
    notes: 'Illustrative vertex density restoration highlighting thicker terminal hair shafts, revitalized follicles, and reduced scalp visibility.',
    beforeSvg: `<svg class="w-full h-full object-cover" viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice"><rect width="600" height="360" fill="#D5B39E"/><circle cx="300" cy="175" r="95" fill="#E6CBB9"/><text x="50%" y="88%" text-anchor="middle" fill="#11241E" font-size="12" letter-spacing="1.5" font-weight="700" font-family="sans-serif">SCALP THINNING &amp; MINIATURIZATION</text></svg>`,
    afterSvg: `<svg class="w-full h-full object-cover" viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice"><rect width="600" height="360" fill="#11241E"/><g stroke="#D9C293" stroke-width="2.5" stroke-opacity="0.55"><line x1="160" y1="60" x2="190" y2="300"/><line x1="220" y1="50" x2="240" y2="310"/><line x1="280" y1="45" x2="290" y2="315"/><line x1="340" y1="50" x2="325" y2="310"/><line x1="400" y1="60" x2="375" y2="300"/><line x1="450" y1="70" x2="425" y2="290"/></g><text x="50%" y="88%" text-anchor="middle" fill="#D9C293" font-size="12" letter-spacing="1.5" font-weight="700" font-family="sans-serif">DENSE FOLLICLES &amp; REVITALIZED COVERAGE</text></svg>`
  }
];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  seedInitialClinicData();
  const page = document.body.getAttribute('data-page');

  if (page === 'patient') {
    const wizDate = document.getElementById('wizDate');
    if (wizDate) {
      const today = new Date().toISOString().split('T')[0];
      wizDate.min = today;
      wizDate.value = today;
    }

    initSpotlightAndMagneticButtons();
    initAmbientGoldenParticles();
    renderAiMetrics({
      hydration: 78,
      pigmentation: 82,
      acne: 88,
      wrinkles: 86,
      pores: 81,
      oil: 85,
      score: 84,
      rec: '03 • Hydra-Infusion Glass Skin + Pico-Laser Toning'
    });
    initThreeJs3DFace();
    renderFaceHotspotsUI();
    selectFaceHotspot(0);
    renderSkinStagesUI();
    selectSkinStage(0);
    renderPatientJourney();
    selectCase(0);
    initBeforeAfterSlider();
    renderWizardTreatments();
    initGsapScrollStorytelling();
  }

  if (page === 'admin') {
    const followUpInput = document.getElementById('rxFollowUpDate');
    if (followUpInput) {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 15);
      followUpInput.value = nextDate.toISOString().split('T')[0];
    }
    renderQuickMedChips();
    syncLiveRxPreview();
    refreshAdminDashboard();
  }

  syncClinicDataFromServer();
  if (window.lucide) lucide.createIcons();
});

// ==================== STORAGE HELPERS ====================
function seedInitialClinicData() {
  const todayStr = new Date().toISOString().split('T')[0];
  if (!localStorage.getItem(STORAGE_KEY_APPTS)) {
    localStorage.setItem(STORAGE_KEY_APPTS, JSON.stringify([
      { passId: 'SCH-4812', name: 'Ananya Kulkarni', phone: '9823044120', protocol: '01 • Medical Acne & Scar Remodeling', date: todayStr, slot: 'Morning Suite (10:30 AM – 1:30 PM)', notes: '26 / F • Cheek acne scars', fee: 2500, status: 'Confirmed' },
      { passId: 'SCH-5190', name: 'Rohan Deshmukh', phone: '9765411890', protocol: '05 • PRP & Exosome Hair Restoration', date: todayStr, slot: 'Evening Suite (5:30 PM – 8:30 PM)', notes: '32 / M • Hair thinning', fee: 4500, status: 'Pending' }
    ]));
  }
  if (!localStorage.getItem(STORAGE_KEY_RX)) {
    localStorage.setItem(STORAGE_KEY_RX, JSON.stringify([]));
  }
}

function getAppointments() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_APPTS)) || []; } catch (e) { return []; }
}
function saveAppointments(list) {
  localStorage.setItem(STORAGE_KEY_APPTS, JSON.stringify(list));
}
function getPrescriptions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_RX)) || []; } catch (e) { return []; }
}
function savePrescriptions(list) {
  localStorage.setItem(STORAGE_KEY_RX, JSON.stringify(list));
}
function generateRxCode() {
  return 'RX-' + Math.floor(1000 + Math.random() * 9000);
}

// ==================== SPOTLIGHT, MAGNETIC & PARTICLES ====================
function initSpotlightAndMagneticButtons() {
  const spotlight = document.getElementById('cursorSpotlight');
  window.addEventListener('mousemove', (e) => {
    if (spotlight) {
      spotlight.style.left = e.clientX + 'px';
      spotlight.style.top = e.clientY + 'px';
    }
  });

  document.querySelectorAll('.magnetic-btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.22;
      const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.22;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });

  document.querySelectorAll('.tilt-card-3d').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
      const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  });
}

function initAmbientGoldenParticles() {
  const canvas = document.getElementById('ambientParticlesCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: 38 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 0.6,
    vy: Math.random() * 0.3 + 0.1,
    vx: (Math.random() - 0.5) * 0.22,
    alpha: Math.random() * 0.45 + 0.15
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.y -= p.vy;
      p.x += p.vx;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(191, 160, 101, ${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// ==================== 1. AI SKIN ANALYZER (WITH AUTO CAMERA OFF) ====================
function renderAiMetrics(data) {
  const grid = document.getElementById('aiMetricsGrid');
  if (!grid) return;

  const metrics = [
    { label: 'Hydration', val: data.hydration },
    { label: 'Pigmentation Clarity', val: data.pigmentation },
    { label: 'Acne Calm Index', val: data.acne },
    { label: 'Fine Lines / Wrinkles', val: data.wrinkles },
    { label: 'Pore Refinement', val: data.pores },
    { label: 'Oil Balance', val: data.oil }
  ];

  const scoreEl = document.getElementById('aiOverallScore');
  const recEl = document.getElementById('aiRecommendedProtocol');
  if (scoreEl) scoreEl.innerHTML = `${data.score} <span class="text-sm text-gold-light">/ 100</span>`;
  if (recEl) recEl.textContent = data.rec;

  grid.innerHTML = metrics.map((m) => `
    <div class="p-3.5 rounded-2xl bg-white border border-stoneBorder space-y-2 shadow-sm">
      <div class="flex items-center justify-between text-xs">
        <span class="text-obsidian font-semibold">${m.label}</span>
        <strong class="text-sky-700 font-mono">${m.val}%</strong>
      </div>
      <div class="w-full h-1.5 rounded-full bg-alabasterCard overflow-hidden">
        <div class="h-full rounded-full bg-gradient-to-r from-sky-600 to-gold transition-all duration-700" style="width:${m.val}%"></div>
      </div>
    </div>
  `).join('');
}

function handleAiPhotoUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = document.getElementById('aiUploadedImg');
    const video = document.getElementById('aiLiveVideo');
    if (video) {
      video.classList.add('hidden');
      stopAiCameraStream();
    }
    if (img) {
      img.src = ev.target.result;
      img.classList.remove('hidden');
    }
    hasFaceOrPhotoInput = true;
    runAiScanAfterInput('PHOTO DETECTED — ANALYZING SKIN...');
  };
  reader.readAsDataURL(file);
}

async function runSimulatedAiScan() {
  const badge = document.getElementById('aiScanStatusBadge');
  const video = document.getElementById('aiLiveVideo');
  const img = document.getElementById('aiUploadedImg');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (badge) {
      badge.innerHTML = `<span class="text-amber-300">CAMERA NOT SUPPORTED — UPLOAD PHOTO FIRST</span><span>NO FACE</span>`;
    }
    return;
  }

  try {
    if (badge) {
      badge.innerHTML = `<span class="animate-pulse">STARTING LIVE CAMERA FOR FACE SCAN...</span><span>CAMERA</span>`;
    }
    aiMediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    if (img) img.classList.add('hidden');
    if (video) {
      video.srcObject = aiMediaStream;
      video.classList.remove('hidden');
    }
    hasFaceOrPhotoInput = true;
    runAiScanAfterInput('LIVE FACE STREAM ACTIVE — SCANNING...');
  } catch (err) {
    hasFaceOrPhotoInput = false;
    if (badge) {
      badge.innerHTML = `<span class="text-red-300">NO FACE / CAMERA BLOCKED — UPLOAD PHOTO</span><span>NO RESULT</span>`;
    }
  }
}

function stopAiCameraStream() {
  if (aiMediaStream) {
    aiMediaStream.getTracks().forEach((track) => track.stop());
    aiMediaStream = null;
  }
}

function runAiScanAfterInput(activeLabel) {
  const badge = document.getElementById('aiScanStatusBadge');
  const video = document.getElementById('aiLiveVideo');
  const img = document.getElementById('aiUploadedImg');

  if (!hasFaceOrPhotoInput) {
    if (badge) badge.innerHTML = `<span class="text-amber-300">PLEASE UPLOAD PHOTO OR START LIVE CAMERA</span><span>LOCKED</span>`;
    return;
  }

  if (badge) badge.innerHTML = `<span class="animate-pulse">${activeLabel}</span><span class="text-sky-300">SCANNING</span>`;

  setTimeout(() => {
    if (video && !video.classList.contains('hidden') && video.videoWidth > 0 && img) {
      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = video.videoWidth;
      snapCanvas.height = video.videoHeight;
      snapCanvas.getContext('2d').drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
      img.src = snapCanvas.toDataURL('image/png');
      img.classList.remove('hidden');
      video.srcObject = null;
      video.classList.add('hidden');
    }

    stopAiCameraStream();

    let seed = 82;
    try {
      if (img && img.complete && img.naturalWidth > 0) {
        const c = document.createElement('canvas');
        c.width = 24;
        c.height = 24;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, 24, 24);
        const data = ctx.getImageData(0, 0, 24, 24).data;
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
        seed = Math.round(sum / (data.length / 4));
      }
    } catch (e) {}

    const clamp = (v) => Math.max(68, Math.min(95, Math.round(v)));
    const hydration = clamp(72 + (seed % 20));
    const pigmentation = clamp(70 + ((seed * 3) % 21));
    const acne = clamp(75 + ((seed * 5) % 19));
    const wrinkles = clamp(78 + ((seed * 7) % 17));
    const pores = clamp(73 + ((seed * 2) % 19));
    const oil = clamp(74 + ((seed * 4) % 18));
    const score = Math.round((hydration + pigmentation + acne + wrinkles + pores + oil) / 6);
    const rec = pigmentation < 78
      ? '07 • Pico-Laser Pigmentation & Rejuvenation (Preliminary AI Preview — Clinical Exam by Dr. Vaishnavi Gayake Recommended)'
      : '03 • Hydra-Infusion Glass Skin Ritual (Preliminary AI Preview — Clinical Exam by Dr. Vaishnavi Gayake Recommended)';

    renderAiMetrics({ hydration, pigmentation, acne, wrinkles, pores, oil, score, rec });
    if (badge) {
      badge.innerHTML = `<span class="text-emerald-300">PRELIMINARY PREVIEW COMPLETE • CAMERA OFF</span><span class="text-gold-light">SCORE: ${score}/100</span>`;
    }
  }, 1400);
}

// ==================== 2. INTERACTIVE LUXURY FACE & TRICHOLOGY ZONE MAP ====================
function initThreeJs3DFace() {
  const container = document.getElementById('threeFaceContainer');
  if (!container) return;

  const points = [
    { x: 200, y: 175, label: 'Acne' },
    { x: 148, y: 222, label: 'Pigmentation' },
    { x: 162, y: 196, label: 'Dark Circles' },
    { x: 256, y: 168, label: 'Fine Lines' },
    { x: 200, y: 84,  label: 'Hair Loss' },
    { x: 252, y: 232, label: 'Scars' },
    { x: 200, y: 274, label: 'Lips' },
    { x: 164, y: 312, label: 'Jawline' }
  ];

  container.innerHTML = `
    <svg viewBox="0 0 400 400" class="w-full h-full max-h-[460px] select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="faceAuraGlow" cx="50%" cy="48%" r="46%">
          <stop offset="0%" stop-color="#D9C293" stop-opacity="0.28"/>
          <stop offset="65%" stop-color="#38BDF8" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#0B1814" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="goldContour" x1="120" y1="70" x2="280" y2="350" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#F0D89E"/>
          <stop offset="50%" stop-color="#BFA065"/>
          <stop offset="100%" stop-color="#38BDF8"/>
        </linearGradient>
      </defs>

      <circle cx="200" cy="200" r="175" fill="url(#faceAuraGlow)"/>
      <circle cx="200" cy="200" r="162" stroke="#D9C293" stroke-opacity="0.24" stroke-width="1" stroke-dasharray="4 6"/>
      <circle cx="200" cy="200" r="132" stroke="#38BDF8" stroke-opacity="0.18" stroke-width="0.9"/>

      <path d="M126 178C122 122 152 80 200 80C248 80 278 122 274 178" stroke="#F0D89E" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M138 162C146 116 170 98 200 98C230 98 254 116 262 162" stroke="#D9C293" stroke-opacity="0.45" stroke-width="1" stroke-dasharray="3 3"/>

      <path d="M132 172C132 232 152 296 200 326C248 296 268 232 268 172" stroke="url(#goldContour)" stroke-width="2" stroke-linecap="round"/>
      <path d="M164 312V352C146 362 126 368 108 372M236 312V352C254 362 274 368 292 372" stroke="#D9C293" stroke-opacity="0.45" stroke-width="1.4" stroke-linecap="round"/>

      <path d="M148 166C160 158 176 159 186 165M214 165C224 159 240 158 252 166" stroke="#F0D89E" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M152 180C162 173 176 173 184 180C176 186 162 186 152 180Z" stroke="#FBF9F5" stroke-opacity="0.88" stroke-width="1.3"/>
      <circle cx="168" cy="180" r="3.5" fill="#F0D89E"/>
      <path d="M216 180C224 173 238 173 248 180C238 186 224 186 216 180Z" stroke="#FBF9F5" stroke-opacity="0.88" stroke-width="1.3"/>
      <circle cx="232" cy="180" r="3.5" fill="#F0D89E"/>

      <path d="M200 174V228C194 232 189 231 187 228M200 228C206 232 211 231 213 228" stroke="#F0D89E" stroke-opacity="0.85" stroke-width="1.4" stroke-linecap="round"/>

      <path d="M177 272C186 266 194 267 200 270C206 267 214 266 223 272C213 282 187 282 177 272Z" stroke="#F0D89E" stroke-width="1.5" fill="#BFA065" fill-opacity="0.16"/>
      <path d="M179 272H221" stroke="#FBF9F5" stroke-opacity="0.5" stroke-width="0.9"/>

      ${points.map((pt, idx) => `
        <g onclick="selectFaceHotspot(${idx})" class="cursor-pointer group" role="button" tabindex="0" aria-label="${pt.label}">
          <circle id="svg-ring-${idx}" cx="${pt.x}" cy="${pt.y}" r="14" fill="#D9C293" fill-opacity="0.2" stroke="#F0D89E" stroke-width="1.2"/>
          <circle id="svg-dot-${idx}" cx="${pt.x}" cy="${pt.y}" r="5.5" fill="#38BDF8" stroke="#0B1814" stroke-width="1.5"/>
          <rect x="${pt.x - 42}" y="${pt.y - 29}" width="84" height="17" rx="8.5" fill="#0B1814" fill-opacity="0.92" stroke="#D9C293" stroke-opacity="0.6" stroke-width="0.8"/>
          <text x="${pt.x}" y="${pt.y - 18}" text-anchor="middle" fill="#FBF9F5" font-size="8.5" font-weight="600" letter-spacing="0.4" font-family="sans-serif">${pt.label}</text>
        </g>
      `).join('')}
    </svg>
  `;
}

function renderFaceHotspotsUI() {
  const wrap = document.getElementById('faceHotspotButtons');
  if (!wrap) return;
  wrap.innerHTML = faceHotspotsData.map((h, idx) => `
    <button type="button" onclick="selectFaceHotspot(${idx})" id="fhs-btn-${idx}" class="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-stoneBorder bg-white text-obsidian hover:border-gold transition">
      ${h.label}
    </button>
  `).join('');
}

function selectFaceHotspot(idx) {
  const item = faceHotspotsData[idx];
  if (!item) return;

  faceHotspotsData.forEach((_, i) => {
    const btn = document.getElementById(`fhs-btn-${i}`);
    if (btn) {
      btn.className = i === idx
        ? 'px-3.5 py-1.5 rounded-full text-xs font-bold bg-obsidian text-gold-light border border-gold shadow'
        : 'px-3.5 py-1.5 rounded-full text-xs font-semibold border border-stoneBorder bg-white text-obsidian hover:border-gold transition';
    }

    const ring = document.getElementById(`svg-ring-${i}`);
    const dot = document.getElementById(`svg-dot-${i}`);
    if (ring && dot) {
      ring.setAttribute('r', i === idx ? '18' : '13');
      ring.setAttribute('fill', i === idx ? '#F0D89E' : '#38BDF8');
      ring.setAttribute('fill-opacity', i === idx ? '0.38' : '0.16');
      dot.setAttribute('fill', i === idx ? '#F0D89E' : '#38BDF8');
      dot.setAttribute('r', i === idx ? '7' : '5');
    }
  });

  document.getElementById('hotspotZoneBadge').textContent = item.zone;
  document.getElementById('hotspotTitle').textContent = item.title;
  document.getElementById('hotspotDesc').textContent = item.desc;
  document.getElementById('hotspotTreatment').textContent = item.treatment;
}

// ==================== 3. SKIN LAYER SCIENCE (6 STAGES) ====================
function renderSkinStagesUI() {
  const list = document.getElementById('skinStagesList');
  if (!list) return;
  list.innerHTML = skinStagesData.map((s, idx) => `
    <button type="button" onclick="selectSkinStage(${idx})" id="skin-stage-btn-${idx}" class="w-full text-left p-4 rounded-2xl glass-luxury border border-stoneBorder hover:border-gold flex items-center gap-4 transition">
      <span class="w-9 h-9 rounded-xl bg-obsidian text-gold-light border border-gold/40 font-mono text-xs font-bold flex items-center justify-center shrink-0">${s.step}</span>
      <div>
        <strong class="text-obsidian text-sm font-semibold block">${s.name}</strong>
        <span class="text-xs text-mutedInk">${s.desc}</span>
      </div>
    </button>
  `).join('');
}

function selectSkinStage(idx) {
  const stage = skinStagesData[idx];
  if (!stage) return;

  skinStagesData.forEach((_, i) => {
    const b = document.getElementById(`skin-stage-btn-${i}`);
    if (!b) return;
    b.className = i === idx
      ? 'w-full text-left p-4 rounded-2xl bg-obsidian text-white border border-gold flex items-center gap-4 shadow-lg transition'
      : 'w-full text-left p-4 rounded-2xl glass-luxury border border-stoneBorder hover:border-gold flex items-center gap-4 transition';
    const titleEl = b.querySelector('strong');
    const descEl = b.querySelector('span.text-xs');
    if (titleEl) titleEl.className = i === idx ? 'text-gold-light text-sm font-semibold block' : 'text-obsidian text-sm font-semibold block';
    if (descEl) descEl.className = i === idx ? 'text-xs text-ivorySilk/80' : 'text-xs text-mutedInk';
  });

  const visual = document.getElementById('skinLayerStageVisual');
  visual.innerHTML = `
    <svg class="w-full h-full" viewBox="0 0 480 280" fill="none">
      <path d="M50 85L240 40L430 85L240 130Z" fill="${stage.color}" fill-opacity="0.38" stroke="${stage.color}" stroke-width="1.8"/>
      <path d="M50 135L240 90L430 135L240 180Z" fill="#BFA065" fill-opacity="0.24" stroke="#D9C293" stroke-width="1.4"/>
      <path d="M50 185L240 140L430 185L240 230Z" fill="#152B23" stroke="#BFA065" stroke-width="1.2"/>
      <text x="240" y="258" text-anchor="middle" fill="#D9C293" font-size="13" font-weight="600" letter-spacing="1.2">${stage.step}. ${stage.name.toUpperCase()}</text>
    </svg>
  `;
}

// ==================== 7 & 8. PATIENT JOURNEY TIMELINE ====================
function renderPatientJourney() {
  const container = document.getElementById('patientJourneyTimeline');
  if (!container) return;
  container.innerHTML = journeyStepsData.map((j) => `
    <div class="relative rounded-2xl glass-luxury p-5 border border-stoneBorder hover:border-gold transition">
      <span class="absolute -left-[45px] top-5 w-7 h-7 rounded-full bg-obsidian border-2 border-gold text-gold-light font-mono text-[11px] font-bold flex items-center justify-center">${j.num}</span>
      <h3 class="font-display text-2xl text-obsidian font-semibold">${j.title}</h3>
      <p class="text-xs sm:text-sm text-mutedInk mt-1">${j.desc}</p>
    </div>
  `).join('');
}

// ==================== 4. BEFORE & AFTER SLIDER & ZOOM ====================
function selectCase(idx) {
  activeCaseIdx = idx;
  const item = transformationCases[idx];
  if (!item) return;

  [0, 1, 2].forEach((i) => {
    const btn = document.getElementById(`case-btn-${i}`);
    if (!btn) return;
    btn.className = i === idx
      ? 'case-btn px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold bg-obsidian text-gold-light border border-gold'
      : 'case-btn px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold bg-ivorySilk text-obsidian border border-stoneBorder';
  });

  document.getElementById('baBeforeVisual').innerHTML = item.beforeSvg;
  document.getElementById('baAfterVisual').innerHTML = item.afterSvg;
  document.getElementById('caseTitle').textContent = item.title;
  document.getElementById('caseSessions').textContent = item.sessions;
  document.getElementById('caseNotes').textContent = item.notes;
}

function toggleBaZoom() {
  baZoomed = !baZoomed;
  const beforeEl = document.getElementById('baBeforeVisual');
  const afterEl = document.getElementById('baAfterVisual');
  if (beforeEl) beforeEl.style.transform = baZoomed ? 'scale(1.3)' : 'scale(1)';
  if (afterEl) afterEl.style.transform = baZoomed ? 'scale(1.3)' : 'scale(1)';
  const btn = document.getElementById('baZoomBtn');
  if (btn) btn.textContent = baZoomed ? '− Reset Zoom' : '+ Magnify 1.35x';
}

function initBeforeAfterSlider() {
  const container = document.getElementById('baContainer');
  const beforeWrapper = document.getElementById('baBeforeWrapper');
  const handle = document.getElementById('baHandle');
  if (!container || !beforeWrapper || !handle) return;

  let dragging = false;
  const moveSlider = (clientX) => {
    const rect = container.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(5, Math.min(95, pct));
    beforeWrapper.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left = `${pct}%`;
  };

  container.addEventListener('mousedown', (e) => { dragging = true; moveSlider(e.clientX); });
  window.addEventListener('mouseup', () => { dragging = false; });
  window.addEventListener('mousemove', (e) => { if (dragging) moveSlider(e.clientX); });
  container.addEventListener('touchmove', (e) => { if (e.touches[0]) moveSlider(e.touches[0].clientX); }, { passive: true });
}

function openVideoStoryModal(title, body) {
  document.getElementById('videoStoryTitle').textContent = title;
  document.getElementById('videoStoryBody').textContent = body;
  document.getElementById('videoStoryModal').classList.remove('hidden');
}

// ==================== 5. MULTI-STEP LUXURY BOOKING + CONFETTI ====================
function renderWizardTreatments() {
  const wrap = document.getElementById('wizardTreatmentCards');
  if (!wrap) return;
  wrap.innerHTML = wizardProtocolsList.map((p) => {
    const active = p === selectedWizardProtocol;
    return `
      <button type="button" onclick="chooseWizardProtocol('${p.replace(/'/g, "\\'")}')" class="text-left p-3.5 rounded-2xl border text-xs transition ${active ? 'bg-obsidian text-gold-light border-gold font-bold shadow' : 'bg-ivorySilk border-stoneBorder text-obsidian font-semibold hover:border-gold'}">
        ${escapeHtml(p)}
      </button>
    `;
  }).join('');
}

function chooseWizardProtocol(p) {
  selectedWizardProtocol = p;
  renderWizardTreatments();
}

function goWizardStep(stepNum) {
  [1, 2, 3, 4].forEach((n) => {
    document.getElementById(`wiz-step-${n}`)?.classList.toggle('hidden', n !== stepNum);
    const ind = document.getElementById(`wiz-ind-${n}`);
    if (ind) ind.className = n <= stepNum ? 'text-obsidian font-bold' : 'text-mutedInk';
  });
}

function finalizeLuxuryBooking() {
  const name = document.getElementById('wizName').value.trim();
  const phone = document.getElementById('wizPhone').value.trim();
  const date = document.getElementById('wizDate').value;
  const slot = document.getElementById('wizSlot').value;
  const notes = document.getElementById('wizNotes').value.trim();

  if (!name || phone.replace(/\D/g, '').length < 10) {
    alert('Please enter your Full Name and valid 10-digit Phone / WhatsApp number.');
    return;
  }

  const existingCount = getAppointments().filter((a) => a.date === date && a.slot === slot && a.status !== 'Cancelled').length;
  if (existingCount >= 3) {
    const proceed = confirm(`Note: ${existingCount} consultations are already scheduled for ${date} (${slot}). Do you still want to request a priority slot?`);
    if (!proceed) return;
  }

  const passId = 'SCH-' + Math.floor(1000 + Math.random() * 9000);
  const apptObj = {
    passId,
    name,
    phone,
    protocol: selectedWizardProtocol,
    date,
    slot,
    notes,
    fee: protocolFeeMap[selectedWizardProtocol] || 800,
    status: 'Pending'
  };

  latestPassData = apptObj;

  const list = getAppointments();
  list.unshift(apptObj);
  saveAppointments(list);
  postAppointmentToServer(apptObj);

  document.getElementById('wizPassId').textContent = `#${passId}`;
  document.getElementById('wizPassSummary').innerHTML = `
    <div><span class="text-gold-light block text-[10px] uppercase">Patient</span><strong>${escapeHtml(name)}</strong></div>
    <div><span class="text-gold-light block text-[10px] uppercase">Phone</span><strong>${escapeHtml(phone)}</strong></div>
    <div class="sm:col-span-2"><span class="text-gold-light block text-[10px] uppercase">Protocol</span><strong>${escapeHtml(selectedWizardProtocol)}</strong></div>
    <div><span class="text-gold-light block text-[10px] uppercase">Date &amp; Slot</span><strong>${escapeHtml(date)} • ${escapeHtml(slot)}</strong></div>
  `;

  goWizardStep(4);
  if (window.confetti) {
    confetti({ particleCount: 85, spread: 70, origin: { y: 0.65 }, colors: ['#BFA065', '#D9C293', '#11241E', '#FBF9F5'] });
  }
}

function confirmPassViaWhatsApp() {
  if (!latestPassData) return;
  const { passId, name, phone, protocol, date, slot } = latestPassData;
  const msg = `SIYA COSMODERMA HUB CLINIC — PASS #${passId}\nDoctor: Dr. Vaishnavi Gayake\nPatient: ${name}\nPhone: ${phone}\nProtocol: ${protocol}\nDate: ${date}\nSlot: ${slot}`;
  window.open(`https://wa.me/${CLINIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
}

function openWhatsAppConcierge() {
  const msg = 'Greetings Siya Cosmoderma Hub Clinic (Dr. Vaishnavi Gayake), Kannad — I would like to book a consultation.';
  window.open(`https://wa.me/${CLINIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
}

// ==================== 12. GSAP SCROLL STORYTELLING ====================
function initGsapScrollStorytelling() {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.from('.hero-stagger', {
    y: 24,
    opacity: 0,
    duration: 0.85,
    stagger: 0.12,
    ease: 'power3.out'
  });

  gsap.utils.toArray('section').forEach((sec) => {
    if (sec.id === 'scene-hero') return;
    gsap.from(sec, {
      y: 26,
      opacity: 0.4,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: sec,
        start: 'top 86%',
        once: true
      }
    });
  });
}

// ==================== ADMIN PORTAL & A4 RX STUDIO (admin.html) ====================
async function handleAdminPinUnlock(e) {
  e.preventDefault();
  const pin = document.getElementById('adminPinInput').value.trim();
  

 let ok = (pin === '1234');

  if (!ok) {
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      if (res.ok) ok = true;
    } catch (err) {}
  }

  if (ok) {
    document.getElementById('pinErrorMsg').classList.add('hidden');
    document.getElementById('adminPinGate').classList.add('hidden');
    document.getElementById('adminDashboardContent').classList.remove('hidden');
    await syncClinicDataFromServer();
    refreshAdminDashboard();
    if (window.lucide) lucide.createIcons();
  } else {
    document.getElementById('pinErrorMsg').classList.remove('hidden');
  }
}

function lockAdminPortal() {
  document.getElementById('adminDashboardContent').classList.add('hidden');
  document.getElementById('adminPinGate').classList.remove('hidden');
}

function switchAdminTab(tabName) {
  ['appointments', 'rxStudio', 'rxArchive'].forEach((t) => {
    document.getElementById(`adminPanel-${t}`)?.classList.toggle('hidden', t !== tabName);
    const btn = document.getElementById(`adminTab-${t}`);
    if (btn) {
      btn.className = t === tabName
        ? 'admin-subtab px-6 py-3 rounded-full text-xs uppercase tracking-[0.15em] font-semibold bg-obsidian text-gold-light border border-gold/50 shadow-md inline-flex items-center gap-2 transition'
        : 'admin-subtab px-6 py-3 rounded-full text-xs uppercase tracking-[0.15em] font-semibold bg-white text-obsidian border border-stoneBorder hover:border-gold inline-flex items-center gap-2 transition';
    }
  });
  if (tabName === 'appointments') renderAdminAppointments();
  if (tabName === 'rxArchive') renderRxArchive();
  if (tabName === 'rxStudio') syncLiveRxPreview();
  if (window.lucide) lucide.createIcons();
}

function refreshAdminDashboard() {
  const totalEl = document.getElementById('kpiTotalAppts');
  if (!totalEl) return;
  const appts = getAppointments();
  const rxs = getPrescriptions();
  totalEl.textContent = appts.length;
  document.getElementById('kpiPendingAppts').textContent = appts.filter((a) => a.status === 'Pending').length;
  document.getElementById('kpiTotalRx').textContent = rxs.length;
  const rev = appts.filter((a) => a.status !== 'Cancelled').reduce((s, a) => s + (Number(a.fee) || 800), 0);
  document.getElementById('kpiRevenue').textContent = '₹' + rev.toLocaleString('en-IN');
  renderAdminAppointments();
  renderRxArchive();
}

async function updateAppointmentStatus(passId, newStatus) {
  const list = getAppointments();
  const idx = list.findIndex((a) => a.passId === passId);
  if (idx === -1) return;
  list[idx].status = newStatus;
  saveAppointments(list);
  refreshAdminDashboard();

  try {
    await fetch(`/api/appointments/${encodeURIComponent(passId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
  } catch (e) {}
}

function renderAdminAppointments() {
  const tbody = document.getElementById('adminAppointmentsTbody');
  if (!tbody) return;
  const q = (document.getElementById('apptSearchInput')?.value || '').toLowerCase();
  const st = document.getElementById('apptStatusFilter')?.value || 'all';
  const rows = getAppointments().filter((a) =>
    (st === 'all' || a.status === st) &&
    (a.name.toLowerCase().includes(q) || a.phone.toLowerCase().includes(q) || a.passId.toLowerCase().includes(q))
  );

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-mutedInk italic">No appointments found.</td></tr>`;
    return;
  }

  const statusStyles = {
    Pending: 'bg-amber-50 text-amber-800 border-amber-300',
    Confirmed: 'bg-sky-50 text-sky-800 border-sky-300',
    Completed: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    Cancelled: 'bg-red-50 text-red-700 border-red-300'
  };

  tbody.innerHTML = rows.map((a) => `
    <tr class="hover:bg-ivorySilk/70">
      <td class="py-4 px-5 font-mono font-bold text-obsidian">#${escapeHtml(a.passId)}</td>
      <td class="py-4 px-5"><strong>${escapeHtml(a.name)}</strong><div class="text-xs text-mutedInk">${escapeHtml(a.phone)}</div></td>
      <td class="py-4 px-5">${escapeHtml(a.protocol)}</td>
      <td class="py-4 px-5">${escapeHtml(a.date)}<div class="text-xs text-mutedInk">${escapeHtml(a.slot)}</div></td>
      <td class="py-4 px-5 font-semibold">₹${(Number(a.fee) || 800).toLocaleString('en-IN')}</td>
      <td class="py-4 px-5">
        <select onchange="updateAppointmentStatus('${escapeHtml(a.passId)}', this.value)" class="px-2.5 py-1 rounded-full border text-xs font-semibold cursor-pointer ${statusStyles[a.status] || statusStyles.Pending}">
          ${['Pending', 'Confirmed', 'Completed', 'Cancelled'].map((s) => `<option value="${s}" ${a.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
      <td class="py-4 px-5 text-right space-x-1">
        <button type="button" onclick="launchRxForPatient('${escapeHtml(a.passId)}')" class="px-3 py-1.5 rounded-lg bg-obsidian text-gold-light text-xs font-semibold">Write Rx</button>
        <button type="button" onclick="deleteAppointment('${escapeHtml(a.passId)}')" class="px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs">Del</button>
      </td>
    </tr>
  `).join('');
}

function deleteAppointment(passId) {
  saveAppointments(getAppointments().filter((a) => a.passId !== passId));
  refreshAdminDashboard();
  deleteAppointmentOnServer(passId);
}

function openWalkInModal() { document.getElementById('walkInModal').classList.remove('hidden'); }
function closeWalkInModal() { document.getElementById('walkInModal').classList.add('hidden'); }

function handleWalkInSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('walkInName').value.trim();
  const phone = document.getElementById('walkInPhone').value.trim();
  const protocol = document.getElementById('walkInProtocol').value;
  const notes = document.getElementById('walkInNotes').value.trim();
  const walkInObj = {
    passId: 'SCH-' + Math.floor(1000 + Math.random() * 9000),
    name,
    phone,
    protocol,
    date: new Date().toISOString().split('T')[0],
    slot: 'Walk-In Priority OPD',
    notes,
    fee: protocolFeeMap[protocol] || 800,
    status: 'Confirmed'
  };
  const list = getAppointments();
  list.unshift(walkInObj);
  saveAppointments(list);
  postAppointmentToServer(walkInObj);
  e.target.reset();
  closeWalkInModal();
  refreshAdminDashboard();
}

function renderQuickMedChips() {
  const c = document.getElementById('quickMedChips');
  if (!c) return;
  c.innerHTML = quickDermatologyMeds.map((m, i) => `<button type="button" onclick="applyQuickMed(${i})" class="px-2.5 py-1 rounded-full bg-white hover:bg-obsidian text-obsidian hover:text-gold-light border border-stoneBorder text-[11px]">+ ${escapeHtml(m.label)}</button>`).join('');
}

function applyQuickMed(i) {
  const m = quickDermatologyMeds[i];
  if (!m) return;
  document.getElementById('medNameInput').value = m.name;
  document.getElementById('medFreqInput').value = m.freq;
  document.getElementById('medDurationInput').value = m.duration;
  document.getElementById('medInstructionInput').value = m.instruction;
}

function launchRxForPatient(passId) {
  const appt = getAppointments().find((a) => a.passId === passId);
  if (!appt) return;
  currentRxId = generateRxCode();
  draftMedications = [];
  document.getElementById('rxPatientName').value = appt.name;
  document.getElementById('rxPatientPhone').value = appt.phone;
  if (document.getElementById('rxLinkedBooking')) document.getElementById('rxLinkedBooking').value = '#' + appt.passId;
  document.getElementById('rxDiagnosis').value = appt.protocol;
  switchAdminTab('rxStudio');
  renderComposerMedList();
  syncLiveRxPreview();
}

function addMedicineToRx() {
  const name = document.getElementById('medNameInput').value.trim();
  if (!name) return;
  draftMedications.push({
    name,
    freq: document.getElementById('medFreqInput').value,
    duration: document.getElementById('medDurationInput').value.trim() || '15 Days',
    instruction: document.getElementById('medInstructionInput').value.trim() || 'As directed'
  });
  document.getElementById('medNameInput').value = '';
  renderComposerMedList();
  syncLiveRxPreview();
}

function removeMedicineFromRx(idx) {
  draftMedications.splice(idx, 1);
  renderComposerMedList();
  syncLiveRxPreview();
}

function renderComposerMedList() {
  const el = document.getElementById('composerMedList');
  if (!el) return;
  el.innerHTML = draftMedications.map((m, i) => `<div class="flex items-center justify-between px-3 py-2 rounded-xl bg-ivorySilk border border-stoneBorder text-xs"><span><strong>${escapeHtml(m.name)}</strong> (${escapeHtml(m.freq)})</span><button type="button" onclick="removeMedicineFromRx(${i})" class="text-red-600 font-bold">✕</button></div>`).join('');
}

function syncLiveRxPreview() {
  const rxIdEl = document.getElementById('previewRxId');
  if (!rxIdEl) return;
  rxIdEl.textContent = '#' + currentRxId;
  document.getElementById('previewPatientName').textContent = document.getElementById('rxPatientName')?.value.trim() || '[Enter Patient Name]';
  document.getElementById('previewAgeGender').textContent = document.getElementById('rxAgeGender')?.value.trim() || '—';
  document.getElementById('previewPhonePass').textContent = document.getElementById('rxPatientPhone')?.value.trim() || '—';
  document.getElementById('previewDiagnosis').textContent = document.getElementById('rxDiagnosis')?.value.trim() || '—';
  document.getElementById('previewAdvice').textContent = document.getElementById('rxAdvice')?.value.trim() || '';
  document.getElementById('previewFollowUp').textContent = document.getElementById('rxFollowUpDate')?.value || 'After 15 Days';

  const tbody = document.getElementById('previewMedTableBody');
  tbody.innerHTML = draftMedications.length
    ? draftMedications.map((m, i) => `<tr><td class="py-2.5 px-3">${i + 1}</td><td class="py-2.5 px-3 font-bold">${escapeHtml(m.name)}</td><td class="py-2.5 px-3">${escapeHtml(m.freq)}</td><td class="py-2.5 px-3">${escapeHtml(m.duration)}</td><td class="py-2.5 px-3">${escapeHtml(m.instruction)}</td></tr>`).join('')
    : `<tr><td colspan="5" class="py-6 text-center text-mutedInk italic">No medications added yet.</td></tr>`;
}

function saveAndPrintRx(doPrint) {
  const patientName = document.getElementById('rxPatientName').value.trim();
  if (!patientName) { alert('Please enter Patient Name.'); return; }
  const rec = {
    rxId: currentRxId,
    date: new Date().toISOString().split('T')[0],
    patientName,
    ageGender: document.getElementById('rxAgeGender')?.value.trim() || '—',
    phone: document.getElementById('rxPatientPhone')?.value.trim() || '—',
    diagnosis: document.getElementById('rxDiagnosis')?.value.trim() || 'Dermatology Evaluation',
    medications: [...draftMedications],
    advice: document.getElementById('rxAdvice')?.value.trim() || '',
    followUpDate: document.getElementById('rxFollowUpDate')?.value || 'After 15 Days'
  };
  const existing = getPrescriptions().filter((r) => r.rxId !== rec.rxId);
  existing.unshift(rec);
  savePrescriptions(existing);
  postPrescriptionToServer(rec);
  refreshAdminDashboard();
  if (doPrint) setTimeout(() => window.print(), 200);
}

function resetRxComposer() {
  currentRxId = generateRxCode();
  draftMedications = [];
  document.getElementById('rxPatientName').value = '';
  document.getElementById('rxDiagnosis').value = '';
  renderComposerMedList();
  syncLiveRxPreview();
}

function shareCurrentRxWhatsApp() {
  const p = document.getElementById('rxPatientName').value.trim() || 'Patient';
  const msg = `Siya Cosmoderma Hub Clinic — Rx #${currentRxId} for ${p} (Dr. Vaishnavi Gayake, Kannad)`;
  window.open(`https://wa.me/${CLINIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
}

function renderRxArchive() {
  const tbody = document.getElementById('rxArchiveTbody');
  if (!tbody) return;
  const q = (document.getElementById('rxArchiveSearchInput')?.value || '').toLowerCase().trim();
  const rxs = getPrescriptions().filter((r) =>
    !q ||
    (r.patientName || '').toLowerCase().includes(q) ||
    (r.phone || '').toLowerCase().includes(q) ||
    (r.diagnosis || '').toLowerCase().includes(q) ||
    (r.rxId || '').toLowerCase().includes(q)
  );

  tbody.innerHTML = rxs.length
    ? rxs.map((r) => `
      <tr class="hover:bg-ivorySilk/70">
        <td class="py-3.5 px-5 font-mono font-bold">#${escapeHtml(r.rxId)}</td>
        <td class="py-3.5 px-5 font-mono text-xs">${escapeHtml(r.date || '—')}</td>
        <td class="py-3.5 px-5 font-semibold">${escapeHtml(r.patientName)}<div class="text-[11px] text-mutedInk">${escapeHtml(r.phone || '')}</div></td>
        <td class="py-3.5 px-5">${escapeHtml(r.diagnosis || '—')}</td>
        <td class="py-3.5 px-5">${(r.medications || []).length} Item(s)</td>
        <td class="py-3.5 px-5 text-right space-x-1.5">
          <button type="button" onclick="openRxDetailsModal('${escapeHtml(r.rxId)}')" class="px-3 py-1.5 rounded-lg bg-obsidian text-gold-light border border-gold/40 hover:bg-obsidian-light text-xs font-semibold transition">
            View Details
          </button>
          <button type="button" onclick="repeatPrescriptionInStudio('${escapeHtml(r.rxId)}')" class="px-3 py-1.5 rounded-lg bg-gold-pale text-obsidian border border-gold text-xs font-semibold transition">
            Repeat Rx
          </button>
        </td>
      </tr>
    `).join('')
    : `<tr><td colspan="6" class="py-8 text-center text-mutedInk italic">No saved prescriptions yet.</td></tr>`;
}

function openRxDetailsModal(rxId) {
  const r = getPrescriptions().find((x) => x.rxId === rxId);
  const modal = document.getElementById('rxDetailsModal');
  if (!r || !modal) return;

  document.getElementById('detailRxBadge').textContent = `#${r.rxId}`;
  document.getElementById('detailPatientTitle').textContent = r.patientName || 'Patient';
  document.getElementById('detailVisitDate').textContent = r.date || '—';
  document.getElementById('detailPatientMeta').textContent = `${r.ageGender || '—'} • ${r.phone || '—'}`;
  document.getElementById('detailFollowUp').textContent = r.followUpDate || '—';
  document.getElementById('detailDiagnosis').textContent = r.diagnosis || 'Dermatology Evaluation';
  document.getElementById('detailAdvice').textContent = r.advice || 'Follow prescribed dosage and sunscreen/skincare routine as advised.';

  const medListEl = document.getElementById('detailMedList');
  const meds = Array.isArray(r.medications) ? r.medications : [];
  if (!meds.length) {
    medListEl.innerHTML = `<div class="p-3.5 rounded-xl bg-ivorySilk border border-stoneBorder text-xs text-mutedInk italic">No medicines recorded in this prescription.</div>`;
  } else {
    medListEl.innerHTML = meds.map((m, idx) => `
      <div class="p-3.5 rounded-xl bg-ivorySilk border border-stoneBorder flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div>
          <strong class="text-obsidian text-sm">${idx + 1}. ${escapeHtml(m.name)}</strong>
          <div class="text-mutedInk mt-0.5">${escapeHtml(m.instruction || '')}</div>
        </div>
        <div class="sm:text-right shrink-0">
          <span class="px-2.5 py-1 rounded-full bg-gold-pale border border-gold/40 text-gold-bronze font-semibold inline-block">${escapeHtml(m.freq || '')}</span>
          <div class="text-[11px] font-mono text-obsidian mt-1">${escapeHtml(m.duration || '')}</div>
        </div>
      </div>
    `).join('');
  }

  const repeatBtn = document.getElementById('repeatRxFromModalBtn');
  if (repeatBtn) {
    repeatBtn.onclick = () => repeatPrescriptionInStudio(rxId);
  }

  modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeRxDetailsModal() {
  document.getElementById('rxDetailsModal')?.classList.add('hidden');
}

function repeatPrescriptionInStudio(rxId) {
  const r = getPrescriptions().find((x) => x.rxId === rxId);
  if (!r) return;
  closeRxDetailsModal();
  currentRxId = generateRxCode();
  draftMedications = Array.isArray(r.medications) ? r.medications.map((m) => ({ ...m })) : [];

  document.getElementById('rxPatientName').value = r.patientName || '';
  if (document.getElementById('rxAgeGender')) document.getElementById('rxAgeGender').value = r.ageGender && r.ageGender !== '—' ? r.ageGender : '';
  if (document.getElementById('rxPatientPhone')) document.getElementById('rxPatientPhone').value = r.phone && r.phone !== '—' ? r.phone : '';
  document.getElementById('rxDiagnosis').value = r.diagnosis || '';
  if (document.getElementById('rxAdvice')) document.getElementById('rxAdvice').value = r.advice || '';

  switchAdminTab('rxStudio');
  renderComposerMedList();
  syncLiveRxPreview();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ==================== SERVER DATABASE SYNC LAYER (/api) ==================== */
async function syncClinicDataFromServer() {
  try {
    const [apptRes, rxRes] = await Promise.all([
      fetch('/api/appointments'),
      fetch('/api/prescriptions')
    ]);

    if (apptRes.ok) {
      const serverAppts = await apptRes.json();
      if (Array.isArray(serverAppts)) {
        localStorage.setItem(STORAGE_KEY_APPTS, JSON.stringify(serverAppts));
      }
    }

    if (rxRes.ok) {
      const serverRxs = await rxRes.json();
      if (Array.isArray(serverRxs)) {
        localStorage.setItem(STORAGE_KEY_RX, JSON.stringify(serverRxs));
      }
    }

    if (document.body.getAttribute('data-page') === 'admin') {
      refreshAdminDashboard();
    }
  } catch (err) {
    // Offline/static fallback keeps localStorage working smoothly
  }
}

async function postAppointmentToServer(apptObj) {
  try {
    await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apptObj)
    });
  } catch (e) {}
}

async function deleteAppointmentOnServer(passId) {
  try {
    await fetch(`/api/appointments/${encodeURIComponent(passId)}`, { method: 'DELETE' });
  } catch (e) {}
}

async function postPrescriptionToServer(rxObj) {
  try {
    await fetch('/api/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rxObj)
    });
  } catch (e) {}
}