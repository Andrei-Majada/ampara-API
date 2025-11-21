📘 AMPARA API — README.md

Copie e cole o conteúdo abaixo em um arquivo chamado README.md no seu projeto:

# 🌿 AMPARA API

API oficial do **Projeto AMPARA**, desenvolvida em **NestJS + MongoDB**, com autenticação JWT e criptografia de dados sensíveis.  
O sistema permite que três perfis interajam: **person** (solicitante de amparo), **helper** (apoiador) e **mediator** (mediador do processo).

---

# 🚀 Como instalar e rodar o projeto

## 📌 1. Requisitos

- Node.js 18+
- npm
- MongoDB local ou Atlas
- Git

## 📌 2. Instalar dependências

```bash
npm install

📌 3. Configurar variáveis de ambiente

Crie um arquivo .env baseado no exemplo:

MONGO_URI=mongodb://localhost:27017/ampara
JWT_SECRET=uma_senha_segura
JWT_EXPIRES_IN=24h
ENCRYPTION_KEY=uma_chave_de_32_caracteres

📌 4. Rodar o projeto
npm run start:dev


A API iniciará em:

http://localhost:3000

🔐 Autenticação (JWT)

Depois do login (POST /auth/login), envie o token nas rotas protegidas:

Authorization: Bearer <token>

👤 PERSON (Solicitante)
✔ Criar conta

POST /users

✔ Login

POST /auth/login

✔ Ver o próprio cadastro

GET /users/me

✔ Atualizar cadastro

PATCH /users/me

✔ Atualizar senha

PATCH /users/me/password

Body:

{
  "currentPassword": "123",
  "newPassword": "NovaSenha!"
}

✔ Criar pedido de amparo

POST /requests

Body:

{
  "userMessage": "Preciso de apoio emocional"
}

✔ Ver pedidos do usuário

GET /requests/user

✔ Atualizar pedido

PATCH /requests/:id

✔ Termos de uso

GET /terms

✔ Sobre o projeto

GET /about

🧭 MEDIATOR (Mediador)
✔ Login

POST /auth/login

✔ Ver cadastro

GET /users/me

✔ Atualizar cadastro

PATCH /users/me

📌 Funções especiais do Mediador
✔ Ver todos os pedidos pending + in_progress

GET /requests/active

Retorna:

dados completos do usuário solicitante

idade calculada

total de pedidos concluídos

lista de apoiadores disponíveis

total de ajudas prestadas por cada helper

✔ Ver detalhes completos de um pedido

GET /requests/:id/mediator

✔ Aceitar um helper para o pedido

POST /requests/:id/accept-supporter

Body:

{
  "supporterId": "<id_do_helper>"
}

🤝 HELPER (Apoiador)
✔ Criar conta

POST /users

✔ Login

POST /auth/login

✔ Ver cadastro

GET /users/me

✔ Atualizar cadastro

PATCH /users/me

📌 Funções especiais do Helper
✔ Ver pedidos abertos (pending + in_progress)

GET /requests/helper/active

Retorno:

{
  "_id": "...",
  "userId": "...",
  "userMessage": "...",
  "status": "pending"
}

✔ Oferecer ajuda ao pedido

POST /requests/:id/available-supporters

Sem body: o ID do helper vem do token.

📂 Estrutura de Coleções
🗂 users

criptografia AES-256 para email, documento e telefone

hash de email para busca

perfis: "person", "helper", "mediator"

🗂 requests

userId

userMessage

status

helpers: [{ helperId }]

availableSupporters: [{ helperId }]

🗂 about

title

content

🗂 terms

title

content

✔ Status das funcionalidades
PERSON
funcionalidade	status
criar conta	✔
login	✔
ver cadastro	✔
atualizar cadastro	✔
atualizar senha	✔
criar pedidos	✔
ver pedidos	✔
atualizar pedidos	✔
sobre	✔
termos	✔
MEDIATOR
funcionalidade	status
login	✔
ver cadastro	✔
atualizar cadastro	✔
lista de pedidos	✔
detalhes de pedido	✔
aceitar apoio	✔
HELPER
funcionalidade	status
criar conta	✔
login	✔
ver cadastro	✔
atualizar cadastro	✔
oferecer ajuda	✔
ver pedidos disponíveis	✔
sobre	✔
termos	✔
```
