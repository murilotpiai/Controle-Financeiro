# Controle Financeiro

Aplicacao web estatica para registrar receitas e despesas, acompanhar saldo, visualizar graficos e exportar dados. O projeto roda diretamente no navegador e salva as informacoes no LocalStorage, sem necessidade de backend.

- Deploy: https://controle-financeiro-besj.vercel.app/
- Repositorio: https://github.com/murilotpiai/Controle-Financeiro

## Objetivo do projeto

Criar uma ferramenta simples de controle financeiro pessoal, com foco em organizacao de dados, visualizacao de informacoes e pratica de desenvolvimento frontend com JavaScript.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- LocalStorage
- Chart.js
- SheetJS para exportacao em Excel
- docx para exportacao em Word

## Funcionalidades

- Cadastro de usuario local
- Registro de receitas e despesas
- Edicao e exclusao de lancamentos
- Filtros por texto, tipo e periodo
- Indicadores de receitas, despesas, saldo e total de lancamentos
- Grafico mensal de receitas e despesas
- Grafico de despesas por categoria
- Importacao de arquivos CSV ou JSON
- Exportacao para Excel, Word e JSON
- Tema claro e escuro
- Interface responsiva

## Estrutura do projeto

```text
Controle-Financeiro/
|-- frontend/
|   |-- index.html
|   |-- style.css
|   `-- script.js
|-- README.md
`-- .gitignore
```

## Como executar localmente

1. Clone o repositorio:

```bash
git clone https://github.com/murilotpiai/Controle-Financeiro.git
cd Controle-Financeiro
```

2. Abra o arquivo no navegador:

```text
frontend/index.html
```

Nao ha etapa de build, servidor ou banco de dados. O armazenamento acontece no navegador do usuario.

## Prints

Adicione aqui imagens do projeto em funcionamento quando quiser enriquecer a apresentacao no GitHub e no LinkedIn.

Sugestao de prints:

- Tela inicial com KPIs preenchidos
- Graficos de receitas/despesas
- Tabela com filtros aplicados
- Exportacao ou importacao de dados

## Aprendizados

- Manipulacao do DOM com JavaScript puro
- Uso de LocalStorage para persistencia local
- Criacao de filtros e indicadores dinamicos
- Integracao com bibliotecas externas via CDN
- Organizacao de um projeto frontend simples para deploy estatico
- Cuidados com validacao, importacao e exportacao de dados

## Melhorias futuras

- Adicionar testes de funcoes principais
- Criar categorias personalizadas pelo usuario
- Melhorar acessibilidade dos botoes de acao
- Adicionar opcao de limpar todos os dados com confirmacao
- Criar versao com backend e autenticacao
- Containerizar uma versao futura com Docker

## Autor

Desenvolvido por Murilo Turcato Piai, estudante de Sistemas de Informacao na UNIFAFIBE, com interesse em desenvolvimento web, analise de dados, Power BI, Python, JavaScript, banco de dados, Docker e sistemas ERP.

- LinkedIn: https://www.linkedin.com/in/mtpiai
- GitHub: https://github.com/murilotpiai
