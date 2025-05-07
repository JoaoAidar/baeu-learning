# Projeto Individual (COMP Parte 1): Estruturando a Base do Projeto

## Objetivo

Configurar o ambiente de desenvolvimento, organizar o projeto com base no padrão MVC e criar uma aplicação básica com Node.js utilizando o framework Express.js.

## Entrega

* Submissão individual.
* O projeto deve estar hospedado em um repositório público no GitHub, bem como uma documentação `WAD.md`.
* `README` explicativo.

## Prazo de Entrega

Até sexta-feira da **semana 3** do módulo.

---

## Descrição do Sistema Escolhido

Este projeto é a base do MVP **BaeU Learning**, uma plataforma web de aprendizado de coreano que utiliza inteligência artificial para gerar decks personalizados de flashcards (no estilo Anki) com foco em compreensão gramatical, vocabulário e tradução contextual. O sistema será expandido nas próximas fases para oferecer funcionalidades como quizzes dinâmicos e feedback inteligente.

---

## Estrutura do Projeto (Padrão MVC)

```
baeu-learning/
│
├── config/                # Configurações do banco de dados
│   └── database.js
├── controllers/           # Lógica de controle das requisições
│   └── UserController.js
├── models/                # Estrutura dos dados
│   └── User.js
├── routes/                # Rotas da aplicação
│   └── index.js
├── services/              # Serviços auxiliares
│   └── userService.js
├── views/                 # Templates EJS
│   └── index.ejs
├── public/
│   ├── scripts/           # Scripts JavaScript públicos
│   ├── styles/            # Arquivos CSS
│   └── assets/            # Imagens e fontes
├── tests/                 # Testes automatizados
│   └── example.test.js
├── modelo-banco.png       # Diagrama relacional do banco de dados
├── .env.example           # Variáveis de ambiente
├── .gitignore             # Arquivos ignorados pelo Git
├── jest.config.js         # Configuração do Jest
├── package.json           # Dependências do Node.js
├── package-lock.json
├── server.js              # Inicialização do servidor
└── readme.md              # Este arquivo
```

---

## Como Executar o Projeto Localmente

1. **Clone o repositório:**

```bash
git clone https://github.com/seu-usuario/baeu-learning.git
cd baeu-learning
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Configure o ambiente:**

* Copie `.env.example` para `.env` e configure os dados de ambiente se necessário.

4. **Inicie o servidor:**

```bash
npm start
```

> O servidor estará disponível em `http://localhost:3000`.

---

## Funcionalidades Atuais

* Estrutura em MVC completa
* Roteamento funcional com Express
* Primeira rota renderizando página EJS
* Modelo inicial de usuário (User)
* Diagrama relacional do banco no repositório (`modelo-banco.png`)
* Teste unitário de exemplo (`example.test.js` com Jest)

---

## Próximos Passos

* Conectar o banco de dados Supabase
* Criar as views dinâmicas para gerenciamento de decks
* Implementar API de IA para geração de cards
* Melhorar estilização da interface
