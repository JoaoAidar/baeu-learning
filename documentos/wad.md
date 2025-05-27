# Documentação da Aplicação Web (WAD)

## Introdução
O Aplicativo de Aprendizado de Coreano é uma plataforma web desenvolvida para auxiliar estudantes no aprendizado do idioma coreano. A aplicação segue a arquitetura MVC (Model-View-Controller) e utiliza tecnologias modernas como Node.js, Express, PostgreSQL e React.

### Objetivos
- Fornecer uma plataforma interativa para aprendizado de coreano
- Implementar sistema de progresso e acompanhamento do usuário
- Oferecer exercícios variados e adaptados ao nível do estudante
- Garantir uma experiência responsiva em diferentes dispositivos

### Tecnologias Principais
- **Backend:** Node.js, Express.js
- **Frontend:** React.js
- **Banco de Dados:** PostgreSQL
- **Autenticação:** JWT (JSON Web Tokens)
- **Estilização:** CSS3 com design responsivo

## Estrutura do Banco de Dados
O banco de dados é composto por quatro tabelas principais:
1. **users:** Armazena informações dos usuários
2. **lessons:** Contém as lições disponíveis
3. **exercises:** Armazena os exercícios de cada lição
4. **user_progress:** Registra o progresso do usuário

### Diagrama do Banco de Dados
O diagrama relacional do banco de dados está disponível em dois formatos:
- Arquivo editável: `documentos/db_schema.drawio`
- Imagem estática: `documentos/db_diagram.png`

![Diagrama do Banco de Dados](documentos/db_diagram.png)

O diagrama mostra:

- **Tabela users** (azul)
  - Chave primária: id
  - Campos: username, email, password_hash
  - Timestamps: created_at, updated_at

- **Tabela lessons** (verde)
  - Chave primária: id
  - Campos: title, description, difficulty, order_index
  - Timestamps: created_at, updated_at

- **Tabela exercises** (laranja)
  - Chave primária: id
  - Chave estrangeira: lesson_id
  - Campos: type, difficulty, prompt, choices, correct_answer, explanation
  - Timestamps: created_at, updated_at

- **Tabela user_progress** (vermelho)
  - Chave primária: id
  - Chaves estrangeiras: user_id, lesson_id, exercise_id
  - Campos: completed, score
  - Timestamps: last_attempt, created_at, updated_at

Os relacionamentos são:
- Uma lição pode ter vários exercícios (1:N)
- Um usuário pode ter vários registros de progresso (1:N)
- Uma lição pode ter vários registros de progresso (1:N)
- Um exercício pode ter vários registros de progresso (1:N)


## Diagrama MVC

![Diagrama MVC](documentos/diagramaMVC.png)
## Atualizações Recentes

### Correções de Bugs
- Corrigida navegação e passagem de parâmetros para exercícios, garantindo que `exerciseId` esteja sempre definido e usado corretamente
- Resolvidos avisos de chaves React usando `exercise_id` único como chave nas listas de exercícios
- Melhorado tratamento de erros para parâmetros ausentes ou inválidos em ExercisePage
- Adicionadas mensagens de erro robustas para dados de exercícios ausentes e falhas em chamadas de API
- Removido o wrapper Layout duplicado em LessonsPage para evitar renderização recursiva
- Corrigido o redirecionamento catch-all para a tela inicial
- Garantido que cada lição possui um array de exercícios, evitando erros de renderização
- Adicionados logs para depuração dos dados recebidos da API
- Ajustada a navegação para evitar loops de renderização ao clicar em 'Lições' no cabeçalho

### Design Responsivo
- Melhorada escala responsiva para componentes ExercisePage e ExerciseRenderer
- Adicionadas media queries para breakpoints de dispositivos móveis e tablets
- Containers de exercícios, questões e opções agora escalam adequadamente em todos os tamanhos de tela

### Qualidade do Código
- Removidos wrappers Layout desnecessários para evitar cabeçalhos duplicados e melhorar a estrutura
- Adicionados comentários e clarificação de uso de parâmetros em ExercisePage

## Uso
- A aplicação agora fornece uma experiência perfeita em diferentes dispositivos
- Todas as mensagens de erro são claras e informativas
- A navegação entre lições e exercícios é robusta e intuitiva
- O sistema de progresso permite acompanhamento contínuo do aprendizado

## Próximos Passos
1. Implementar sistema de revisão espaçada
2. Adicionar mais tipos de exercícios
3. Melhorar o sistema de feedback
4. Implementar gamificação 