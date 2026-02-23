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
  // Handle ISO date strings (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)
  let d;
  if (typeof date === 'string' && date.includes('T')) {
    // ISO format with time
    d = new Date(date);
  } else if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // YYYY-MM-DD format
    d = new Date(date + 'T00:00:00');
  } else {
    d = new Date(date);
  }
  
  // Check if date is valid
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

// Display flight results
function displayFlightResults(flights, from, to, date, config = {}) {
  const block = document.querySelector('.flights');
  if (!block) {
    console.error('Flights block not found!');
    return;
  }
  
  console.log('Displaying flights:', flights.length, flights);
  
  // Clear existing content but preserve hidden config divs
  const hiddenDivs = Array.from(block.children).filter(child => child.style.display === 'none');
  block.innerHTML = '';
  // Re-append hidden divs for Universal Editor
  hiddenDivs.forEach(div => {
    div.style.display = 'none';
    block.appendChild(div);
  });
  
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

// Create a default flight item structure in the DOM (editable)
function createDefaultFlightItem(block) {
  const defaultFlightData = SAMPLE_FLIGHTS['JFK-TQO'][0];
  
  // Create a flight item div with the structure that Universal Editor expects
  const flightItem = document.createElement('div');
  flightItem.setAttribute('data-aue-model', 'flight');
  flightItem.setAttribute('data-aue-type', 'component');
  
  // Create field divs in the order expected by the model
  // Mark them as fields (not separate components) to prevent showing in content tree
  // 0: image
  const imageDiv = createElement('div', '');
  imageDiv.setAttribute('data-aue-prop', 'image');
  imageDiv.setAttribute('data-aue-type', 'reference'); // Mark as field type
  const imageLink = createElement('a', '');
  imageLink.href = defaultFlightData.image;
  imageLink.textContent = defaultFlightData.image;
  imageDiv.appendChild(imageLink);
  flightItem.appendChild(imageDiv);
  
  // 1: from
  const fromDiv = createElement('div', '');
  fromDiv.setAttribute('data-aue-prop', 'from');
  fromDiv.setAttribute('data-aue-type', 'text');
  const fromP = createElement('p', '');
  fromP.textContent = defaultFlightData.from;
  fromDiv.appendChild(fromP);
  flightItem.appendChild(fromDiv);
  
  // 2: fromName
  const fromNameDiv = createElement('div', '');
  fromNameDiv.setAttribute('data-aue-prop', 'fromName');
  fromNameDiv.setAttribute('data-aue-type', 'text');
  const fromNameP = createElement('p', '');
  fromNameP.textContent = defaultFlightData.fromName;
  fromNameDiv.appendChild(fromNameP);
  flightItem.appendChild(fromNameDiv);
  
  // 3: to
  const toDiv = createElement('div', '');
  toDiv.setAttribute('data-aue-prop', 'to');
  toDiv.setAttribute('data-aue-type', 'text');
  const toP = createElement('p', '');
  toP.textContent = defaultFlightData.to;
  toDiv.appendChild(toP);
  flightItem.appendChild(toDiv);
  
  // 4: toName
  const toNameDiv = createElement('div', '');
  toNameDiv.setAttribute('data-aue-prop', 'toName');
  toNameDiv.setAttribute('data-aue-type', 'text');
  const toNameP = createElement('p', '');
  toNameP.textContent = defaultFlightData.toName;
  toNameDiv.appendChild(toNameP);
  flightItem.appendChild(toNameDiv);
  
  // 5: departureTime
  const departureTimeDiv = createElement('div', '');
  departureTimeDiv.setAttribute('data-aue-prop', 'departureTime');
  departureTimeDiv.setAttribute('data-aue-type', 'text');
  const departureTimeP = createElement('p', '');
  departureTimeP.textContent = defaultFlightData.departureTime;
  departureTimeDiv.appendChild(departureTimeP);
  flightItem.appendChild(departureTimeDiv);
  
  // 6: arrivalTime
  const arrivalTimeDiv = createElement('div', '');
  arrivalTimeDiv.setAttribute('data-aue-prop', 'arrivalTime');
  arrivalTimeDiv.setAttribute('data-aue-type', 'text');
  const arrivalTimeP = createElement('p', '');
  arrivalTimeP.textContent = defaultFlightData.arrivalTime;
  arrivalTimeDiv.appendChild(arrivalTimeP);
  flightItem.appendChild(arrivalTimeDiv);
  
  // 7: price
  const priceDiv = createElement('div', '');
  priceDiv.setAttribute('data-aue-prop', 'price');
  priceDiv.setAttribute('data-aue-type', 'text');
  const priceP = createElement('p', '');
  priceP.textContent = defaultFlightData.price.toString();
  priceDiv.appendChild(priceP);
  flightItem.appendChild(priceDiv);
  
  // 8: class
  const classDiv = createElement('div', '');
  classDiv.setAttribute('data-aue-prop', 'class');
  classDiv.setAttribute('data-aue-type', 'text');
  const classP = createElement('p', '');
  classP.textContent = defaultFlightData.class;
  classDiv.appendChild(classP);
  flightItem.appendChild(classDiv);
  
  // Append to block (after config divs)
  block.appendChild(flightItem);
  
  return flightItem;
}

// Check if a flight item is completely empty (no data at all)
function isFlightItemEmpty(row) {
  // First check: if row has data-aue-model="flight", it's a flight item
  // If it doesn't have this attribute, it might not be a flight item yet
  const hasModel = row.getAttribute('data-aue-model') === 'flight';
  
  // Check if any field has a value - be more lenient in detection
  const fieldOrder = ['image', 'from', 'fromName', 'to', 'toName', 'departureTime', 'arrivalTime', 'price', 'class'];
  
  for (const fieldName of fieldOrder) {
    const fieldDiv = row.querySelector(`[data-aue-prop="${fieldName}"]`);
    if (fieldDiv) {
      // Check all possible ways a value could be stored
      const p = fieldDiv.querySelector('p');
      const link = fieldDiv.querySelector('a');
      const img = fieldDiv.querySelector('img');
      const picture = fieldDiv.querySelector('picture');
      const nestedDiv = fieldDiv.querySelector('div:not([data-aue-prop])');
      
      // More comprehensive value detection
      const hasValue = (p && p.textContent && p.textContent.trim() !== '') || 
                       (link && ((link.href && link.href.trim() !== '') || (link.textContent && link.textContent.trim() !== ''))) ||
                       (img && ((img.src && img.src.trim() !== '') || (img.getAttribute('data-src') && img.getAttribute('data-src').trim() !== ''))) ||
                       (picture && picture.querySelector('img')) ||
                       (nestedDiv && nestedDiv.textContent && nestedDiv.textContent.trim() !== '') ||
                       (fieldDiv.textContent && fieldDiv.textContent.trim() !== '' && !fieldDiv.querySelector('p') && !fieldDiv.querySelector('a') && !fieldDiv.querySelector('img'));
      
      if (hasValue) {
        return false; // Found at least one field with a value
      }
    }
  }
  
  // Also check by index if no data attributes found
  const children = Array.from(row.children);
  for (let i = 0; i < Math.min(9, children.length); i++) {
    const child = children[i];
    // Skip if it's a display element (not a field div)
    if (child.classList.contains('flight-card-image') || 
        child.classList.contains('flight-card-details') || 
        child.classList.contains('flight-card-price')) {
      continue;
    }
    
    const p = child.querySelector('p');
    const link = child.querySelector('a');
    const img = child.querySelector('img');
    const picture = child.querySelector('picture');
    
    const hasValue = (p && p.textContent && p.textContent.trim() !== '') || 
                     (link && ((link.href && link.href.trim() !== '') || (link.textContent && link.textContent.trim() !== ''))) ||
                     (img && ((img.src && img.src.trim() !== '') || (img.getAttribute('data-src') && img.getAttribute('data-src').trim() !== ''))) ||
                     (picture && picture.querySelector('img')) ||
                     (child.textContent && child.textContent.trim() !== '' && !p && !link && !img);
    
    if (hasValue) {
      return false; // Found at least one field with a value
    }
  }
  
  // If it has the model attribute but no values, it's a new empty item
  // If it doesn't have the model attribute, it might not be a flight item
  return hasModel; // Only consider empty if it's marked as a flight item
}

// Ensure flight item has default values ONLY if it's completely empty
function ensureDefaultValues(row) {
  // Only populate defaults if the item is truly empty
  if (!isFlightItemEmpty(row)) {
    return; // Item has data, don't overwrite
  }
  
  const defaultValues = {
    image: 'https://t3.ftcdn.net/jpg/05/61/35/04/240_F_561350476_Oz0OHoStNdPdsiDVY6K2DQG2SqyYlSgI.jpg',
    from: 'JFK',
    fromName: 'New York',
    to: 'TQO',
    toName: 'Tulum',
    departureTime: '9:00 AM',
    arrivalTime: '1:30 PM',
    price: '450.00',
    class: 'Standard'
  };
  
  const fieldOrder = ['image', 'from', 'fromName', 'to', 'toName', 'departureTime', 'arrivalTime', 'price', 'class'];
  
  fieldOrder.forEach((fieldName, index) => {
    let fieldDiv = row.querySelector(`[data-aue-prop="${fieldName}"]`);
    
    // If not found by data attribute, try by index
    if (!fieldDiv) {
      const children = Array.from(row.children);
      if (children[index]) {
        fieldDiv = children[index];
        // Add data attribute if missing
        if (!fieldDiv.getAttribute('data-aue-prop')) {
          fieldDiv.setAttribute('data-aue-prop', fieldName);
        }
      }
    }
    
    // If field div doesn't exist, create it
    if (!fieldDiv) {
      fieldDiv = createElement('div', '');
      fieldDiv.setAttribute('data-aue-prop', fieldName);
      // Set appropriate data-aue-type based on field type
      if (fieldName === 'image') {
        fieldDiv.setAttribute('data-aue-type', 'reference');
      } else {
        fieldDiv.setAttribute('data-aue-type', 'text');
      }
      row.appendChild(fieldDiv);
    } else {
      // Ensure existing field divs have proper data-aue-type
      if (!fieldDiv.getAttribute('data-aue-type')) {
        if (fieldName === 'image') {
          fieldDiv.setAttribute('data-aue-type', 'reference');
        } else {
          fieldDiv.setAttribute('data-aue-type', 'text');
        }
      }
    }
    
    // Only populate if this specific field is empty
    const p = fieldDiv.querySelector('p');
    const link = fieldDiv.querySelector('a');
    const img = fieldDiv.querySelector('img');
    const picture = fieldDiv.querySelector('picture');
    const nestedDiv = fieldDiv.querySelector('div');
    
    const hasValue = (p && p.textContent?.trim()) || 
                     (link && (link.href || link.textContent?.trim())) ||
                     (img && (img.src || img.getAttribute('data-src'))) ||
                     (picture && picture.querySelector('img')) ||
                     (nestedDiv && nestedDiv.textContent?.trim()) ||
                     (fieldDiv.textContent?.trim() && !fieldDiv.querySelector('p') && !fieldDiv.querySelector('a'));
    
    // Only populate if this field is empty
    if (!hasValue) {
      // Clear existing content
      fieldDiv.innerHTML = '';
      
      if (fieldName === 'image') {
        // For image, create a link
        const imageLink = createElement('a', '');
        imageLink.href = defaultValues.image;
        imageLink.textContent = defaultValues.image;
        fieldDiv.appendChild(imageLink);
      } else {
        // For text fields, create a p tag
        const p = createElement('p', '');
        p.textContent = defaultValues[fieldName];
        fieldDiv.appendChild(p);
      }
    }
  });
}

// Process a flight item directly from the DOM structure
function processFlightItem(row) {
  // Skip if already processed (has display elements)
  if (row.classList.contains('flight-card') && 
      (row.querySelector('.flight-card-image') || row.querySelector('.flight-card-details'))) {
    // Already processed, just update display
    if (row._updateDisplay) {
      row._updateDisplay();
    }
    return;
  }
  
  // Prevent double processing - mark immediately
  if (row._isProcessing) {
    return;
  }
  row._isProcessing = true;
  
  // Ensure default values are populated ONLY if item is completely empty
  // This prevents overwriting saved values on page refresh
  ensureDefaultValues(row);
  
  // Transform the row into a flight card structure while preserving UE fields
  row.className = 'flight-card';
  
  // Store original field divs (preserve them for UE - they must stay as children)
  const originalChildren = Array.from(row.children);
  
  // Helper to read field values from preserved divs - always reads fresh from DOM
  const readFieldValue = (fieldName) => {
    // Always query fresh from the row to get current values
    // First try to find by data attribute
    let fieldDiv = row.querySelector(`[data-aue-prop="${fieldName}"]`);
    
    if (!fieldDiv) {
      // Fallback to index-based
      const index = ['image', 'from', 'fromName', 'to', 'toName', 'departureTime', 'arrivalTime', 'price', 'class'].indexOf(fieldName);
      if (index >= 0) {
        const children = Array.from(row.children);
        // Skip display elements, only look at field divs
        let fieldIndex = 0;
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (child.classList.contains('flight-card-image') || 
              child.classList.contains('flight-card-details') || 
              child.classList.contains('flight-card-price')) {
            continue; // Skip display elements
          }
          if (fieldIndex === index) {
            fieldDiv = child;
            break;
          }
          fieldIndex++;
        }
      }
    }
    
    if (fieldDiv) {
      // For image field, check for link, img, or picture
      if (fieldName === 'image') {
        const link = fieldDiv.querySelector('a');
        if (link && (link.href || link.textContent?.trim())) {
          return link.href || link.textContent?.trim() || '';
        }
        const img = fieldDiv.querySelector('img');
        if (img && (img.src || img.getAttribute('data-src'))) {
          return img.src || img.getAttribute('data-src') || '';
        }
        const picture = fieldDiv.querySelector('picture');
        if (picture) {
          const picImg = picture.querySelector('img');
          if (picImg) return picImg.src || picImg.getAttribute('data-src') || '';
        }
        // Fallback to text content
        return fieldDiv.textContent?.trim() || '';
      }
      // For text fields - check p tag first (most common)
      const p = fieldDiv.querySelector('p');
      if (p && p.textContent?.trim()) {
        return p.textContent.trim();
      }
      // Check for nested div
      const nestedDiv = fieldDiv.querySelector('div:not([data-aue-prop])');
      if (nestedDiv && nestedDiv.textContent?.trim()) {
        return nestedDiv.textContent.trim();
      }
      // Check direct text content (but only if no p or nested div)
      const directText = fieldDiv.textContent?.trim();
      if (directText && !p && !nestedDiv) {
        return directText;
      }
    }
    return '';
  };
  
  // Function to update display from field values
  const updateDisplay = () => {
    const from = readFieldValue('from');
    const fromName = readFieldValue('fromName');
    const to = readFieldValue('to');
    const toName = readFieldValue('toName');
    const departureTime = readFieldValue('departureTime');
    const arrivalTime = readFieldValue('arrivalTime');
    const price = readFieldValue('price');
    const flightClass = readFieldValue('class');
    
    // Update route
    if (routeEl) {
      routeEl.textContent = `${fromName || ''} (${from || ''}) to ${toName || ''} (${to || ''})`;
    }
    
    // Update times
    if (timesEl) {
      timesEl.innerHTML = `
        <div class="flight-time">
          <span class="flight-airport">${from || ''}</span>
          <span class="flight-time-value">${departureTime || ''}</span>
        </div>
        <div class="flight-time">
          <span class="flight-airport">${to || ''}</span>
          <span class="flight-time-value">${arrivalTime || ''}</span>
        </div>
      `;
    }
    
    // Update price
    if (priceClassEl) {
      priceClassEl.textContent = flightClass || 'Standard';
    }
    if (priceEl) {
      priceEl.textContent = price ? `$${parseFloat(price).toFixed(2)}` : '$0.00';
    }
    
    // Update image - use readFieldValue for consistency
    const imageUrl = readFieldValue('image');
    if (imageUrl && imageContainer) {
      const existingImg = imageContainer.querySelector('img');
      if (existingImg) {
        existingImg.src = imageUrl;
        existingImg.alt = `${toName || ''} destination`;
      } else {
        imageContainer.innerHTML = '';
        const newImg = createElement('img', '');
        newImg.src = imageUrl;
        newImg.alt = `${toName || ''} destination`;
        imageContainer.appendChild(newImg);
      }
    }
    
    // Update select button handler
    if (selectButton) {
      selectButton.onclick = () => {
        handleFlightSelect({
          from,
          to,
          fromName,
          toName,
          departureTime,
          arrivalTime,
          price: parseFloat(price) || 0,
          class: flightClass
        });
      };
    }
  };
  
  // Hide original field divs but keep them in DOM for UE (they stay as children)
  originalChildren.forEach((child) => {
    // Only hide if it's a field div (has data-aue-prop or is in expected position)
    // Skip display elements that we're about to add
    if (child.classList.contains('flight-card-image') || 
        child.classList.contains('flight-card-details') || 
        child.classList.contains('flight-card-price')) {
      return; // Don't hide display elements
    }
    
    const isFieldDiv = child.getAttribute('data-aue-prop') || 
                      (originalChildren.indexOf(child) < 9 && !child.classList.contains('flight-card'));
    if (isFieldDiv) {
      child.style.display = 'none';
      child.setAttribute('data-aue-hidden', 'true'); // Mark as hidden for UE
      // Ensure field divs have proper data-aue-type (not component)
      if (!child.getAttribute('data-aue-type')) {
        const propName = child.getAttribute('data-aue-prop');
        if (propName === 'image') {
          child.setAttribute('data-aue-type', 'reference');
        } else {
          child.setAttribute('data-aue-type', 'text');
        }
      }
    }
  });
  
  // Create display elements (these will be added after the field divs)
  const imageContainer = createElement('div', 'flight-card-image');
  const detailsContainer = createElement('div', 'flight-card-details');
  const routeEl = createElement('div', 'flight-route');
  const timesEl = createElement('div', 'flight-times');
  const priceContainer = createElement('div', 'flight-card-price');
  const priceClassEl = createElement('div', 'flight-class');
  const priceEl = createElement('div', 'flight-price');
  const selectButton = createElement('button', 'flight-select-button', 'Select');
  
  detailsContainer.appendChild(routeEl);
  detailsContainer.appendChild(timesEl);
  priceContainer.appendChild(priceClassEl);
  priceContainer.appendChild(priceEl);
  priceContainer.appendChild(selectButton);
  
  // Assemble the card - add display elements AFTER the field divs (they stay as children)
  // Field divs are already in the row, we just add display elements
  row.appendChild(imageContainer);
  row.appendChild(detailsContainer);
  row.appendChild(priceContainer);
  
  // Initial display update
  updateDisplay();
  
  // Set up MutationObserver to sync changes from UE to display
  const observer = new MutationObserver(() => {
    updateDisplay();
  });
  
  // Observe all field divs for changes
  originalChildren.forEach(child => {
    if (child) {
      observer.observe(child, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true
      });
    }
  });
  
  // Store observer and update function on the row
  row._flightObserver = observer;
  row._updateDisplay = updateDisplay;
}

// Read flight item from a block child (row)
function readFlightItem(row) {
  // Each flight item has fields in this order (matching model definition):
  // 0: image (reference - link, img, or picture)
  // 1: from (text)
  // 2: fromName (text)
  // 3: to (text)
  // 4: toName (text)
  // 5: departureTime (text)
  // 6: arrivalTime (text)
  // 7: price (text)
  // 8: class (text)
  
  const readField = (index, fieldName) => {
    // Try to find by data attribute first (more reliable)
    if (fieldName) {
      const byDataAttr = row.querySelector(`[data-aue-prop="${fieldName}"]`);
      if (byDataAttr) {
        // Check for p tag
        const p = byDataAttr.querySelector('p');
        if (p) return p.textContent?.trim() || '';
        // Check for nested div
        const nestedDiv = byDataAttr.querySelector('div');
        if (nestedDiv) return nestedDiv.textContent?.trim() || '';
        // Check direct text content
        return byDataAttr.textContent?.trim() || '';
      }
    }
    
    // Fallback to index-based reading
    const div = row.querySelector(`:scope > div:nth-child(${index + 1})`);
    if (div) {
      // Check for p tag first (common structure)
      const p = div.querySelector('p');
      if (p) return p.textContent?.trim() || '';
      // Check for nested div
      const nestedDiv = div.querySelector('div');
      if (nestedDiv) return nestedDiv.textContent?.trim() || '';
      // Check direct text content
      return div.textContent?.trim() || '';
    }
    return '';
  };
  
  // Read image - can be a link, img tag, or picture element
  // Try data attribute first
  let imageDiv = row.querySelector('[data-aue-prop="image"]');
  if (!imageDiv) {
    // Fallback to first child
    imageDiv = row.querySelector(':scope > div:nth-child(1)');
  }
  
  let imageUrl = '';
  if (imageDiv) {
    // Check for picture > img
    const picture = imageDiv.querySelector('picture');
    if (picture) {
      const img = picture.querySelector('img');
      if (img) {
        imageUrl = img.src || img.getAttribute('data-src') || '';
      }
    } else {
      // Check for direct img tag
      const img = imageDiv.querySelector('img');
      if (img) {
        imageUrl = img.src || img.getAttribute('data-src') || '';
      } else {
        // Check for link
        const link = imageDiv.querySelector('a');
        if (link) {
          imageUrl = link.href || link.textContent?.trim() || '';
        } else {
          // Check for text content (path)
          const div = imageDiv.querySelector('div');
          const text = div?.textContent?.trim() || imageDiv.textContent?.trim() || '';
          if (text) {
            imageUrl = text;
          }
        }
      }
    }
  }
  
  const flight = {
    id: `flight-${Date.now()}-${Math.random()}`,
    image: imageUrl,
    from: readField(1, 'from'),
    fromName: readField(2, 'fromName'),
    to: readField(3, 'to'),
    toName: readField(4, 'toName'),
    departureTime: readField(5, 'departureTime'),
    arrivalTime: readField(6, 'arrivalTime'),
    price: parseFloat(readField(7, 'price')) || 0,
    class: readField(8, 'class'),
  };
  
  // Debug logging to help troubleshoot
  console.log('Flight item read:', flight);
  
  // Only return flight if it has required fields
  if (flight.from && flight.to) {
    return flight;
  }
  return null;
}

// Main decorate function
export default async function decorate(block) {
  // Prevent multiple executions
  if (block.dataset.decorated === 'true') {
    return;
  }
  block.dataset.decorated = 'true';
  
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
  const urlFrom = urlParams.get('from');
  const urlTo = urlParams.get('to');
  const urlDate = urlParams.get('date');
  
  // Preserve block structure for authoring
  block.className = 'flights';
  
  // Hide config divs but keep them for Universal Editor
  // Only hide if they have data-aue-prop attributes matching the flights block model
  Array.from(block.children).forEach((child, index) => {
    // Check if this is a config field (flights block model fields)
    const isConfigField = child.getAttribute('data-aue-prop') === 'title' ||
                         child.getAttribute('data-aue-prop') === 'subtitle' ||
                         child.getAttribute('data-aue-prop') === 'defaultFrom' ||
                         child.getAttribute('data-aue-prop') === 'defaultTo' ||
                         child.getAttribute('data-aue-prop') === 'defaultDate' ||
                         child.getAttribute('data-aue-prop') === 'apiUrl' ||
                         child.getAttribute('data-aue-prop') === 'flightImages' ||
                         (index < 7 && !child.getAttribute('data-aue-model')); // First 7 children without flight model are config
    if (isConfigField) {
      child.style.display = 'none';
    }
  });
  
  // Check if URL parameters are present - if so, use sample data
  if (urlFrom && urlTo) {
    // URL params present - use sample data
    const route = `${urlFrom}-${urlTo}`;
    const flights = SAMPLE_FLIGHTS[route] || [];
    displayFlightResults(flights, urlFrom, urlTo, urlDate || config.defaultDate, config);
    return;
  }
  
  // No URL params - check for authorable flight items first
  const children = Array.from(block.children);
  const flightItems = [];
  const processedItems = new Set(); // Track processed items to prevent duplicates
  
  // Find flight items (starting from index 7, after config divs)
  for (let i = 7; i < children.length; i++) {
    const child = children[i];
    
    // Skip if it's a display element (already processed)
    if (child.classList.contains('flight-results-header') || 
        child.classList.contains('flight-results-disclaimer') ||
        child.classList.contains('flight-results-list') ||
        child.classList.contains('flight-card-image') ||
        child.classList.contains('flight-card-details') ||
        child.classList.contains('flight-card-price')) {
      continue;
    }
    
    // Skip if already processed
    if (processedItems.has(child)) {
      continue;
    }
    
    // Check if this child is a flight item
    const hasFlightModel = child.getAttribute('data-aue-model') === 'flight';
    const hasFlightData = child.querySelector('[data-aue-prop="from"]') || 
                         child.querySelector('[data-aue-prop="to"]');
    
    // Only process if it's explicitly marked as a flight item OR has flight data fields
    // Don't process based on child count alone as config fields might match
    if (hasFlightModel || hasFlightData) {
      // Skip if already processed (has flight-card class and display elements)
      if (child.classList.contains('flight-card') && 
          (child.querySelector('.flight-card-image') || child.querySelector('.flight-card-details'))) {
        // Already processed, just add to list if not already added
        if (!flightItems.includes(child)) {
          flightItems.push(child);
        }
        processedItems.add(child);
        continue;
      }
      
      // Ensure it has the model attribute for UE
      if (!child.getAttribute('data-aue-model')) {
        child.setAttribute('data-aue-model', 'flight');
        child.setAttribute('data-aue-type', 'component');
      }
      
      // This is a flight item - process it directly (which will ensure defaults only if empty)
      // Only process if not already in the list
      if (!flightItems.includes(child)) {
        processFlightItem(child);
        flightItems.push(child);
        processedItems.add(child);
      }
    }
  }
  
  // Don't create default flight - flights should only appear when explicitly added in UE
  // If no flight items exist, just show empty state or nothing
  
  // Only display UI elements if there are flight items
  if (flightItems.length === 0) {
    // No flights - just return, don't show anything
    return;
  }
  
  // Display authorable flight items
  // Add title and subtitle if configured
  if (config.title || config.subtitle) {
    const titleSection = createElement('div', 'flight-results-header');
    if (config.title) {
      const title = createElement('h2', 'flight-results-title');
      title.textContent = config.title;
      titleSection.appendChild(title);
    }
    if (config.subtitle) {
      const subtitle = createElement('p', 'flight-results-subtitle');
      subtitle.textContent = config.subtitle;
      titleSection.appendChild(subtitle);
    }
    // Insert before first flight item
    if (flightItems[0]) {
      block.insertBefore(titleSection, flightItems[0]);
    } else {
      block.appendChild(titleSection);
    }
  }
  
  // Add disclaimer
  const disclaimer = createElement('p', 'flight-results-disclaimer');
  disclaimer.textContent = 'Presented fares are per passenger, including fees and taxes. Additional services and amenities may vary per flight or change in time.';
  if (flightItems[0]) {
    block.insertBefore(disclaimer, flightItems[0]);
  } else {
    block.appendChild(disclaimer);
  }
  
  // Wrap flight items in a container (move them)
  const resultsList = createElement('div', 'flight-results-list');
  flightItems.forEach(item => {
    resultsList.appendChild(item);
  });
  block.appendChild(resultsList);
}

