# Glossário OAuth 2.0

## Contexto

Pesquisem os 15 elementos da tabela, como `GoogleOAuthProvider`, `verifyIdToken` e `credential`, e respondam o que é, para que serve no projeto e onde aparece no código. Façam essa parte antes de codar.

---

## Tabela

| Elemento | O que é | Para que serve no projeto | Onde aparece no código |
|---|---|---|---|
| `google-auth-library` | Biblioteca oficial do Google para autenticação no Node.js. | É usada no back-end para validar o token recebido do login com Google. | No `package.json` e no `src/controllers/usuarioControllers.js`. |
| `OAuth2Client` | Classe da biblioteca `google-auth-library`. | Cria o cliente responsável por validar os tokens do Google. | Em `src/controllers/usuarioControllers.js`, na criação de `googleClient`. |
| `verifyIdToken()` | Método que verifica um ID Token do Google. | Confere se o token recebido é válido e pertence à aplicação. | Dentro da função `loginGoogle`, em `googleClient.verifyIdToken(...)`. |
| `credential` | ID Token gerado pelo Google após o login. | É enviado do front-end para o back-end para validar a identidade do usuário. | No back-end, em `const { credential } = req.body`. |
| `audience` | Valor que indica para qual aplicação o token foi criado. | Garante que o token recebido pertence ao Client ID do projeto. | Dentro de `verifyIdToken()`, em `audience: process.env.GOOGLE_CLIENT_ID`. |
| `getPayload()` | Método que retorna os dados armazenados no ID Token. | Permite acessar informações do usuário, como `sub`, `email`, `name` e `picture`. | Em `ticket.getPayload()`. |
| `sub` | Identificador único da Conta Google. | É usado para identificar o usuário de forma única no sistema. | Em `dadosGoogle.sub`. |
| `email_verified` | Campo que informa se o e-mail foi verificado pelo Google. | Serve para impedir o login caso o e-mail da conta Google não esteja verificado. | Em `dadosGoogle.email_verified`. |
| `gerarToken` | Função que gera o JWT da própria aplicação. | Cria o token que será usado nas rotas protegidas do sistema após o login. | No `src/controllers/usuarioControllers.js`. |
| `@react-oauth/google` | Biblioteca React usada para integrar o login com Google. | Facilita a implementação da autenticação Google no front-end. | No front-end, instalada com `npm install @react-oauth/google`. |
| `GoogleOAuthProvider` | Componente Provider da biblioteca `@react-oauth/google`. | Disponibiliza a configuração do Google para os outros componentes da aplicação. | No `main.jsx`, envolvendo o `<App />`. |
| `clientId / VITE_GOOGLE_CLIENT_ID` | Identificador público da aplicação criada no Google Cloud. | Informa ao Google qual aplicação está solicitando o login. | No `.env` do front-end e no `GoogleOAuthProvider`. |
| `GoogleLogin` | Componente que cria o botão de login do Google. | Permite que o usuário faça login utilizando sua Conta Google. | Na tela de login do front-end. |
| `onSuccess / onError` | Funções executadas após uma tentativa de login. | `onSuccess` trata o login realizado com sucesso e `onError` trata falhas. | Dentro do componente `GoogleLogin`. |
| `googleLogout()` | Função usada para encerrar o login do Google. | É chamada quando o usuário sai da aplicação. | No botão Sair do Dashboard. |

---

## Código de exemplo

### Back-end

```js
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

export const loginGoogle = async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const dadosGoogle = ticket.getPayload();

    if (!dadosGoogle.email_verified) {
      return res.status(401).json({
        mensagem: 'E-mail do Google não foi verificado'
      });
    }

    return res.status(200).json({
      mensagem: 'Login com Google realizado com sucesso',
      usuario: dadosGoogle
    });

  } catch (erro) {
    return res.status(401).json({
      mensagem: 'Token do Google inválido'
    });
  }
};
```

### Front-end

> Login
```js
import { GoogleLogin } from '@react-oauth/google';
import api from '../api';

function Login() {
  const loginGoogle = async (credentialResponse) => {
    try {
      const credential = credentialResponse.credential;

      const resposta = await api.post('/login/google', {
        credential
      });

      localStorage.setItem('token', resposta.data.token);
      localStorage.setItem(
        'usuario',
        JSON.stringify(resposta.data.usuario)
      );

    } catch (erro) {
      console.log('Erro ao fazer login com Google');
    }
  };

  return (
    <GoogleLogin
      onSuccess={loginGoogle}
      onError={() => {
        console.log('Erro ao fazer login com Google');
      }}
    />
  );
}

export default Login;
```

> Logout
```js
import { googleLogout } from '@react-oauth/google';

function sair() {
  googleLogout();

  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}
```

## Fluxo básico

```text
GoogleLogin
    ↓
onSuccess
    ↓
credential
    ↓
api.post('/login/google')
    ↓
OAuth2Client
    ↓
verifyIdToken()
    ↓
ticket
    ↓
getPayload()
    ↓
sub, email, name, email_verified
    ↓
gerarToken()
    ↓
JWT da aplicação
```

### Rotas
