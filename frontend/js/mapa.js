
/* =========================================================
   GUIA DO BUSÃO - MAPA COM LOCALIZAÇÃO AUTOMÁTICA
   ========================================================= */

let mapaGuia = null;
let marcadorUsuario = null;
let circuloPrecisao = null;

const POSICAO_INICIAL = [-30.0346, -51.2177];

document.addEventListener("DOMContentLoaded", inicializarMapa);

function inicializarMapa() {
    const elemento = document.getElementById("map");

    if (!elemento || typeof L === "undefined") {
        console.error("Mapa ou biblioteca Leaflet não encontrados.");
        return;
    }

    mapaGuia = L.map(elemento).setView(POSICAO_INICIAL, 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapaGuia);

    L.marker(POSICAO_INICIAL)
        .addTo(mapaGuia)
        .bindPopup("Porto Alegre");

    const botao = document.getElementById("myLocationButton");

    if (botao) {
        botao.addEventListener("click", obterLocalizacao);
    }

    setTimeout(() => mapaGuia.invalidateSize(), 250);

    // Tenta localizar o usuário automaticamente ao abrir a página.
    obterLocalizacao();
}

function obterLocalizacao() {
    const botao = document.getElementById("myLocationButton");

    if (!navigator.geolocation) {
        alert("Seu navegador não oferece suporte à localização.");
        return;
    }

    if (botao) {
        botao.disabled = true;
        botao.textContent = "Obtendo localização...";
    }

    navigator.geolocation.getCurrentPosition(
        (posicao) => {
            const latitude = posicao.coords.latitude;
            const longitude = posicao.coords.longitude;
            const precisao = posicao.coords.accuracy;
            const coordenadas = [latitude, longitude];

            if (marcadorUsuario) {
                mapaGuia.removeLayer(marcadorUsuario);
            }

            if (circuloPrecisao) {
                mapaGuia.removeLayer(circuloPrecisao);
            }

            marcadorUsuario = L.marker(coordenadas)
                .addTo(mapaGuia)
                .bindPopup(
                    `Sua localização estimada<br>` +
                    `Precisão informada: ±${Math.round(precisao)} metros`
                )
                .openPopup();

            circuloPrecisao = L.circle(coordenadas, {
                radius: precisao,
                color: "#1769aa",
                fillColor: "#1769aa",
                fillOpacity: 0.12,
                weight: 1
            }).addTo(mapaGuia);

            mapaGuia.setView(coordenadas, 16);

            console.log("Latitude:", latitude);
            console.log("Longitude:", longitude);
            console.log("Precisão informada:", precisao, "metros");

            if (botao) {
                botao.disabled = false;
                botao.textContent = "📍 Minha localização";
            }
        },
        (erro) => {
            console.warn("Erro ao obter localização:", erro.message);

            if (erro.code === 1) {
                alert("Permita o acesso à localização nas configurações do navegador.");
            } else if (erro.code === 2) {
                alert("Não foi possível determinar sua posição.");
            } else if (erro.code === 3) {
                alert("A localização demorou demais. Tente novamente pelo botão.");
            }

            if (botao) {
                botao.disabled = false;
                botao.textContent = "📍 Minha localização";
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        }
    );
}
