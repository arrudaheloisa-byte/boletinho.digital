// CONFIGURAÇÃO FIXA DO ALUNO
const CONFIG_ALUNO = {
  turma: "8B",
  numeroChamada: 13,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// VARIÁVEIS DE ESTADO DA SESSÃO
let pinSessao = "";
let dadosBoletim = null;

// DADOS DEMONSTRATIVOS LOCAIS (PRESERVADOS DO PROJETO ORIGINAL)
const DADOS_LOCAIS = [
  {
    disciplina: "Língua Portuguesa",
    notas: [8.5, 7.5, 9.0],
    faltas: [1, 2, 0]
  },
  {
    disciplina: "Matemática",
    notas: [7.0, 8.0, 8.5],
    faltas: [0, 1, 1]
  },
  {
    disciplina: "História",
    notas: [9.0, 8.5, 9.5],
    faltas: [0, 0, 0]
  },
  {
    disciplina: "Geografia",
    notas: [8.0, 7.0, 8.0],
    faltas: [2, 0, 1]
  },
  {
    disciplina: "Ciências",
    notas: [8.5, 9.0, 9.0],
    faltas: [1, 0, 0]
  },
  {
    disciplina: "Inglês",
    notas: [9.5, 9.0, 10.0],
    faltas: [0, 0, 0]
  },
  {
    disciplina: "Educação Física",
    notas: [10.0, 10.0, 10.0],
    faltas: [0, 0, 0]
  },
  {
    disciplina: "Arte",
    notas: [9.0, 9.5, 9.0],
    faltas: [0, 0, 0]
  }
];

// ELEMANTOS DO DOM
const loginContainer = document.getElementById("login-container");
const boletimConteudo = document.getElementById("boletim-conteudo");
const formLogin = document.getElementById("form-login");
const pinInput = document.getElementById("pin-input");
const loginMensagem = document.getElementById("login-mensagem");

const btnAlterarDados = document.getElementById("btn-alterar-dados");
const painelEdicao = document.getElementById("painel-edicao");
const formEdicao = document.getElementById("form-edicao");
const containerCamposEdicao = document.getElementById("container-campos-edicao");
const edicaoMensagem = document.getElementById("edicao-mensagem");
const btnCancelarEdicao = document.getElementById("btn-cancelar-edicao");

const gridDisciplinas = document.getElementById("grid-disciplinas");
const tabelaCorpo = document.getElementById("tabela-corpo");

// INICIALIZAÇÃO E EVENTOS
document.addEventListener("DOMContentLoaded", () => {
  formLogin.addEventListener("submit", handleLogin);
  btnAlterarDados.addEventListener("click", abrirPainelEdicao);
  btnCancelarEdicao.addEventListener("click", fecharPainelEdicao);
  formEdicao.addEventListener("submit", handleSalvarEdicao);
});

// FUNÇÕES DE LOGIN E CONEXÃO COM A API
async function handleLogin(e) {
  e.preventDefault();
  const pinDigitado = pinInput.value.trim();

  if (!pinDigitado) {
    exibirMensagem(loginMensagem, "Por favor, digite seu PIN.", "erro");
    return;
  }

  exibirMensagem(loginMensagem, "Conectando...", "info");

  try {
    const response = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (response.status === 401) {
      exibirMensagem(loginMensagem, "Turma, chamada ou PIN inválidos.", "erro");
      return;
    }

    if (response.status === 429) {
      exibirMensagem(loginMensagem, "Muitas tentativas. Aguarde um minuto e tente novamente.", "erro");
      return;
    }

    if (!response.ok) {
      exibirMensagem(loginMensagem, "Não foi possível conectar ao servidor. Tente novamente.", "erro");
      return;
    }

    const data = await response.json();

    // SUCESSO NO LOGIN: Guardar PIN apenas em memória e limpar o input
    pinSessao = pinDigitado;
    pinInput.value = "";
    exibirMensagem(loginMensagem, "", "");

    // Tratamento dos dados retornados
    if (data && data.dados && Array.isArray(data.dados.disciplinas) && data.dados.disciplinas.length > 0) {
      dadosBoletim = normalizarDadosAPI(data.dados.disciplinas);
    } else {
      dadosBoletim = JSON.parse(JSON.stringify(DADOS_LOCAIS));
    }

    // Exibe a tela principal do boletim
    loginContainer.classList.add("oculto");
    boletimConteudo.classList.remove("oculto");
    renderizarBoletim();

  } catch (error) {
    exibirMensagem(loginMensagem, "Não foi possível conectar ao servidor. Tente novamente.", "erro");
  }
}

// NORMALIZAÇÃO DE DADOS (API E LOCAIS)
function normalizarNota(val) {
  if (val === null || val === undefined || val === "") return null;
  if (typeof val === "string") val = val.replace(",", ".");
  let num = parseFloat(val);
  if (isNaN(num)) return null;
  if (num > 10 && num <= 100) num = num / 10;
  return num;
}

function normalizarFalta(val) {
  if (val === null || val === undefined || val === "") return 0;
  let num = parseInt(val, 10);
  return isNaN(num) || num < 0 ? 0 : num;
}

function normalizarDadosAPI(listaDisciplinas) {
  return listaDisciplinas.map(item => ({
    disciplina: item.disciplina || item.nome || "Disciplina",
    notas: [
      normalizarNota(item.notas ? item.notas[0] : item.nota1),
      normalizarNota(item.notas ? item.notas[1] : item.nota2),
      normalizarNota(item.notas ? item.notas[2] : item.nota3)
    ],
    faltas: [
      normalizarFalta(item.faltas ? item.faltas[0] : item.falta1),
      normalizarFalta(item.faltas ? item.faltas[1] : item.falta2),
      normalizarFalta(item.faltas ? item.faltas[2] : item.falta3)
    ]
  }));
}

// CÁLCULOS E REGRAS DE NEGÓCIO
function calcularMedia(notas) {
  const notasValidas = notas.filter(n => n !== null && !isNaN(n));
  if (notasValidas.length === 0) return null;
  const soma = notasValidas.reduce((acc, curr) => acc + curr, 0);
  return soma / notasValidas.length;
}

function calcularTotalFaltas(faltas) {
  return faltas.reduce((acc, curr) => acc + (parseInt(curr, 10) || 0), 0);
}

function obterSituacao(media, notas) {
  const possuiTodasNotas = notas.every(n => n !== null);
  if (media === null) return { texto: "Em Andamento", classe: "status-em-andamento" };
  
  if (media >= 6.0) {
    return { texto: "Aprovado", classe: "status-aprovado" };
  } else if (!possuiTodasNotas) {
    return { texto: "Em Andamento", classe: "status-em-andamento" };
  } else {
    return { texto: "Reprovado", classe: "status-reprovado" };
  }
}

function formatarNota(val) {
  if (val === null || val === undefined || isNaN(val)) return "-";
  return Number(val).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// RENDERIZAÇÃO SEGURA DO DOM (PREVENINDO DUPLICAÇÃO)
function renderizarBoletim() {
  gridDisciplinas.innerHTML = "";
  tabelaCorpo.innerHTML = "";

  dadosBoletim.forEach(item => {
    const media = calcularMedia(item.notas);
    const totalFaltas = calcularTotalFaltas(item.faltas);
    const situacao = obterSituacao(media, item.notas);

    // 1. RENDERIZAR CARD DA DISCIPLINA
    const card = document.createElement("div");
    card.className = "card-disciplina";

    const title = document.createElement("h3");
    title.textContent = item.disciplina;
    card.appendChild(title);

    const infoDiv = document.createElement("div");
    infoDiv.className = "card-info";

    const trimestres = ["1º Trimestre", "2º Trimestre", "3º Trimestre"];
    item.notas.forEach((nota, index) => {
      const linha = document.createElement("div");
      linha.className = "card-linha";
      
      const rotulo = document.createElement("span");
      rotulo.textContent = `${trimestres[index]}:`;
      
      const valor = document.createElement("span");
      valor.textContent = `${formatarNota(nota)} (Faltas: ${item.faltas[index] || 0})`;
      
      linha.appendChild(rotulo);
      linha.appendChild(valor);
      infoDiv.appendChild(linha);
    });

    const linhaMedia = document.createElement("div");
    linhaMedia.className = "card-linha";
    const rotuloMedia = document.createElement("span");
    rotuloMedia.textContent = "Média Final:";
    const valorMedia = document.createElement("strong");
    valorMedia.textContent = formatarNota(media);
    linhaMedia.appendChild(rotuloMedia);
    linhaMedia.appendChild(valorMedia);
    infoDiv.appendChild(linhaMedia);

    card.appendChild(infoDiv);

    const statusDiv = document.createElement("div");
    statusDiv.className = `card-status ${situacao.classe}`;
    statusDiv.textContent = situacao.texto;
    card.appendChild(statusDiv);

    gridDisciplinas.appendChild(card);

    // 2. RENDERIZAR LINHA DA TABELA
    const tr = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.textContent = item.disciplina;
    tr.appendChild(tdNome);

    item.notas.forEach(nota => {
      const tdNota = document.createElement("td");
      tdNota.textContent = formatarNota(nota);
      tr.appendChild(tdNota);
    });

    const tdMedia = document.createElement("td");
    const strongMedia = document.createElement("strong");
    strongMedia.textContent = formatarNota(media);
    tdMedia.appendChild(strongMedia);
    tr.appendChild(tdMedia);

    const tdFaltas = document.createElement("td");
    tdFaltas.textContent = totalFaltas;
    tr.appendChild(tdFaltas);

    const tdSituacao = document.createElement("td");
    tdSituacao.textContent = situacao.texto;
    tdSituacao.className = situacao.classe;
    tr.appendChild(tdSituacao);

    tabelaCorpo.appendChild(tr);
  });
}

// PAINEL DE EDIÇÃO E VALIDAÇÕES
function abrirPainelEdicao() {
  containerCamposEdicao.innerHTML = "";
  exibirMensagem(edicaoMensagem, "", "");

  dadosBoletim.forEach((item, dIdx) => {
    const bloco = document.createElement("div");
    bloco.className = "grid-edicao-disciplina";

    const titulo = document.createElement("h4");
    titulo.textContent = item.disciplina;
    bloco.appendChild(titulo);

    const camposGrid = document.createElement("div");
    camposGrid.className = "campos-trimestres";

    for (let t = 0; t < 3; t++) {
      // Campo Nota
      const grupoNota = document.createElement("div");
      grupoNota.className = "grupo-campo";
      const lblNota = document.createElement("label");
      lblNota.textContent = `${t + 1}º Trim. Nota:`;
      const inputNota = document.createElement("input");
      inputNota.type = "text";
      inputNota.dataset.disc = dIdx;
      inputNota.dataset.trim = t;
      inputNota.dataset.tipo = "nota";
      inputNota.value = item.notas[t] !== null ? item.notas[t].toString().replace(".", ",") : "";
      grupoNota.appendChild(lblNota);
      grupoNota.appendChild(inputNota);

      // Campo Falta
      const grupoFalta = document.createElement("div");
      grupoFalta.className = "grupo-campo";
      const lblFalta = document.createElement("label");
      lblFalta.textContent = `${t + 1}º Trim. Faltas:`;
      const inputFalta = document.createElement("input");
      inputFalta.type = "text";
      inputFalta.dataset.disc = dIdx;
      inputFalta.dataset.trim = t;
      inputFalta.dataset.tipo = "falta";
      inputFalta.value = item.faltas[t] !== undefined ? item.faltas[t] : 0;
      grupoFalta.appendChild(lblFalta);
      grupoFalta.appendChild(inputFalta);

      camposGrid.appendChild(grupoNota);
      camposGrid.appendChild(grupoFalta);
    }

    bloco.appendChild(camposGrid);
    containerCamposEdicao.appendChild(bloco);
  });

  painelEdicao.classList.remove("oculto");
  painelEdicao.scrollIntoView({ behavior: "smooth" });
}

function fecharPainelEdicao() {
  painelEdicao.classList.add("oculto");
  exibirMensagem(edicaoMensagem, "", "");
}

function validarNotaInput(valStr) {
  const str = valStr.trim();
  if (str === "") return { valido: true, valor: null };
  const strPonto = str.replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(strPonto)) return { valido: false };
  const num = parseFloat(strPonto);
  if (isNaN(num) || num < 0 || num > 10) return { valido: false };
  return { valido: true, valor: num };
}

function validarFaltaInput(valStr) {
  const str = valStr.trim();
  if (!/^\d+$/.test(str)) return { valido: false };
  const num = parseInt(str, 10);
  if (isNaN(num) || num < 0) return { valido: false };
  return { valido: true, valor: num };
}

async function handleSalvarEdicao(e) {
  e.preventDefault();
  exibirMensagem(edicaoMensagem, "", "");

  const inputs = containerCamposEdicao.querySelectorAll("input");
  let houverErro = false;

  // Reseta marcas de erro
  inputs.forEach(input => input.classList.remove("campo-invalido"));

  // Estrutura temporária para armazenar novos dados validados
  const novosDados = JSON.parse(JSON.stringify(dadosBoletim));

  inputs.forEach(input => {
    const dIdx = parseInt(input.dataset.disc, 10);
    const tIdx = parseInt(input.dataset.trim, 10);
    const tipo = input.dataset.tipo;
    const valRaw = input.value;

    if (tipo === "nota") {
      const res = validarNotaInput(valRaw);
      if (!res.valido) {
        input.classList.add("campo-invalido");
        houverErro = true;
      } else {
        novosDados[dIdx].notas[tIdx] = res.valor;
      }
    } else if (tipo === "falta") {
      const res = validarFaltaInput(valRaw);
      if (!res.valido) {
        input.classList.add("campo-invalido");
        houverErro = true;
      } else {
        novosDados[dIdx].faltas[tIdx] = res.valor;
      }
    }
  });

  if (houverErro) {
    exibirMensagem(edicaoMensagem, "Verifique os campos destacados em vermelho. Use notas de 0 a 10 e faltas inteiras (≥ 0).", "erro");
    return;
  }

  exibirMensagem(edicaoMensagem, "Salvando...", "info");

  // MONTA O PAYLOAD PARA ENVIAR À API
  const payloadDisciplinas = novosDados.map(item => ({
    disciplina: item.disciplina,
    notas: item.notas,
    faltas: item.faltas
  }));

  try {
    const response = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: payloadDisciplinas
        }
      })
    });

    if (!response.ok) {
      exibirMensagem(edicaoMensagem, "Falha ao salvar dados no servidor. Tente novamente.", "erro");
      return;
    }

    // Atualiza os dados em memória e a interface
    dadosBoletim = novosDados;
    renderizarBoletim();
    exibirMensagem(edicaoMensagem, "Dados salvos com sucesso.", "sucesso");

    setTimeout(() => {
      fecharPainelEdicao();
    }, 1500);

  } catch (err) {
    exibirMensagem(edicaoMensagem, "Erro de rede ao tentar salvar. Tente novamente.", "erro");
  }
}

// AUXILIAR DE MENSAGENS
function exibirMensagem(elemento, texto, tipo) {
  if (!elemento) return;
  elemento.textContent = texto;
  elemento.className = `mensagem-status ${tipo}`;
}