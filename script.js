let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const isLeapYear = (year) =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const getFebDays = (year) => (isLeapYear(year) ? 29 : 28);

const container = document.querySelector(".container");
const month_names = [
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

/////////////////////////////////////////////////////////////////
// Function to update the event list in the sidebar
const updateEventList = (selectedDate) => {
  const events = JSON.parse(localStorage.getItem("events")) || [];
  const eventList = document.getElementById("event-list");
  eventList.innerHTML = ""; // Clear the current list

  events.forEach((event) => {
    //   const eventItem = document.createElement("li");
    //   eventItem.textContent = event.title;
    // Filter events to show only those for the selected date
    // console.log(events);
    // const filteredEvents = events.filter(
    //   (event) => event.date === selectedDate
    // );
    // console.log(filteredEvents);
    

    // filteredEvents.forEach((event) => {
    const eventItem = document.createElement("li");
    eventItem.textContent = event.title;
    // console.log(eventItem);
    eventItem.addEventListener("click", () => displayEventDetails(event));
    eventItem.addEventListener("dblclick", () => {
      if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
        deleteEvent(event.id);
      }
    });
    eventList.appendChild(eventItem);
  });
  // console.log(filteredEvents);
};



// Function to display full event details
const displayEventDetails = (event) => {
  // display the details in the create-event-section
  document.querySelector("#event-date").value = event.date;
  document.querySelector("#event-title").value = event.title;
  document.querySelector("#event-description").textContent = event.description;
};

// Event creation
document.getElementById("event-form").addEventListener("submit", (e) => {
  e.preventDefault();

  // Get form values
  const eventDate = document.querySelector("#event-date").value;
  const eventTitle = document.querySelector("#event-title").value;
  const eventDescription = document.querySelector("#event-description").value;

  // Validate form fields
  if (!eventTitle.trim() || !eventDescription.trim()) {
    alert("Please fill in all the fields.");
    return;
  }

  // Store the event details using localStorage
  const events = JSON.parse(localStorage.getItem("events")) || [];
  events.push({
    date: eventDate,
    title: eventTitle,
    description: eventDescription,
  });
  localStorage.setItem("events", JSON.stringify(events));

  // Clear the event creator form and hide it
  hideEventCreator();

  // refresh the calendar to show the new event
  generateCalendar(currentMonth, currentYear);

  // Update the event list after creating an event
  updateEventList();
});

// Function to delete an event by ID
const deleteEvent = (eventId) => {
  let events = JSON.parse(localStorage.getItem("events")) || [];
  events = events.filter(event => event.id !== eventId);
  localStorage.setItem("events", JSON.stringify(events));
  
  // Update the event list for the currently selected date
  updateEventList(document.querySelector("#event-date").value);
  hideEventCreator();
};

// Call updateEventList on page load to populate the event list
updateEventList();

// Function to hide the event creator
function hideEventCreator() {
  const eventCreator = document.querySelector(".event-creator");
  eventCreator.style.transform = "translateX(-101%)";
  document.getElementById("event-form").reset();
  document.getElementById("event-description").innerHTML = "";
}

// Close button for the event creator form
document.querySelector(".close").addEventListener("click", hideEventCreator);

/////////////////////////////////////////////////////////////////////////////////////////////

// Function to generate the calendar
const generateCalendar = (month, year) => {
  const calendar_days = document.querySelector(".calendar-days");
  calendar_days.innerHTML = "";

  // Retrieve events from localStorage
  const events = JSON.parse(localStorage.getItem("events")) || [];

  // Function to handle day click and open the event creator
  const openEventCreator = (dayNum, month, year) => {
    // Display the event creator form
    const eventCreator = document.querySelector(".event-creator");
    eventCreator.style.transform = "translateX(0%)";

    // Pre-fill the selected date in the form
    const eventDateInput = document.querySelector("#event-date");
    eventDateInput.value = `${year}-${String(month + 1).padStart(
      2,
      "0"
    )}-${String(dayNum).padStart(2, "0")}`;
  };

  // Generate the calendar
  const calendar_header_month = document.querySelector(".month");
  const calendar_header_year = document.querySelector(".year");
  const days_of_month = [
    31,
    getFebDays(year),
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

  const currentDate = new Date();
  calendar_header_month.textContent = month_names[month];
  calendar_header_year.textContent = year;

  // Generate the days of the week
  const first_day = new Date(year, month);
  const firstDayIndex = first_day.getDay();

  for (let i = 0; i < days_of_month[month] + firstDayIndex; i++) {
    const day = document.createElement("div");

    if (i >= firstDayIndex) {
      const dayNum = i - firstDayIndex + 1;
      day.textContent = dayNum;

      // Check if there's an event for this date
      const eventForDay = events.find(
        (event) =>
          event.date ===
          `${year}-${String(month + 1).padStart(2, "0")}-${String(
            dayNum
          ).padStart(2, "0")}`
      );
      if (eventForDay) {
        // Create an element to display the event
        const eventElement = document.createElement("span");
        eventElement.classList.add("event-indicator");
        day.appendChild(eventElement);
      }
      // Add click event listener to each day
      day.addEventListener("click", () =>
        openEventCreator(dayNum, month, year)
      );
      if (
        dayNum === currentDate.getDate() &&
        year === currentDate.getFullYear() &&
        month === currentDate.getMonth()
      ) {
        day.classList.add("current-date");
      }
    } else {
      day.classList.add("padding");
    }
    calendar_days.appendChild(day);
  }
};

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
generateCalendar(currentMonth, currentYear);

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
  // const option = {
  //   hour: "numeric",
  //   minute: "numeric",
  //   second: "numeric",
  // };
  //   const formatTimer = new Intl.DateTimeFormat("en-US", option).format(timer);
  let time = `${`${timer.getHours()}`.padStart(
    2,
    "0"
  )}:${`${timer.getMinutes()}`.padStart(
    2,
    "0"
  )}:${`${timer.getSeconds()}`.padStart(2, "0")}`;
  //   showTime.innerHTML = formatTimer;
  showTime.innerHTML = time;
}, 1000);

// footer weather display
const weatherBtn = document.getElementById("weather-btn");
const weatherDisplay = document.getElementById("weather-display");
const API_KEY = "ac2f72a7c4dcdcd518209e33465a5f55"; // API key for OpenWeather API

// 3 days weather forcast
const createWeatherCard = (cityName, weatherItem) => {
  // html for main weather card
  return `<li class="weather">
  <h4>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h4>
  <img src="https://openweathermap.org/img/wn/${
    weatherItem.weather[0].icon
  }@2x.png" alt="weather-icon">
  <h4>Des: ${weatherItem.weather[0].description}</h4>
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
      // filter the forcasts to only get one per day
      const uniqueForcastDays = [];
      const threeDaysForcast = data.list.filter((forcast) => {
        const forcastDate = new Date(forcast.dt_txt).getDate();
        if (!uniqueForcastDays.includes(forcastDate)) {
          return uniqueForcastDays.push(forcastDate);
        }
      });
      // clearing previous weather data
      weatherDisplay.innerHTML = "";
      // creating weather carrds and adding them to the DOM
      threeDaysForcast.forEach((weatherItem, index) => {
        weatherDisplay.insertAdjacentHTML(
          "beforeend",
          createWeatherCard(cityName, weatherItem, index)
        );
      });
    })
    .catch(() => {
      alert("An error occurred while fetching the weather forecast");
    });
};

// get cordinates using reverse geocoding API
const getUserCordinates = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

      // get city name from cordinates using reverse geocoding API
      fetch(REVERSE_GEOCODING_URL)
        .then((res) => res.json())
        .then((data) => {
          const { name } = data[0];
          // get weather data for the city
          getWeatherData(name, latitude, longitude);
        })
        .catch(() => {
          alert("An error occurred while fetching the city");
        });
    },
    (error) => {
      // show alert if error
      if (error.code === error.PERMISSION_DENIED) {
        alert(
          "Geolocation request denied. Please reset location permission to grant access."
        );
      } else {
        alert("Network error");
      }
    }
  );
};

weatherBtn.addEventListener("click", () => {
  weatherDisplay.classList.toggle("active");
  if (weatherDisplay.classList.contains("active")) {
    getUserCordinates();
  }
});
