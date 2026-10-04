function FormEndereco({ endereco, setEndereco, aoAlterarCep, buscandoCep = false }) {
    const alterarCampo = (e) => {
        const { name, value } = e.target;

        setEndereco({
            ...endereco,
            [name]: value
        });
    };

    return (
        <fieldset className="grupo-endereco">
            <legend>Endereço</legend>

            <div className="grade-formulario">
                <div className="campo campo-cep">
                    <label htmlFor="cep">CEP</label>
                    <input
                        id="cep"
                        name="cep"
                        value={endereco.cep}
                        onChange={aoAlterarCep}
                        placeholder="00000000"
                        maxLength="9"
                        inputMode="numeric"
                        required
                    />
                    {buscandoCep && <small>Buscando CEP...</small>}
                </div>

                <div className="campo campo-logradouro">
                    <label htmlFor="logradouro">Logradouro</label>
                    <input
                        id="logradouro"
                        name="logradouro"
                        value={endereco.logradouro}
                        onChange={alterarCampo}
                        required
                    />
                </div>

                <div className="campo">
                    <label htmlFor="numero">Número</label>
                    <input
                        id="numero"
                        name="numero"
                        value={endereco.numero}
                        onChange={alterarCampo}
                        required
                    />
                </div>

                <div className="campo">
                    <label htmlFor="complemento">Complemento</label>
                    <input
                        id="complemento"
                        name="complemento"
                        value={endereco.complemento}
                        onChange={alterarCampo}
                    />
                </div>

                <div className="campo">
                    <label htmlFor="bairro">Bairro</label>
                    <input
                        id="bairro"
                        name="bairro"
                        value={endereco.bairro}
                        onChange={alterarCampo}
                        required
                    />
                </div>

                <div className="campo">
                    <label htmlFor="cidade">Cidade</label>
                    <input
                        id="cidade"
                        name="cidade"
                        value={endereco.cidade}
                        onChange={alterarCampo}
                        required
                    />
                </div>

                <div className="campo campo-uf">
                    <label htmlFor="uf">UF</label>
                    <input
                        id="uf"
                        name="uf"
                        value={endereco.uf}
                        onChange={alterarCampo}
                        maxLength="2"
                        required
                    />
                </div>
            </div>
        </fieldset>
    );
}

export default FormEndereco;
