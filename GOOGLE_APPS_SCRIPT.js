// ════════════════════════════════════════════════════════════════
// COLE ESTE CÓDIGO NO GOOGLE APPS SCRIPT DA SUA PLANILHA
// Instruções: veja o arquivo LEIA-ME.md
// ════════════════════════════════════════════════════════════════

const NOME_ABA     = "Registros";
const LINHA_INICIO = 4;   // primeira linha de dados (após cabeçalho)

// Mapeamento de colunas (A=1, B=2, ...)
const COL = {
  TITULO:       1,
  VALOR:        2,
  CATEGORIA:    3,
  PAGAMENTO:    4,
  ANO:          5,
  MES:          6,
  SEM_MES:      7,
  SEM_ANO:      8,
  DATA:         9,
  ID_INTERNO:  10,  // coluna oculta usada para identificar registros
};

const MESES_PT = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

// ── Ponto de entrada: recebe POST do webapp ───────────────────
function doPost(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  try {
    const dados = JSON.parse(e.postData.contents);
    let resultado;

    switch (dados.acao) {
      case "adicionar": resultado = adicionarGasto(dados); break;
      case "editar":    resultado = editarGasto(dados);    break;
      case "excluir":   resultado = excluirGasto(dados);   break;
      default: throw new Error("Ação desconhecida: " + dados.acao);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, ...resultado }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, erro: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Também aceita GET (para testar no navegador) ──────────────
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, msg: "App de Gastos ativo!" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Adicionar gasto ───────────────────────────────────────────
function adicionarGasto(d) {
  const aba   = obterAba();
  const linha = proximaLinhaVazia(aba);
  const data  = new Date(d.timestamp);

  const catLabel = d.categoria === 'al'
    ? "🍽️ Alimentação"
    : "🎭 Entretenimento/Outros";
  const pagLabel = d.pagamento === 'deb'
    ? "Débito/Pix"
    : "Crédito";

  const semMes = semanaNoMes(data);
  const semAno = isoWeekNumber(data);

  aba.getRange(linha, COL.TITULO).setValue(d.titulo);
  aba.getRange(linha, COL.VALOR).setValue(d.valor);
  aba.getRange(linha, COL.CATEGORIA).setValue(catLabel);
  aba.getRange(linha, COL.PAGAMENTO).setValue(pagLabel);
  aba.getRange(linha, COL.ANO).setValue(data.getFullYear());
  aba.getRange(linha, COL.MES).setValue(MESES_PT[data.getMonth()]);
  aba.getRange(linha, COL.SEM_MES).setValue("Semana " + semMes);
  aba.getRange(linha, COL.SEM_ANO).setValue("Semana " + semAno);
  aba.getRange(linha, COL.DATA).setValue(Utilities.formatDate(data, "America/Sao_Paulo", "dd/MM/yyyy"));
  aba.getRange(linha, COL.ID_INTERNO).setValue(d.id);

  // Formatar valor como moeda
  aba.getRange(linha, COL.VALOR).setNumberFormat('R$ #,##0.00');

  return { linha };
}

// ── Editar gasto ──────────────────────────────────────────────
function editarGasto(d) {
  const aba   = obterAba();
  const linha = encontrarLinhaPorId(aba, d.id);
  if (!linha) {
    // Se não encontrou pelo ID, adiciona como novo
    return adicionarGasto(d);
  }

  const data     = new Date(d.timestamp);
  const catLabel = d.categoria === 'al' ? "🍽️ Alimentação" : "🎭 Entretenimento/Outros";
  const pagLabel = d.pagamento === 'deb' ? "Débito/Pix" : "Crédito";
  const semMes   = semanaNoMes(data);
  const semAno   = isoWeekNumber(data);

  aba.getRange(linha, COL.TITULO).setValue(d.titulo);
  aba.getRange(linha, COL.VALOR).setValue(d.valor);
  aba.getRange(linha, COL.CATEGORIA).setValue(catLabel);
  aba.getRange(linha, COL.PAGAMENTO).setValue(pagLabel);
  aba.getRange(linha, COL.ANO).setValue(data.getFullYear());
  aba.getRange(linha, COL.MES).setValue(MESES_PT[data.getMonth()]);
  aba.getRange(linha, COL.SEM_MES).setValue("Semana " + semMes);
  aba.getRange(linha, COL.SEM_ANO).setValue("Semana " + semAno);
  aba.getRange(linha, COL.DATA).setValue(Utilities.formatDate(data, "America/Sao_Paulo", "dd/MM/yyyy"));

  return { linha };
}

// ── Excluir gasto ─────────────────────────────────────────────
function excluirGasto(d) {
  const aba   = obterAba();
  const linha = encontrarLinhaPorId(aba, d.id);
  if (linha) aba.deleteRow(linha);
  return { excluido: !!linha };
}

// ── Utilitários ───────────────────────────────────────────────
function obterAba() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName(NOME_ABA);
  if (!aba) throw new Error(`Aba "${NOME_ABA}" não encontrada.`);
  return aba;
}

function proximaLinhaVazia(aba) {
  const dados = aba.getRange(LINHA_INICIO, COL.TITULO, aba.getLastRow(), 1).getValues();
  for (let i = 0; i < dados.length; i++) {
    if (!dados[i][0]) return LINHA_INICIO + i;
  }
  return aba.getLastRow() + 1;
}

function encontrarLinhaPorId(aba, id) {
  const ultima = aba.getLastRow();
  if (ultima < LINHA_INICIO) return null;
  const ids = aba.getRange(LINHA_INICIO, COL.ID_INTERNO, ultima - LINHA_INICIO + 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return LINHA_INICIO + i;
  }
  return null;
}

function semanaNoMes(data) {
  // Número ordinal da segunda-feira dentro do mês
  const seg = segundaFeiraDe(data);
  let count = 0;
  const d = new Date(seg.getFullYear(), seg.getMonth(), 1);
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
  while (d <= seg) { count++; d.setDate(d.getDate() + 7); }
  return count;
}

function segundaFeiraDe(data) {
  const d = new Date(data);
  const dow = d.getDay(); // 0=dom
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return d;
}

function isoWeekNumber(data) {
  const d = new Date(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
