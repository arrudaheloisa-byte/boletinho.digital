// CONFIGURAÇÃO FIXA DO ALUNO
const CONFIG_ALUNO = {
  turma: "8B",
  numeroChamada: 13,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// VARIÁVEIS DE ESTADO DA SESSÃO
let pinSessao = "";
let dadosBoletim = null;

// INSTÂNCIAS DOS GRÁFICOS (SOMENTE LEITURA / APRESENTAÇÃO)
let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

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
  if (formLogin) formLogin.addEventListener("submit", handleLogin);
  if (btnAlterarDados) btnAlterarDados.addEventListener("click", abrirPainelEdicao);
  if (btnCancelarEdicao) btnCancelarEdicao.addEventListener("click", fecharPainelEdicao);
  if (formEdicao) formEdicao.addEventListener("submit", handleSalvarEdicao);
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
    pinInput.