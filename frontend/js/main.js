/* =====================================================
   GUIA DO BUSÃO
   MAIN.JS
===================================================== */


/* ================= ELEMENTOS ================= */

const routeForm = document.getElementById("routeForm");

const originInput = document.getElementById("origin");
const destinationInput = document.getElementById("destination");

const travelDate = document.getElementById("travelDate");
const travelTime = document.getElementById("travelTime");

const swapButton = document.getElementById("swapButton");
const locationButton = document.getElementById("locationButton");

const originSuggestions =
    document.getElementById("originSuggestions");

const destinationSuggestions =
    document.getElementById("destinationSuggestions");

const menuButton =
    document.getElementById("menuButton");

const mobileMenu =
    document.getElementById("mobileMenu");

const mobileClose =
    document.getElementById("mobileClose");


/* ================= DATA ATUAL ================= */

function setMinimumDate() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    const formattedDate =
        `${year}-${month}-${day}`;

    travelDate.min = formattedDate;

    if (!travelDate.value) {
        travelDate.value = formattedDate;
    }
}

setMinimumDate();


/* ================= SWAP ================= */

swapButton.addEventListener("click", () => {

    const originValue = originInput.value;

    originInput.value = destinationInput.value;

    destinationInput.value = originValue;

});


/* ================= SUGESTÕES ================= */

const locations = [

    "Porto Alegre - RS",
    "Florianópolis - SC",
    "Curitiba - PR",
    "São Paulo - SP",
    "Canoas - RS",
    "Novo Hamburgo - RS",
    "São Leopoldo - RS",
    "Gravataí - RS",
    "Sarandi - Porto Alegre - RS",
    "Centro Histórico - Porto Alegre - RS",
    "Centro - Florianópolis - SC",
    "Terminal Rodoviário de Porto Alegre",
    "Terminal Rodoviário de Florianópolis",
    "Balneário Camboriú - SC",
];


function showSuggestions(input, container) {

    const value =
        input.value.trim().toLowerCase();

    container.innerHTML = "";

    if (!value) {

        container.classList.remove("active");

        return;
    }


    const filtered =
        locations
            .filter(location =>
                location
                    .toLowerCase()
                    .includes(value)
            )
            .slice(0, 5);


    if (filtered.length === 0) {

        container.classList.remove("active");

        return;
    }


    filtered.forEach(location => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "suggestion-item";


        button.innerHTML = `
            <span class="suggestion-icon">📍</span>
            <span>${location}</span>
        `;


        button.addEventListener("click", () => {

            input.value = location;

            container.classList.remove("active");

        });


        container.appendChild(button);

    });


    container.classList.add("active");
}


originInput.addEventListener("input", () => {

    showSuggestions(
        originInput,
        originSuggestions
    );

});


destinationInput.addEventListener("input", () => {

    showSuggestions(
        destinationInput,
        destinationSuggestions
    );

});


/* ================= FECHAR SUGESTÕES ================= */

document.addEventListener("click", (event) => {

    if (
        !originInput.contains(event.target) &&
        !originSuggestions.contains(event.target)
    ) {

        originSuggestions.classList.remove("active");

    }


    if (
        !destinationInput.contains(event.target) &&
        !destinationSuggestions.contains(event.target)
    ) {

        destinationSuggestions.classList.remove("active");

    }

});


/* ================= LOCALIZAÇÃO ================= */

locationButton.addEventListener("click", () => {

    if (!navigator.geolocation) {

        showNotification(
            "Seu navegador não suporta localização.",
            "error"
        );

        return;
    }


    locationButton.textContent = "⌛";


    navigator.geolocation.getCurrentPosition(

        (position) => {

            console.log(
                "Latitude:",
                position.coords.latitude
            );

            console.log(
                "Longitude:",
                position.coords.longitude
            );


            /*
                FUTURO:

                Aqui vamos enviar as coordenadas
                para uma API de mapas/geolocalização.

                Por enquanto apenas mostramos
                uma mensagem.
            */


            showNotification(
                "Localização encontrada! A integração com o mapa será adicionada depois.",
                "success"
            );


            locationButton.textContent = "◎";

        },


        () => {

            showNotification(
                "Não foi possível obter sua localização.",
                "error"
            );

            locationButton.textContent = "◎";

        }

    );

});


/* ================= FORMULÁRIO ================= */

routeForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const origin =
        originInput.value.trim();

    const destination =
        destinationInput.value.trim();

    const date =
        travelDate.value;

    const time =
        travelTime.value;


    /* ================= VALIDAÇÃO ================= */

    if (!origin) {

        showNotification(
            "Informe o local de origem.",
            "error"
        );

        originInput.focus();

        return;
    }


    if (!destination) {

        showNotification(
            "Informe o destino.",
            "error"
        );

        destinationInput.focus();

        return;
    }


    if (!date) {

        showNotification(
            "Escolha uma data para a viagem.",
            "error"
        );

        travelDate.focus();

        return;
    }


    /* ================= BOTÃO ================= */

    const button =
        routeForm.querySelector(".search-button");

    const originalContent =
        button.innerHTML;


    button.classList.add("loading");

    button.innerHTML =
        "<span>Buscando rotas...</span>";


    /*
        POR ENQUANTO:

        O backend ainda não existe.

        Então simulamos uma pequena espera
        para testar a interface.
    */


    await delay(800);


    const searchData = {

        origin,
        destination,
        date,
        time,

        directOnly:
            document.getElementById("directRoute").checked

    };


    console.log(
        "Dados da pesquisa:",
        searchData
    );


    /*
        FUTURO BACKEND

        Aqui teremos algo parecido com:

        const response = await fetch(
            "http://localhost:3000/api/rotas",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(searchData)
            }
        );

        const data = await response.json();

        localStorage.setItem(
            "ultimaPesquisa",
            JSON.stringify(data)
        );

        window.location.href =
            "resultado.html";
    */


    localStorage.setItem(
        "ultimaPesquisa",
        JSON.stringify(searchData)
    );


    button.classList.remove("loading");

    button.innerHTML =
        originalContent;


    /*
        Como ainda não criamos resultado.html,
        mostramos uma mensagem temporária.
    */

    showNotification(
        "Pesquisa realizada! O sistema de rotas será conectado ao backend na próxima etapa.",
        "success"
    );

});


/* ================= MENU MOBILE ================= */

menuButton.addEventListener("click", () => {

    mobileMenu.classList.add("active");

});


mobileClose.addEventListener("click", () => {

    mobileMenu.classList.remove("active");

});


document.addEventListener("click", (event) => {

    if (
        mobileMenu.classList.contains("active") &&
        !mobileMenu.contains(event.target) &&
        !menuButton.contains(event.target)
    ) {

        mobileMenu.classList.remove("active");

    }

});


/* ================= NOTIFICAÇÃO ================= */

function showNotification(message, type = "success") {

    const existing =
        document.querySelector(".notification");

    if (existing) {
        existing.remove();
    }


    const notification =
        document.createElement("div");

    notification.className =
        `notification ${type}`;

    notification.textContent =
        message;


    document.body.appendChild(notification);


    setTimeout(() => {

        notification.remove();

    }, 4000);

}


/* ================= DELAY ================= */

function delay(milliseconds) {

    return new Promise(resolve => {

        setTimeout(resolve, milliseconds);

    });

}