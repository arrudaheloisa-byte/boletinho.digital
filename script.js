// Dados brutos fictícios das 15 disciplinas do 8º Ano
const dadosBoletim = [
  { disciplina: "Língua Portuguesa", tri1: 82, tri2: "7,8", tri3: 85, faltas: [2, 1, 1] },
  { disciplina: "Matemática", tri1: 52, tri2: "5,8", tri3: null, faltas: [3, 2, 1] },
  { disciplina: "Ciências", tri1: "8,1", tri2: 76, tri3: 8.0, faltas: [1, 2, 0] },
  { disciplina: "História", tri1: 7.0, tri2: 84, tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Geografia", tri1: 68, tri2: 7.3, tri3: "7,9", faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 86, tri2: "8,1", tri3: 8.7, faltas: [1, 0, 0] },
  { disciplina: "Arte", tri1: 9.0, tri2: 92, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 95, tri2: 9.0, tri3: "9,4", faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 88, tri2: 9.1, tri3: 93, faltas: [1, 0, 1] },
  { disciplina: "Educação Financeira", tri1: 74, tri2: "7,8", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Estudo Orientado", tri1: 8.0, tri2: 83, tri3: "8,5", faltas: [0, 1, 0] },
  { disciplina: "Redação e Leitura", tri1: 62, tri2: "6,8", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 48, tri2: 5.6, tri3: "6,0", faltas: [2, 2, 1] },
  { disciplina: "Literatura Arte e Movimento", tri1: "7,7", tri2: 80, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Práticas Experimentais", tri1: 58, tri2: "6,2", tri3: 6.4, faltas: [1, 1, 1] }
];

// Função obrigatória para ajustar qualquer formato de nota para a escala 0-10
function normalizarNota(valor) {
  // Trata notas ausentes, vazias ou nulas
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Se o valor vier como texto com vírgula, troca por ponto para conseguir converter
  if (typeof valor === "string") {
    valor = valor.replace(",", ".");
  }

  let num = Number(valor);

  // Se não for um número válido, descarta
  if (isNaN(num)) {
    return null;
  }

  // Se a nota estiver na escala até 100, divide por 10
  if (num > 10 && num <= 100) {
    num = num / 10;
  }

  // Valida se a nota final está na escala permitida de 0 a 10
  if (num >= 0 && num <= 10) {
    return num;
  }

  return null; // Caso a nota esteja fora das regras
}

// Função para formatar a exibição da nota na tabela
function formatarExibicaoNota(notaNormalizada) {
  if (notaNormalizada === null) {
    return "Ainda não lançada";
  }
  return notaNormalizada.toFixed(1).replace(".", ",");
}

// Função principal que processa os dados e desenha o boletim na tela
function renderizarBoletim() {
  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.innerHTML = ""; // Limpa a tabela antes de preencher

  let somaDasMedias = 0;
  let contadorDisciplinasComMedia = 0;
  let totalGeralFaltas = 0;
  let contadorBomDesempenho = 0;
  let contadorAtencao = 0;

  // Passa por cada disciplina da nossa lista
  dadosBoletim.forEach((item) => {
    // Normaliza as notas dos 3 trimestres
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    // Calcula a média ignorando notas ausentes (null)
    const notasValidas = [n1, n2, n3].filter((n) => n !== null);
    let media = null;
    let situacao = "Nota ainda não disponível";
    let classeSituacao = "situacao-indisponivel";

    if (notasValidas.length > 0) {
      const somaNotas = notasValidas.reduce((acc, curr) => acc + curr, 0);
      media = somaNotas / notasValidas.length;
      somaDasMedias += media;
      contadorDisciplinasComMedia++;

      if (media >= 6.0) {
        situacao = "Bom desempenho";
        classeSituacao = "situacao-bom";
        contadorBomDesempenho++;
      } else {
        situacao = "Atenção";
        classeSituacao = "situacao-atencao";
        contadorAtencao++;
      }
    }

    // Soma as faltas dos trimestres
    const totalFaltasDisciplina = item.faltas.reduce((acc, curr) => acc + curr, 0);
    totalGeralFaltas += totalFaltasDisciplina;

    // Cria a linha da tabela com os dados processados
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${item.disciplina}</strong></td>
      <td>${formatarExibicaoNota(n1)}</td>
      <td>${formatarExibicaoNota(n2)}</td>
      <td>${formatarExibicaoNota(n3)}</td>
      <td><strong>${media !== null ? media.toFixed(1).replace(".", ",") : "—"}</strong></td>
      <td>${totalFaltasDisciplina}</td>
      <td class="${classeSituacao}">${situacao}</td>
    `;

    corpoTabela.appendChild(tr);
  });

  // Atualiza os Cards de Resumo no topo da página
  const mediaGeralGlobal = contadorDisciplinasComMedia > 0 
    ? (somaDasMedias / contadorDisciplinasComMedia).toFixed(1).replace(".", ",") 
    : "—";

  document.getElementById("card-media-geral").innerText = mediaGeralGlobal;
  document.getElementById("card-total-faltas").innerText = totalGeralFaltas;
  document.getElementById("card-bom-desempenho").innerText = contadorBomDesempenho;
  document.getElementById("card-atencao").innerText = contadorAtencao;

  // NOTA: A frequência de 92% exibida no HTML é apenas FICTÍCIA/DEMONSTRATIVA.
  // Ela não é calculada pelas faltas nesta etapa e será tratada de outra forma no futuro.
}

// Executa a função assim que a página carregar
renderizarBoletim();