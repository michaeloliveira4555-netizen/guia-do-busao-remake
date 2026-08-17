const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../../data");

function lerArquivo(nomeArquivo) {
    const caminho = path.join(dataPath, nomeArquivo);

    if (!fs.existsSync(caminho)) {
        throw new Error(`Arquivo ${nomeArquivo} não encontrado.`);
    }

    const dados = fs.readFileSync(caminho, "utf-8");

    return JSON.parse(dados);
}

function getCidades() {
    return lerArquivo("cidades.json");
}

function getBairros() {
    return lerArquivo("bairros.json");
}

function getHorarios() {
    return lerArquivo("horarios.json");
}

function getLinhas() {
    return lerArquivo("linhas.json");
}

module.exports = {
    getCidades,
    getBairros,
    getHorarios,
    getLinhas
};