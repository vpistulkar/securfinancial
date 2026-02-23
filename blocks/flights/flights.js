// Flights Block - Displays flight search results
// Sample airport data (shared with flight-search)
const AIRPORTS = [
  { code: 'WAW', name: 'Warsaw Chopin Airport', city: 'Warsaw' },
  { code: 'LHR', name: 'London Heathrow', city: 'London' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris' },
  { code: 'ORD', name: 'O\'Hare International', city: 'Chicago' },
  { code: 'LAS', name: 'McCarran International', city: 'Las Vegas' },
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York' },
  { code: 'MBJ', name: 'Sangster International', city: 'Montego Bay' },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam' },
  { code: 'TXL', name: 'Berlin Tegel', city: 'Berlin' },
  { code: 'HND', name: 'Haneda Airport', city: 'Tokyo' },
  { code: 'SFR', name: 'San Francisco International', city: 'San Francisco' },
  { code: 'CUN', name: 'Cancún International', city: 'Cancún' },
  { code: 'DEL', name: 'Indira Gandhi International', city: 'Delhi' },
  { code: 'TQO', name: 'Tulum International', city: 'Tulum' },
];

// Sample flight data - in production, this would come from an API
const SAMPLE_FLIGHTS = {
  'AMS-TQO': [
    {
      id: '1',
      from: 'AMS',
      to: 'TQO',
      fromName: 'Amsterdam',
      toName: 'Tulum',
      departureTime: '5:15 PM',
      arrivalTime: '3:30 AM',
      price: 550.00,
      class: 'Standard',
      image: 'https://t4.ftcdn.net/jpg/03/30/53/47/240_F_330534715_1vke3762QI4yYRsnSXNaE8NGDUF8xzno.jpg',
    },
    {
      id: '2',
      from: 'AMS',
      to: 'TQO',
      fromName: 'Amsterdam',
      toName: 'Tulum',
      departureTime: '8:30 AM',
      arrivalTime: '6:45 PM',
      price: 625.00,
      class: 'Business',
      image: 'https://t3.ftcdn.net/jpg/17/40/03/60/240_F_1740036054_pyNaH8LuAe27d9KpFTZSjNAY844g6WJV.jpg',
    },
  ],
  'WAW-TQO': [
    {
      id: '3',
      from: 'WAW',
      to: 'TQO',
      fromName: 'Warsaw',
      toName: 'Tulum',
      departureTime: '10:00 AM',
      arrivalTime: '8:15 PM',
      price: 680.00,
      class: 'Standard',
      image: 'https://t4.ftcdn.net/jpg/16/22/86/51/240_F_1622865138_g9NtaEIxizg8ZY1bpNCqJiqbQl9mqFvB.jpg',
    },
  ],
  'LHR-TQO': [
    {
      id: '4',
      from: 'LHR',
      to: 'TQO',
      fromName: 'London',
      toName: 'Tulum',
      departureTime: '2:00 PM',
      arrivalTime: '11:30 PM',
      price: 720.00,
      class: 'Standard',
      image: 'https://t4.ftcdn.net/jpg/09/33/35/09/240_F_933350998_f9ATUKob9OVKFGS0zNetT28Ub4NTSwEN.jpg',
    },
  ],
  'JFK-TQO': [
    {
      id: '5',
      from: 'JFK',
      to: 'TQO',
      fromName: 'New York',
      toName: 'Tulum',
      departureTime: '9:00 AM',
      arrivalTime: '1:30 PM',
      price: 450.00,
      class: 'Standard',
      image: 'https://t3.ftcdn.net/jpg/05/61/35/04/240_F_561350476_Oz0OHoStNdPdsiDVY6K2DQG2SqyYlSgI.jpg',
    },
  ],
};

// Utility functions
function createElement(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content !== undefined) {
    if (typeof content === 'string') {
      element.innerHTML = content;
    } else {
      element.appendChild(content);
    }
  }
  return element;
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

// Display flight results
function displayFlightResults(flights, from, to, date, config = {}) {
  const block = document.querySelector('.flights');
  if (!block) return;
  
  block.innerHTML = '';
  
  if (flights.length === 0) {
    const noResults = createElement('div', 'flight-no-results');
    noResults.innerHTML = `
      <p>No flights found for ${from} to ${to}${date ? ` on ${formatDate(date)}` : ''}</p>
      <p>Please try different airports or dates.</p>
      <a href="/" class="flight-back-link">← Back to Search</a>
    `;
    block.appendChild(noResults);
    return;
  }
  
  // Title - use authorable title if provided, otherwise generate default
  const title = createElement('h2', 'flight-results-title');
  if (config.title) {
    title.textContent = config.title;
  } else {
    const fromAirport = AIRPORTS.find((a) => a.code === from);
    const toAirport = AIRPORTS.find((a) => a.code === to);
    title.textContent = `One-Way connections from ${fromAirport?.city || from} to ${toAirport?.city || to}`;
  }
  block.appendChild(title);
  
  // Subtitle - use authorable subtitle if provided
  if (config.subtitle) {
    const subtitle = createElement('p', 'flight-results-subtitle');
    subtitle.textContent = config.subtitle;
    block.appendChild(subtitle);
  }
  
  // Disclaimer
  const disclaimer = createElement('p', 'flight-results-disclaimer');
  disclaimer.textContent = 'Presented fares are per passenger, including fees and taxes. Additional services and amenities may vary per flight or change in time.';
  block.appendChild(disclaimer);
  
  // Results list
  const resultsList = createElement('div', 'flight-results-list');
  
  // Use authorable images if provided (already an array from readImageReferences)
  const authorableImages = Array.isArray(config.flightImages) ? config.flightImages : [];
  
  flights.forEach((flight, index) => {
    const flightCard = createElement('div', 'flight-card');
    
    const imageContainer = createElement('div', 'flight-card-image');
    const image = createElement('img', '');
    // Use authorable image if available, otherwise use flight's default image
    image.src = authorableImages[index] || flight.image;
    image.alt = `${flight.toName} destination`;
    imageContainer.appendChild(image);
    
    const detailsContainer = createElement('div', 'flight-card-details');
    
    const route = createElement('div', 'flight-route');
    route.textContent = `${flight.fromName} (${flight.from}) to ${flight.toName} (${flight.to})`;
    
    const times = createElement('div', 'flight-times');
    times.innerHTML = `
      <div class="flight-time">
        <span class="flight-airport">${flight.from}</span>
        <span class="flight-time-value">${flight.departureTime}</span>
      </div>
      <div class="flight-time">
        <span class="flight-airport">${flight.to}</span>
        <span class="flight-time-value">${flight.arrivalTime}</span>
      </div>
    `;
    
    detailsContainer.appendChild(route);
    detailsContainer.appendChild(times);
    
    const priceContainer = createElement('div', 'flight-card-price');
    const priceClass = createElement('div', 'flight-class');
    priceClass.textContent = flight.class;
    
    const price = createElement('div', 'flight-price');
    price.textContent = `$${flight.price.toFixed(2)}`;
    
    const selectButton = createElement('button', 'flight-select-button', 'Select');
    selectButton.addEventListener('click', () => {
      handleFlightSelect(flight);
    });
    
    priceContainer.appendChild(priceClass);
    priceContainer.appendChild(price);
    priceContainer.appendChild(selectButton);
    
    flightCard.appendChild(imageContainer);
    flightCard.appendChild(detailsContainer);
    flightCard.appendChild(priceContainer);
    
    resultsList.appendChild(flightCard);
  });
  
  block.appendChild(resultsList);
}

// Handle flight selection
function handleFlightSelect(flight) {
  // In production, this would navigate to booking page or show booking modal
  console.log('Selected flight:', flight);
  alert(`Selected flight from ${flight.from} to ${flight.to} for $${flight.price.toFixed(2)}`);
  
  // You can add navigation or modal here
  // window.location.href = `/book-flight?id=${flight.id}`;
}

// Main decorate function
export default async function decorate(block) {
  // Read configuration from block children (authorable fields)
  // Block structure: each field is in a div > div > p structure
  const readConfigValue = (index) => {
    const div = block.querySelector(`:scope > div:nth-child(${index}) > div`);
    return div?.textContent?.trim() || '';
  };
  
  // Read all authorable fields
  // For multi-reference fields like images, read all links/anchors
  const readImageReferences = () => {
    const imageDiv = block.querySelector(':scope > div:nth-child(7)');
    if (!imageDiv) return [];
    const links = imageDiv.querySelectorAll('a');
    return Array.from(links).map(link => link.href || link.textContent?.trim()).filter(Boolean);
  };
  
  const config = {
    title: readConfigValue(1),
    subtitle: readConfigValue(2),
    defaultFrom: readConfigValue(3),
    defaultTo: readConfigValue(4),
    defaultDate: readConfigValue(5),
    apiUrl: readConfigValue(6),
    flightImages: readImageReferences(),
  };
  
  // Get URL parameters (priority over authorable fields)
  const urlParams = new URLSearchParams(window.location.search);
  const from = urlParams.get('from') || config.defaultFrom;
  const to = urlParams.get('to') || config.defaultTo;
  const date = urlParams.get('date') || config.defaultDate;
  
  // Preserve block structure for authoring
  block.className = 'flights';
  
  // If no from/to values (neither URL params nor authorable), show message
  if (!from || !to) {
    // Hide config divs but keep them for Universal Editor
    Array.from(block.children).forEach((child, index) => {
      if (index >= 0 && index < 7) {
        child.style.display = 'none';
      }
    });
    
    const noParams = createElement('div', 'flight-no-results');
    noParams.innerHTML = `
      <p>Please provide flight search parameters.</p>
      <p>Use the flight search form to find flights, or configure default values in the block settings.</p>
      <a href="/" class="flight-back-link">← Back to Search</a>
    `;
    block.appendChild(noParams);
    return;
  }
  
  // Hide config divs but keep them for Universal Editor
  Array.from(block.children).forEach((child, index) => {
    if (index >= 0 && index < 7) {
      child.style.display = 'none';
    }
  });
  
  // Get flight results based on route
  const route = `${from}-${to}`;
  let flights = SAMPLE_FLIGHTS[route] || [];
  
  // If API URL is provided, fetch from API (future enhancement)
  // For now, use sample data
  
  // Display results with config
  displayFlightResults(flights, from, to, date, config);
}

