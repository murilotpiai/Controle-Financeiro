# Fincoob — Controle Financeiro Pessoal

Aplicativo web estático para controle financeiro pessoal, desenvolvido com HTML, CSS e JavaScript puro. O Fincoob permite registrar receitas e despesas, acompanhar indicadores, definir metas, controlar orçamento mensal por categoria, gerar relatórios e exportar/importar dados usando o próprio navegador.

O projeto não utiliza backend nem banco de dados externo. Todas as informações ficam salvas localmente no navegador por meio do LocalStorage.

- Deploy: https://controle-financeiro-besj.vercel.app/
- Repositório: https://github.com/murilotpiai/Fincoob-Gestao-Financeira

## Objetivo do projeto

Criar uma aplicação completa, simples e profissional de gestão financeira pessoal para compor portfólio de estágio em TI, demonstrando organização de interface, manipulação de dados no frontend, persistência local, relatórios e visualização com gráficos.

## Funcionalidades

- Dashboard com saldo atual, receitas, despesas e resultado do mês.
- Comparativo do mês atual com o mês anterior.
- Últimos lançamentos e categorias com maior gasto.
- Dicas financeiras automáticas com base nos dados cadastrados.
- Cadastro, edição e exclusão de receitas e despesas.
- Campos de descrição, valor, data, categoria, tipo, forma de pagamento e observação.
- Máscara monetária em real brasileiro.
- Categorias padrão para receitas e despesas.
- Criação, edição e remoção de categorias personalizadas.
- Metas financeiras com valor desejado, valor atual, prazo, progresso e valor restante.
- Sugestão automática de meta com base nos gastos do mês.
- Orçamento mensal por categoria com alertas de limite.
- Relatórios por período, categoria, tipo e forma de pagamento.
- Gráficos de receitas x despesas, despesas por categoria, evolução do saldo, forma de pagamento e orçamento.
- Exportação de dados e relatórios para JSON, Excel e Word.
- Importação de backup em JSON.
- Limpeza de todos os dados com confirmação.
- Tema claro e escuro.
- Interface responsiva.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- LocalStorage
- Chart.js
- SheetJS (xlsx)

## Como executar localmente

1. Clone o repositório:

```bash
git clone https://github.com/murilotpiai/Fincoob-Gestao-Financeira.git
cd Fincoob-Gestao-Financeira
```

2. Abra o arquivo no navegador:

```text
frontend/index.html
```

Não há etapa de build, servidor, autenticação ou banco de dados. O projeto é compatível com deploy estático na Vercel.

## Estrutura do projeto

```text
Fincoob-Gestao-Financeira/
|-- frontend/
|   |-- index.html
|   |-- style.css
|   `-- script.js
|-- docs/
|   `-- images/
|-- README.md
`-- .gitignore
```

## Prints do sistema

Adicione ou atualize os prints abaixo conforme novas telas forem publicadas:

```text
docs/images/fincoob-home.png
docs/images/fincoob-mobile.png
```

Sugestões de prints para GitHub e LinkedIn:

- Dashboard com dados preenchidos.
- Tela de lançamentos com filtros.
- Relatórios com gráficos.
- Tela de metas financeiras.
- Orçamento mensal por categoria.
- Backup e exportação.

## Aprendizados obtidos

- Organização de uma aplicação frontend sem framework.
- Persistência de dados com LocalStorage.
- Estruturação de estado local no navegador.
- Criação de CRUDs com JavaScript puro.
- Validação e normalização de dados.
- Geração de indicadores financeiros.
- Uso de Chart.js para visualização de dados.
- Exportação e importação de informações em JSON e Excel.
- Criação de interface responsiva para desktop e mobile.

## Melhorias futuras

- Adicionar testes automatizados para funções de cálculo.
- Criar opção de recorrência para despesas fixas.
- Permitir anexar comprovantes localmente.
- Criar simulação de parcelamento de cartão de crédito.
- Melhorar acessibilidade com atalhos de teclado e testes com leitores de tela.
- Adicionar PWA para instalação no celular.
- Criar uma versão futura com backend e autenticação.

## Autor

Desenvolvido por Murilo Turcato Piai, estudante de Sistemas de Informação na UNIFAFIBE, com interesse em desenvolvimento web, análise de dados, Power BI, Python, JavaScript, banco de dados, Docker e sistemas ERP.

- LinkedIn: https://www.linkedin.com/in/mtpiai
- GitHub: https://github.com/murilotpiai
