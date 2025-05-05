// Initialize map centered on Jigjiga
const map = L.map('map').setView([9.35, 42.8], 14);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Create marker clusters
const markers = L.markerClusterGroup();

// Custom icons
const hospitalIcon = L.divIcon({
  className: 'custom-icon hospital-icon',
  html: '<i class="fas fa-hospital"></i>',
  iconSize: [30, 30]
});

const hostelIcon = L.divIcon({
  className: 'custom-icon hostel-icon',
  html: '<i class="fas fa-bed"></i>',
  iconSize: [30, 30]
});

const taxiIcon = L.divIcon({
  className: 'custom-icon taxi-icon',
  html: '<i class="fas fa-taxi"></i>',
  iconSize: [30, 30]
});

// Load services data from JSON file
let allServices = [];

fetch('data/services.json')
  .then(response => response.json())
  .then(data => {
    allServices = data;
    addServicesToMap(allServices);
  })
  .catch(error => {
    console.error('Error loading services data:', error);
    // Fallback to sample data if JSON fails to load
    allServices = [
      {
        id: 1,
        name: "Jigjiga General Hospital",
        type: "hospital",
        phone: "+251900000001",
        lat: 9.3501,
        lng: 42.8001,
        address: "Main Road, Jigjiga"
      },
      {
        id: 2,
        name: "Peace Hostel",
        type: "hostel",
        phone: "+251900000002",
        lat: 9.3512,
        lng: 42.8032,
        address: "Near University, Jigjiga"
      },
      {
        id: 3,
        name: "Taxi Station A",
        type: "taxi",
        phone: "+251900000003",
        lat: 9.3530,
        lng: 42.7978,
        address: "City Center, Jigjiga"
      },
      {
        id: 4,
        name: "Regional Hospital",
        type: "hospital",
        phone: "+251900000004",
        lat: 9.3550,
        lng: 42.8050,
        address: "Airport Road, Jigjiga"
      },
      {
        id: 5,
        name: "Student Hostel",
        type: "hostel",
        phone: "+251900000005",
        lat: 9.3480,
        lng: 42.8020,
        address: "Near College, Jigjiga"
      },
      {
        id: 6,
        name: "City Taxi Service",
        type: "taxi",
        phone: "+251900000006",
        lat: 9.3520,
        lng: 42.7950,
        address: "Market Area, Jigjiga"
      }
    ];
    addServicesToMap(allServices);
  });

// Function to add services to map
function addServicesToMap(services) {
  // Clear existing markers
  markers.clearLayers();
  
  services.forEach(service => {
    let icon;
    switch(service.type) {
      case 'hospital':
        icon = hospitalIcon;
        break;
      case 'hostel':
        icon = hostelIcon;
        break;
      case 'taxi':
        icon = taxiIcon;
        break;
      default:
        icon = L.divIcon({className: 'custom-icon', html: '<i class="fas fa-map-marker-alt"></i>', iconSize: [30, 30]});
    }
    
    const marker = L.marker([service.lat, service.lng], {icon: icon})
      .bindPopup(`
        <div class="popup-content">
          <h3>${service.name}</h3>
          <p><strong>Type:</strong> ${service.type.charAt(0).toUpperCase() + service.type.slice(1)}</p>
          ${service.address ? `<p><strong>Address:</strong> ${service.address}</p>` : ''}
          <a href="tel:${service.phone}" class="call-button">
            <i class="fas fa-phone"></i> Call: ${service.phone}
          </a>
        </div>
      `);
    
    marker.serviceType = service.type;
    marker.serviceName = service.name.toLowerCase();
    markers.addLayer(marker);
  });
  
  map.addLayer(markers);
}

// Filter buttons functionality
document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', function() {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    
    const filter = this.dataset.filter;
    filterServices(filter);
  });
});

// Filter services based on selection
function filterServices(filterType) {
  if (filterType === 'all') {
    addServicesToMap(allServices);
    return;
  }
  
  const filteredServices = allServices.filter(service => service.type === filterType);
  addServicesToMap(filteredServices);
}

// Search functionality
document.getElementById('search-btn').addEventListener('click', performSearch);
document.getElementById('search-input').addEventListener('keyup', function(e) {
  if (e.key === 'Enter') {
    performSearch();
  }
});

function performSearch() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  
  if (!searchTerm) {
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    filterServices(activeFilter);
    return;
  }
  
  const filteredServices = allServices.filter(service => 
    service.name.toLowerCase().includes(searchTerm) || 
    (service.address && service.address.toLowerCase().includes(searchTerm))
  );
  
  addServicesToMap(filteredServices);
}

// Locate user functionality
document.getElementById('locate-btn').addEventListener('click', function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        // Add user location marker
        const userMarker = L.marker([userLat, userLng], {
          icon: L.divIcon({
            className: 'custom-icon',
            html: '<i class="fas fa-user"></i>',
            iconSize: [30, 30],
            style: 'background-color: #3498db;'
          })
        }).bindPopup('Your Location').addTo(map);
        
        // Center map on user location
        map.setView([userLat, userLng], 15);
        
        // Remove user marker after 30 seconds
        setTimeout(() => {
          map.removeLayer(userMarker);
        }, 30000);
      },
      error => {
        alert('Unable to get your location: ' + error.message);
      },
      {enableHighAccuracy: true}
    );
  } else {
    alert('Geolocation is not supported by your browser');
  }
});