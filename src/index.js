// Variable Declarations
const rootURL = "https://api.teleport.org/api";

document.addEventListener("DOMContentLoaded", () => {

    getData(continents);

})

function getAPIData(directory) {

    fetch(rootURL + `/${directory}`)
    .then(resp => resp.json())
    .then(data => console.log(data));
}

