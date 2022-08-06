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
// const citydirectory = `${rootURL}`/

// ----------------DOM-VARIABLES----------------------------

const dropdownContainer = document.querySelector("#dropdown-lists");
const continentContainer = document.querySelector("#continent-selector");
const selectContinent = document.querySelector("#continents");
const selectCountry = document.querySelector("#countries");

/* Create object to obtain continent directory id */

// const citydirectory =

// ------------------------DOM LOADED--------------------------------

document.addEventListener("DOMContentLoaded", () => {
  getAPIData(continentDirectory, "continent", renderContinentData);

  onChangeListener(selectContinent);
  onChangeListener(selectCountry);
});

// -------------------Asynchronous Functions-----------------------
// -------------------Fetch Data From External API------------


function getAPIData(URL) {
  return fetch(URL).then(resp => resp.json());
}

function parseAPIData(data, locationType) {
  const locationList = data["_links"][`${locationType}:items`].map((location) => location.name);

  return locationList;
}

// ------------------------- Methods ---------------------------------
// ------------------------- Handle API Data -------------------------

/* Continents ---------------------------------------- */
function renderContinentData(apiDataObj) {
  const continentList = apiDataObj.map((continent) => continent.name);
  console.log('continentList: ', continentList);


  appendFixedContinents(continentList, selectContinent);
}

/* Countries ----------------------------------------*/
function renderCountryData(apiDataObj) {
  const countryList = apiDataObj.map((country) => country.name);
  console.log('countryList: ', countryList);


  toggleSelectorListVisibility(selectCountry);

  handleDynamicOptions(countryList, selectCountry);

  //   createDropdownDOMList(countryList, "country", "countries", selectCountry);
}

/* Cities --------------------------------------------*/
function renderCityData(apiDataObj) {
  const selectCity = document.createElement("select");

  const citiesList = apiDataObj["_embedded"]["city:search-results"].map((x) => {
    return x["_embedded"]["city:item"]["name"];
  });




  toggleSelectorListVisibility(selectCity);
  handleDynamicOptions(citiesList, selectCity);
}

// renderCityData()

// --------------------------DOM Manipulation-----------------------------------------

// --------------------- Append Selector List Options ----------------------

function toggleSelectorListVisibility(selectorList) {
  return selectorList.hidden === true
    ? selectorList.removeAttribute("hidden")
    : true;
}

/* Creates new selector dropdowns in DOM */

// function createDropdownDOMList(strDataArr, target, id, selectorListEl) {
/* Check which dropdowns currently exist */

//   const currentDropdownsByID = [];
//   const currentDropdownSelectors = document
//     .querySelectorAll(".selectors")
//     .forEach((dropdown) => {
//       currentDropdownsByID.push(dropdown.id);
//     });
//

//   /* Determine whether or not dropdown is created
//         if dropdown id does not currently exist, create new dropdown,
//         otherwise refrain  */

//   if (!currentDropdownsByID.includes(id)) {
//   const selectorContainer = document.createElement("div");
//   const selectorList = document.createElement("select");
//   const selectorLabel = document.createElement("label");
//   const defaultOption = document.createElement("option");

//   defaultOption.innerHTML = `Choose a ${target}`;
//   defaultOption.disabled = true;
//   defaultOption.selected = true;

//   selectorLabel.setAttribute("for", id);
//   selectorListEl.id = id;
//   selectorListEl.className = "selectors";

//   dropdownContainer.append(selectorContainer);
//   selectorContainer.append(selectorLabel);
//   selectorLabel.append(selectorListEl);
//   selectorListEl.appendChild(defaultOption);

//   strDataArr.forEach((str) => {
//     const option = document.createElement("option");
//     option.innerText = str;

//     selectorListEl.append(option);
//   });
// }

/* Appends Options to Dropdown Selectors */

function appendFixedContinents(strDataArr, parentEl) {
  /*strDataArr must be clean location data, comprising geographical location names only */

  strDataArr.forEach((str) => {
    const option = document.createElement("option");
    option.innerText = str;

    parentEl.append(option);
  });
}

// function handleNewDropdowns() {
//   const currentDropdownsByID = [];
//   const currentDropdownSelectors = document
//     .querySelectorAll(".selectors")
//     .forEach((dropdown) => {
//       currentDropdownsByID.push(dropdown.id);
//     });
//

//   /* Determine whether or not dropdown is created
//         if dropdown id does not currently exist, create new dropdown,
//         otherwise refrain  */

//   if (!currentDropdownsByID.includes(id)) {
//     createDropdownDOMList()
//   }
// }

// ------------------------ Initialize Event Listeners -----------------------

function continentListener() {
  selectContinent.addEventListener("change", (event) => {
    const continentSelection = event.target.value;
    const countryListArr = `${countryDirectory}${continentAbbreviations[continentSelection]}/countries`;

    return getAPIData(countryListArr, "country", renderCountryData);
  });
}

// function countryListener() {}

function onChangeListener(selectorList) {
  selectorList.addEventListener("change", (event) => {
    const selectionValue = event.target.value;


    if (selectorList === selectContinent) {
      const countryListArr = `${countryDirectory}${continentAbbreviations[selectionValue]}/countries`;


      return getAPIData(countryListArr, "country", renderCountryData);
    }

    else if (selectorList === selectCountry) {
      const cityListArr = `${cityDirectory}${selectionValue}`;
      console.log('cityListArr: ', cityListArr);

      return getAPIData(cityListArr, "city", renderCityData);
    }
  });
}

function handleDynamicOptions(strDataArr, parentEl) {
  strDataArr.forEach((str) => {
    const option = document.createElement("option");

    option.innerText = str;
    parentEl.append(option);
  });
}
