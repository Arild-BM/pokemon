const appElement = document.getElementById("app");
appElement.innerHTML = `
	<nav>
		<button id="button-prev">⬅️</button>
		<button id="button-home">POKE DEX HOME</button>
		<button id="button-next">➡️</button>
		<input type="text" name="" id="search-text" placeholder="search">
		<button id="search-button">🔍</button>
	</nav>`;

const prevButton = document.getElementById("button-prev");
const nextButton = document.getElementById("button-next");
const homeButton = document.getElementById("button-home");
const searchText = document.getElementById("search-text");
const searchButton = document.getElementById("search-button");

const mainContent = document.createElement("div");
mainContent.className = "poke-list";
mainContent.style = "margin-top: 5rem;";

const apiUrls = {
  currentUrl: "https://pokeapi.co/api/v2/pokemon/",
  main: "https://pokeapi.co/api/v2/pokemon/",
  next: null,
  previous: null,
  last: ""
};

// Beregner siste URL
async function getLastUrl(url) {
  const pokemonData = await getAPIdata(url);
  apiUrls.last = `https://pokeapi.co/api/v2/pokemon/?offset=${
    Math.trunc(pokemonData.count / 20) * 20
  }&limit=20`;
}

// Kaller funksjon som beregner siste URL
getLastUrl(apiUrls.main);

// Legger inn evntlisterners for knapperad
prevButton.addEventListener("click", prev);
nextButton.addEventListener("click", next);
homeButton.addEventListener("click", home);
searchButton.addEventListener("click", search);

// Viser forrige 20 kort
function prev() {
  apiUrls.currentUrl = apiUrls.previous || apiUrls.last;
  console.log("Current: ", apiUrls.currentUrl)
  displayAPIdata(apiUrls.currentUrl);
}
// Viser neste 20 kort
function next() {
  apiUrls.currentUrl = apiUrls.next || apiUrls.main;
  displayAPIdata(apiUrls.currentUrl);
}

// Hopper til start
function home() {
  apiUrls.currentUrl = apiUrls.main;
  displayAPIdata(apiUrls.currentUrl);
}

function showPokemonElement(pokemon) {
  mainContent.innerHTML = "";
  mainContent.append(pokemon);
  appElement.append(mainContent);
}

// Søker etter pokemon angitt i tekstfelt
async function search() {
  apiUrls.currentUrl = apiUrls.main;
  let found = false;
  do {
    const pokemonData = await getAPIdata(apiUrls.currentUrl);

    for (let i = 0; i < pokemonData.results.length && !found; i++) {
      if (pokemonData.results[i].name === searchText.value.toLowerCase()) {
        let pokemonElements = pokemonCardElement(pokemonData.results[i]);
        showPokemonElement(pokemonElements)
        searchText.value = ""; // Tømmer tekstfelt hvis tekst blir funnet
        found = true;
      }
    }
    apiUrls.currentUrl = apiUrls.next;
  } while (!found && apiUrls.currentUrl != null);
  if (!found) {
    mainContent.innerHTML = "";
    document.createElement("h1").textContent = "GGG"
    
    const notFound = document.createElement("h2");
    notFound.textContent = "Not found";
    mainContent.append(notFound);
    appElement.append(mainContent);
  }
}

// Henter API-data
async function getAPIdata(url) {
  const fetchRequest = await fetch(url);
  const fetchData = await fetchRequest.json();

  apiUrls.next = fetchData.next;
  apiUrls.previous = fetchData.previous;

  return fetchData;
}

// Viser API-data i DOM
async function displayAPIdata(url) {
  const pokemonData = await getAPIdata(url);
  let pokemonElements = pokemonData.results.map((pokemon) =>
    pokemonCardElement(pokemon)
  );
  // clear the mainContent div
  mainContent.innerHTML = "";
  // append elements to the page
  mainContent.append(...pokemonElements);
}

// Lager ny div og legger inn navn og bilde
function pokemonCardElement(pokemon) {
  // console.log(pokemon)
  const pokemonCard = document.createElement("div");
  
  // Henter inn data (bilde) for en enkelt Pokemon-figur
  async function getPokecard(url) {
    const fetchRequest = await fetch(url);
    const fetchData = await fetchRequest.json();
        
    pokemonPic.src = fetchData.sprites.other["official-artwork"].front_default || "./src/noPicture.png"
  }
  
  
  pokemonCard.className = "card";

  const pokemonTitle = document.createElement("h2");
  pokemonTitle.textContent = pokemon.name[0].toUpperCase() + pokemon.name.slice(1);

  const pokemonPic = document.createElement("img");
  getPokecard(pokemon.url)
  pokemonCard.append(pokemonTitle);
  pokemonCard.append(pokemonPic);

  return pokemonCard;
}

// Kjører displayfunksjon
displayAPIdata(apiUrls.currentUrl);
appElement.append(mainContent);