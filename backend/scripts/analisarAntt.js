const fs = require("fs");
const path = require("path");
const { TextDecoder } = require("util");

const arquivo = path.resolve(__dirname, "../../horarios_antt.csv");

if (!fs.existsSync(arquivo)) {
    console.error("CSV não encontrado:", arquivo);
    process.exit(1);
}

const texto = new TextDecoder("windows-1252").decode(
    fs.readFileSync(arquivo)
);

function parseCSV(linha) {
    const campos = [];
    let valor = "";
    let aspas = false;

    for (let i = 0; i < linha.length; i++) {
        const caractere = linha[i];

        if (caractere === '"') {
            if (aspas && linha[i + 1] === '"') {
                valor += '"';
                i++;
            } else {
                aspas = !aspas;
            }
        } else if (caractere === ";" && !aspas) {
            campos.push(valor.trim());
            valor = "";
        } else {
            valor += caractere;
        }
    }

    campos.push(valor.trim());
    return campos;
}

const linhas = texto.split(/\r?\n/).filter(linha => linha.trim());
const cabecalho = parseCSV(linhas[0]);
const registros = [];

let invalidos = 0;

for (let i = 1; i < linhas.length; i++) {
    const campos = parseCSV(linhas[i]);

    if (campos.length !== cabecalho.length) {
        invalidos++;
        continue;
    }

    const registro = Object.fromEntries(
        cabecalho.map((coluna, indice) => [coluna, campos[indice]])
    );

    if (
        !registro.cnpj ||
        !registro.razao_social ||
        !registro.prefixo ||
        !registro.descricao_linha ||
        !["ida", "volta"].includes(registro.sentido.toLowerCase()) ||
        !/^\d{2}:\d{2}$/.test(registro.horario)
    ) {
        invalidos++;
        continue;
    }

    registros.push(registro);
}

const estadosSul = new Set(["RS", "SC", "PR"]);

function extrairExtremos(descricao) {
    const partes = descricao.split(/\s+-\s+/);
    const inicio = partes[0]?.trim() || "";
    const fim = partes[partes.length - 1]?.trim() || "";

    const origem = inicio.match(/^([A-Z]{2})\/(.+)$/);
    const destino = fim.match(/^([A-Z]{2})\/(.+)$/);

    return {
        origemUf: origem?.[1] || null,
        origemCidade: origem?.[2] || null,
        destinoUf: destino?.[1] || null,
        destinoCidade: destino?.[2] || null
    };
}

const resumoSul = registros.filter(registro => {
    const extremos = extrairExtremos(registro.descricao_linha);

    return estadosSul.has(extremos.origemUf) ||
        estadosSul.has(extremos.destinoUf);
});

const empresas = new Set(registros.map(r => r.razao_social));
const prefixos = new Set(registros.map(r => r.prefixo));
const tipos = new Set(registros.map(r => r.tipo_veiculo));
const sentidos = new Set(registros.map(r => r.sentido.toLowerCase()));

console.log("=== ANÁLISE ANTT — SOMENTE LEITURA ===");
console.log("Linhas no arquivo, incluindo cabeçalho:", linhas.length);
console.log("Registros válidos:", registros.length);
console.log("Registros inválidos:", invalidos);
console.log("Empresas distintas:", empresas.size);
console.log("Prefixos distintos:", prefixos.size);
console.log("Tipos de veículo:", [...tipos].sort().join(", "));
console.log("Sentidos:", [...sentidos].sort().join(", "));
console.log("Registros cujos extremos incluem RS, SC ou PR:", resumoSul.length);

console.log("\nExemplos de linhas do Sul:");
for (const registro of resumoSul.slice(0, 12)) {
    const extremos = extrairExtremos(registro.descricao_linha);
    console.log(JSON.stringify({
        empresa: registro.razao_social,
        prefixo: registro.prefixo,
        linha: registro.descricao_linha,
        ...extremos,
        tipo: registro.tipo_veiculo,
        sentido: registro.sentido,
        partida: registro.horario
    }));
}

console.log("\nNenhuma alteração foi feita no banco de dados.");
