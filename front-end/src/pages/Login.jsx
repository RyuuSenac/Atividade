import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);

    const finalizarLogin = (dados) => {
        localStorage.setItem("token", dados.token);
        localStorage.setItem("usuario", JSON.stringify(dados.usuario));
        navigate("/perfil");
    };

    const entrar = async (evento) => {
        evento.preventDefault();
        setEnviando(true);
        setMensagem("");

        try {
            const resposta = await api.post("/usuarios/login", { email, senha });
            setEnviando(false);
            finalizarLogin(resposta.data);
        } catch (erro) {
            setMensagem(erro.response?.data?.mensagem || "Não foi possível realizar o login");
            setEnviando(false);
        }
    };

    const entrarComGoogle = async (respostaGoogle) => {
        setMensagem("");

        try {
            const resposta = await api.post("/usuarios/login/google", {
                credential: respostaGoogle.credential
            });

            finalizarLogin(resposta.data);
        } catch (erro) {
            setMensagem(erro.response?.data?.mensagem || "Não foi possível entrar com o Google");
        }
    };

    return (
        <main className="pagina">
            <section className="cartao cartao-login">
                <div className="cabecalho-formulario">
                    <span className="marca">System Auth</span>
                    <h1>Entrar</h1>
                    <p>Acesse sua conta com e-mail ou Google.</p>
                </div>

                <form onSubmit={entrar}>
                    <div className="campo">
                        <label htmlFor="email">E-mail</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(evento) => setEmail(evento.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="senha">Senha</label>
                        <input
                            id="senha"
                            type="password"
                            value={senha}
                            onChange={(evento) => setSenha(evento.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {mensagem && <p className="mensagem erro" role="alert">{mensagem}</p>}

                    <button className="botao-principal" type="submit" disabled={enviando}>
                        {enviando ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                <div className="separador"><span>ou</span></div>

                <div className="login-google">
                    <GoogleLogin
                        onSuccess={entrarComGoogle}
                        onError={() => setMensagem("Não foi possível entrar com o Google")}
                        theme="filled_black"
                        width="320"
                    />
                </div>

                <p className="texto-rodape">
                    Ainda não possui uma conta? <Link to="/cadastro">Cadastre-se</Link>
                </p>
            </section>
        </main>
    );
}

export default Login;
