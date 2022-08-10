// Variables
const body = document.querySelector("body");
const darkModeButton = document.querySelector("#dark-mode-button");

// Init Event Listener
darkModeButton.addEventListener("click", toggleMode);

// Handle Event Listener
function toggleMode() {
  console.log(body.classList.value === "default");
  if (body.classList.value === "default") {
    body.classList.value = "dark-mode";
    console.log("dark mode on");
  } else {
    body.classList.value = "default";
    console.log("back to the light");
  }
}
