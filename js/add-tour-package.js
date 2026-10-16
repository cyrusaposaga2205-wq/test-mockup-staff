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
  // terms: "Entrance-fee discounts for eligible guests are subject to the applicable terms and verification requirements. Cancellation and activity policies should follow the business's approved terms.",
  cover: "images/card-1.jpg",
  gallery: ["images/card-1.jpg", "images/card-1.jpg", "images/card-1.jpg"]
};

const $ = id => document.getElementById(id);

function set(id, v) {
  $(id).value = v ?? '';
}

// Prefill form defaults for adding new package
set('name', '');
set('category', 'south');
set('status', 'active');
set('featured', 'no');
set('shortDescription', '');
set('price', '');
set('duration', '1 Day');
set('maxGuests', '11');
set('maxGuestsPerDate', '30'); // Pre-filled default capacity
set('overview', '');
set('pickup', defaults.pickup);
// set('terms', defaults.terms);
set('cover', defaults.cover);
set('gallery', defaults.gallery.join('\n'));

function removeButton() {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'remove';
  b.innerHTML = '<i data-lucide="trash-2"></i>';
  b.onclick = () => { b.parentElement.remove(); };
  return b;
}

function addTextRow(container, value = '') {
  const row = document.createElement('div');
  row.className = 'repeat-row';
  const input = document.createElement('input');
  input.value = value;
  input.placeholder = 'Enter item';
  row.append(input, removeButton());
  container.append(row);
}

function addItineraryRow(item = { time: '', activity: '' }) {
  const row = document.createElement('div');
  row.className = 'itinerary-row';
  const t = document.createElement('input');
  t.value = item.time;
  t.placeholder = 'e.g. 03:00 AM';
  const a = document.createElement('input');
  a.value = item.activity;
  a.placeholder = 'Activity / destination';
  row.append(t, a, removeButton());
  $('itinerary').append(row);
}

function addAddonRow(item = { name: '', price: '', status: 'Active' }) {
  const row = document.createElement('div');
  row.className = 'addon-row';
  const n = document.createElement('input');
  n.value = item.name;
  n.placeholder = 'Add-on name';
  const p = document.createElement('input');
  p.type = 'number';
  p.value = item.price;
  p.placeholder = 'Price';
  const s = document.createElement('select');
  ['Active', 'Inactive'].forEach(x => {
    const o = document.createElement('option');
    o.value = x;
    o.textContent = x;
    s.append(o);
  });
  s.value = item.status || 'Active';
  row.append(n, p, s, removeButton());
  $('addons').append(row);
}

// Initial default input rows
(defaults.destinations || []).forEach(x => addTextRow($('destinations'), x));
(defaults.itinerary || []).forEach(addItineraryRow);
(defaults.inclusions || []).forEach(x => addTextRow($('inclusions'), x));
(defaults.exclusions || []).forEach(x => addTextRow($('exclusions'), x));
(defaults.addons || []).forEach(addAddonRow);
lucide.createIcons();

$('addDestination').onclick = () => { addTextRow($('destinations')); lucide.createIcons(); };$('addInclusion').onclick = () => { addTextRow($('inclusions')); lucide.createIcons(); };$('addExclusion').onclick = () => { addTextRow($('exclusions')); lucide.createIcons(); };$('addItinerary').onclick = () => { addItineraryRow(); lucide.createIcons(); };
$('addAddon').onclick = () => { addAddonRow(); lucide.createIcons(); };$('cover').oninput = () => { $('coverPreview').src =$('cover').value || defaults.cover; };

function values(container) {
  return [...$(container).children].map(r => r.querySelector('input')?.value.trim()).filter(Boolean);
}

function showToast(message, onComplete) {
  let toast = document.getElementById('toastNotification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  
  toast.innerHTML = `<i data-lucide="check-circle" style="color: #22c55e;"><span>${message}</span>`;
  lucide.createIcons();

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    if (onComplete) onComplete();
  }, 1500);
}

// Capacity validation checked automatically upon form submission
// Capacity validation checked automatically upon form submission
function checkBookingCapacity() {
  const capacityInput = $('maxGuestsPerDate');
  const maxPackagePax = parseInt($('maxGuests').value || 1, 10);
  const capacity = parseInt(capacityInput.value, 10);
  const alertBox = $('capacityValidationBox');
  const alertMessage = $('capacityAlertMessage');

  // Hide alert box by default
  alertBox.style.display = 'none';

  // If empty or NaN, let native browser HTML5 'required' handle the tooltip
  if (isNaN(capacity) || capacity <= 0) {
    return true; 
  }

  // Rule 1: Exceeds maximum operational threshold
  if (capacity > 500) {
    alertMessage.textContent = "Maximum guests per date cannot exceed 500 for standard tour operations.";
    alertBox.style.background = "#fff5f5";
    alertBox.style.borderColor = "#fca5a5";
    alertBox.style.display = 'flex';
    capacityInput.focus();
    capacityInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    lucide.createIcons();
    return false;
  }

  // Rule 2: Cannot be lower than single group size
  if (capacity < maxPackagePax) {
    alertMessage.textContent = `Maximum guests per date (${capacity}) cannot be less than Maximum Package Pax (${maxPackagePax}).`;
    alertBox.style.background = "#fff5f5";
    alertBox.style.borderColor = "#fca5a5";
    alertBox.style.display = 'flex';
    capacityInput.focus();
    capacityInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    lucide.createIcons();
    return false;
  }

  return true;
}

// Automatically hide error box when editing the input
$('maxGuestsPerDate').addEventListener('input', () => {$('capacityValidationBox').style.display = 'none';
});

// Clear error alert box when user edits the capacity input
$('maxGuestsPerDate').addEventListener('input', () => {$('capacityValidationBox').hidden = true;
});

function save() {
  // Validate capacity check before proceeding
  if (!checkBookingCapacity()) {
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

  const newPackage = {
    id: 'package-' + Date.now(),
    name: $('name').value.trim(),
    category: $('category').value,
    categoryLabel: categoryLabels[$('category').value] || 'Cebu Tour',
    status: $('status').value,
    featured: $('featured').value,
    shortDescription: $('shortDescription').value.trim(),
    price: $('price').value,
    maxGuests: $('maxGuests').value,
    maxGuestsPerDate: $('maxGuestsPerDate').value,
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

  packages.push(newPackage);
  localStorage.setItem(KEY, JSON.stringify(packages));

  showToast('Tour package added successfully!', () => {
    location.href = 'tour-packages.html';
  });
}

$('packageForm').addEventListener('submit', e => { 
  e.preventDefault(); 
  save(); 
});

$('saveButton').onclick = () => { 
  if ($('packageForm').reportValidity()) {
    save(); 
  }
};

lucide.createIcons();