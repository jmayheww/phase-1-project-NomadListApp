// -------------------------------------------VARIABLES-------------------------

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

// -----------------------------------------DOM-VARIABLES----------------------------

const continentWrapper = document.querySelector("#continent-wrapper");
const countryWrapper = document.querySelector("#country-wrapper");
const cityWrapper = document.querySelector("#city-wrapper");

const continentDropDown = document.querySelector("#continents");
const countryDropDown = document.querySelector("#countries");
const cityDropDown = document.querySelector("#cities");

const DOM_MAP = {
  continent: {
    wrap: continentWrapper,
    drop: continentDropDown,
  },
  country: {
    wrap: countryWrapper,
    drop: countryDropDown,
  },
  city: {
    wrap: cityWrapper,
    drop: cityDropDown,
  },
};
// ------------------------------------------DOM LOADED--------------------------------

document.addEventListener("DOMContentLoaded", () => {
  getAPIData(getAPIURL.continent())
    .then((data) => {
      const continentList = parseAPIData.continent(data);
      renderLocationData(continentList, continentDropDown);
    })
    .catch((err) => console.log("Error fetching continents: ", err.message));
});

// -------------------------------------------API---------------------------------------------------

const getAPIURL = {
  continent: () => `${rootURL}/continents`,

  country: (continent) =>
    `${rootURL}/continents/geonames:${ISO_Map[continent]}/countries`,

  city: (country) =>
    `${rootURL}/cities?search=${country}&embed=city%3Asearch-results%2Fcity%3Aitem%2Fcity`,
};

function getAPIData(URL) {
  return fetch(URL).then((resp) => resp.json());
}

const parseAPIData = {
  continent: (data) =>
    data["_links"]["continent:items"].map((location) => location.name),
  country: (data) =>
    data["_links"]["country:items"].map((location) => location.name),
  city: (data) =>
    data["_embedded"]["city:search-results"].map((location) => {
      return location["_embedded"]["city:item"].name;
    }),
};

// DOM MANPIPULATION -------------------------------------------------------

function createAppendOptions(optList, parentEl) {
  const option = document.createElement("option");
  optList.forEach((opt) => {
    const option = opt;
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

  getAPIData(getAPIURL.country(continentSelection))
    .then((data) => {
      const countryList = parseAPIData.country(data);
      resetDropDownOptions(countryDropDown);
      renderLocationData(countryList, countryDropDown);
    })
    .catch((err) => console.log("Error fetching countries!: ", err.message));
});

countryDropDown.addEventListener("change", (event) => {
  const countrySelection = event.target.value;
  const citiesURL = getAPIURL.city(countrySelection);

  getAPIData(citiesURL)
    .then((data) => {
      const cityList = parseAPIData.city(data);
      cityList.sort();

      resetDropDownOptions(cityDropDown);
      renderLocationData(cityList, cityDropDown);
    })
    .catch((err) => console.log("Error fetching cities!: ", err.message));
});
