# Atividade: Preparando o Banco para Login com Google

> **Tema:** OAuth 2.0, OpenID Connect e adaptação de banco de dados para autenticação com Google  
> **Objetivo:** compreender quais informações são retornadas pelo Google durante o login e adaptar a tabela `usuarios` para armazenar os dados necessários.

---

## 1. Pesquisa

### 1.1 Quais informações do usuário o Google envia para o sistema quando a pessoa faz login?

Durante o login com Google, algumas informações do usuário podem ser disponibilizadas para o sistema.

| Campo | Significado |
|---|---|
| `sub` | Identificador único da Conta Google |
| `email` | E-mail do usuário |
| `email_verified` | Informa se o e-mail foi verificado pelo Google |
| `name` | Nome completo |
| `given_name` | Primeiro nome |
| `family_name` | Sobrenome |
| `picture` | URL da foto de perfil |
| `hd` | Pode aparecer em contas Google Workspace e indicar o domínio da organização |

Além das informações relacionadas ao usuário, o token também possui campos técnicos:

| Campo técnico | Função |
|---|---|
| `iss` | Informa quem emitiu o token |
| `aud` | Informa para qual Client ID o token foi criado |
| `iat` | Momento em que o token foi emitido |
| `exp` | Momento em que o token expira |
| `azp` | Cliente autorizado |
| `jti` | Identificador do token, quando presente |
| `auth_time` | Momento da autenticação, em alguns casos |
| `amr` | Métodos usados na autenticação, quando solicitado |

> **Observação:** nem todos esses campos precisam ser armazenados no banco. Alguns servem apenas para validação e funcionamento do token.

---

### 1.2 Qual desses campos identifica a pessoa de forma única no Google e nunca muda?

O campo `sub` é o identificador único da Conta Google.

Ele é indicado para identificar a conta do usuário no banco de dados, pois representa de forma única aquela conta dentro do sistema de autenticação do Google.

Exemplo:

```text
sub = 123456789012345678901
```

No banco, esse valor pode ser armazenado em uma coluna como:

```text
google_sub
```

---

## 2. Relação entre os dados do Google e o banco

### 2.1 Tabela de adaptação

| Campo enviado pelo Google | O que significa | Já existe no banco? | Precisa criar coluna? |
|---|---|:---:|---|
| `sub` | Identificador único da Conta Google | Não | Sim: `google_sub` |
| `email` | E-mail do usuário | Sim | Não |
| `email_verified` | Informa se o e-mail foi verificado pelo Google | Não | Sim: `email_verificado` |
| `name` | Nome completo | Sim | Não |
| `given_name` | Primeiro nome | Não | Sim: `given_name` |
| `family_name` | Sobrenome | Não | Sim: `family_name` |
| `picture` | URL da foto de perfil | Não | Sim: `img` |

### Estrutura original da tabela

Antes da adaptação, a tabela `usuarios` possui os seguintes campos:

```sql
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    role ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Pense e responda

### 3.1 Um usuário que entra pelo Google tem senha no nosso sistema? O que isso muda na coluna `senha`?

Não. Nesse modelo de autenticação, o usuário que entra pelo Google não precisa possuir uma senha salva no sistema.

Por esse motivo, a coluna `senha` deixa de ser necessária para usuários autenticados exclusivamente pelo Google.

---

### 3.2 Por que não usar apenas o e-mail para identificar o usuário do Google?

O e-mail não é o dado mais estável para identificação de uma Conta Google.

Além disso, existe o campo `sub`, criado especificamente para funcionar como identificador único da conta.

Por isso, é mais adequado utilizar:

```text
google_sub
```

como identificador da Conta Google no banco de dados.

---

### 3.3 A coluna que guarda o identificador do Google pode ter valores repetidos? Que restrição ela precisa ter?

Não.

Como cada valor de `sub` identifica uma Conta Google específica, a coluna correspondente no banco deve impedir duplicações.

A restrição utilizada é:

```sql
UNIQUE
```

Exemplo:

```sql
google_sub VARCHAR(255) UNIQUE
```

---

### 3.4 Como o sistema pode saber se uma conta foi criada pelo formulário ou pelo Google?

O sistema pode distinguir os dois tipos de autenticação analisando o fluxo utilizado no back-end.

Por exemplo:

```text
Cadastro tradicional
POST /cadastro
```

```text
Login com Google
POST /auth/google
```

O front-end pode iniciar o fluxo correto, mas o back-end é responsável por processar e validar as informações recebidas.

No caso do Google, o back-end pode identificar que se trata de uma autenticação Google quando recebe e valida os dados correspondentes, incluindo o `sub`.

Assim, o sistema consegue diferenciar:

```text
Conta criada pelo formulário
- utiliza os dados enviados pelo formulário

Conta autenticada pelo Google
- utiliza os dados retornados pelo Google
- possui google_sub
```

---

### 3.5 Maria já tem cadastro com e-mail e senha. Um dia ela clica em "Entrar com Google" usando o mesmo e-mail. O sistema deve criar uma conta nova ou usar a mesma?

As duas abordagens são possíveis.

Porém, criar uma segunda conta faria com que existissem dois registros diferentes associados ao mesmo e-mail, o que pode gerar confusão no sistema.

Uma alternativa mais organizada é impedir a criação de uma nova conta quando o e-mail já estiver cadastrado.

Nesse caso, o sistema pode informar:

> Já existe uma conta cadastrada com este e-mail.

Depois disso, o usuário pode ser redirecionado para a tela de login.

---

### 3.6 Todas as informações que o Google envia precisam ser guardadas no banco?

Não.

Nem todas as informações enviadas pelo Google precisam ser armazenadas permanentemente.

Um exemplo é:

```text
picture
```

Esse campo contém a URL da foto de perfil do usuário.

A foto pode ser útil para personalização da interface, mas não é necessária para identificar o usuário durante logins futuros.

Outro exemplo são campos técnicos como:

```text
iat
exp
iss
aud
```

Esses campos são utilizados principalmente durante a validação do token e não precisam fazer parte dos dados permanentes do usuário no banco.

---

## 4. Adaptação do banco

### 4.1 Regras da atividade

O banco já possui usuários cadastrados.

Portanto:

- não pode ser utilizado `DROP TABLE`;
- a tabela `usuarios` não deve ser recriada;
- a alteração deve ser feita com `ALTER TABLE`;
- após a alteração, deve ser executado `DESCRIBE usuarios;`.

---

### 4.2 Script SQL utilizado

```sql
ALTER TABLE usuarios
    DROP COLUMN senha,

    ADD COLUMN email_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN google_sub VARCHAR(255) UNIQUE,
    ADD COLUMN given_name VARCHAR(100),
    ADD COLUMN family_name VARCHAR(100),
    ADD COLUMN img TEXT;

DESCRIBE usuarios;
```

---

### 4.3 Explicação das novas colunas

| Coluna | Tipo | Finalidade |
|---|---|---|
| `email_verificado` | `BOOLEAN` | Informa se o e-mail foi verificado pelo Google |
| `google_sub` | `VARCHAR(255)` | Armazena o identificador único da Conta Google |
| `given_name` | `VARCHAR(100)` | Armazena o primeiro nome |
| `family_name` | `VARCHAR(100)` | Armazena o sobrenome |
| `img` | `TEXT` | Armazena a URL da foto de perfil |

A coluna:

```sql
google_sub VARCHAR(255) UNIQUE
```

recebe a restrição `UNIQUE` para evitar que duas linhas diferentes representem a mesma Conta Google.

---

## 5. Banco de dados completo

```sql
DROP DATABASE atividade;

CREATE DATABASE atividade;

USE atividade;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    role ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parte 4: adaptar o banco
ALTER TABLE usuarios
    DROP COLUMN senha,

    ADD COLUMN email_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN google_sub VARCHAR(255) UNIQUE,
    ADD COLUMN given_name VARCHAR(100),
    ADD COLUMN family_name VARCHAR(100),
    ADD COLUMN img TEXT;

DESCRIBE usuarios;
```

---

## 6. Resultado do `DESCRIBE usuarios`

Após executar o `ALTER TABLE`, o comando:

```sql
DESCRIBE usuarios;
```

é utilizado para verificar a estrutura final da tabela.

### Print do resultado

![Resultado do DESCRIBE usuarios](DESCRIBE.png)

---

## 7. Estrutura final esperada da tabela

Depois da alteração, a tabela `usuarios` passa a possuir, de forma geral:

```text
id
nome
email
role
criado_em
email_verificado
google_sub
given_name
family_name
img
```

Dessa forma, o banco fica preparado para armazenar informações utilizadas no login com Google e para identificar cada Conta Google por meio do campo `google_sub`.

---

## Conclusão

A principal mudança necessária para integrar o login com Google ao banco é a inclusão de um identificador próprio da Conta Google.

O campo mais importante para isso é:

```text
sub
```

No banco, ele foi representado pela coluna:

```text
google_sub
```

A restrição `UNIQUE` garante que o mesmo identificador do Google não seja associado a mais de um registro.

Os demais campos adicionados complementam as informações do usuário e podem ser utilizados pela aplicação conforme necessário.
