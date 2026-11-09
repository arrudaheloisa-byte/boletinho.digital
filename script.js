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
  formLogin.addEventListener("submit", handleLogin);
  btnAlterarDados.addEventListener("click", abrirPainelEdicao);
  btnCancelarEdicao.addEventListener("click", fecharPainelEdicao);
  formEdicao.addEventListener("submit", handleSalvarEdicao);