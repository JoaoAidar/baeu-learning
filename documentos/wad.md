WAD.md - Projeto BaeU Learning
## 1. Introdução

O **BaeU Learning** é uma aplicação web MVP voltada para o aprendizado de coreano, oferecendo lições interativas e exercícios de múltipla escolha, tradução e construção de frases em estilo Anki. Esta documentação descreve a estrutura, o modelo de dados e as instruções para configuração do projeto, seguindo o padrão **MVC (Model-View-Controller)**.

---

## 2. Modelo de Dados

O banco de dados utiliza um modelo relacional para gerenciar usuários, lições, exercícios e resultados.

### Entidades principais

* **Users**: cadastro e informações dos usuários.
* **Lessons**: lições disponíveis para estudo.
* **Exercises**: tipos de exercício atrelados a cada lição (multiple\_choice, translate, listen).
* **UserProgress**: registro de progresso do usuário em cada lição.
* **Submissions**: respostas enviadas pelos usuários e resultado (correto/incorreto).

### Diagrama Relacional

Insira aqui a imagem `modelo-banco.png`, exportada do seu diagrama ER.

---

## 3. Estrutura do Projeto

```
TODO
```

**Observação:** A pasta `frontend` está localizada diretamente dentro de `baeu-learning`.

---

## 4. Como Executar o Projeto Localmente

### 4.1 Backend

1. Acesse o diretório do backend:

   ```bash
   cd baeu-learning/backend
   ```
2. Instale as dependências:

   ```bash
   npm install
   ```
3. Copie as variáveis de ambiente:

   ```bash
   cp .env.example .env
   ```
4. Inicie o servidor:

   ```bash
   npm start
   ```

O backend estará disponível em `http://localhost:3000`.

### 4.2 Frontend

1. Acesse o diretório do frontend:

   ```bash
   cd baeu-learning/frontend
   ```
2. Instale as dependências:

   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:

   ```bash
   npm start
   ```

O frontend estará disponível em `http://localhost:3001`.

---

## 5. Requisitos de Entrega

Para que o sistema seja considerado completo, deve incluir:

* ✅ **Banco de Dados**: Modelo relacional com diagramas físico e lógico (`modelo-banco.png`).
* ✅ **Backend**: Aplicação Node.js/Express estruturada em MVC, com servidor funcional (`server.js`).
* ✅ **Frontend**: SPA React com interface de usuário interativa.
* ✅ **Integração**: Comunicação frontend-backend via API REST.
* ✅ **Documentação**: Código hospedado em repositório público no GitHub com `README.md` e `WAD.md`.

---

## 6. Documentação e Qualidade de Código

* **README.md**: Contém descrição do projeto, instruções de instalação e execução, estrutura de pastas e visão geral das funcionalidades.
* **WAD.md**: Descreve arquitetura, diagrama de dados e estrutura de pastas.
* **Testes**: Implementação de testes unitários com Jest (pasta `tests/`).
* **Boas práticas**: Padrão MVC, uso de variáveis de ambiente, tratamento de erros e code style consistente.

