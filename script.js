const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const isLeapYear = (year) =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
const getDaysInFebruary = (year) => (isLeapYear(year) ? 29 : 28);
const getDaysInMonth = (month, year) => {
  const daysOfMonth = [
    31,
    getDaysInFebruary(year),
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return daysOfMonth[month];
};

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const today = new Date();

const generateCalendar = (month, year) => {
  const calendarDays = document.querySelector(".calendar-days");
  calendarDays.innerHTML = "";
  const events = JSON.parse(localStorage.getItem("events")) || [];

  // Update the calendar header
  const calendarHeaderMonth = document.querySelector(".month");
  const calendarHeaderYear = document.querySelector(".year");
  calendarHeaderMonth.textContent = monthNames[month];
  calendarHeaderYear.textContent = year;

  // Get the first day of the month
  const firstDay = new Date(year, month, 1).getDay();

  // Generate the days
  for (let i = 0; i < getDaysInMonth(month, year) + firstDay; i++) {
    const day = document.createElement("div");
    if (i >= firstDay) {
      const dayNum = i - firstDay + 1;
      day.textContent = dayNum;
      day.classList.add("calendar-day");
      day.setAttribute("data-day", dayNum);
      day.setAttribute("data-month", month);
      day.setAttribute("data-year", year);

      // Highlight the current date
      if (
        dayNum === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      ) {
        day.classList.add("current-date");
      }

      // Add event listeners for creating and editing events
      day.addEventListener("click", openEventCreator);

      // Display an event indicator if there are events on this day
      const dayEvents = events.filter(
        (e) =>
          new Date(e.date).toDateString() ===
          new Date(year, month, dayNum).toDateString()
      );
      if (dayEvents.length > 0) {
        const eventIndicator = document.createElement("span");
        eventIndicator.classList.add("event-indicator");
        day.appendChild(eventIndicator);
      }
    } else {
      day.classList.add("padding");
    }
    calendarDays.appendChild(day);
  }
};

// Function to update the event list for the selected day
const updateEventList = (dayNum, month, year) => {
  const eventList = document.querySelector("#event-list");
  eventList.innerHTML = ""; // Clear the current list

  const events = JSON.parse(localStorage.getItem("events")) || [];
  const dayEvents = events.filter(
    (e) =>
      new Date(e.date).toDateString() ===
      new Date(year, month, dayNum).toDateString()
  );

  dayEvents.forEach((event) => {
    const eventItem = document.createElement("li");
    eventItem.textContent = event.title;
    eventItem.setAttribute("data-event-id", event.id);
    eventItem.addEventListener("click", () => editEvent(event.id));
    eventItem.addEventListener("dblclick", (e) => {
      e.stopPropagation(); // Prevent the click event from firing
      if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
        deleteEvent(event.id);
      }
    });
    eventList.appendChild(eventItem);
  });
};

// Function to open the event creator form
function openEventCreator(event) {
  const dayElement = event.target;
  const dayNum = dayElement.getAttribute("data-day");
  const month = dayElement.getAttribute("data-month");
  const year = dayElement.getAttribute("data-year");

  // Display the event creator form
  const eventCreator = document.querySelector(".event-creator");
  eventCreator.style.transform = "translateX(0%)";

  // Pre-fill the selected date in the form
  const eventDateInput = document.querySelector("#event-date");
  eventDateInput.value = `${year}-${String(parseInt(month) + 1).padStart(
    2,
    "0"
  )}-${String(dayNum).padStart(2, "0")}`;

  // Update the event list for the selected day
  updateEventList(dayNum, month, year);
}

// Function to edit an existing event
function editEvent(eventId) {
  const events = JSON.parse(localStorage.getItem("events")) || [];
  const event = events.find((e) => e.id === eventId);

  if (event) {
    const eventCreator = document.querySelector(".event-creator");
    eventCreator.style.transform = "translateX(0%)";

    const eventDateInput = document.querySelector("#event-date");
    const eventTitleInput = document.querySelector("#event-title");
    const eventDescriptionInput = document.querySelector("#event-description");

    eventDateInput.value = event.date;
    eventTitleInput.value = event.title;
    eventDescriptionInput.value = event.description;
    eventDateInput.setAttribute("data-event-id", event.id);
  }
}

// Function to save (create or edit) an event
function saveEvent() {
  const eventDate = document.querySelector("#event-date").value;
  const eventTitle = document.querySelector("#event-title").value;
  const eventDescription = document.querySelector("#event-description").value;

  const events = JSON.parse(localStorage.getItem("events")) || [];
  const eventId = document
    .querySelector("#event-date")
    .getAttribute("data-event-id");

  if (eventId) {
    // Edit existing event
    const existingEventIndex = events.findIndex((e) => e.id === eventId);
    if (existingEventIndex > -1) {
      events[existingEventIndex].date = eventDate;
      events[existingEventIndex].title = eventTitle;
      events[existingEventIndex].description = eventDescription;
    }
  } else {
    // Create new event
    const newEvent = {
      id: Date.now().toString(),
      date: eventDate,
      title: eventTitle,
      description: eventDescription,
    };
    events.push(newEvent);
  }

  localStorage.setItem("events", JSON.stringify(events));
  const selectedDate = new Date(eventDate);
  updateEventList(
    selectedDate.getDate(),
    selectedDate.getMonth(),
    selectedDate.getFullYear()
  );
  hideEventCreator();
  generateCalendar(currentMonth, currentYear);
}

// Function to delete an event
function deleteEvent(eventId) {
  const events = JSON.parse(localStorage.getItem("events")) || [];
  const updatedEvents = events.filter((e) => e.id !== eventId);
  localStorage.setItem("events", JSON.stringify(updatedEvents));
  generateCalendar(currentMonth, currentYear);

  // Use the higher scope variables
  const selectedDate = new Date(document.querySelector("#event-date").value);
  updateEventList(
    selectedDate.getDate(),
    selectedDate.getMonth(),
    selectedDate.getFullYear()
  );
  hideEventCreator();
}

// Function to hide the event creator form
function hideEventCreator() {
  const eventCreator = document.querySelector(".event-creator");
  eventCreator.style.transform = "translateX(-100%)";
  document.getElementById("event-form").reset();
  document.getElementById("event-description").innerHTML = "";
  const eventDateInput = document.querySelector("#event-date");
  eventDateInput.removeAttribute("data-event-id"); // Clear the event ID attribute
}

// Initial call to generate the calendar for the current month and year
generateCalendar(currentMonth, currentYear);

// Event listeners for the previous and next buttons
document.querySelector("#pre-month").onclick = () => {
  currentMonth = currentMonth > 0 ? currentMonth - 1 : 11;
  currentYear = currentMonth === 11 ? currentYear - 1 : currentYear;
  generateCalendar(currentMonth, currentYear);
};

document.querySelector("#next-month").onclick = () => {
  currentMonth = currentMonth < 11 ? currentMonth + 1 : 0;
  currentYear = currentMonth === 0 ? currentYear + 1 : currentYear;
  generateCalendar(currentMonth, currentYear);
};

document.querySelector("#pre-year").onclick = () => {
  currentYear -= 1;
  generateCalendar(currentMonth, currentYear);
};

document.querySelector("#next-year").onclick = () => {
  currentYear += 1;
  generateCalendar(currentMonth, currentYear);
};

// Function to return to the current date
const returnToCurrentDate = () => {
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  generateCalendar(currentMonth, currentYear);
};

// Add event listeners to the month and year headers
document.querySelector(".month").addEventListener("click", returnToCurrentDate);
document.querySelector(".year").addEventListener("click", returnToCurrentDate);

// Event listener for saving the event
document.querySelector("#save-event").addEventListener("click", saveEvent);

// Close button for the event creator form
document.query;

// Close button for the event creator form
document.querySelector(".close").addEventListener("click", hideEventCreator);

// footer date display
const fullDetails = document.querySelector(".fullDetails");
const showTime = document.querySelector(".time");
const showDate = document.querySelector(".date");

const currshowDate = new Date();
const showCurrentDateOption = {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
};
const currentDateformat = new Intl.DateTimeFormat(
  "en-US",
  showCurrentDateOption
).format(currshowDate);
showDate.innerHTML = currentDateformat;

// footer time display
setInterval(() => {
  const timer = new Date();
  const time = `${`${timer.getHours()}`.padStart(
    2,
    "0"
  )}:${`${timer.getMinutes()}`.padStart(
    2,
    "0"
  )}:${`${timer.getSeconds()}`.padStart(2, "0")}`;
  showTime.innerHTML = time;
}, 1000);

// footer weather display
const weatherBtn = document.getElementById("weather-btn");
const weatherDisplay = document.getElementById("weather-display");
const API_KEY = "ac2f72a7c4dcdcd518209e33465a5f55"; // API key for OpenWeather API

// 3 days weather forecast
const createWeatherCard = (cityName, weatherItem) => {
  // html for main weather card
  return `<li class="weather">
    <h4>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h4>
    <img src="https://openweathermap.org/img/wn/${
      weatherItem.weather[0].icon
    }@2x.png" alt="weather-icon">
    <h4>Description: ${weatherItem.weather[0].description}</h4>
    <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
    <h4>Wind: ${weatherItem.wind.speed}M/S</h4>
    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
  </li>`;
};

// get weather details
const getWeatherData = (cityName, lat, lon) => {
  const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      if (!data.list || data.list.length === 0) {
        throw new Error("No weather data available");
      }
      // filter the forecasts to only get one per day
      const uniqueForecastDays = [];
      const threeDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });
      // clearing previous weather data
      weatherDisplay.innerHTML = "";
      // creating weather cards and adding them to the DOM
      threeDaysForecast.forEach((weatherItem, index) => {
        weatherDisplay.insertAdjacentHTML(
          "beforeend",
          createWeatherCard(cityName, weatherItem, index)
        );
      });
    })
    .catch((error) => {
      alert(
        `An error occurred while fetching the weather forecast: ${error.message}`
      );
    });
};

// get coordinates using reverse geocoding API
const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

      // get city name from coordinates using reverse geocoding API
      fetch(REVERSE_GEOCODING_URL)
        .then((res) => res.json())
        .then((data) => {
          if (!data[0]) {
            throw new Error("No city found at this location");
          }
          const { name } = data[0];
          // get weather data for the city
          getWeatherData(name, latitude, longitude);
        })
        .catch((error) => {
          alert(`An error occurred while fetching the city: ${error.message}`);
        });
    },
    (error) => {
      let errorMessage;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage =
            "Geolocation request denied. Please reset location permission to grant access.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable.";
          break;
        case error.TIMEOUT:
          errorMessage = "The request to get user location timed out.";
          break;
        default:
          errorMessage = "An unknown error occurred.";
          break;
      }
      alert(errorMessage);
    }
  );
};

if (weatherBtn) {
  weatherBtn.addEventListener("click", () => {
    weatherDisplay.classList.toggle("active");
    if (weatherDisplay.classList.contains("active")) {
      getUserCoordinates();
    }
  });
}
