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
const cardWrapper = document.querySelector("#city-card-wrapper");

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
  cards: {
    wrap: cardWrapper,
  },
};

// -------------------------------------------API---------------------------------------------------

const getAPIURL = {
  continent: () => `${rootURL}/continents`,

  country: (continent) =>
    `${rootURL}/continents/geonames:${ISO_Map[continent]}/countries`,

  city: (country) =>
    `${rootURL}/cities?search=${country}&embed=city%3Asearch-results%2Fcity%3Aitem%2Fcity`,

  cityInfo: (city) =>
    `${rootURL}/cities/?search=${city}&embed=city%3Asearch-results%2Fcity%3Aitem%2Fcity%3Aurban_area%2Fua%3Ascores`,

  image: (citySlug) => `${rootURL}/urban_areas/slug:${citySlug}/images/`,
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
  title: (data) => {
    return data["_embedded"]["city:search-results"][0]["_embedded"][
      "city:item"
    ];
  },
  cityData: (data) => {
    const CITY_ITEM =
      data["_embedded"]["city:search-results"][0]["_embedded"]["city:item"];

    const name = CITY_ITEM["full_name"];
    const pop = CITY_ITEM["population"];

    try {
      const URBAN_AREA = CITY_ITEM["_embedded"]["city:urban_area"]["_embedded"];

      const scores = URBAN_AREA["ua:scores"]["categories"];
      scores.sort((a, b) => (a.name > b.name ? 1 : -1));

      const overAllScore = Math.round(
        URBAN_AREA["ua:scores"]["teleport_city_score"]
      );

      const desc = URBAN_AREA["ua:scores"]["summary"].replace(/<[^>]+>/g, "");

      return { name, pop, desc, scores, overAllScore };
    } catch {
      const missingDataMessage =
        "Sorry, no quality of life data currently exists for this city.";

      return { name, pop, missingDataMessage };
    }
  },
  imgSlug: (data) => {
    try {
      return data._embedded["city:search-results"][0]["_embedded"]["city:item"][
        "_embedded"
      ]["city:urban_area"]["slug"];
    } catch {
      return "no-image";
    }
  },
  image: (data) => {
    try {
      const IMAGE_DATA = data["photos"][0];

      const src = IMAGE_DATA["image"].web;
      const photographer = IMAGE_DATA["attribution"].photographer;
      const originSrc = IMAGE_DATA["attribution"].source;
      return { src, photographer, originSrc };
    } catch {
      const missingImageData = "No image data currently exists for this city";
      return missingImageData;
    }
  },
};

// DOM MANPIPULATION -------------------------------------------------------

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
  //append options
  list.forEach((opt) => {
    const option = document.createElement("option");
    option.innerText = opt;
    dropDown.append(option);
  });
}

function renderCityCard(cityData, imageData, cardsWrapper) {
  //clear previous content
  cardWrapper.innerHTML = "";

  //Handle missing data case
  if (cityData.missingDataMessage || imageData.missingImageData) {
    const { name, pop, missingDataMessage } = cityData;

    const cityCard = document.createElement("div");
    const title = document.createElement("h2");
    const population = document.createElement("p");
    const description = document.createElement("p");
    title.innerText = name;
    population.innerText = `Total population: ${pop}`;
    description.innerText = missingDataMessage;

    const missingImageData = imageData.missingImageData;

    const imgWrapper = document.createElement("div");
    const imgMessage = document.createElement("p");
    imgMessage.textContent = missingImageData;
    imgWrapper.append(imgMessage);

    cityCard.append(title, population, description);
    cardsWrapper.append(imgWrapper, cityCard);
    return;
  }
  const { name, desc, pop, overAllScore, scores } = cityData;
  const { src, photographer, originSrc } = imageData;

  // Create DOM Nodes
  const cityCard = document.createElement("div");
  const cityInfo = document.createElement("div");
  const cityScores = document.createElement("div");
  const title = document.createElement("h2");
  const population = document.createElement("p");
  const description = document.createElement("p");
  const cityScore = document.createElement("p");

  const imgWrapper = document.createElement("div");
  const img = document.createElement("img");
  const imgCitation1 = document.createElement("span");
  const imgCitation2 = document.createElement("span");

  cityCard.id = "city-card";
  cityInfo.id = "city-info";
  cityScores.id = "city-scores";

  img.src = src;

  //Inject info into DOM elements
  title.textContent = name;
  population.textContent = `Total Population: ${pop}`;
  description.textContent = `Description Summary: ${desc}`;
  cityScore.textContent = `Aggregate city score: ${overAllScore}/100`;

  imgCitation1.textContent = `Photographer: ${photographer}`;
  imgCitation2.textContent = `Origin: ${originSrc}`;

  //Append DOM elements to parent and iterate scores data
  scores.map((score) => {
    const scoreData = document.createElement("p");
    scoreData.textContent = `${score.name}: ${Math.round(
      score.score_out_of_10
    )}/10`;
    cityScores.append(scoreData);
  });
  cityInfo.append(title, description, population);
  cityScores.append(cityScore);
  cityCard.append(cityInfo, cityScores);

  imgWrapper.append(img, imgCitation1, imgCitation2);

  cardsWrapper.append(imgWrapper, cityCard);
}

function locationSelectedEventHandler(locationType, event) {
  const needsInitLocation = typeof event === "object";

  let selectedLocationName = needsInitLocation ? event.target.value : null;

  if (selectedLocationName === "United States") {
    selectedLocationName = "usa";
  }
  const url = needsInitLocation
    ? getAPIURL[locationType](selectedLocationName)
    : getAPIURL[locationType](); //continent;

  getAPIData(url)
    .then((data) => {
      const locList = parseAPIData[locationType](data).sort();
      if (needsInitLocation) {
        resetDropDownOptions(DOM_MAP[locationType].drop);
      }
      renderLocationData(locList, DOM_MAP[locationType].drop);
    })
    .catch((err) => {
      console.log(`Error fetching ${locationType} list: `, err);
    });
}

function citySelectedEventHandler(event) {
  let selectedCityName = event.target.value;

  const url = getAPIURL["cityInfo"](selectedCityName);

  getAPIData(url)
    .then((ctyData) => {
      const cityData = parseAPIData["cityData"](ctyData);

      const imgSlug = parseAPIData["imgSlug"](ctyData);

      if (imgSlug === "no-image") {
        const imageData = {
          missingImageData: "Sorry, no image data currently exists for this city.",
        };
        renderCityCard(cityData, imageData, DOM_MAP["cards"].wrap);
        return;
      }
      const imgUrl = getAPIURL["image"](imgSlug);

      getAPIData(imgUrl)
        .then((imgData) => {
          const imageData = parseAPIData["image"](imgData);

          return renderCityCard(cityData, imageData, DOM_MAP["cards"].wrap);
        })
        .catch((err) => console.log(`Error fetching image data: `, err));
    })
    .catch((err) => console.log(`Error fetching city data: `, err));
}

// EVENT LISTENERS ----------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  //fetching continent data from API and appending to DOM
  locationSelectedEventHandler("continent");
});

continentDropDown.addEventListener("change", (event) => {
  locationSelectedEventHandler("country", event);
});

countryDropDown.addEventListener("change", (event) => {
  locationSelectedEventHandler("city", event);
});

cityDropDown.addEventListener("change", (event) => {
  citySelectedEventHandler(event);
});

// const selection = event.target.value;

// const cityUrl = getAPIURL["city"](selection);

// const cityDetails = `https://api.teleport.org/api/cities/?search=${selection}&embed=city%3Asearch-results%2Fcity%3Aitem%2Fcity%3Aurban_area%2Fua%3Ascores`;

// getAPIData(cityDetails).then((data) => {
//   console.log(data);
//   const getPopDetails =
//     data._embedded["city:search-results"][0]["_embedded"]["city:item"];

//   const getQualityDetails =
//     getPopDetails._embedded["city:urban_area"]["_embedded"]["ua:scores"];
//   console.log(getPopDetails.population);
//   console.log(getQualityDetails);

//   if ("city:urban_area" === undefined) {
//     console.log("This city does not current have quality of life statistics");
//   }
// });

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
