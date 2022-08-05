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
function getData(strDirectory, location) {
  return fetch(`${rootURL}/${strDirectory}/`)
  .then((resp) => resp.json())
  .then((data) => {
    return data["_links"][`${location}:items`]
  })
}


console.log('getData: ', getData("continents/geonames:AF/countries", "country"));
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
  console.log(apiData);
  const citiesList = apiData["_embedded"]["city:search-results"]
    .map((x) => {
      return x["_embedded"]["city:item"]["name"];
    })
    .sort();

  console.log("citiesList: ", citiesList);

  createDropdown("city", "cities", selectCity);
  createAppendOptions(citiesList, selectCity);
}

// 'https://api.teleport.org/api/cities/?search=' + country + '&embed=city%3Asearch-results%2Fcity%3Aitem%2Fcity').then(function(data) {
//       var cities = data['_embedded']['city:search-results'];
//       cities.forEach(function(city) {
//         var city = {
//           country: country,
//           fullName: city['_embedded']['city:item'].full_name,
//           name: city['_embedded']['city:item'].name,
//           population: city['_embedded']['city:item'].population

// Create New Select Dropdown Lists -------------------------------------------------------------------------------

function createDropdown(target, id, selectEl) {
  const currentDropdowns = [];
  const currentDropdownSelectors = document
    .querySelectorAll(".selectors")
    .forEach((x) => {
      currentDropdowns.push(x.id);
    });

  console.log("currentDropdowns: ", currentDropdowns);
  if (!currentDropdowns.includes(id)) {
    const selectorContainer = document.createElement("div");
    const selectorLabel = document.createElement("label");
    const defaultOption = document.createElement("option");

    defaultOption.innerHTML = `Choose a ${target}`;
    defaultOption.disabled = true;
    defaultOption.selected = true;

    selectorLabel.setAttribute("for", id);
    selectEl.id = id;
    selectEl.className = "selectors";

    dropdownContainer.append(selectorContainer);
    selectorContainer.append(selectorLabel);
    selectorLabel.append(selectEl);
    selectEl.appendChild(defaultOption);
  }
}

// Create and Append Dropdown Selector Options ------------------------------------------------------------------------
// arrStr must be clean, clear array containing strings
function createAppendOptions(arrStr, parentEl) {
  arrStr.forEach((str) => {
    let option = document.createElement("option");

    option.textContent = str;

    parentEl.append(option);
  });
}

// Add Event Listeners -------------------------------------------------------------------------------------------------

selectContinent.addEventListener("change", (event) => {
  const continentSelection = event.target.value;

  const countryListURL = `continents/geonames:${continentAbbreviations[continentSelection]}/countries`;

  getAPIData(countryListURL, createCountryList);
});
