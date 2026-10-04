import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { buscarCep } from "../services/viacep.js";
import FormEndereco from "../components/FormEndereco.jsx";

const enderecoInicial = {
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: ""
};

function Cadastro() {
    const navigate = useNavigate();
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [endereco, setEndereco] = useState(enderecoInicial);
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const alterarCep = async (evento) => {
        const cep = evento.target.value.replace(/\D/g, "").slice(0, 8);

        setEndereco({
            ...endereco,
            cep
        });

        if (cep.length !== 8) {
            return;
        }

        setBuscandoCep(true);
        setMensagem("");

        const dadosCep = await buscarCep(cep);

        if (!dadosCep) {
            setTipoMensagem("erro");
            setMensagem("CEP não encontrado");
            setBuscandoCep(false);
            return;
        }

        setEndereco({
            ...endereco,
            ...dadosCep,
            cep
        });
        setBuscandoCep(false);
    };

    const cadastrar = async (evento) => {
        evento.preventDefault();
        setEnviando(true);
        setMensagem("");

        try {
            const resposta = await api.post("/usuarios/cadastro", {
                nome,
                email,
                senha,
                endereco
            });

            setTipoMensagem("sucesso");
            setMensagem(resposta.data.mensagem);
            setEnviando(false);

            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (erro) {
            setTipoMensagem("erro");
            setMensagem(erro.response?.data?.mensagem || "Não foi possível realizar o cadastro");
            setEnviando(false);
        }
    };

    return (
        <main className="pagina">
            <section className="cartao cartao-largo">
                <div className="cabecalho-formulario">
                    <span className="marca">System Auth</span>
                    <h1>Criar conta</h1>
                    <p>Preencha seus dados pessoais e seu endereço.</p>
                </div>

                <form onSubmit={cadastrar}>
                    <div className="grade-formulario dados-pessoais">
                        <div className="campo">
                            <label htmlFor="nome">Nome</label>
                            <input
                                id="nome"
                                value={nome}
                                onChange={(evento) => setNome(evento.target.value)}
                                autoComplete="name"
                                required
                            />
                        </div>

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
                                autoComplete="new-password"
                                minLength="6"
                                required
                            />
                        </div>
                    </div>

                    <FormEndereco
                        endereco={endereco}
                        setEndereco={setEndereco}
                        aoAlterarCep={alterarCep}
                        buscandoCep={buscandoCep}
                    />

                    {mensagem && (
                        <p className={`mensagem ${tipoMensagem}`} role="alert">
                            {mensagem}
                        </p>
                    )}

                    <button className="botao-principal" type="submit" disabled={enviando || buscandoCep}>
                        {enviando ? "Cadastrando..." : "Cadastrar"}
                    </button>
                </form>

                <p className="texto-rodape">
                    Já possui uma conta? <Link to="/login">Entrar</Link>
                </p>
            </section>
        </main>
    );
}

export default Cadastro;
