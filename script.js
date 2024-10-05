const pokemonsDiv = document.querySelector("#pokemonsDiv");
const more = document.querySelector("#more");
const pokemonsDialog = document.querySelector("#dialog");
let clickedPokemon;
let DataId;

let key = "project";

const pokedata = [];
const printData = [];
let savedArray = [];

function saveData() {
    localStorage.setItem(key, JSON.stringify(savedArray));
}

getData();

function displayLocal() {
    for (let item of savedArray) {
        if (item) {
            let cardElement = document.querySelector(`.card[data-id="${item}"]`);
            cardElement.classList.add("green");
            let caught = document.querySelector(`.caught[data-id="${item}"]`);
            caught.classList.add("white");
        }
    }
}

function getData() {
    let data = localStorage.getItem(key);
    if (data) {
        savedArray = JSON.parse(data);
    } else {
        savedArray = [];
    }
}

function anotherFetch(data) {
    pokedata.push(...data.results);

    const last20 = pokedata.slice(-20);

    last20.forEach(async (item) => {
        const response = await fetch(item.url);
        let data = await response.json();
        printData.push(data);
        displayPokemon(printData);
    });
}

function displayPokemon(printData) {
    pokemonsDiv.innerHTML = "";

    pokemonsDiv.innerHTML = printData.reduce(
        (html, prop) =>
            html +
            `<div class="card" id="${prop.id}" data-id="${prop.id}">
                <img src="${prop.sprites.other["official-artwork"].front_default}">
                <h2 class="poke-title">${prop.name}</h2>
                <h3 class="caught" data-id="${prop.id}">CAUGHT</h3>
            </div>`,
        ""
    );

    pokemonsDiv.addEventListener("click", clickExecute);
    displayLocal();
}

function clickExecute(ev) {
    if (ev.target.closest(".card")) {
        DataId = ev.target.closest(".card").getAttribute("data-id");
        clickedPokemon = printData.find((item) => item.id === Number(DataId));
        displayDialog(clickedPokemon);
    }
}

function displayDialog(pokemon) {
    pokemonsDialog.showModal();

    let types = [];
    let moves = [];
    pokemon.types.forEach((item) => types.push(item.type.name));
    pokemon.moves.forEach((item) => moves.push(item.move.name));

    moves.length = 6;
    pokemonsDialog.innerHTML = `
        <div class="dialogContainer">
            <div class="dialogHeader">
                <h2 class="dialogTitle">${pokemon.name}</h2>
                <button id="dialogClose">close</button>
            </div>
            <div class="dialogData">
                <img src="${pokemon.sprites.other["official-artwork"].front_shiny}" alt="" />
                <div class="dialogText" data-id="${pokemon.id}">
                    <div>
                        <h3 class="types">Types</h3>
                        <p class="typesText">${types}</p>
                    </div>
                    <div>
                        <h3 class="moves">Moves</h3>
                        <p class="movesText">${moves}</p>
                    </div>
                    ${
                        savedArray.includes(pokemon.id)
                            ? `<button class="delete" data-id="${pokemon.id}">Delete</button>`
                            : `<button class="catch" data-id="${pokemon.id}">Catch</button>`
                    }
                </div>
            </div>
        </div>
    `;
    let closeBtn = pokemonsDialog.querySelector("#dialogClose");
    let dltBtn = pokemonsDialog.querySelector(`.delete`);
    if (dltBtn) {
        dltBtn.addEventListener("click", pokeDelete);
    }
    let catchBtn = pokemonsDialog.querySelector(".catch");

    closeBtn.addEventListener("click", () => {
        pokemonsDialog.close();
    });

    catchBtn.addEventListener("click", catchAction);
}

function catchAction(ev) {
    ev.preventDefault();
    DataId = ev.target.getAttribute("data-id");
    clickedPokemon = printData.find((item) => item.id === Number(DataId));
    if (!savedArray.includes(Number(DataId))) {
        savedArray.push(clickedPokemon.id);
        let cardElement = document.querySelector(`.card[data-id="${DataId}"]`);
        cardElement.classList.add("green");
        let caught = document.querySelector(`.caught[data-id="${DataId}"]`);
        caught.classList.add("white");
        pokemonsDialog.close();
        saveData();
    }
}

function pokeDelete(ev) {
    ev.preventDefault();
    DataId = ev.target.getAttribute("data-id");


    const index = savedArray.indexOf(Number(DataId));
    if (index !== -1) {
        savedArray.splice(index, 1);
    }


    let cardElement = document.querySelector(`.card[data-id="${DataId}"]`);
    cardElement.classList.remove("green");

    let caught = document.querySelector(`.caught[data-id="${DataId}"]`);
    caught.classList.remove("white");

    let catchbtn1 = document.querySelector(`.delete[data-id="${DataId}"]`);
    let catchBtn = document.createElement("button");
    catchBtn.setAttribute("class", "catch");
    catchBtn.setAttribute("data-id", DataId);
    catchBtn.innerHTML = "Catch";
    catchbtn1.replaceWith(catchBtn);

    saveData();
    pokeDelete.close();
}

function caughtAction() {
    console.log(savedArray);
}

more.addEventListener("click", async function (ev) {
    ev.preventDefault();
    const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=20&offset=${pokedata.length}`
    );
    const data = await response.json();
    anotherFetch(data);
});

fetch("https://pokeapi.co/api/v2/pokemon?limit=20&offset=0")
    .then((response) => response.json())
    .then((data) => {
        anotherFetch(data);
    });
