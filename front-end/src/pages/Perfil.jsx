import { useEffect, useState } from "react";
import { googleLogout } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import FormEndereco from "../components/FormEndereco.jsx";
import { buscarCep } from "../services/viacep.js";

const enderecoInicial = {
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: ""
};

function Perfil() {
    const navigate = useNavigate();
    const [dados, setDados] = useState(null);
    const [endereco, setEndereco] = useState(enderecoInicial);
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [salvando, setSalvando] = useState(false);

    const carregarPerfil = async () => {
        try {
            const resposta = await api.get("/usuarios/perfil");
            setDados(resposta.data);

            if (resposta.data.endereco) {
                setEndereco(resposta.data.endereco);
            }
        } catch (erro) {
            if (erro.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("usuario");
                navigate("/login");
                return;
            }

            setTipoMensagem("erro");
            setMensagem("Não foi possível carregar o perfil");
        }
    };

    useEffect(() => {
        carregarPerfil();
    }, []);

    const sair = () => {
        googleLogout();
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/login");
    };

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

    const salvarEndereco = async (evento) => {
        evento.preventDefault();
        setSalvando(true);
        setMensagem("");

        try {
            const resposta = await api.put("/usuarios/endereco", endereco);
            setTipoMensagem("sucesso");
            setMensagem(resposta.data.mensagem || "Endereço salvo com sucesso");
            await carregarPerfil();
            setSalvando(false);
        } catch (erro) {
            setTipoMensagem("erro");
            setMensagem(erro.response?.data?.mensagem || "Não foi possível salvar o endereço");
            setSalvando(false);
        }
    };

    if (!dados) {
        return (
            <main className="pagina">
                <p className="carregando">Carregando perfil...</p>
            </main>
        );
    }

    let tituloEndereco = "Cadastre seu endereço";
    let textoEndereco = "Sua conta ainda não possui um endereço.";
    let textoBotao = "Salvar endereço";

    if (dados.endereco) {
        tituloEndereco = "Editar endereço";
        textoEndereco = "Altere os campos e salve novamente.";
        textoBotao = "Atualizar endereço";
    }

    if (salvando) {
        textoBotao = "Salvando...";
    }

    return (
        <main className="pagina pagina-perfil">
            <section className="cartao cartao-largo cartao-perfil">
                <header className="topo-perfil">
                    <div className="identidade">
                        {dados.usuario?.foto ? (
                            <img src={dados.usuario.foto} alt={`Foto de ${dados.usuario?.nome}`} />
                        ) : (
                            <div className="avatar-sem-foto" aria-hidden="true">
                                {dados.usuario?.nome?.charAt(0).toUpperCase()}
                            </div>
                        )}

                        <div>
                            <span className="marca">Meu perfil</span>
                            <h1>{dados.usuario?.nome}</h1>
                            <p>{dados.usuario?.email}</p>
                        </div>
                    </div>

                    <button className="botao-secundario" type="button" onClick={sair}>
                        Sair
                    </button>
                </header>

                <div className="conteudo-endereco">
                    <form onSubmit={salvarEndereco} className="formulario-endereco">
                        <div className="cabecalho-secao">
                            <h2>{tituloEndereco}</h2>
                            <p>{textoEndereco}</p>
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

                        <button className="botao-principal" type="submit" disabled={salvando || buscandoCep}>
                            {textoBotao}
                        </button>
                    </form>

                    <aside className="resumo-endereco">
                        <h2>Informações atuais</h2>

                        {dados.endereco ? (
                            <div>
                                <p><strong>CEP:</strong> {dados.endereco.cep}</p>
                                <p><strong>Logradouro:</strong> {dados.endereco.logradouro}</p>
                                <p><strong>Número:</strong> {dados.endereco.numero}</p>
                                <p><strong>Complemento:</strong> {dados.endereco.complemento || "Não informado"}</p>
                                <p><strong>Bairro:</strong> {dados.endereco.bairro}</p>
                                <p><strong>Cidade:</strong> {dados.endereco.cidade}</p>
                                <p><strong>UF:</strong> {dados.endereco.uf}</p>
                            </div>
                        ) : (
                            <p>Nenhum endereço cadastrado.</p>
                        )}
                    </aside>
                </div>
            </section>
        </main>
    );
}

export default Perfil;
