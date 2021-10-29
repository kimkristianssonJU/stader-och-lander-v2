const storageKey = "cityIDs";
const btnSwitchView = document.getElementById("switch-view-button");
const btnClear = document.getElementById("clear-view-button");
let countryCards = [];                          // Lista över alla länder
let visitedCitiesIds = [];                      // Lista över IDs till besökta städer
let mainTitle = document.getElementById("title");
let switchState = "default";                    // Påvisar vilken vy användaren är på

// Får knappar att kollapsa
collapsible = () => {
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function () {
            let activeIndicator = this.getElementsByClassName("indicator")[0];
            activeIndicator.style.display = "none";
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;

                if (activeIndicator) {
                    activeIndicator.style.display = "block";
                }
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    }
}

// Skapar sidan med besökta länder
function gotoVisitedView() {
    const index = getCurrentTabIndex();
    clearViews();
    switchState = "visited";
    mainTitle.textContent = "Besökta Länder och Städer";

    // Om användaren har besökt en stad i ett land
    for (const countryCard of countryCards) {
        if (countryCard.visitedCount > 0) {
            countryCard.createTab();
        }
    }

    // Tar användaren tillbaka till förstasidan utan att byta land för användaren
    btnSwitchView.querySelector("p").textContent = "Tillbaka";
    if (countryCards[index].visitedCount > 0) {
        countryCards[index].visitedView();
    }
    else {
        showAppropriateTab()
    }
}

// Skapar förstasidan för användaren
function gotoDefaultView() {
    const index = getCurrentTabIndex();
    clearViews();
    switchState = "default";
    mainTitle.textContent = "Länder och Städer";
    for (const countryCard of countryCards) {
        countryCard.createTab();
    }
    btnSwitchView.querySelector("p").textContent = "Städer jag besökt";
    countryCards[index].defaultView();
}

// Funktioner till knappen som tar användaren till och från länder hen har besökt
btnSwitchView.addEventListener("click", () => {
    if (switchState === "default") {
        gotoVisitedView();
    }
    else {
        gotoDefaultView();
    }
});

// Rensar lagrad data och tar användaren till förstasidan
btnClear.addEventListener("click", () => {
    visitedCitiesIds = [];
    localStorage.removeItem(storageKey);
    nextTabIndex = getCurrentTabIndex();
    clearViews();
    for (const countryCard of countryCards) {
        countryCard.visitedCount = 0;
    }
    gotoDefaultView();
    countryCards[nextTabIndex].defaultView();
    btnSwitchView.disabled = true;
    btnClear.disabled = true;
});

// Tar användaren till det land som hen var inne på i förra vyn.
// Om landet inte finns i vyn så tas användern till första bästa land.
function showAppropriateTab() {
    const index = getCurrentTabIndex();
    if (switchState === "default") {
        countryCards[index].defaultView();
    }
    else {
        for (const countryCard of countryCards) {
            if (countryCard.visitedCount > 0) {
                countryCard.visitedView();
                break;
            }
        }
    }
}

// Returnerar index till det land som användaren är inne på
function getCurrentTabIndex() {
    for (let i = 0; i < countryCards.length; i++) {
        const countryCard = countryCards[i];
        if (countryCard.isActive) {
            return i;
        }
    }

    return 0;
}

// Tar bort all content från sidan
function clearViews() {
    for (const countryCard of countryCards) {
        countryCard.removeContent();
    }
}

// Skapar, klassificerar, och organiserar nya element med setAttribute
customCreateElements = (tag, attribute, attributeName, parent) => {
    element = document.createElement(tag);
    if (attribute) {
        element.setAttribute(attribute, attributeName);
    }
    parent.appendChild(element);
    return element;
}

// Skapar, klassificerar, och organiserar nya element
customCreateClassesElements = (tag, classNames, parent) => {
    element = document.createElement(tag);
    for (const className of classNames) {
        element.classList.add(className);
    }
    parent.appendChild(element);
    return element;
}

// Klass: Hanterar städerna som objekt
class CityCard {
    isActive = false;
    circleIcon = ["far", "fa-circle"];
    checkIcon = ["fas", "fa-check"];

    constructor(id, stadname, countryid, population, countryCard) {
        this.id = id;
        this.stadname = stadname;
        this.countryid = countryid;
        this.population = population;
        this.countryCard = countryCard // countryCard: Hänvisar till det land denna stad tillhör
    }

    // Returnerar ul-elementet som blir förälder till listan med städer.
    // Skapar ett ul-element ifall det inte finns, som sen returneras.
    getUlContent() {
        const section = document.getElementById("wrapper");
        this.ulContent = section.getElementsByClassName("ul-city-content")[0];

        if (!this.ulContent) {
            this.ulContent = customCreateElements("ul", "class", "ul-city-content", section);
        }
        return this.ulContent;
    }

    // Skapar och lägger till ny nod till listan över städer i ett land
    createCityNode() {
        const ul = this.getUlContent();
        this.cityNode = customCreateElements("li", "class", "city-node", ul);
        this.collapseButton = customCreateElements("button", "class", "collapsible", this.cityNode);
        this.collapseButton.type = "button";
        this.collapseContent = customCreateElements("div", "class", "content", this.cityNode);
        const div = customCreateElements("div", "", "", this.collapseContent);
        this.cityInfo = customCreateElements("p", "", "", div);
        this.btnCity = customCreateElements("button", "class", "visit-button", this.collapseContent);
        this.cardHandler();
        this.visitBtnTxt = customCreateElements("p", "class", "visit-btn-txt", this.btnCity);
        this.visitBtnTxt.textContent = "Besökt";
        this.indicator = customCreateElements("div", "class", "indicator", this.collapseButton);

        this.setCardState();
    }

    // Lägger till funktioner landets knapp, samt informationstext till objektet. 
    // "Lägg till"-knapp ifall användaren är på förstasidan.
    // "Ta bort"-knapp ifall användare är på sidan för besökta länder och städer. 
    cardHandler() {
        // "Lägg till"-knapp ifall användaren är på förstasidan.
        if (switchState === "default") {
            this.icon = customCreateClassesElements("i", ["far", "fa-circle"], this.btnCity);
            this.btnCity.addEventListener("click", () => {
                if (!visitedCitiesIds.includes(this.id)) {
                    visitedCitiesIds.push(this.id);
                    this.countryCard.visitedCount++;
                    localStorage.setItem(storageKey, JSON.stringify(visitedCitiesIds));
                    this.setCardState();
                    this.btnCity.disabled = true;
                    btnClear.disabled = false;

                    if (btnSwitchView.disabled) {
                        btnSwitchView.disabled = false;
                    }
                }
            });

            // Lägger till information om staden
            // <span>-elementet används för att siffran över antal besökare
            // inte ska separeras på grund av bildskärmsstorleken.
            const span = document.createElement("span");
            span.textContent = this.population.toLocaleString();
            this.collapseButton.textContent = this.stadname;
            this.cityInfo.textContent = this.stadname + " är en stad i " + this.countryCard.countryname + " med ";
            this.cityInfo.appendChild(span);
            this.cityInfo.textContent += " invånare.";
        }
        // "Ta bort"-knapp ifall användare är på sidan för besökta länder och städer. 
        else {
            // Knappen tar bort de städer hen inte längre vill påstå sig ha besökt
            // ...eller vid feltryck.
            this.icon = customCreateClassesElements("i", ["fas", "fa-times"], this.btnCity);
            this.btnCity.addEventListener("click", () => {
                this.countryCard.visitedCount--;
                this.btnCity.disabled = false;
                this.removeCard();

                // Tar bort denna staden från localStorage och listan över besökta städer.
                const index = visitedCitiesIds.indexOf(this.id);
                if (index > -1) {
                    visitedCitiesIds.splice(index, 1);
                    localStorage.setItem(storageKey, JSON.stringify(visitedCitiesIds));
                }

                // Om det inte längre finns städer i listan över landets besökta städer
                // så försvinner knappen för navigering till det landet
                if (this.countryCard.visitedCount === 0) {
                    this.countryCard.removeContent();

                    for (const countryCard of countryCards) {
                        if (countryCard.visitedCount > 0) {
                            showAppropriateTab();
                        }
                    }
                }

                // Om hela listan med besökta länder är tom
                // Återvänder användaren till förstasidan igen.
                if (visitedCitiesIds.length === 0) {
                    console.log("visitedCitiesIds.length");
                    localStorage.removeItem(storageKey);
                    gotoDefaultView();
                    showAppropriateTab();
                    btnClear.disabled = true;
                    btnSwitchView.disabled = true;
                    return;
                }
            });

            // Lägger till information om staden
            this.collapseButton.textContent = this.stadname;
            this.cityInfo.textContent = "Invånarantal: " + this.population.toLocaleString();
            this.cityInfo.innerText += "\nDu beräknas ha stött på ca. " + Math.round(this.population * 0.01).toLocaleString() + " av stadens invånare.";
        }
    }

    toggleIconClasses() {
        for (const circle of this.circleIcon) {
            this.icon.classList.toggle(circle);
        }
        for (const check of this.checkIcon) {
            this.icon.classList.toggle(check);
        }
    }

    setCardState() {
        if (switchState === "default") {
            for (const visitedId of visitedCitiesIds) {
                if (this.id === visitedId) {
                    this.toggleIconClasses();
                    this.collapseContent.classList.toggle("active-content");
                    this.btnCity.classList.toggle("active-visit-btn");
                    this.indicator.classList.toggle("indicator-active");
                    this.btnCity.disabled = true;
                }
            }
        }
    }

    removeCard() {
        this.cityNode.remove();
    }
}

// Klass: Hanterar länderna som objekt
class CountryCard {
    isActive = false;
    cityCards = [];
    visitedCount = 0;

    constructor(id, countryname) {
        this.id = id;
        this.countryname = countryname;
    }

    // Skapar knapparna för navigeringen mellan länderna
    createTab() {
        const ul = this.getUlContent();
        this.countryNode = customCreateElements("li", "class", "country-node", ul);
        this.tab = customCreateElements("button", "class", "country-tab", this.countryNode);
        this.tab.setAttribute("id", this.id);

        this.tab.addEventListener("click", () => {
            if (switchState === "default") {
                this.defaultView();
            }
            else {
                this.visitedView();
            }
        });

        this.title = customCreateElements("p", "", "", this.tab);

        this.title.textContent = this.countryname;
    }

    // Ändrar knapparnas utseende beroende på om de är aktiva eller inte,
    // samt avaktiverar/aktiveerar knappen
    toggleActiveTab() {
        if (this.isActive) {
            this.tab.style.color = "white";
            this.tab.style.backgroundColor = "black";
            this.tab.disabled = true;
        }
        else {
            this.tab.style.color = "black";
            this.tab.style.backgroundColor = "white";
            this.tab.disabled = false;
        }
    }

    // Förstasidan: Skapar vyn till sidan där användaren kan klicka på de länder de har besökt  
    defaultView() {
        document.getElementById("title-city").textContent = "Städer i " + this.countryname;
        document.getElementById("info-text").textContent = "Trevliga platser att besöka när du har tid.";
        this.toggleTabDisable();

        for (const countryCard of countryCards) {
            countryCard.removeCityContents();
        }

        for (const cityCard of this.cityCards) {
            cityCard.createCityNode();
        }
        this.isActive = true;
        this.toggleActiveTab();
        collapsible();
    }

    // Sidan som visar de länder och städer som användaren har angett att hen har besökt
    visitedView() {
        document.getElementById("title-city").textContent = "Besökta städer i " + this.countryname;
        document.getElementById("info-text").textContent = "I genomsnitt så träffar man inte mer än 1% av en stads befolkning över ett dagsbesök, enligt osäkra källor.";
        this.toggleTabDisable();
        this.tab.disabled = true;

        for (const countryCard of countryCards) {
            countryCard.removeCityContents();
        }

        for (const cityCard of this.cityCards) {
            for (const visitedId of visitedCitiesIds) {
                if (cityCard.id === visitedId) {
                    cityCard.createCityNode();
                }
            }
        }
        this.isActive = true;
        this.toggleActiveTab();
        collapsible();
    }

    // Aktiverar de knappar till det land som användaren inte är inne på
    toggleTabDisable() {
        for (const countryCard of countryCards) {
            if (countryCard.id !== this.id && countryCard.tab.disabled) {
                countryCard.tab.disabled = false;
            }
        }
    }

    // Returnerar ul-elementet som blir förälder till listan med länder.
    // Skapar ett ul-element ifall det inte finns, som sen returneras
    getUlContent() {
        const section = document.getElementById("nav");
        this.ulContent = section.getElementsByClassName("ul-nav")[0];
        if (!this.ulContent) {
            this.ulContent = document.createElement("ul");
            this.ulContent.classList.add("ul-nav");
            section.insertBefore(this.ulContent, btnSwitchView);
        }
        return this.ulContent;
    }

    // Skapar och förvarar stads-objekt till senare användning
    // Samt sorterar städerna baserat på population (störst först...)
    addCityCard(city) {
        const cityCard = new CityCard(city.id, city.stadname, city.countryid, city.population, this);
        this.cityCards.push(cityCard);
        this.cityCards.sort((a, b) => b.population - a.population);
    }

    // Tar bort staden visuellt ifrån sidan 
    removeContent() {
        this.countryNode.remove();
    }

    // Tar bort innehåll när användaren navigerar sig mellan länderna;
    removeCityContents() {
        if (this.isActive) {
            for (const cityCard of this.cityCards) {
                if (cityCard.cityNode) {
                    cityCard.cityNode.remove();
                }
            }
        }
        this.isActive = false;
        this.toggleActiveTab();
    }
}

// Skapar första vyn som användaren möts av,
// förutsatt att JSON-filen innehåller data.
createCountryContent = (jsonCountries, jsonCities) => {
    for (const country of jsonCountries) {
        let countryCard = new CountryCard(country.id, country.countryname);

        countryCard.createTab();

        for (const city of jsonCities) {
            if (city.countryid === countryCard.id) {
                countryCard.addCityCard(city);
            }
        }

        countryCards.push(countryCard);
    }
    showAppropriateTab();
}

// Räknar hur många städer användaren har besökt i varje land
setCardStorage = () => {
    if(visitedCitiesIds.length > 0) {
        for (const countryCard of countryCards) {
            for (const cityCard of countryCard.cityCards) {
                for (const visitedId of visitedCitiesIds) {
                    if (cityCard.id === visitedId) {
                        countryCard.visitedCount++;
                        break;
                    }
                }
            }
        }
    }
}

// Hämtar data från JSON
loadData = async (url) => {
    const response = await fetch(url);
    const data = response.json();
    return data;
}

// Behandlar data från JSON fil
printData = async () => {
    const jsonCountries = await loadData('https://lander-och-stader.herokuapp.com/countries');
    const jsonCities = await loadData('https://lander-och-stader.herokuapp.com/cities');

    // Hämtar lagrad IDs
    if (localStorage.getItem(storageKey)) {
        visitedCitiesIds = JSON.parse(localStorage.getItem(storageKey));

        if (visitedCitiesIds.length > 0) {
            btnSwitchView.disabled = false;
            btnClear.disabled = false;
        }
    }

    customCreateElements("p", "id", "info-text", document.getElementById("wrapper"));
    createCountryContent(jsonCountries, jsonCities);
    setCardStorage();
}
printData();
