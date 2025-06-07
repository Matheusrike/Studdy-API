# 📚 Studdy API

API backend da plataforma **Studdy**, desenvolvida com Node.js, Express e Prisma. Este projeto visa facilitar a criação e gestão de quizzes educacionais por professores, alunos e administradores.

---

## 🚀 Executando a API localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar banco de dados

- Certifique-se de ter o MySQL instalado e rodando.
- Crie um banco de dados com o nome `studdy`.
- Utilize o usuário `root`, **sem senha**.

### 3. Ajustar o arquivo `schema.prisma`

Verifique se o bloco `datasource` está assim:

```prisma
provider = "mysql"
```

### 4. Criar o arquivo `.env`

Na raiz do projeto, crie um arquivo `.env` com o seguinte conteúdo:

```env
# URL do banco de dados
DATABASE_URL= 'mysql://root:root@localhost:3306/studdy'

# token privado do JWT
JWT_SECRET = ''

#Chave de API da OpenAI
OPENAI_API_KEY = ''

# Chave de API do Youtube
YOUTUBE_API_KEY= ''
```

### 5. Onde obter as chaves de API

**OpenAI API Key:**  
Acesse [OpenAI Platform](https://platform.openai.com/account/api-keys), crie sua conta (ou faça login) e gere uma nova chave de API na seção **API Keys**.

**YouTube API Key:**  
Acesse o [Google Cloud Console](https://console.cloud.google.com/apis/credentials), crie um projeto, ative a API do **YouTube Data API v3** e gere uma chave de API na seção **Credentials**.

### 6. Aplicar as migrações do banco de dados

```bash
npx prisma migrate dev --name init
npx prisma migrate reset -f
```

### 7. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em: `http://localhost:3000`

---

## 🛠️ Tecnologias utilizadas

- Node.js
- Express
- Prisma ORM
- MySQL
- Zod (validação)

---
