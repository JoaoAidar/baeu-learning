# WAD.md — Documentação da Aplicação Web

## 📌 Introdução

Este documento descreve a estrutura e funcionamento do projeto **BaeU Learning**, desenvolvido como parte da disciplina COMP (Parte 1). O objetivo principal é configurar e estruturar uma aplicação web seguindo o padrão **MVC (Model-View-Controller)** utilizando **Node.js** com o framework **Express.js**.

**BaeU Learning** é uma plataforma voltada para o aprendizado do idioma coreano por meio de decks de estudo gerados com auxílio de inteligência artificial, oferecendo práticas de tradução, vocabulário e gramática contextualizada.

---

## 🗂️ Estrutura do Projeto

O projeto foi organizado com base no padrão **MVC**, separando claramente as responsabilidades entre modelos, controladores e visualizações. Abaixo, a estrutura de pastas:

```
baeu-learning/
│
├── config/                # Configurações (ex: conexão com o banco)
│   └── database.js
├── controllers/           # Controladores (lógica de negócio)
│   └── UserController.js
├── models/                # Modelos de dados
│   └── User.js
├── routes/                # Definições de rotas
│   └── index.js
├── services/              # Serviços auxiliares (ex: lógica de IA)
│   └── userService.js
├── views/                 # Templates EJS (HTML dinâmico)
│   └── index.ejs
├── public/
│   ├── scripts/           # Scripts JavaScript públicos
│   ├── styles/            # Arquivos CSS
│   └── assets/            # Imagens, ícones e fontes
├── tests/                 # Testes automatizados com Jest
│   └── example.test.js
├── modelo-banco.png       # Diagrama relacional do banco de dados
├── .env.example           # Exemplo de variáveis de ambiente
├── .gitignore             # Arquivos ignorados pelo Git
├── jest.config.js         # Configuração do Jest
├── package.json           # Dependências e scripts
├── server.js              # Inicialização do servidor
└── readme.md              # Documentação geral
```

---

## 🧠 Modelo de Dados

Para esta primeira etapa, foi definido um modelo inicial com foco na entidade **Usuário**, que será essencial para o controle de acesso e personalização dos decks. Futuramente, novas entidades serão adicionadas, como **Decks**, **Cartões**, **Sessões de Estudo**, entre outras.

### 📄 Diagrama Relacional

![modelo-banco.png](./modelo-banco.png)

**Entidades iniciais:**

* **User**

  * id (PK)
  * nome
  * email
  * senha
  * idioma\_nativo
  * objetivo\_de\_aprendizado
  * criado\_em

---

## 🚀 Instruções para Execução Local

1. **Clone o repositório:**

```bash
git clone https://github.com/seu-usuario/baeu-learning.git
cd baeu-learning
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Configure variáveis de ambiente:**

Copie o arquivo `.env.example` para `.env` e edite conforme necessário (futuramente incluirá a URL do banco).

4. **Inicie o servidor:**

```bash
npm start
```

> O servidor será iniciado na porta `3000` e acessível via `http://localhost:3000`.

---

## ✅ Funcionalidades Implementadas

* Organização do projeto no padrão MVC
* Inicialização do servidor com Express.js
* Primeiras rotas conectadas à view EJS
* Modelo de usuário implementado
* Estrutura pronta para conexão com banco de dados
* Teste automatizado de exemplo configurado com Jest
* Diagrama físico e lógico do banco incluído no repositório

---

## 🔜 Próximas Etapas

* Criar autenticação de usuários
* Conectar à API de IA para geração de flashcards
* Salvar e gerenciar decks personalizados
* Implementar funcionalidades interativas de aprendizado
* Melhorar a responsividade da interface com CSS moderno
