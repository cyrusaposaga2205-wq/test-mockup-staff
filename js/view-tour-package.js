const KEY = "uncleRonPackages";

const defaults = {
  id: "oslob-whale-shark",
  name: "Oslob Whale Shark Tour",
  category: "south",
  categoryLabel: "South Cebu",
  status: "active",
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
  terms: "Entrance-fee discounts for eligible guests are subject to the applicable terms and verification requirements. Cancellation and activity policies should follow the business's approved terms.",
  cover: "images/package-cover.jpg",
  gallery: ["images/package-cover.jpg", "images/package-cover.jpg", "images/package-cover.jpg"]
};

// 1. Get package ID from URL query parameters (e.g. ?id=package-17123456789)
const urlParams = new URLSearchParams(window.location.search);
const packageId = urlParams.get("id");

// 2. Fetch packages array from LocalStorage
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

// 3. Find target package or fallback to default/first package
let data = packages.find(p => String(p.id) === String(packageId)) || packages[0] || defaults;

const $ = id => document.getElementById(id);

// 4. Render details onto page
$('packageName').textContent = data.name || 'Untitled Package';
$('shortDescription').textContent = data.shortDescription || '';$('overview').textContent = data.overview || '';
$('categoryBadge').textContent = (data.categoryLabel || data.category ||'').toUpperCase();$('duration').textContent = data.duration || '';
$('maxGuests').textContent = data.maxGuests || '1';$('price').textContent = Number(data.price || 0).toLocaleString();

$('statusBadge').textContent = data.status === 'active' ? 'Active' : 'Inactive';$('statusBadge').className = 'status ' + (data.status || 'active');

$('sideStatus').textContent = data.status === 'active' ? 'Active' : 'Inactive';$('sideStatus').style.color = data.status === 'active' ? '#08865d' : '#bd3b3b';

$('sideCategory').textContent = data.categoryLabel || data.category || '';
$('sideDuration').textContent = data.duration || '';$('sidePrice').textContent = '₱' + Number(data.price || 0).toLocaleString() + '/person';
$('sidePax').textContent = (data.maxGuests || '1') + ' guests';$('coverImage').src = data.cover || defaults.cover;

const renderList = (id, items, cls) => {
  $(id).innerHTML = (items || []).map(x => `<span class="${cls}">${x}</span>`).join('');
};

renderList('destinations', data.destinations, 'tag');

$('itinerary').innerHTML = (data.itinerary || []).map(x => 
  `<div class="timeline-item"><time>${x.time || ''}</time><p>${x.activity || ''}</p></div>`
).join('');

$('inclusions').innerHTML = (data.inclusions || []).map(x => `<li>${x}</li>`).join('');
$('exclusions').innerHTML = (data.exclusions || []).map(x => `<li>${x}</li>`).join('');

$('addons').innerHTML = (data.addons || []).map(x => 
  `<div class="addon"><span>${x.name}</span><strong>+₱${Number(x.price || 0).toLocaleString()}</strong></div>`
).join('');

$('pickup').textContent = data.pickup || '';$('terms').textContent = data.terms || '';

$('gallery').innerHTML = (data.gallery && data.gallery.length ? data.gallery : [data.cover || defaults.cover])
  .map(x => `<img src="${x}" alt="${data.name}">`).join('');

// Pass the correct package ID to the edit links
$('editLink').href = 'edit-tour-package.html?id=' + encodeURIComponent(data.id);
$('editLink2').href = 'edit-tour-package.html?id=' + encodeURIComponent(data.id);

lucide.createIcons();