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
    getAPIData(continentdirectory);
  });

// -------------------Asynchronous Functions-----------------------
// ---- Fetch Data From External API--------

function getAPIData(directory) {
    fetch(`${directory}`)
    .then(resp => resp.json())
    .then((data) => {

        console.log('data: ', data);
    })
}