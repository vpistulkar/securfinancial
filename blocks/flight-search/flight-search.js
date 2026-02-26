// Flight Search Block
import { getMetadata, readBlockConfig } from '../../scripts/aem.js';
import { isAuthorEnvironment } from '../../scripts/scripts.js';
import { getPathDetails } from '../../scripts/utils.js';

// Sample airport data
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

function getTodayDate() {
  const today = new Date();
  return formatDate(today);
}

// Create airport dropdown
function createAirportDropdown(airports, selectedCode, placeholder, id) {
  const container = createElement('div', 'flight-input-group');
  const label = createElement('label', '', placeholder);
  label.setAttribute('for', id);
  
  const inputContainer = createElement('div', 'flight-input-container');
  const input = createElement('input', 'flight-input');
  input.type = 'text';
  input.id = id;
  input.placeholder = placeholder;
  input.value = selectedCode || '';
  input.readOnly = true;
  input.setAttribute('aria-label', placeholder);
  
  const dropdown = createElement('div', 'airport-dropdown');
  dropdown.style.display = 'none';
  
  airports.forEach((airport) => {
    const option = createElement('div', 'airport-option');
    option.dataset.code = airport.code;
    option.innerHTML = `
      <span class="airport-code">${airport.code}</span>
      <span class="airport-name">${airport.name}</span>
      <span class="airport-city">${airport.city}</span>
    `;
    option.addEventListener('click', () => {
      input.value = airport.code;
      dropdown.style.display = 'none';
      inputContainer.classList.remove('open');
      // Trigger search if both fields are filled
      const searchBtn = document.querySelector('.flight-search-button');
      if (searchBtn) {
        const fromInput = document.getElementById('flight-from');
        const toInput = document.getElementById('flight-to');
        if (fromInput.value && toInput.value) {
          // Auto-search can be enabled here if needed
        }
      }
    });
    dropdown.appendChild(option);
  });
  
  input.addEventListener('click', (e) => {
    e.stopPropagation();
    const allDropdowns = document.querySelectorAll('.airport-dropdown');
    allDropdowns.forEach((dd) => {
      if (dd !== dropdown) {
        dd.style.display = 'none';
        dd.parentElement.classList.remove('open');
      }
    });
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    inputContainer.classList.toggle('open');
  });
  
  inputContainer.appendChild(input);
  inputContainer.appendChild(dropdown);
  container.appendChild(label);
  container.appendChild(inputContainer);
  
  return container;
}

// Create date picker
function createDatePicker(selectedDate, id) {
  const container = createElement('div', 'flight-input-group');
  const label = createElement('label', '', 'Date');
  label.setAttribute('for', id);
  
  const inputContainer = createElement('div', 'flight-input-container');
  const input = createElement('input', 'flight-input');
  input.type = 'date';
  input.id = id;
  input.value = selectedDate || '';
  input.min = getTodayDate();
  input.setAttribute('aria-label', 'Date');
  
  inputContainer.appendChild(input);
  container.appendChild(label);
  container.appendChild(inputContainer);
  
  return container;
}

// Default airport selection when no URL params
const DEFAULT_FROM = 'WAW';
const DEFAULT_TO = 'TQO';

// Create search form
function createFlightSearchForm(fromDefault = DEFAULT_FROM, toDefault = DEFAULT_TO) {
  const form = createElement('form', 'flight-search-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSearch();
  });
  
  const searchRow = createElement('div', 'flight-search-row');
  
  // From dropdown (default WAW)
  const fromGroup = createAirportDropdown(AIRPORTS, fromDefault, 'From', 'flight-from');
  searchRow.appendChild(fromGroup);
  
  // To dropdown (default TQO)
  const toGroup = createAirportDropdown(AIRPORTS, toDefault, 'To', 'flight-to');
  searchRow.appendChild(toGroup);
  
  // Date picker
  const dateGroup = createDatePicker('', 'flight-date');
  searchRow.appendChild(dateGroup);
  
  // Search button
  const buttonGroup = createElement('div', 'flight-button-group');
  const searchButton = createElement('button', 'flight-search-button', 'Search');
  searchButton.type = 'submit';
  buttonGroup.appendChild(searchButton);
  searchRow.appendChild(buttonGroup);
  
  form.appendChild(searchRow);
  
  // Options row
  const optionsRow = createElement('div', 'flight-options-row');
  const options = [
    { id: 'business-trip', label: 'Business Trip' },
    { id: 'business-class', label: 'Business Class' },
    { id: 'travelling-children', label: 'Travelling with children' },
  ];
  
  options.forEach((option) => {
    const optionContainer = createElement('div', 'flight-option');
    const checkbox = createElement('input', 'flight-checkbox');
    checkbox.type = 'checkbox';
    checkbox.id = option.id;
    checkbox.name = option.id;
    
    const label = createElement('label', '', option.label);
    label.setAttribute('for', option.id);
    
    optionContainer.appendChild(checkbox);
    optionContainer.appendChild(label);
    optionsRow.appendChild(optionContainer);
  });
  
  form.appendChild(optionsRow);
  
  return form;
}

// Handle search
function handleSearch() {
  const fromInput = document.getElementById('flight-from');
  const toInput = document.getElementById('flight-to');
  const dateInput = document.getElementById('flight-date');
  
  const from = fromInput?.value?.trim() || '';
  const to = toInput?.value?.trim() || '';
  const date = dateInput?.value || '';
  
  // Build URL with query parameters (from, to, date are optional)
  const isAuthor = isAuthorEnvironment();
  const { pathname } = window.location;
  let flightsPath;
  
  if (isAuthor) {
    // Author environment: /content/wknd-fly/language-masters/en/home.html
    // Get language code from path details and ensure it's in the URL
    const pathDetails = getPathDetails();
    const { langCode } = pathDetails;
    const pathParts = pathname.split('/');
    const langMastersIndex = pathParts.indexOf('language-masters');
    
    if (langMastersIndex !== -1) {
      // Check if language code exists after language-masters
      const expectedLangIndex = langMastersIndex + 1;
      const hasLanguageCode = pathParts.length > expectedLangIndex 
        && /^[a-z]{2,3}$/i.test(pathParts[expectedLangIndex]) 
        && !pathParts[expectedLangIndex].includes('.html');
      
      if (hasLanguageCode) {
        // Path has language: /content/wknd-fly/language-masters/en/home.html
        // Replace last part (e.g., 'home.html') with 'flights.html'
        pathParts[pathParts.length - 1] = 'flights.html';
        flightsPath = pathParts.join('/');
      } else {
        // Language code missing, insert it before the page name
        // /content/wknd-fly/language-masters/home.html -> /content/wknd-fly/language-masters/en/flights.html
        const languageToUse = langCode || 'en';
        // Insert language code after language-masters
        pathParts.splice(langMastersIndex + 1, 0, languageToUse);
        // Replace last part with flights.html
        pathParts[pathParts.length - 1] = 'flights.html';
        flightsPath = pathParts.join('/');
      }
    } else {
      // No language-masters found, use getPathDetails to construct path
      // This shouldn't happen in author, but handle it
      const languageToUse = langCode || 'en';
      pathParts[pathParts.length - 1] = 'flights.html';
      flightsPath = pathParts.join('/');
    }
  } else {
    // Live site: /en/flights or /web/wknd-fly/flights
    // Get path details to extract language and structure
    const pathDetails = getPathDetails();
    const { langCode, prefix } = pathDetails;
    
    if (langCode) {
      // Path has language: /en/home -> /en/flights
      // Or /web/wknd-fly/en/home -> /web/wknd-fly/en/flights
      if (prefix) {
        flightsPath = `${prefix}/${langCode}/flights`;
      } else {
        flightsPath = `/${langCode}/flights`;
      }
    } else {
      // No language detected, use current path structure
      // /web/wknd-fly/home -> /web/wknd-fly/flights
      const pathParts = pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        pathParts[pathParts.length - 1] = 'flights';
        flightsPath = '/' + pathParts.join('/');
      } else {
        flightsPath = '/flights';
      }
    }
  }
  
  // Build query string (only include non-empty values)
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (date) params.set('date', date);
  
  const queryString = params.toString();
  const url = queryString ? `${flightsPath}?${queryString}` : flightsPath;
  window.location.href = url;
}


// Close dropdowns when clicking outside
function setupClickOutside() {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.flight-input-container')) {
      const dropdowns = document.querySelectorAll('.airport-dropdown');
      dropdowns.forEach((dropdown) => {
        dropdown.style.display = 'none';
        dropdown.parentElement.classList.remove('open');
      });
    }
  });
}

// Main decorate function
export default async function decorate(block) {
  const config = readBlockConfig(block) || {};
  /* Hide button config rows (index >= 7) on published/live, same as hero/cards */
  [...block.children].forEach((row, index) => {
    if (index >= 7) row.style.display = 'none';
  });

  // Clear block
  block.innerHTML = '';
  block.className = 'flight-search';
  
  // Check for URL parameters to pre-fill form (override defaults when present)
  const urlParams = new URLSearchParams(window.location.search);
  const fromParam = urlParams.get('from');
  const toParam = urlParams.get('to');
  const dateParam = urlParams.get('date');
  
  const form = createFlightSearchForm(fromParam || DEFAULT_FROM, toParam || DEFAULT_TO);
  block.appendChild(form);
  
  // Setup click outside handler
  setupClickOutside();
  
  if (dateParam) {
    const dateInput = document.getElementById('flight-date');
    if (dateInput) dateInput.value = dateParam;
  }
}

