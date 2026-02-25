# Flight Search Block

A reusable flight search component with From/To airport selection, date picker, and flight results display.

## Features

- **From/To Airport Selection**: Dropdown menus with airport codes and names
- **Date Picker**: Calendar input for selecting travel date
- **Search Functionality**: Search for flights based on selected criteria
- **Flight Results**: Display flight options with details and Select buttons
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Usage

Add the block to your page HTML:

```html
<div class="flight-search"></div>
```

The block will automatically load and render the flight search form.

## Configuration

The block can be configured via the component definition JSON file (`_flight-search.json`). Available options:

- `title`: Optional title for the flight search block
- `subtitle`: Optional subtitle
- `apiUrl`: Optional API URL for fetching flight data (if not provided, sample data is used)
- `enableBusinessTrip`: Enable/disable Business Trip option checkbox
- `enableBusinessClass`: Enable/disable Business Class option checkbox
- `enableTravellingChildren`: Enable/disable Travelling with Children option checkbox

## URL Parameters

The block supports URL parameters to pre-fill the form:

- `?from=AMS` - Pre-select "From" airport
- `?to=TQO` - Pre-select "To" airport
- `?date=2025-03-15` - Pre-select date (YYYY-MM-DD format)

Example: `/page?from=AMS&to=TQO&date=2025-03-15`

If all three parameters are provided, the search will automatically execute.

## Sample Data

The block includes sample flight data for testing. In production, replace the `SAMPLE_FLIGHTS` object in `flight-search.js` with an API call to fetch real flight data.

## Styling

The block uses CSS custom properties for theming:

- `--background-color`: Background color for cards and inputs
- `--background-color-secondary`: Background for form and price sections
- `--text-color`: Primary text color
- `--text-color-secondary`: Secondary text color
- `--text-color-light`: Light text color (for dark backgrounds)
- `--link-color`: Primary link/button color
- `--link-color-hover`: Hover state for links/buttons
- `--border-color`: Border color

## Airport Codes

The block includes a predefined list of airports. To add more airports, update the `AIRPORTS` array in `flight-search.js`.
