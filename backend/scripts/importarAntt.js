const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { TextDecoder } = require('util');
const { Pool } = require('pg');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

const csvPath = path.resolve(__dirname, '../../horarios_antt.csv');
const schemaPath = path.resolve(__dirname, '../database/schema_antt.sql');
const gravar = process.argv.includes('--gravar');

const colunas = [
  'cnpj', 'razao_social', 'data_autorizacao', 'prefixo',
  'descricao_linha', 'tipo_veiculo', 'sentido', 'horario',
  'gratuidade', 'segunda_feira', 'terca_feira', 'quarta_feira',
  'quinta_feira', 'sexta_feira', 'sabado', 'domingo',
  'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

function parseLinha(linha) {
  const campos = [];
  let campo = '';
  let aspas = false;

  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];

    if (c === '"') {
      if (aspas && linha[i + 1] === '"') {
        campo += '"';
        i++;
      } else {
        aspas = !aspas;
      }
    } else if (c === ';' && !aspas) {
      campos.push(campo.trim());
      campo = '';
    } else {
      campo += c;
    }
  }

  if (aspas) throw new Error('Aspas não fechadas no CSV.');
  campos.push(campo.trim());
  return campos;
}

function converterData(valor) {
  if (!valor) return null;

  let m = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;

  m = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return valor;

  throw new Error(`Data inválida: ${valor}`);
}

function converterFlag(valor) {
  if (!valor) return false;
  if (valor.toLowerCase() === 'x') return true;
  throw new Error(`Indicador inesperado: "${valor}"`);
}

function converterRegistro(valores, numeroLinha) {
  if (valores.length !== colunas.length) {
    throw new Error(
      `Linha ${numeroLinha}: ${valores.length} colunas; esperadas ${colunas.length}.`
    );
  }

  const original = Object.fromEntries(
    colunas.map((nome, i) => [nome, valores[i]])
  );

  for (const campo of [
    'cnpj', 'razao_social', 'prefixo',
    'descricao_linha', 'sentido', 'horario'
  ]) {
    if (!original[campo]) {
      throw new Error(`Linha ${numeroLinha}: campo obrigatório vazio: ${campo}`);
    }
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(original.horario)) {
    throw new Error(`Linha ${numeroLinha}: horário inválido: ${original.horario}`);
  }

  if (!['ida', 'volta'].includes(original.sentido.toLowerCase())) {
    throw new Error(`Linha ${numeroLinha}: sentido inesperado: ${original.sentido}`);
  }

  const dias = [
    'segunda_feira', 'terca_feira', 'quarta_feira', 'quinta_feira',
    'sexta_feira', 'sabado', 'domingo'
  ];

  const meses = [
    'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  const registro = {
    cnpj: original.cnpj,
    razao_social: original.razao_social,
    data_autorizacao: converterData(original.data_autorizacao),
    prefixo: original.prefixo,
    descricao_linha: original.descricao_linha,
    tipo_veiculo: original.tipo_veiculo || null,
    sentido: original.sentido.toLowerCase(),
    horario: original.horario.length === 5
      ? `${original.horario}:00`
      : original.horario,
    gratuidade: original.gratuidade || null,
    registro_original: original
  };

  for (const campo of [...dias, ...meses]) {
    registro[campo] = converterFlag(original[campo]);
  }

  registro.registro_hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(original), 'utf8')
    .digest('hex');

  return registro;
}

async function main() {
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV não encontrado: ${csvPath}`);
  }

  const texto = new TextDecoder('windows-1252')
    .decode(fs.readFileSync(csvPath));

  const linhas = texto.split(/\r?\n/).filter(l => l.trim());

  if (linhas.length < 2) throw new Error('CSV vazio ou sem registros.');

  const cabecalho = parseLinha(linhas[0])
    .map(c => c.replace(/^\uFEFF/, ''));

  if (JSON.stringify(cabecalho) !== JSON.stringify(colunas)) {
    throw new Error(
      'Cabeçalho diferente do esperado:\n' + cabecalho.join(';')
    );
  }

  const registros = [];
  const hashes = new Set();
  let invalidos = 0;

  for (let i = 1; i < linhas.length; i++) {
    try {
      const r = converterRegistro(parseLinha(linhas[i]), i + 1);

      if (hashes.has(r.registro_hash)) {
        throw new Error(`Linha ${i + 1}: registro completo duplicado.`);
      }

      hashes.add(r.registro_hash);
      registros.push(r);
    } catch (e) {
      invalidos++;
      console.error(`ERRO: ${e.message}`);
    }
  }

  console.log('\n===== SIMULAÇÃO ANTT =====');
  console.log(`Arquivo: ${path.basename(csvPath)}`);
  console.log(`Linhas de dados: ${linhas.length - 1}`);
  console.log(`Registros válidos: ${registros.length}`);
  console.log(`Registros inválidos: ${invalidos}`);
  console.log(`Hashes únicos: ${hashes.size}`);
  console.log(`Modo: ${gravar ? 'GRAVAÇÃO SOLICITADA' : 'SIMULAÇÃO'}`);

  if (invalidos) {
    throw new Error('Operação cancelada: corrija os registros inválidos.');
  }

  if (!gravar) {
    console.log('\nSimulação concluída. Nenhuma alteração foi feita no banco.');
    return;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não encontrada em backend/.env.');
  }

  const databaseUrl = process.env.DATABASE_URL;
  const hostname = new URL(databaseUrl).hostname;
  const local = /localhost|127\.0\.0\.1/i.test(hostname);

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: local ? false : { rejectUnauthorized: false }
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(fs.readFileSync(schemaPath, 'utf8'));

    const campos = [
      'cnpj', 'razao_social', 'data_autorizacao', 'prefixo',
      'descricao_linha', 'tipo_veiculo', 'sentido', 'horario',
      'gratuidade', 'segunda_feira', 'terca_feira', 'quarta_feira',
      'quinta_feira', 'sexta_feira', 'sabado', 'domingo',
      'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
      'registro_original', 'registro_hash', 'arquivo_fonte'
    ];

    const sql = `
      INSERT INTO horarios_antt (${campos.join(', ')})
      VALUES (${campos.map((_, i) => `$${i + 1}`).join(', ')})
      ON CONFLICT (registro_hash) DO NOTHING
    `;

    let inseridos = 0;

    for (let i = 0; i < registros.length; i++) {
      const r = registros[i];

      const valores = campos.map(campo => {
        if (campo === 'registro_original') {
          return JSON.stringify(r.registro_original);
        }
        if (campo === 'arquivo_fonte') {
          return path.basename(csvPath);
        }
        return r[campo];
      });

      const resultado = await client.query(sql, valores);
      inseridos += resultado.rowCount;

      if ((i + 1) % 500 === 0) {
        console.log(`Processados ${i + 1}/${registros.length} registros...`);
      }
    }

    await client.query('COMMIT');
    console.log('\n===== IMPORTAÇÃO CONCLUÍDA =====');
    console.log(`Processados: ${registros.length}`);
    console.log(`Novos registros: ${inseridos}`);
    console.log(`Já existentes ignorados: ${registros.length - inseridos}`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => {
  console.error('\nOperação não concluída:', e.message);
  process.exitCode = 1;
});
