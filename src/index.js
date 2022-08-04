// Variable Declarations and DOM Selectors------------------------------------------------------
const rootURL = "https://api.teleport.org/api";

const continentAbbreviations = {
  Africa: "AF",
  Antarctica: "AN",
  Asia: "AS",
  Europe: "EU",
  "North America": "NA",
  Oceania: "OC",
  "South America": "SA",
};

const dropdownContainer = document.querySelector("#dropdown-lists");
const continentContainer = document.querySelector("#continent-selector");
const selectContinent = document.querySelector("#continents");


// DOM Interactions ----------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  getAPIData("continents", filterContinentData);
});

// Asynchronous Functions: Fetch Data from API --------------------------------------------
function getAPIData(strDirectory, callbackFun) {
  fetch(`${rootURL}/${strDirectory}/`)
    .then((resp) => resp.json())
    .then((data) => {
      callbackFun(data);
    });
}

// Handle API Data ------------------------------------------------------------------------

function filterContinentData(apiData) {
  const continentList = apiData._links["continent:items"].map(
    (cont) => cont.name
  );

  createAppendOptions(continentList, selectContinent);
}

function createCountryList(apiData) {
  const selectCountry = document.createElement("select");

  const countryList = apiData._links["country:items"].map(
    (country) => country.name
  );

  createDropdown("country", "countries", selectCountry);

  createAppendOptions(countryList, selectCountry);

  // Add Event Listener to Newly Created Country List

  selectCountry.addEventListener("change", (event) => {
    const countrySelection = event.target.value;

    const cityListURL = `cities/?search=${countrySelection}&embed=city%3Asearch-results%2Fcity%3Aitem%2Fcity`;

    getAPIData(cityListURL, createCitySelection);
  });
}

function createCitySelection(apiData) {
  const selectCity = document.createElement("select");

  const citiesList = apiData["_embedded"]["city:search-results"];

  createDropdown("city", "cities", selectCity);
  createAppendOptions(citiesList, selectCity);

  // 'https://api.teleport.org/api/cities/?search=' + country + '&embed=city%3Asearch-results%2Fcity%3Aitem%2Fcity').then(function(data) {
  //       var cities = data['_embedded']['city:search-results'];
  //       cities.forEach(function(city) {
  //         var city = {
  //           country: country,
  //           fullName: city['_embedded']['city:item'].full_name,
  //           name: city['_embedded']['city:item'].name,
  //           population: city['_embedded']['city:item'].population
}

// Create New Select Dropdown Lists -------------------------------------------------------------------------------

function createDropdown(target, id, selectEl) {
  const selectorContainer = document.createElement("div");
  const selectorLabel = document.createElement("label");
  const defaultOption = document.createElement("option");

  defaultOption.innerHTML = `Choose a ${target}`;
  defaultOption.disabled = true;
  defaultOption.selected = true;

  selectorLabel.setAttribute("for", id);
  selectEl.id = id;

  dropdownContainer.append(selectorContainer);
  selectorContainer.append(selectorLabel);
  selectorLabel.append(selectEl);
  selectEl.appendChild(defaultOption);
}

// Create and Append Dropdown Selector Options ------------------------------------------------------------------------

function createAppendOptions(data, parentEl) {
  data.forEach((datum) => {
    let option = document.createElement("option");

    option.textContent = datum;

    parentEl.append(option);
  });
}

// Add Event Listeners -------------------------------------------------------------------------------------------------

selectContinent.addEventListener("change", (event) => {
  const continentSelection = event.target.value;

  const countryListURL = `continents/geonames:${continentAbbreviations[continentSelection]}/countries`;

  getAPIData(countryListURL, createCountryList);
});
