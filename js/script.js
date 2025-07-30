/////////////////////////////////////////////////
// Set current year

const yearEl = document.querySelector(".year");
const currentYear = new Date().getFullYear();

yearEl.textContent = currentYear;

/////////////////////////////////////////////////
// Make mobile navigation work

const btnNavEl = document.querySelector(".btn-mobile-nav");
const headerEl = document.querySelector(".header");

btnNavEl.addEventListener("click", function () {
  headerEl.classList.toggle("nav-open");
});

////////////////////////////////////////////////
// Smooth scrolling animation

const allLinks = document.querySelectorAll("a:link");

allLinks.forEach(function (link) {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const href = link.getAttribute("href");
    // Scroll back to top
    if (href === "#") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    // Scroll to other links
    if (href !== "#" && href.startsWith("#")) {
      const sectionEl = document.querySelector(href);
      sectionEl.scrollIntoView({
        behavior: "smooth",
      });
    }

    // Close the mobile navigation
    if (link.classList.contains("main-nav-link")) {
      headerEl.classList.toggle("nav-open");
    }
  });
});

////////////////////////////////////////////////
// Sticky header

window.addEventListener("scroll", function () {
  if (window.scrollY >= 720) {
    this.document.body.classList.add("sticky");
  } else {
    this.document.body.classList.remove("sticky");
  }
});


// Function to handle meal rating (example for star icons)
const starIcons = document.querySelectorAll('.preferences-form .stars ion-icon');
starIcons.forEach(icon => {
  icon.addEventListener('click', function() {
    const rating = this.dataset.rating;
    starIcons.forEach((star, index) => {
      if (index < rating) {
        star.setAttribute('name', 'star'); // Filled star
      } else {
        star.setAttribute('name', 'star-outline'); // Outline star
      }
    });
    // In a real application, send this rating to your backend
    console.log(`User rated meal ${document.getElementById('meal-rating').value} with ${rating} stars`);
  });
});

// Event listener for the preferences form submission
const preferencesForm = document.querySelector('.preferences-form');
if (preferencesForm) {
  preferencesForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const selectedMeal = document.getElementById('meal-rating').value;
    const avoidedIngredients = Array.from(document.querySelectorAll('input[name="avoid"]:checked')).map(cb => cb.value);
    const dietaryGoal = document.getElementById('dietary-goal').value;

    console.log('User Preferences:', {
      selectedMeal,
      avoidedIngredients,
      dietaryGoal
    });

    // Here you would typically send this data to a backend API
    // for personalized recommendations.
    alert('Preferences saved! Your future meals will be even more tailored.');
  });
}


// Dummy order ID (in a real app, this would come from the user's session/order details)
let currentOrderId = 'ORDER12345';
let map;
let marker; // For driver's marker on the map

// Function to initialize the map
function initMap(centerLat, centerLng, orderLat, orderLng) {
    // Check if map already exists to prevent re-initialization
    if (map) {
        map.remove(); // Clear previous map instance if any
    }

    // Default to a general area if specific coords not provided
    const defaultCenter = { lat: centerLat || 31.5204, lng: centerLng || 74.3587 }; // Lahore coordinates

    map = L.map('delivery-map').setView([defaultCenter.lat, defaultCenter.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add delivery location marker (fixed)
    if (orderLat && orderLng) {
        L.marker([orderLat, orderLng]).addTo(map)
            .bindPopup('Your Delivery Location')
            .openPopup();
    }

    // Initialize driver marker (will be updated)
    marker = L.marker([defaultCenter.lat, defaultCenter.lng]).addTo(map)
        .bindPopup('Your Driver')
        .openPopup();
}


// Function to update the tracking UI
function updateTrackingUI(data) {
    const statusTextEl = document.getElementById('current-status-text');
    const etaTextEl = document.getElementById('eta-text');
    const progressBar = document.querySelector('.progress-bar');

    if (statusTextEl) statusTextEl.textContent = data.status;
    if (etaTextEl) etaTextEl.textContent = data.eta;

    // Update status steps and progress bar
    const statusSteps = {
        "Order Placed": 0,
        "Preparing": 1,
        "Out for Delivery": 2,
        "Delivered!": 3
    };
    const currentStepIndex = statusSteps[data.status] || 0;

    document.querySelectorAll('.status-item').forEach((item, index) => {
        if (index <= currentStepIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Animate progress bar (simple calculation)
    const progressPercentage = (currentStepIndex / (Object.keys(statusSteps).length - 1)) * 100;
    if (progressBar) {
        progressBar.style.width = `${progressPercentage}%`;
    }

    // Update map marker if driver location is available
    if (data.driver_lat && data.driver_lng && marker) {
        const newLatLng = new L.LatLng(data.driver_lat, data.driver_lng);
        marker.setLatLng(newLatLng);
        // Optionally, recenter map on driver if they move far
        // map.setView(newLatLng, map.getZoom());
    } else if (marker) {
        // If driver location is not available (e.g., preparing phase), hide marker or move to default
        marker.setLatLng([data.order_lat || 31.5204, data.order_lng || 74.3587]); // Default to order location
    }

    // If order is delivered, stop refreshing
    if (data.status === "Delivered!") {
        clearInterval(refreshIntervalId);
        alert("Your order has been delivered!");
    }
}

// Function to fetch and update order status (simulated)
async function fetchOrderStatus(orderId) {
    console.log(`Fetching status for order: ${orderId}`);
    // In a real app, this would be an AJAX call to your backend:
    /*
    const response = await fetch(`/api/order-status/${orderId}`);
    const data = await response.json();
    */

    // Simulate different statuses for demonstration
    const dummyStatuses = [
        { status: "Order Placed", eta: "45 mins", driver_lat: null, driver_lng: null },
        { status: "Preparing", eta: "35 mins", driver_lat: null, driver_lng: null },
        { status: "Out for Delivery", eta: "20 mins", driver_lat: 31.5204, driver_lng: 74.3587, order_lat: 31.5826, order_lng: 74.3168 },
        { status: "Out for Delivery", eta: "10 mins", driver_lat: 31.5500, driver_lng: 74.3400, order_lat: 31.5826, order_lng: 74.3168 },
        { status: "Out for Delivery", eta: "5 mins", driver_lat: 31.5700, driver_lng: 74.3250, order_lat: 31.5826, order_lng: 74.3168 },
        { status: "Delivered!", eta: "Delivered!", driver_lat: 31.5826, driver_lng: 74.3168, order_lat: 31.5826, order_lng: 74.3168 },
    ];
    let currentStatusIndex = localStorage.getItem('orderStatusIndex') ? parseInt(localStorage.getItem('orderStatusIndex')) : 0;
    let data = dummyStatuses[currentStatusIndex];

    // Simulate progress in dummy data
    if (currentStatusIndex < dummyStatuses.length - 1) {
        localStorage.setItem('orderStatusIndex', currentStatusIndex + 1);
    } else {
        localStorage.setItem('orderStatusIndex', 0); // Reset for next demo run
    }


    updateTrackingUI(data);
}

let refreshIntervalId; // To store the interval ID so we can clear it

// Function to open the tracking view
function openOrderTracker(orderId) {
    document.getElementById('order-tracking').style.display = 'block';
    currentOrderId = orderId;
    localStorage.setItem('orderStatusIndex', 0); // Reset status for fresh demo

    // Initialize map with a placeholder location or a known general area for Lahore
    initMap(31.5204, 74.3587, 31.5826, 74.3168); // Driver start, Order destination

    // Fetch initial status immediately
    fetchOrderStatus(currentOrderId);

    // Set interval to refresh status every X seconds
    refreshIntervalId = setInterval(() => fetchOrderStatus(currentOrderId), 5000); // Every 5 seconds
}

// Function to close the tracking view
function closeOrderTracker() {
    document.getElementById('order-tracking').style.display = 'none';
    clearInterval(refreshIntervalId); // Stop refreshing when closed
    if (map) {
        map.remove(); // Clean up map instance
        map = null;
        marker = null;
    }
}

// Event listeners for opening/closing the tracker (example)
document.addEventListener('DOMContentLoaded', () => {
  // Add a placeholder button somewhere to trigger the tracker for testing
  const triggerTrackerButton = document.createElement('button');
  triggerTrackerButton.className = 'btn btn-full'
  triggerTrackerButton.textContent = 'Track My Demo Order';
  triggerTrackerButton.style.marginTop = '4rem';
  triggerTrackerButton.style.display = 'block';
  triggerTrackerButton.style.margin = '4rem auto';

  // Find a suitable place to append it, e.g., after the meals section or pricing
  const ctaSection = document.querySelector('.section-cta');
  if (ctaSection) {
    ctaSection.parentNode.insertBefore(triggerTrackerButton, ctaSection.nextSibling);
  }


  triggerTrackerButton.addEventListener('click', () => {
    openOrderTracker('DEMO_ORDER_ID'); // Use a dummy ID for demo
  });

  document.querySelector('.close-tracker')?.addEventListener('click', closeOrderTracker);

  // Load Leaflet CSS dynamically if not already present
  if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIINfBGaqgUPJd8qgEScZWfaR0TTxQpVaF4=';
      link.crossOrigin = '';
      document.head.appendChild(link);
  }
});

// From your script.js
let mapTracker; // Global variable to hold the map instance
let markerTracker; // Global variable for the driver's marker

function initTrackerMap(centerLat, centerLng, orderLat, orderLng) {
    const deliveryMapContainer = document.getElementById('delivery-map');
    if (!deliveryMapContainer) return;

    // Check if map already exists on this specific container and remove it
    if (deliveryMapContainer._leaflet_id) {
        deliveryMapContainer._leaflet_id = null;
    }

    const defaultCenter = { lat: centerLat || 31.5204, lng: centerLng || 74.3587 }; // Default center (Lahore)

    // Initialize the map on the 'delivery-map' div
    mapTracker = L.map('delivery-map').setView([defaultCenter.lat, defaultCenter.lng], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapTracker);

    // Add delivery location marker
    if (orderLat && orderLng) {
        L.marker([orderLat, orderLng]).addTo(mapTracker)
            .bindPopup('Your Delivery Location')
            .openPopup();
    }

    // Initialize driver marker (this marker's position will be updated later)
    markerTracker = L.marker([defaultCenter.lat, defaultCenter.lng]).addTo(mapTracker)
        .bindPopup('Your Driver')
        .openPopup();
}

// ... (other script.js functions like updateTrackingUI, openOrderTracker, closeOrderTracker) ...

// This call ensures the map initializes when the tracker is opened
document.addEventListener('DOMContentLoaded', () => {
    // ... other initializations ...

    // Event listener for opening the tracker
    // (example of how openOrderTracker is called, as provided in previous response)
    const triggerTrackerButton = document.querySelector('YOUR_BUTTON_SELECTOR'); // e.g., created demo button
    if (triggerTrackerButton) {
        triggerTrackerButton.addEventListener('click', () => {
            openOrderTracker('DEMO_ORDER_ID');
        });
    }

    // Event listener for closing the tracker
    document.querySelector('.close-tracker')?.addEventListener('click', closeOrderTracker);
});

// script.js (add these functions at the end of your file)

// ---------------------------------------------
// Food & Wine Pairing Tool
// ---------------------------------------------

const dishInput = document.getElementById('dish-input');
const getPairingBtn = document.getElementById('get-pairing-btn');
const pairingResultsDiv = document.getElementById('pairing-results');

// A simple data structure for pairings (can be expanded significantly or fetched from an API)
const pairingData = [
    {
        dish: "steak",
        suggestions: {
            food: ["Roasted Asparagus", "Creamy Mashed Potatoes", "Grilled Mushrooms"],
            wine: ["Cabernet Sauvignon", "Merlot", "Syrah"],
            beverage: ["Strong Stout Beer", "Black Coffee"]
        }
    },
    {
        dish: "salmon",
        suggestions: {
            food: ["Lemon-Dill Sauce", "Quinoa Salad", "Steamed Green Beans"],
            wine: ["Pinot Noir", "Chardonnay (unoaked)", "Sauvignon Blanc"],
            beverage: ["Green Tea", "Sparkling Water with Lemon"]
        }
    },
    {
        dish: "pasta", // General pasta
        suggestions: {
            food: ["Garlic Bread", "Caesar Salad"],
            wine: ["Chianti (for red sauce)", "Pinot Grigio (for white/cream sauce)", "Barbera"],
            beverage: ["Italian Soda", "Red Wine Sangria"]
        }
    },
    {
        dish: "chicken", // General chicken
        suggestions: {
            food: ["Roasted Vegetables", "Rice Pilaf", "Garden Salad"],
            wine: ["Chardonnay", "Pinot Grigio", "Sauvignon Blanc"],
            beverage: ["Iced Tea", "Light Lager Beer"]
        }
    },
    {
        dish: "tacos",
        suggestions: {
            food: ["Guacamole", "Salsa", "Lime Wedges", "Mexican Rice"],
            wine: ["Zinfandel", "Albariño", "Dry Rosé"],
            beverage: ["Margarita", "Mexican Lager", "Agua Fresca"]
        }
    },
    {
        dish: "pizza",
        suggestions: {
            food: ["Side Salad", "Garlic Knots"],
            wine: ["Chianti", "Sangiovese", "Pinot Noir"],
            beverage: ["Cola", "Italian Pilsner"]
        }
    },
    {
        dish: "burger",
        suggestions: {
            food: ["Fries", "Onion Rings", "Coleslaw"],
            wine: ["Zinfandel", "Cabernet Franc", "Malbec"],
            beverage: ["Craft Beer (IPA, Pale Ale)", "Milkshake", "Soda"]
        }
    },
    // Add more dishes and pairings here!
];

function getPairingSuggestions(dish) {
    const normalizedDish = dish.toLowerCase().trim();
    // Find a direct match
    let foundPairing = pairingData.find(item => item.dish === normalizedDish);

    // Basic keyword matching for more flexibility (e.g., "chicken curry" matches "chicken")
    if (!foundPairing) {
        for (const item of pairingData) {
            if (normalizedDish.includes(item.dish)) {
                foundPairing = item;
                break;
            }
        }
    }
    return foundPairing ? foundPairing.suggestions : null;
}

function displayPairingResults(suggestions) {
    pairingResultsDiv.innerHTML = ''; // Clear previous results

    if (suggestions) {
        let html = `<h3>Here are some suggestions:</h3>`;
        if (suggestions.food && suggestions.food.length > 0) {
            html += `<h4 style="font-size:20px">Food Pairings:</h4><ul>`;
            suggestions.food.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += `</ul>`;
        }
        if (suggestions.wine && suggestions.wine.length > 0) {
            html += `<h4 style="font-size:20px">Wine Pairings:</h4><ul>`;
            suggestions.wine.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += `</ul>`;
        }
        if (suggestions.beverage && suggestions.beverage.length > 0) {
            html += `<h4 style="font-size:20px">Beverage Pairings:</h4><ul>`;
            suggestions.beverage.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += `</ul>`;
        }
        pairingResultsDiv.innerHTML = html;
    } else {
        pairingResultsDiv.innerHTML = `<p class="pairing-placeholder">Sorry, we don't have suggestions for "${dishInput.value}". Please try another dish!</p>`;
    }
}

// Event Listener for the button
getPairingBtn.addEventListener('click', function() {
    const dish = dishInput.value;
    if (dish) {
        const suggestions = getPairingSuggestions(dish);
        displayPairingResults(suggestions);
    } else {
        pairingResultsDiv.innerHTML = `<p class="pairing-placeholder">Please enter a dish to get suggestions.</p>`;
    }
});

// Optional: Allow pressing Enter key in the input field
dishInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        getPairingBtn.click(); // Simulate button click
    }
});

// Initial placeholder on load
document.addEventListener('DOMContentLoaded', () => {
    if (pairingResultsDiv) {
        pairingResultsDiv.innerHTML = `<p class="pairing-placeholder">Enter a dish above to find the perfect match!</p>`;
    }
});