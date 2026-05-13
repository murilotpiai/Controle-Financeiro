# Fincoob - Gestão Financeira

Aplicação web estática para registrar receitas e despesas, acompanhar saldo, visualizar gráficos e exportar dados. O projeto roda diretamente no navegador e salva as informações no LocalStorage, sem necessidade de backend.

- Deploy: https://controle-financeiro-besj.vercel.app/
- Repositório: https://github.com/murilotpiai/Fincoob---Gest-o-Financeira

## Objetivo do projeto

Criar uma ferramenta simples de gestão financeira pessoal, com foco em organização de dados, visualização de informações e prática de desenvolvimento frontend com JavaScript.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- LocalStorage
- Chart.js
- SheetJS para exportação em Excel
- docx para exportação em Word

## Funcionalidades

- Cadastro de usuário local
- Registro de receitas e despesas
- Edição e exclusão de lançamentos
- Filtros por texto, tipo e período
- Indicadores de receitas, despesas, saldo e total de lançamentos
- Gráfico mensal de receitas e despesas
- Gráfico de despesas por categoria
- Importação de arquivos CSV ou JSON
- Exportação para Excel, Word e JSON
- Tema claro e escuro
- Interface responsiva

## Estrutura do projeto

```text
fincoob-gestao-financeira/
|-- frontend/
|   |-- index.html
|   |-- style.css
|   `-- script.js
|-- docs/
|   `-- images/
|-- README.md
`-- .gitignore
```

## Como executar localmente

1. Clone o repositório:

```bash
git clone https://github.com/murilotpiai/Fincoob---Gest-o-Financeira.git
cd Fincoob---Gest-o-Financeira
```

2. Abra o arquivo no navegador:

```text
frontend/index.html
```

Não há etapa de build, servidor ou banco de dados. O armazenamento acontece no navegador do usuário.

## Prints

Adicione aqui imagens do projeto em funcionamento quando quiser enriquecer a apresentação no GitHub e no LinkedIn.

Sugestão de prints:

- Tela inicial com KPIs preenchidos
- Gráficos de receitas e despesas
- Tabela com filtros aplicados
- Exportação ou importação de dados

## Aprendizados

- Manipulação do DOM com JavaScript puro
- Uso de LocalStorage para persistência local
- Criação de filtros e indicadores dinâmicos
- Integração com bibliotecas externas via CDN
- Organização de um projeto frontend simples para deploy estático
- Cuidados com validação, importação e exportação de dados

## Melhorias futuras

- Adicionar testes de funções principais
- Criar categorias personalizadas pelo usuário
- Melhorar acessibilidade dos botões de ação
- Adicionar opção de limpar todos os dados com confirmação
- Criar versão com backend e autenticação
- Containerizar uma versão futura com Docker

## Autor

Desenvolvido por Murilo Turcato Piai, estudante de Sistemas de Informação na UNIFAFIBE, com interesse em desenvolvimento web, análise de dados, Power BI, Python, JavaScript, banco de dados, Docker e sistemas ERP.

- LinkedIn: https://www.linkedin.com/in/mtpiai
- GitHub: https://github.com/murilotpiai
