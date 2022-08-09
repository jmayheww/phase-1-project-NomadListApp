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
      const description = URBAN_AREA["ua:scores"]["summary"].replace(
        /<[^>]+>/g,
        ""
      );

      return { name, pop, desc, scores, overAllScore };
    } catch {
      const missingDataMessage =
        "Sorry, no quality of life data currently exists for this city.";

      return { name, pop, missingDataMessage };
    }
  },
  imgSlug: (data) => {
    return data._embedded["city:search-results"][0]["_embedded"]["city:item"][
      "_embedded"
    ]["city:urban_area"]["slug"];
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
    population.innerText = pop;
    description.innerText = missingDataMessage;

    const missingImageData = imageData;

    const imgWrapper = document.createElement("div");
    const img = document.createElement("img");
    img.textContent = missingImageData;
    imgWrapper.append(img);

    cityCard.append(title, population, description);
    cardsWrapper.append(imgWrapper, cityCard);
    return;
  }
  const { name, desc, pop, overallScore, scores } = cityData;
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
  cityScore.textContent = `Aggregate city score: ${overallScore}/100`;

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

function handleImgData(data) {
  try {
    const citySlug =
      data._embedded["city:search-results"][0]["_embedded"]["city:item"][
        "_embedded"
      ]["city:urban_area"].slug;

    const imgURL = `https://api.teleport.org/api/urban_areas/slug:${citySlug}/images/`;

    getAPIData(imgURL).then((data) => {
      const imgData = parseAPIData["image"](data);
      console.log("imgData: ", imgData);

      const imgFile = imgData["image"].web;
      const imgAuthor = imgData["attribution"].photographer;
      const imgSrc = imgData["attribution"].source;

      appendImgData(imgFile, imgAuthor, imgSrc);
    });
  } catch {
    const imgWrapper = document.querySelector("#city-img");
    const sorryMessage = "Sorry, no image data currently exists for this city";

    imgWrapper.append(sorryMessage);
  }
}

// getAPIData(imgURL).then((data) => {
//   const imgData = parseAPIData["image"](data);
//   console.log("imgData: ", imgData);

//   const imgFile = imgData["image"].web;
//   const imgAuthor = imgData["attribution"].photographer;
//   const imgSrc = imgData["attribution"].source;

//   appendImgData(imgFile, imgAuthor, imgSrc);

function appendImgData(imageFile, imgAuthor, imgSrc) {
  const img = document.createElement("img");
  const imgCitation1 = document.createElement("span");
  const imgCitation2 = document.createElement("span");

  const imgWrapper = document.querySelector("#city-img");

  img.src = imageFile;
  imgCitation1.textContent = `Photographer: ${imgAuthor}`;
  imgCitation2.textContent = `Origin: ${imgSrc}`;

  imgWrapper.append(img, imgCitation1, imgCitation2);
}

function dropDownEventHandler(locationType, event) {
  let selection = event ? event.target.value : null;

  if (selection === "United States") {
    selection = "usa";
  }

  const url = selection
    ? getAPIURL[locationType](selection)
    : getAPIURL[locationType]();

  getAPIData(url)
    .then((data) => {
      const locList = parseAPIData[locationType](data).sort();

      if (event) {
        resetDropDownOptions(DOM_MAP[locationType].drop);
      }
      renderLocationData(locList, DOM_MAP[locationType].drop);
    })
    .catch((err) => {
      console.log(`Error fetching ${locationType} list: `, err);
    });
}

function handleCityCards(locationType1, locationType2, event) {
  let selection = event.target.value;

  const url = getAPIURL[locationType1](selection);

  getAPIData(url).then((data) => {
    const titleList = parseAPIData[locationType1](data);
    const qualityLife = parseAPIData[locationType2](data);
    handleImgData(data);
    createCityCard(titleList, qualityLife, DOM_MAP[locationType1].wrap);
  });
}

// EVENT LISTENERS ----------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  dropDownEventHandler("continent");
});

continentDropDown.addEventListener("change", (event) => {
  dropDownEventHandler("country", event);
});

countryDropDown.addEventListener("change", (event) => {
  dropDownEventHandler("city", event);
});

cityDropDown.addEventListener("change", (event) => {
  handleCityCards("title", "qualityLife", event);
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
