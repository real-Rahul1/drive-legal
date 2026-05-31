const API_BASE = 'https://drive-legal-backend.onrender.com';

// ==================== MAP INIT ====================
const map = L.map('map', {
  center: [20.5937, 78.9629],
  zoom: 5,
  zoomControl: true,
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 18,
}).addTo(map);

const markerIcon = L.divIcon({
  html: `<div style="
    width:28px;height:28px;border-radius:50% 50% 50% 0;
    background:#f5a623;transform:rotate(-45deg);
    border:3px solid #0a0a0f;box-shadow:0 0 12px rgba(245,166,35,0.6);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  className: '',
});

let currentMarker = null;

map.on('click', async (e) => {
  const { lat, lng } = e.latlng;
  await fetchByCoords(lat, lng);
});

// ==================== GEOCODING ====================
async function geocodeLocation(query) {
  showLoading();
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', India')}&format=json&addressdetails=1&limit=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    if (!data.length) { hideLoading(); alert('Location not found. Try another city or state.'); return; }
    const loc = data[0];
    const lat = parseFloat(loc.lat);
    const lng = parseFloat(loc.lon);
    const city = loc.address?.city || loc.address?.town || loc.address?.village || loc.address?.county || '';
    const state = loc.address?.state || '';
    map.setView([lat, lng], 10);
    placeMarker(lat, lng, loc.display_name);
    await fetchLaws(city, state, lat, lng, loc.display_name);
  } catch (err) {
    hideLoading();
    alert('Error fetching location. Please try again.');
  }
}

async function fetchByCoords(lat, lng) {
  showLoading();
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
    const state = data.address?.state || '';
    const displayName = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    map.setView([lat, lng], 10);
    placeMarker(lat, lng, displayName);
    await fetchLaws(city, state, lat, lng, displayName);
  } catch (err) {
    hideLoading();
    console.error('Reverse geocode error:', err);
  }
}

function placeMarker(lat, lng, title) {
  if (currentMarker) map.removeLayer(currentMarker);
  currentMarker = L.marker([lat, lng], { icon: markerIcon })
    .addTo(map)
    .bindPopup(`<b style="font-family:'Bebas Neue',sans-serif;letter-spacing:1px;font-size:16px;">${title.split(',')[0]}</b><br><small style="color:#888">${lat.toFixed(4)}, ${lng.toFixed(4)}</small>`)
    .openPopup();
}

// ==================== FETCH LAWS ====================
async function fetchLaws(city, state, lat, lng, displayName) {
  try {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (state) params.append('state', state);
    const res = await fetch(`${API_BASE}/api/laws?${params.toString()}`);
    const data = await res.json();
    hideLoading();
    renderResults(data, lat, lng, displayName);
  } catch (err) {
    hideLoading();
    console.error('Laws API error:', err);
    alert('Error loading traffic laws. Make sure the server is running on port 3000.');
  }
}

// ==================== RENDER RESULTS ====================
function renderResults(data, lat, lng, displayName) {
  const section = document.getElementById('laws-section');
  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Title — show city if available
  const title = data.city ? `${data.city}, ${data.state}` : data.state;
  const subtitle = data.type === 'city' ? '📍 City-Specific Laws Active' : '🗺 State-Level Laws (City not in database)';

  document.getElementById('resultsState').textContent = title;
  document.getElementById('resultsCoords').innerHTML =
    `${displayName.split(',').slice(0,2).join(',')} &nbsp;·&nbsp; ${lat.toFixed(4)}°N ${lng.toFixed(4)}°E &nbsp;<span style="color:#f5a623;font-size:11px;">${subtitle}</span>`;

  // Speed badges
  document.getElementById('speedBadges').innerHTML = `
    <div class="speed-badge"><span class="badge-num">${data.speedLimits.urban}</span><span class="badge-label">Urban km/h</span></div>
    <div class="speed-badge"><span class="badge-num">${data.speedLimits.highway}</span><span class="badge-label">Highway km/h</span></div>
    <div class="speed-badge"><span class="badge-num">${data.speedLimits.expressway}</span><span class="badge-label">Expressway km/h</span></div>
  `;

  // Fines table
  const icons = ['🚦','🍺','🏎','🏍','🪑','📱','📦','📄','🚗','⚠️'];
  document.getElementById('finesBody').innerHTML = data.fines.map((f, i) => {
    const risk = getRisk(f.fine);
    return `<tr>
      <td>${String(i+1).padStart(2,'0')}</td>
      <td>${icons[i] || '⚠️'} ${f.violation}</td>
      <td class="fine-amount">${f.fine}</td>
      <td class="fine-repeat">${f.repeat}</td>
      <td><span class="risk-badge risk-${risk.level}">${risk.label}</span></td>
    </tr>`;
  }).join('');

  // Local rules
  const ruleIcons = ['🚦','🏙️','🌙','🏍️','🚗','📷','🛑','⚠️','🔊','🅿️','🌿','🎉'];
  document.getElementById('localRules').innerHTML = data.localRules.map((rule, i) => `
    <div class="local-rule-item">
      <span class="rule-icon">${ruleIcons[i % ruleIcons.length]}</span>
      <span class="rule-text">${rule}</span>
    </div>
  `).join('') + (data.fineNotes ? `
    <div class="local-rule-item" style="border-color:#f5a623;background:rgba(245,166,35,0.05);">
      <span class="rule-icon">ℹ️</span>
      <span class="rule-text"><strong>Note:</strong> ${data.fineNotes}</span>
    </div>` : '');

  // Contacts
  document.getElementById('contactsGrid').innerHTML = `
    <div class="contact-card">
      <div class="contact-icon">🏛️</div>
      <div class="contact-label">Authority</div>
      <div class="contact-value">${data.authority}</div>
    </div>
    <div class="contact-card">
      <div class="contact-icon">📞</div>
      <div class="contact-label">Helpline</div>
      <div class="contact-value">${data.helpline}</div>
    </div>
    <div class="contact-card">
      <div class="contact-icon">🌐</div>
      <div class="contact-label">Official Portal</div>
      <a class="contact-link" href="${data.portal}" target="_blank">${data.portal}</a>
    </div>
    <div class="contact-card">
      <div class="contact-icon">📱</div>
      <div class="contact-label">National Helpline</div>
      <div class="contact-value">1800-180-1500</div>
      <a class="contact-link" href="https://parivahan.gov.in" target="_blank">parivahan.gov.in</a>
    </div>
  `;
}

function getRisk(fine) {
  const l = fine.toLowerCase();
  if (l.includes('jail') || l.includes('₹10,000') || l.includes('₹15,000') || l.includes('suspension') || l.includes('impound')) return { level: 'high', label: 'HIGH' };
  if (l.includes('₹5,000') || l.includes('₹2,000') || l.includes('cancellation')) return { level: 'medium', label: 'MEDIUM' };
  return { level: 'low', label: 'LOW' };
}

// ==================== TABS ====================
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
  });
});

// ==================== SEARCH ====================
document.getElementById('searchBtn').addEventListener('click', () => {
  const val = document.getElementById('locationInput').value.trim();
  if (val) geocodeLocation(val);
});
document.getElementById('locationInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { const val = e.target.value.trim(); if (val) geocodeLocation(val); }
});

// ==================== DETECT LOCATION ====================
document.getElementById('detectBtn').addEventListener('click', () => {
  if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
  showLoading();
  navigator.geolocation.getCurrentPosition(
    (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
    () => { hideLoading(); alert('Unable to get your location.'); }
  );
});

// ==================== CALCULATOR ====================
async function loadStates() {
  try {
    const res = await fetch(`${API_BASE}/api/states`);
    const states = await res.json();
    const select = document.getElementById('calcState');
    states.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s; opt.textContent = s;
      select.appendChild(opt);
    });
  } catch (e) { console.error('Could not load states'); }
}

document.getElementById('calcState').addEventListener('change', async (e) => {
  const state = e.target.value;
  const vSelect = document.getElementById('calcViolation');
  vSelect.innerHTML = '<option value="">-- Loading... --</option>';
  if (!state) return;
  try {
    const res = await fetch(`${API_BASE}/api/laws?state=${encodeURIComponent(state)}`);
    const data = await res.json();
    vSelect.innerHTML = '<option value="">-- Select Violation --</option>';
    data.fines.forEach((f, i) => {
      const opt = document.createElement('option');
      opt.value = i; opt.textContent = f.violation;
      vSelect.appendChild(opt);
    });
    vSelect._fines = data.fines;
  } catch (e) { vSelect.innerHTML = '<option>Error loading</option>'; }
});

document.getElementById('calcBtn').addEventListener('click', () => {
  const vSelect = document.getElementById('calcViolation');
  const idx = parseInt(vSelect.value);
  const offence = document.querySelector('input[name="offence"]:checked').value;
  if (!vSelect._fines || isNaN(idx)) { alert('Please select a state and violation first.'); return; }
  const fine = vSelect._fines[idx];
  const amount = offence === 'first' ? fine.fine : fine.repeat;
  const result = document.getElementById('calcResult');
  result.style.display = 'block';
  result.innerHTML = `
    <div class="result-violation">${fine.violation} · ${offence === 'first' ? 'First Offence' : 'Repeat Offence'}</div>
    <div class="result-fine">${amount}</div>
    <div class="result-note">⚠ Estimate based on Motor Vehicles Act 2019. Actual fines may vary.</div>
  `;
});

// ==================== LOADING ====================
function showLoading() { document.getElementById('loadingOverlay').style.display = 'flex'; }
function hideLoading() { document.getElementById('loadingOverlay').style.display = 'none'; }

// ==================== INIT ====================
loadStates();

// Cycle speed ring
const speedTypes = [
  { val: '50', unit: 'km/h', label: 'URBAN LIMIT' },
  { val: '80', unit: 'km/h', label: 'HIGHWAY LIMIT' },
  { val: '120', unit: 'km/h', label: 'EXPRESSWAY' },
  { val: '0.03', unit: '% BAC', label: 'ALCOHOL LIMIT' },
];
let speedIdx = 0;
