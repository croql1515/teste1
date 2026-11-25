// ==========================================================================
// DADOS PRÉ-CADASTRADOS DA PLATAFORMA (3 módulos, 4 aulas cada)
// Para trocar um vídeo, altere o campo videoUrl (formato .../embed/ID_DO_VIDEO).
// Aulas sem videoUrl são exibidas como "Aula prática" (texto + exercício).
// ==========================================================================
const courseData = [
    {
        id: "mod-1",
        title: "Introdução ao Desenvolvimento Web",
        description: "Entenda como a web funciona, prepare seu ambiente e crie sua primeira página.",
        lessons: [
            { id: "l-1", title: "Como a Internet funciona", duration: "12 min",
              description: "Cliente, servidor, DNS e HTTP: o caminho completo de uma requisição, do navegador até a resposta.",
              videoUrl: "https://www.youtube.com/embed/PaOOO2VdBoc" },
            { id: "l-2", title: "Configurando o ambiente de desenvolvimento", duration: "15 min",
              description: "Instalação do VS Code, extensões essenciais e organização das pastas do seu projeto.",
              videoUrl: "https://www.youtube.com/embed/YekF-jQRFEc" },
            { id: "l-3", title: "Sua primeira página HTML", duration: "18 min",
              description: "Estrutura básica, títulos, parágrafos, links e imagens com HTML5 semântico.",
              videoUrl: "https://www.youtube.com/embed/kfeRzs0n6ow" },
            { id: "l-4", title: "Prática: monte sua página pessoal", duration: "20 min",
              description: "Exercício guiado para aplicar o que você aprendeu no módulo.",
              practice: ["Crie a pasta do projeto e o arquivo index.html", "Adicione título, uma foto e um parágrafo sobre você", "Crie uma lista com 3 hobbies e um link para seu GitHub", "Abra no navegador e confira o resultado"] }
        ]
    },
    {
        id: "mod-2",
        title: "Estilização Avançada com CSS",
        description: "Domine Flexbox, Grid e crie layouts que funcionam em qualquer tela.",
        lessons: [
            { id: "l-5", title: "Dominando o CSS Flexbox", duration: "22 min",
              description: "Eixos, justify-content, align-items e wrap: alinhe qualquer coisa com facilidade.",
              videoUrl: "https://www.youtube.com/embed/Homo-ORr-9o" },
            { id: "l-6", title: "Layouts modernos com CSS Grid", duration: "25 min",
              description: "Linhas, colunas, áreas nomeadas e como combinar Grid com Flexbox.",
              videoUrl: "https://www.youtube.com/embed/1FKUfMWBcLM" },
            { id: "l-7", title: "Responsividade e Conceitos Mobile-First", duration: "20 min",
              description: "Media queries, unidades relativas e a estratégia de começar pelo celular.",
              videoUrl: "https://www.youtube.com/embed/wAHXAp5RhRg" },
            { id: "l-8", title: "Prática: card de produto responsivo", duration: "20 min",
              description: "Monte uma grade de cards que se adapta de 1 a 3 colunas.",
              practice: ["Crie 3 cards com imagem, título e preço", "Use CSS Grid com auto-fit e minmax", "Adicione uma media query para telas pequenas", "Teste redimensionando a janela do navegador"] }
        ]
    },
    {
        id: "mod-3",
        title: "Lógica de Programação com JavaScript",
        description: "Variáveis, condições, laços e manipulação do DOM para deixar a página interativa.",
        lessons: [
            { id: "l-9", title: "Variáveis, Tipos de Dados e Operadores", duration: "20 min",
              description: "let, const, strings, números, booleanos e operadores aritméticos e lógicos.",
              videoUrl: "https://www.youtube.com/embed/-1Dayitq-rk" },
            { id: "l-10", title: "Estruturas de Condição e Repetição", duration: "24 min",
              description: "if/else, switch, for e while para controlar o fluxo do seu programa.",
              videoUrl: "https://www.youtube.com/embed/RlgdACEgA8c" },
            { id: "l-11", title: "Manipulação Avançada de DOM", duration: "28 min",
              description: "Selecionar elementos, criar nós, escutar eventos e atualizar a tela dinamicamente.",
              videoUrl: "https://www.youtube.com/embed/UPD0vts-eMQ" },
            { id: "l-12", title: "Prática: lista de tarefas interativa", duration: "30 min",
              description: "Projeto final: um to-do list com adicionar, concluir e remover itens.",
              practice: ["Crie um input e um botão 'Adicionar'", "Ao clicar, crie um item <li> na lista", "Permita marcar o item como concluído", "Salve a lista no localStorage"] }
        ]
    }
];
