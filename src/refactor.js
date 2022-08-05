// ----------------Variable Declarations and DOM Selectors-----------------

const rootURL = "https://api.teleport.org/api";
const continentdirectory = `${rootURL}/continents`;
// const countrydirectory = `${rootURL}/continents/geonames:?/countries`;
// const citydirectory =

const dropdownContainer = document.querySelector("#dropdown-lists");
const continentContainer = document.querySelector("#continent-selector");
const selectContinent = document.querySelector("#continents");

// ------------------------DOM Interaction--------------------------------

document.addEventListener("DOMContentLoaded", () => {
  getAPIData(continentdirectory, "continent", renderContinentData);

});

// -------------------Asynchronous Functions-----------------------
// ---- Fetch Data From External API--------

function getAPIData(directory, strTargetLocation, renderLocationFunction) {
  fetch(`${directory}`)
    .then((resp) => resp.json())
    .then((data) => {

      const locationDataObj = data["_links"][`${strTargetLocation}:items`];

      renderLocationFunction(locationDataObj);
    });
}

// ------------------------- Handle API Data -------------------------

function renderContinentData(apiDataObj) {
  const continentList = apiDataObj.map((continent) => continent.name);
  console.log("continentList: ", continentList);
}
