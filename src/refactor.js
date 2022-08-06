// ----------------VARIABLES-------------------------

const rootURL = "https://api.teleport.org/api";

const ISO_Map = {
  Africa: "AF",
  Antarctica: "AN",
  Asia: "AS",
  Europe: "EU",
  "North America": "NA",
  Oceania: "OC",
  "South America": "SA",
};

const getAPIURL = {
  continent: () => `${rootURL}/continents`,

  country: (continent) =>
    `${rootURL}/continents/geonames:${ISO_Map[continent]}/countries`,

  city: (country) =>
    `${rootURL}/cities?search=${country}&embed=city%3Asearch-results%2Fcity%3Aitem%2Fcity`,
};

// ----------------DOM-VARIABLES----------------------------

const continentWrapper = document.querySelector("#continent-wrapper");
const countryWrapper = document.querySelector("#country-wrapper");
const cityWrapper = document.querySelector("#city-wrapper");

const continentDropDown = document.querySelector("#continents");
const countryDropDown = document.querySelector("#countries");
const cityDropDown = document.querySelector("#cities");

// ------------------------DOM LOADED--------------------------------

document.addEventListener("DOMContentLoaded", () => {
  getAPIData(continentDirectory)
    .then((data) => {
      const continentList = parseAPIData(data, "continent");
      renderLocationData(continentList, continentDropDown);
    })
    .catch((err) => console.log("Error fetching continents: ", err.message));
});

// -------------------Asynchronous Functions-----------------------
// -------------------Fetch Data From External API------------

function getAPIData(URL) {
  return fetch(URL).then((resp) => resp.json());
}

// ------------------------- Methods ---------------------------------
// ------------------------- Handle API Data -------------------------

function parseAPIData(data, locationType) {
  const locationList = data["_links"][`${locationType}:items`].map(
    (location) => location.name
  );
  return locationList;
}

function parseCityData(data) {
  const cityList = `${data}&embed=city%3Asearch-results%2Fcity%3Aitem%2Fcity`;
  console.log(cityList);
  return cityList;
}
// DOM MANPIPULATION -------------------------------------------------------

function createAppendOptions(optList, parentEl) {
  optList.forEach((opt) => {
    const option = document.createElement("option");
    option.innerText = opt;
    parentEl.append(option);
  });
}

function resetDropDownOptions(dropdown) {
  const defaultOption = dropdown.children[0];

  defaultOption.selected = true;
  dropdown.innerHTML = "";
  dropdown.append(defaultOption);
}

function renderLocationData(list, dropDown) {
  dropDown.parentElement.classList.remove("hide");
  createAppendOptions(list, dropDown);
}

// EVENT LISTENERS ----------------------------------------------

continentDropDown.addEventListener("change", (event) => {
  const continentSelection = event.target.value;
  const countryURLString = `${countryDirectory}${ISO_Map[continentSelection]}/countries`;
  getAPIData(countryURLString)
    .then((data) => {
      const countryList = parseAPIData(data, "country");
      resetDropDownOptions(countryDropDown);
      renderLocationData(countryList, countryDropDown);
    })
    .catch((err) => console.log("Error fetching countries!: ", err.message));
});

countryDropDown.addEventListener("change", (event) => {
  const countrySelection = event.target.value;
  const cityURLString = `${cityDirectory}${countrySelection}`;

  getAPIData(cityURLString).then((data) => {
    console.log("data: ", data);

    const cityList = parseCityData(data);
    console.log("cityList: ", cityList);
  });
});
