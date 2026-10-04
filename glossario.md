# Glossário do Login com Google

## Back-end

### 1. `google-auth-library`

É uma biblioteca oficial do Google para autenticação no Node.js. No projeto, ela fica no back-end porque o servidor precisa conferir se o token recebido foi realmente criado pelo Google. Aparece no `back-end/package.json` e em `back-end/src/controllers/usuarioControllers.js`.

### 2. `OAuth2Client`

É uma classe da `google-auth-library`. Criamos esse objeto usando o Client ID para representar nossa aplicação durante a validação do token. Aparece em `back-end/src/controllers/usuarioControllers.js`.

### 3. `verifyIdToken()`

Confere a assinatura do token, para qual aplicação ele foi criado, quem o criou e se ainda não venceu. Se o token for inválido, o código entra no `catch` e responde com status 401. Aparece dentro da função `loginGoogle`.

### 4. `credential` (ID Token)

É o token gerado pelo Google depois que o usuário escolhe uma conta e autoriza o login. O front-end recebe esse valor no `onSuccess` e o envia ao back-end. Aparece em `front-end/src/pages/Login.jsx` e em `back-end/src/controllers/usuarioControllers.js`.

### 5. `audience`

É o Client ID esperado durante a validação. Ele é informado novamente para garantir que o token foi criado para nossa aplicação e não para outro sistema. Aparece na chamada de `verifyIdToken()`.

### 6. `getPayload()`

Devolve os dados que estão dentro do token validado. Alguns campos são `sub`, `email`, `name`, `picture` e `email_verified`. Aparece dentro da função `loginGoogle`.

### 7. `sub`

É o identificador único da Conta Google. Usamos o `sub` porque ele foi criado para identificar a conta e não muda como um endereço de e-mail pode mudar. No banco, ele é salvo na coluna `google_id`.

### 8. `email_verified`

Informa se o Google verificou o e-mail daquela conta. O login é recusado quando o valor é `false` para evitar aceitar um e-mail que não foi confirmado. Aparece dentro da função `loginGoogle`.

### 9. Nosso JWT (`gerarToken`)

O token do Google serve para provar quem é o usuário durante o login. Depois disso, o sistema cria seu próprio JWT para controlar a sessão e permitir o acesso às rotas protegidas, como perfil e endereço. A função `gerarToken` aparece em `back-end/src/controllers/usuarioControllers.js`.

## Front-end

### 10. `@react-oauth/google`

É uma biblioteca criada pela comunidade para facilitar o uso do Google Identity Services em projetos React. Ela não é uma biblioteca oficial criada pelo Google, mas utiliza o serviço oficial de login do Google. Aparece no `front-end/package.json` e nas páginas de login e perfil.

### 11. `GoogleOAuthProvider`

É um componente que disponibiliza o Client ID para os componentes de login que estão dentro dele. Um Provider no React serve para compartilhar uma configuração com vários componentes. Aparece em `front-end/src/main.jsx`, envolvendo o aplicativo.

### 12. `clientId` / `VITE_GOOGLE_CLIENT_ID`

O Client ID identifica publicamente qual aplicação está pedindo o login e pode ficar no front-end. O Client Secret não pode ficar no front-end porque é uma informação secreta e poderia ser visualizada pelo usuário. A variável aparece no `front-end/.env`, em `front-end/src/config/config.js` e em `front-end/src/main.jsx`.

### 13. `GoogleLogin`

É o componente que mostra o botão do Google. Quando o usuário clica, o Google permite escolher uma conta e, se o login der certo, devolve uma credencial. Aparece em `front-end/src/pages/Login.jsx`.

### 14. `onSuccess` / `onError`

O `onSuccess` é chamado quando o login com Google funciona e recebe uma resposta que contém o `credential`. O `onError` é chamado quando o login falha. Ambos aparecem no componente `GoogleLogin`, em `front-end/src/pages/Login.jsx`.

### 15. `googleLogout()`

Encerra o estado de login mantido pelo Google. Limpar o `localStorage` remove somente o token e o usuário salvos pelo nosso sistema, por isso também chamamos `googleLogout()`. Aparece no botão Sair de `front-end/src/pages/Perfil.jsx`.

## Rotas do projeto

| Método | Rota | Protegida | Função |
|---|---|---|---|
| POST | `/usuarios/cadastro` | Não | Cadastra usuário local e endereço |
| POST | `/usuarios/login` | Não | Faz login com e-mail e senha |
| POST | `/usuarios/login/google` | Não | Faz login com a Conta Google |
| GET | `/usuarios/perfil` | Sim | Retorna usuário e endereço |
| PUT | `/usuarios/endereco` | Sim | Cria ou atualiza o endereço |
