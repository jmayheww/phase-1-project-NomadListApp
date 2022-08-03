// Variable Declarations and DOM Selectors
const rootURL = "https://api.teleport.org/api";

const continentAbbreviations = {
  Africa: "AF",
  Antarctica: "AN",
  Asia: "AS",
  Europe: "EU",
  North_America: "NA",
  Oceania: "OC",
  South_America: "SA",
};

const dropdownContainer = document.querySelector("#dropdown-lists");
const continentContainer = document.querySelector("#continent-selector");
const selectContinent = document.querySelector("#continents");

// DOM Interactions
document.addEventListener("DOMContentLoaded", () => {
  getAPIData("continents", filterContinentData);
});

// Asynchronous Functions: Fetch Data from API
function getAPIData(strDirectory, callbackFun) {
  fetch(`${rootURL}/${strDirectory}/`)
    .then((resp) => resp.json())
    .then((data) => {
      callbackFun(data);
    });
}

// Handle API Data

function filterContinentData(apiData) {
  const continentList = apiData._links["continent:items"].map(
    (cont) => cont.name
  );

  createSelectorList(continentList, selectContinent);
}

function createCountryList(apiData) {
  const countrySelectorContainer = document.createElement("div");
  const selectorLabel = document.createElement("label");
  const selectCountry = document.createElement("select");
  const defaultOption = document.createElement("option");

  defaultOption.innerHTML = "Choose a country";
  defaultOption.disabled = true;
  defaultOption.selected = true;

  selectorLabel.setAttribute("for", "countries");
  selectCountry.id = "countries";

  dropdownContainer.append(countrySelectorContainer);
  countrySelectorContainer.append(selectorLabel);
  selectorLabel.append(selectCountry);
  selectCountry.appendChild(defaultOption);


  const countryList = apiData._links["country:items"].map(
    (country) => country.name
  );

  createSelectorList(countryList, selectCountry);
}

// Create Select List for Continents

function createSelectorList(data, parentEl) {
  data.forEach((datum) => {
    let option = document.createElement("option");

    option.textContent = datum;

    parentEl.append(option);
  });
}

// Add Event Listeners

selectContinent.addEventListener("change", (event) => {
  const continentSelection = event.target.value;

  //   "https://api.teleport.org/api/continents/geonames:AF/countries/"
  const countryListURL = `continents/geonames:${continentAbbreviations[continentSelection]}/countries`;

  getAPIData(countryListURL, createCountryList);
});
