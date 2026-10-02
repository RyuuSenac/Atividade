import axios from "axios";

const viaCepApi = axios.create({
    baseURL: "https://viacep.com.br/ws",
});

export async function buscarCep(cep) {
  const cepLimpo = cep.replace(/\D/g, "")

  const resposta = await viaCepApi.get(`/${cepLimpo}/json/`)

  if (resposta.data.erro) {
    throw new Error("CEP não encontrado")
  }

  return {
    cep: response.data.cep,
    logradouro: response.data.logradouro,
    bairro: response.data.bairro,
    cidade: response.data.localidade,
    uf: response.data.uf
  }
}
