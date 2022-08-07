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
  if (list.length < 1) {
    list = ["No cities in this country..."];
  }

  dropDown.parentElement.classList.remove("hide");
  createAppendOptions(list, dropDown);
}

function dropDownEventHandler(locationType, event) {
  let selection = event ? event.target.value : null;

  if (selection === "United States") {
    selection = "usa";
  }

  console.log("selection: ", selection);

  const url = selection
    ? getAPIURL[locationType](selection)
    : getAPIURL[locationType]();

  console.log(url);

  getAPIData(url)
    .then((data) => {
      console.log(data);
      const locList = parseAPIData[locationType](data).sort();
      console.log(locList);

      if (event) {
        resetDropDownOptions(DOM_MAP[locationType].drop);
      }
      renderLocationData(locList, DOM_MAP[locationType].drop);
    })
    .catch((err) => {
      console.log(`Error fetching ${locationType} list: `, err);
    });
}

// EVENT LISTENERS ----------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  console.log("test");
  dropDownEventHandler("continent");
});

continentDropDown.addEventListener("change", (event) => {
  dropDownEventHandler("country", event);
});

countryDropDown.addEventListener("change", (event) => {
  dropDownEventHandler("city", event);
});

cityDropDown.addEventListener("change", (event) => {
  const selection = event.target.value;

  const cityUrl = getAPIURL["city"](selection);

  const cityDetails =
    "https:teleport.org/api/resources/City/#!/relations/{rel}/";

  getAPIData(cityDetails).then((data) => {
    console.log(data);
  });

  //  "ua:details": {
  //   "href": "https://api.teleport.org/api/urban_areas/slug:san-francisco-bay-area/details/"

  //   "ua:primary-cities": [
  //     {
  //         "href": "https://api.teleport.org/api/cities/geonameid:5392171/",
  //         "name": "San Jose"
  //     },
  //     {
  //         "href": "https://api.teleport.org/api/cities/geonameid:5391959/",
  //         "name": "San Francisco"
  //     },
  //     {
  //         "href": "https://api.teleport.org/api/cities/geonameid:5389489/",
  //         "name": "Sacramento"
  //     },
  //     {
  //         "href": "https://api.teleport.org/api/cities/geonameid:5378538/",
  //         "name": "Oakland"
  // })

  // "ua:salaries": {
  //   "href": "https://api.teleport.org/api/urban_areas/slug:san-francisco-bay-area/salaries/"
  // },
  // "ua:scores": {
  //   "href": "https://api.teleport.org/api/urban_areas/slug:san-francisco-bay-area/scores/
});
