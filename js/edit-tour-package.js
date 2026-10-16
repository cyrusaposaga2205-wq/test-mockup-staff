const KEY = "uncleRonPackages";

const defaults = {
  id: "oslob-whale-shark",
  name: "Oslob Whale Shark Tour",
  category: "south",
  categoryLabel: "South Cebu",
  status: "active",
  featured: "no",
  price: "4200",
  maxGuests: "11",
  maxGuestsPerDate: "30",
  currentReservedGuests: 24,
  duration: "1 Day",
  shortDescription: "Experience one of Cebu's most popular southern adventures with whale shark watching and Tumalog Falls.",
  overview: "Experience one of Cebu's most popular southern adventures with the Private Oslob Whale Shark Watching & Snorkeling Tour with Tumalog Falls. Enjoy a memorable day exploring Oslob's coastal attractions.",
  destinations: ["Oslob", "Tumalog Falls", "Whale Shark Watching"],
  itinerary: [
    { time: "03:00 AM", activity: "Pick up from hotel / resort" },
    { time: "05:30 AM", activity: "Arrival in Oslob & light breakfast" },
    { time: "06:30 AM", activity: "Whale shark watching / snorkeling" },
    { time: "10:00 AM", activity: "Visit Tumalog Falls" },
    { time: "12:00 PM", activity: "Lunch and return journey" }
  ],
  inclusions: ["Round-trip transportation", "Tour guide", "Applicable tour entrance fees"],
  exclusions: ["Personal expenses", "Meals unless stated in the package", "Optional activities"],
  addons: [
    { name: "GoPro Rental", price: "1000", status: "Active" },
    { name: "Osmeña Peak Side Trip", price: "1000", status: "Active" }
  ],
  pickup: "Hotel / resort pickup within the agreed service area. Exact pickup time is confirmed after booking.",
  cover: "images/package-cover.jpg",
  gallery: ["images/package-cover.jpg", "images/package-cover.jpg", "images/package-cover.jpg"]
};

const UPPER_CAPACITY_LIMIT = 1000;

const urlParams = new URLSearchParams(window.location.search);
const packageId = urlParams.get("id");

let packages = [];
try {
  const raw = localStorage.getItem(KEY);
  packages = raw ? JSON.parse(raw) : [];
} catch (e) {
  packages = [];
}

if (!Array.isArray(packages) || packages.length === 0) {
  packages = [defaults];
}

let data = packages.find(p => String(p.id) === String(packageId)) || packages[0] || defaults;

const $ = id => document.getElementById(id);
function set(id, v) { $(id).value = v ?? ''; }

set('name', data.name);
set('category', data.category);
set('status', data.status);
set('featured', data.featured || 'no');
set('shortDescription', data.shortDescription);
set('price', data.price);
set('duration', data.duration);
set('maxGuests', data.maxGuests);
set('maxGuestsPerDate', data.maxGuestsPerDate || '30');
set('overview', data.overview);
set('pickup', data.pickup);
set('cover', data.cover);
set('gallery', (data.gallery || []).join('\n'));

// Track changes explicitly across the form
let formHasChanges = false;
function markChanged() {
  formHasChanges = true;
}

// Attach change event listeners to all base inputs
document.querySelectorAll('#packageForm input, #packageForm select, #packageForm textarea').forEach(el => {
  el.addEventListener('input', markChanged);
  el.addEventListener('change', markChanged);
});

function removeButton() {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'remove';
  b.innerHTML = '<i data-lucide="trash-2"></i>';
  b.onclick = () => { 
    markChanged();
    b.parentElement.remove(); 
  };
  return b;
}

function addTextRow(container, value = '') {
  const row = document.createElement('div');
  row.className = 'repeat-row';
  const input = document.createElement('input');
  input.value = value;
  input.placeholder = 'Enter item';
  input.addEventListener('input', markChanged);
  row.append(input, removeButton());
  container.append(row);
}

function addItineraryRow(item = { time: '', activity: '' }) {
  const row = document.createElement('div');
  row.className = 'itinerary-row';
  const t = document.createElement('input');
  t.value = item.time;
  t.placeholder = 'e.g. 03:00 AM';
  t.addEventListener('input', markChanged);

  const a = document.createElement('input');
  a.value = item.activity;
  a.placeholder = 'Activity / destination';
  a.addEventListener('input', markChanged);

  row.append(t, a, removeButton());
  $('itinerary').append(row);
}

function addAddonRow(item = { name: '', price: '', status: 'Active' }) {
  const row = document.createElement('div');
  row.className = 'addon-row';
  const n = document.createElement('input');
  n.value = item.name;
  n.placeholder = 'Add-on name';
  n.addEventListener('input', markChanged);

  const p = document.createElement('input');
  p.type = 'number';
  p.value = item.price;
  p.placeholder = 'Price';
  p.addEventListener('input', markChanged);

  const s = document.createElement('select');
  ['Active', 'Inactive'].forEach(x => {
    const o = document.createElement('option');
    o.value = x;
    o.textContent = x;
    s.append(o);
  });
  s.value = item.status || 'Active';
  s.addEventListener('change', markChanged);

  row.append(n, p, s, removeButton());
  $('addons').append(row);
}

(data.destinations || []).forEach(x => addTextRow($('destinations'), x));
(data.itinerary || []).forEach(addItineraryRow);
(data.inclusions || []).forEach(x => addTextRow($('inclusions'), x));
(data.exclusions || []).forEach(x => addTextRow($('exclusions'), x));
(data.addons || []).forEach(addAddonRow);
lucide.createIcons();

$('addDestination').onclick = () => { markChanged(); addTextRow($('destinations')); lucide.createIcons(); };$('addInclusion').onclick = () => { markChanged(); addTextRow($('inclusions')); lucide.createIcons(); };$('addExclusion').onclick = () => { markChanged(); addTextRow($('exclusions')); lucide.createIcons(); };$('addItinerary').onclick = () => { markChanged(); addItineraryRow(); lucide.createIcons(); };
$('addAddon').onclick = () => { markChanged(); addAddonRow(); lucide.createIcons(); };$('cover').oninput = () => { markChanged(); $('coverPreview').src =$('cover').value || defaults.cover; };

function values(container) {
  return [...$(container).children].map(r => r.querySelector('input')?.value.trim()).filter(Boolean);
}

function validateCapacityInput(valueStr) {
  const trimmed = String(valueStr).trim();

  if (!trimmed) {
    return { valid: false, message: "Capacity limit is required. Please enter a value." };
  }
  if (isNaN(trimmed)) {
    return { valid: false, message: "Invalid capacity input. Please enter numbers only." };
  }
  if (trimmed.includes('.')) {
    return { valid: false, message: "Capacity must be a whole number (no decimals allowed)." };
  }

  const num = Number(trimmed);

  if (num <= 0) {
    return { valid: false, message: "Capacity limit must be a positive number greater than 0." };
  }
  if (num > UPPER_CAPACITY_LIMIT) {
    return { valid: false, message: `Capacity exceeds maximum safeguard limit of ${UPPER_CAPACITY_LIMIT} guests.` };
  }

  const currentCapacity = Number(data.maxGuestsPerDate || 30);
  if (num === currentCapacity) {
    return {
      valid: true,
      noChange: true,
      value: num,
      title: "No Change",
      message: "No change; skip the capacity update."
    };
  }

  const currentReserved = data.currentReservedGuests || 24;
  if (num < currentReserved) {
    return {
      valid: false,
      isCapacityExceeded: true,
      title: "Cannot save this capacity limit",
      message: `The new maximum (${num}) is lower than the number of guests already reserved (${currentReserved}) for one or more future dates. Increase the limit or resolve the affected reservations through an authorized process.`
    };
  }

  return { valid: true, noChange: false, value: num };
}

function showCapacityAlert(result) {
  const box = $('capacityValidationBox');
  const title = $('capacityAlertTitle');
  const message = $('capacityAlertMessage');

  box.hidden = false;

  if (!result.valid) {
    box.className = 'capacity-alert-box error';
    box.querySelector('.alert-icon').innerHTML = '<i data-lucide="alert-triangle"></i>';
    title.textContent = result.title || "Invalid Capacity Input";
    message.textContent = result.message;
  } else if (result.noChange) {
    box.className = 'capacity-alert-box success';
    box.querySelector('.alert-icon').innerHTML = '<i data-lucide="info"></i>';
    title.textContent = result.title || "No Change";
    message.textContent = result.message;
  } else {
    box.className = 'capacity-alert-box success';
    box.querySelector('.alert-icon').innerHTML = '<i data-lucide="check-circle"></i>';
    title.textContent = "Valid Capacity Limit";
    message.textContent = `Booking capacity limit of ${result.value} guests is valid and acceptable.`;
  }
  lucide.createIcons();
}

$('validateCapacityBtn').onclick = () => {
  const result = validateCapacityInput($('maxGuestsPerDate').value);
  showCapacityAlert(result);
};

function save() {
  if (!formHasChanges) {
    showToast("You did not change anything");
    return;
  }

  const capacityResult = validateCapacityInput($('maxGuestsPerDate').value);
  if (!capacityResult.valid) {
    showCapacityAlert(capacityResult);
    $('maxGuestsPerDate').focus();
    return;
  }

  const itinerary = [...$('itinerary').children].map(r => ({
    time: r.children[0].value.trim(),
    activity: r.children[1].value.trim()
  })).filter(x => x.time || x.activity);

  const addons = [...$('addons').children].map(r => ({
    name: r.children[0].value.trim(),
    price: r.children[1].value,
    status: r.children[2].value
  })).filter(x => x.name);

  const categoryLabels = {
    south: 'South Cebu',
    cebu: 'Cebu Tour',
    bohol: 'Cebu-Bohol',
    city: 'City Tour'
  };

  const updatedPackage = {
    ...data,
    id: data.id,
    name: $('name').value.trim(),
    category: $('category').value,
    categoryLabel: categoryLabels[$('category').value] || 'Cebu Tour',
    status: $('status').value,
    featured: $('featured').value,
    shortDescription: $('shortDescription').value.trim(),
    price: $('price').value,
    maxGuests: $('maxGuests').value,
    maxGuestsPerDate: String(capacityResult.value),
    duration: $('duration').value.trim(),
    overview: $('overview').value.trim(),
    destinations: values('destinations'),
    itinerary,
    inclusions: values('inclusions'),
    exclusions: values('exclusions'),
    addons,
    pickup: $('pickup').value.trim(),
    terms: $('terms').value.trim(),
    cover: $('cover').value.trim() || defaults.cover,
    gallery: $('gallery').value.split('\n').map(x => x.trim()).filter(Boolean)
  };

  const packageIndex = packages.findIndex(p => String(p.id) === String(data.id));
  if (packageIndex !== -1) {
    packages[packageIndex] = updatedPackage;
  } else {
    packages.push(updatedPackage);
  }

  localStorage.setItem(KEY, JSON.stringify(packages));

  showToast('Tour saved successfully!', () => {
    location.href = 'view-tour-package.html?id=' + encodeURIComponent(updatedPackage.id);
  });
}

function showToast(message, callback) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
            callback?.();
        }, 300);
    }, 2000);
}

$('packageForm').addEventListener('submit', e => { e.preventDefault(); save(); });$('saveButton').onclick = () => { save(); };
lucide.createIcons();