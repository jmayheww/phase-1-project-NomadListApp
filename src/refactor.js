// ----------------VARIABLES-------------------------

const rootURL = "https://api.teleport.org/api";
const continentDirectory = `${rootURL}/continents`;
const countryDirectory = `${rootURL}/continents/geonames:`;
const cityDirectory = `${rootURL}/cities?search=`;

const ISO_Map = {
  Africa: "AF",
  Antarctica: "AN",
  Asia: "AS",
  Europe: "EU",
  "North America": "NA",
  Oceania: "OC",
  "South America": "SA",
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
  console.log("defaultOption: ", defaultOption);
  defaultOption.selected = true;
  dropdown.innerHTML = "";
  dropdown.append(defaultOption);
}

function renderLocationData(list, dropDown) {
  console.log('dropDown: ', dropDown);
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
