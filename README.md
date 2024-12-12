# Weather Forecast App

## Overview
The Weather Forecast App provides users with real-time weather information and a 7-day forecast. Users can search for a specific city or use their current location to access weather details such as temperature, humidity, wind speed, and more. The app also visualizes temperature trends in an interactive chart.

## [Click here to check out the Weather App](https://weather-invention.vercel.app/)
---

## Features
1. **Location Access:**
   - Use your current location to fetch weather data automatically.
   - Search for any city to get its weather information.

2. **Real-Time Weather Details:**
   - Displays current temperature, humidity, wind speed, and feels-like temperature.

3. **7-Day Forecast:**
   - Provides max and min temperatures, visualized in a dynamic line chart.

4. **Interactive UI:**
   - Loading spinner for feedback during data fetch.
   - Error messages for invalid inputs or failed requests.

5. **Responsive Design:**
   - Optimized layout for desktop and mobile devices.

---

## How It Works
1. **Search or Geolocation:**
   - Users can input a city name or click the "Use My Location" button to fetch weather data.

2. **Data Fetching:**
   - The app uses the Open-Meteo API for weather information and the Geocoding API to convert city names into coordinates.

3. **Data Display:**
   - Current weather and 7-day forecast are displayed in a user-friendly interface, with temperatures visualized using a line chart powered by Chart.js.

---

## Technical Overview

### Utility Functions
- **`showLoading()` / `hideLoading()`**: Controls the visibility of the loading spinner.
- **`showError(message)` / `hideError()`**: Displays or hides error messages.
- **`validateCoordinates(latitude, longitude)`**: Ensures latitude and longitude values are valid geographic coordinates.

### API Functions
- **`getCurrentPosition()`**:
  Retrieves the user’s current latitude and longitude using the browser's Geolocation API.

- **`fetchWeatherData(latitude, longitude)`**:
  Fetches weather data from the Open-Meteo API for the provided coordinates. Validates the response to ensure it contains all required fields.

- **`geocodeLocation(location)`**:
  Converts a city name into geographic coordinates using the Geocoding API. Ensures the location exists and returns its coordinates and formatted name.

### Weather Display Functions
- **`updateCurrentWeather(data)`**:
  Updates the current weather section (temperature, humidity, wind speed, and feels-like temperature).

- **`updateForecastChart(data)`**:
  Visualizes 7-day forecast trends (max and min temperatures) using Chart.js.

- **`updateForecastCards(data)`**:
  Populates the forecast cards with daily weather data, including day names, temperature ranges, and weather icons.

### Main Logic
- **`fetchAndDisplayWeather(latitude, longitude)`**:
  Integrates data fetching and UI updates. It fetches weather data, updates the weather card, and visualizes the 7-day forecast.

### Event Handlers
- **`handleGetCurrentLocation()`**:
  Uses geolocation to fetch the user’s current location, reverse geocodes it to get the city name, and updates the weather UI.

- **`handleSearchLocation()`**:
  Fetches weather data for a user-specified city by first geocoding the location name.

### Event Listeners
- Adds listeners for:
  - **`getCurrentLocation` button:** Calls `handleGetCurrentLocation()`.
  - **`searchLocation` button:** Calls `handleSearchLocation()`.
  - **Enter key in the search input field:** Triggers `handleSearchLocation()`.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/weather-forecast-app.git
   ```

2. Navigate to the project directory:
   ```bash
   cd weather-forecast-app
   ```

3. Open the `index.html` file in a browser.

---

## File Structure

```
weather-forecast-app/
├── index.html        # The main HTML file
├── styles.css        # CSS for styling
├── app.js            # JavaScript logic
```

---

## APIs Used
- **[Open-Meteo API](https://open-meteo.com/):** Provides weather data including hourly and daily forecasts.
- **[Open-Meteo Geocoding API](https://open-meteo.com/geocoding):** Converts city names into geographic coordinates.

---
