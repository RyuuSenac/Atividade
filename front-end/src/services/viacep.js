import axios from "axios";

const viaCepApi = axios.create({
    baseURL: "https://viacep.com.br/ws"
});

export async function buscarCep(cep) {
    const cepLimpo = String(cep).replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
        return null;
    }

    try {
        const resposta = await viaCepApi.get(`/${cepLimpo}/json/`);
        const dados = resposta.data;

        if (dados.erro) {
            return null;
        }

        return {
            cep: dados.cep.replace(/\D/g, ""),
            logradouro: dados.logradouro,
            bairro: dados.bairro,
            cidade: dados.localidade,
            uf: dados.uf
        };
    } catch (erro) {
        return null;
    }
}
