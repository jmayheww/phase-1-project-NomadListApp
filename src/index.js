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

const continentWrapper1 = document.querySelector("#continent-wrapper1");
const countryWrapper1 = document.querySelector("#country-wrapper1");
const cityWrapper1 = document.querySelector("#city-wrapper1");

const continentDropDown1 = document.querySelector("#continents1");
const countryDropDown1 = document.querySelector("#countries1");
const cityDropDown1 = document.querySelector("#cities1");

const continentWrapper2 = document.querySelector("#continent-wrapper2");
const countryWrapper2 = document.querySelector("#country-wrapper2");
const cityWrapper2 = document.querySelector("#city-wrapper2");

const continentDropDown2 = document.querySelector("#continents2");
const countryDropDown2 = document.querySelector("#countries2");
const cityDropDown2 = document.querySelector("#cities2");

const cardWrapper1 = document.querySelector("#city-card-wrapper1");
const cardWrapper2 = document.querySelector("#city-card-wrapper2");

const DOM_MAP = {
  continent: {
    wrap1: continentWrapper1,
    drop1: continentDropDown1,
    drop2: continentDropDown2,
  },
  country: {
    wrap1: countryWrapper1,
    drop1: countryDropDown1,
    drop2: countryDropDown2,
  },
  city: {
    wrap1: cityWrapper1,
    drop1: cityDropDown1,
    drop2: cityDropDown2,
  },
  cards: {
    wrap1: cardWrapper1,
    wrap2: cardWrapper2,
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
        "Sorry, no other quality of life data currently exists for this city.";

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
  cardsWrapper.innerHTML = "";

  //Handle missing data case
  if (cityData.missingDataMessage || imageData.missingImageData) {
    const { name, pop, missingDataMessage } = cityData;

    const cityCard = document.createElement("div");
    const title = document.createElement("h2");
    const population = document.createElement("p");
    const description = document.createElement("p");
    const imgWrapper = document.createElement("div");
    const imgMessage = document.createElement("p");
    const resetButton = document.createElement("button");

    resetButton.classList = "reset-button";

    title.innerText = name;
    population.innerText = `Total population: ${pop}`;
    description.innerText = missingDataMessage;

    const missingImageData = imageData.missingImageData;
    imgMessage.textContent = missingImageData;

    resetButton.textContent = "Reset Selection";

    resetButton.addEventListener("click", (event) => {
      resetSelectionEventHandler(event);
    });

    imgWrapper.append(imgMessage);
    cityCard.append(title, population, description);
    cardsWrapper.append(imgWrapper, cityCard, resetButton);
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
  const imgCitation1 = document.createElement("p");
  const imgCitation2 = document.createElement("p");

  const resetButton = document.createElement("button");

  cityCard.classList = "city-card";
  cityInfo.classList = "city-info";
  cityScores.classList = "city-scores";
  description.classList = "description";
  cityScore.classList = "aggregate-score";

  img.src = src;
  img.classList = "city-image";
  imgCitation1.classList = "citations";
  imgCitation2.classList = "citations";
  imgWrapper.classList = "image-wrapper";

  resetButton.classList = "reset-button";

  //Inject info into DOM elements
  title.textContent = name;
  population.textContent = `Total Population: ${pop}`;
  description.textContent = `Description Summary: ${desc}`;
  cityScore.textContent = `Aggregate city score: ${overAllScore}/100`;

  imgCitation1.textContent = `Photographer: ${photographer}`;
  imgCitation2.textContent = `Origin: ${originSrc}`;

  resetButton.textContent = "Reset Selection";
  // Add event listener to button

  resetButton.addEventListener("click", (event) => {
    resetSelectionEventHandler(event);
  });

  //Append DOM elements to parent and iterate scores data
  scores.map((score) => {
    const scoreData = document.createElement("p");
    scoreData.textContent = `${score.name}: ${Math.round(
      score.score_out_of_10
    )}/10`;
    scoreData.classList = "scores";
    cityScores.append(scoreData);
  });
  imgWrapper.append(img, imgCitation1, imgCitation2);

  cityInfo.append(title, description, population);
  cityScores.append(cityScore);
  cityCard.append(cityInfo, cityScores);

  cardsWrapper.append(imgWrapper, cityCard, resetButton);
}

function locationSelectedEventHandler(
  locationType,
  domMapLocationValue,
  event
) {
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
      debugger
      const locList = parseAPIData[locationType](data).sort();
      if (needsInitLocation) {
        resetDropDownOptions(DOM_MAP[locationType][domMapLocationValue]);
      }
      renderLocationData(locList, DOM_MAP[locationType][domMapLocationValue]);
    })
    .catch((err) => {
      console.log(`Error fetching ${locationType} list: `, err);
    });
}

function citySelectedEventHandler(event, domMapLocationValue) {
  let selectedCityName = event.target.value;

  const url = getAPIURL["cityInfo"](selectedCityName);

  getAPIData(url)
    .then((ctyData) => {
      const cityData = parseAPIData["cityData"](ctyData);

      const imgSlug = parseAPIData["imgSlug"](ctyData);

      if (imgSlug === "no-image") {
        const imageData = {
          missingImageData:
            "Sorry, no image data currently exists for this city.",
        };
        renderCityCard(
          cityData,
          imageData,
          DOM_MAP["cards"][domMapLocationValue]
        );
        return;
      }
      const imgUrl = getAPIURL["image"](imgSlug);

      getAPIData(imgUrl)
        .then((imgData) => {
          const imageData = parseAPIData["image"](imgData);

          return renderCityCard(
            cityData,
            imageData,
            DOM_MAP["cards"][domMapLocationValue]
          );
        })
        .catch((err) => console.log(`Error fetching image data: `, err));
    })
    .catch((err) => console.log(`Error fetching city data: `, err));
}

function resetSelectionEventHandler(event) {
  const buttonEl = event.target;
  buttonEl.parentElement.innerHTML = "Please make another selection";
}

// EVENT LISTENERS ----------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  //fetching continent data from API and appending to DOM
  locationSelectedEventHandler("continent", "drop1");
  locationSelectedEventHandler("continent", "drop2");
});

continentDropDown1.addEventListener("change", (event) => {
  locationSelectedEventHandler("country", "drop1", event);
});

countryDropDown1.addEventListener("change", (event) => {
  locationSelectedEventHandler("city", "drop1", event);
});

cityDropDown1.addEventListener("change", (event) => {
  citySelectedEventHandler(event, "wrap1");
});

continentDropDown2.addEventListener("change", (event) => {
  locationSelectedEventHandler("country", "drop2", event);
});

countryDropDown2.addEventListener("change", (event) => {
  locationSelectedEventHandler("city", "drop2", event);
});

cityDropDown2.addEventListener("change", (event) => {
  citySelectedEventHandler(event, "wrap2");
});
