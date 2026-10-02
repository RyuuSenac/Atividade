import connect from '../config/db.js'
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"
import { OAuth2Client } from 'google-auth-library'
 
// confere se um token de login foi mesmo gerado pelo Google, e não inventado por alguém.
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
 
// funções auxiliares
 
// TIRAMOS DO LOGIN POIS A FUNÇÃO SERÁ UTILIZADA EM DOIS LUGARES
export const gerarToken = (usuario) => {
    const payload = {
        id: usuario.id,
        nome: usuario.nome,
        role: usuario.role
    }
 
    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
    )
 
    return {token, payload}
}
 
export const validarEndereco = async (endereco) => {
    if (!endereco) return null
 
    const cep = String(endereco.cep || '').replace(/\D/g, '') // permitir apenas numeros
    const { logradouro, numero, complemento, bairro, cidade, uf } = endereco
 
    if (cep.length !== 8 || !logradouro || !numero || !bairro || !cidade || !uf) {
        return null
    }
 
    return {
        cep,
        logradouro,
        numero,
        complemento: complemento || null,
        bairro,
        cidade,
        uf: String(uf).toUpperCase()
    }
 
}
 
export const cadastroUsuarios = async (req, res) => {
    const { nome, email, senha, endereco } = req.body
 
    // verificar se todas as informações foram informadas
    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: "Preencha todos os campos" })
    }
 
    const enderecoValido = await validarEndereco(endereco)
    if (!enderecoValido) {
        return res.status(400).json({ mensagem: "Preencha todos os campos" })
    }
 
    // Pegamos UMA conexão do pool para fazer uma TRANSAÇÃO:
    // ou salva o usuário E o endereço, ou não salva nada.
    const conexao = await connect.getConnection()
 
    try {
        const [existente] = await connect.query("SELECT id FROM usuarios WHERE email = ?", [email])
        if (existente.length > 0) {
            return res.status(409).json({ mensagem: "O email informado ja foi cadastrado anteriormente" })
        }
 
        // criptografia de senha
        const senhaCriptografa = await bcrypt.hash(senha, 10)
 
        await conexao.beginTransaction()
 
        const [resultado] = await connect.query(
            'INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?,?,?)',
            [nome, email, senhaCriptografa, 'usuario']
        )
 
        const usuarioId = resultado.insertId
 
        await conexao.query(
            `INSERT INTO enderecos (usuario_id, cep, logradouro, numero, complemento, bairro, cidade, uf)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [usuarioId, enderecoValido.cep, enderecoValido.logradouro, enderecoValido.numero,
                enderecoValido.complemento, enderecoValido.bairro, enderecoValido.cidade, enderecoValido.uf]
        )
 
        await conexao.commit() // confirma as duas gravações de dados (usuario e endereço)
 
        return res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" })
    } catch (erro) {
        console.log(erro)
        return res.status(500).json({ mensagem: "Erro ao cadastrar  usuario." })
    }
}
 
export const login = async (req, res) => {
    try {
        const { email, senha } = req.body
 
        if (!email || !senha) {
            return res.status(400).json({ mensagem: "Preencha email e senha" })
        }
 
        const [resultado] = await connect.query(
            "SELECT * FROM usuarios WHERE email =?", [email]
        )
 
        if (resultado.length === 0) {
            return res.status(401).json({ mensagem: "Email ou senha inválidos" })
        }
 
        const usuario = resultado[0]
 
 
        
        
        if (!usuario.senha) {
            return res.status(401).json({ mensagem: "Email ou senha inválidos" })
        }

        const senhaConfere = await bcrypt.compare(senha, usuario.senha)
        
        if (!senhaConfere) {
            return res.status(401).json({ mensagem: "Esta conta foi criada com o Google. Use o botão 'Entrar com Google'" })
        }

        const { token, payload } = gerarToken(usuario)
 
        res.status(200).json({
            mensagem: "Login realizado com sucesso",
            token,
            usuario: payload
        })
    }
    catch (erro) {
        console.log(erro)
        return res.status(500).json({ mensagem: "Erro ao realizar login" })
    }
}
 
export const loginGoogle = async (req, res) => {
    const { credential } = req.body
 
    if (!credential) {
        return res.status(400).json({ mensagem: "Token do Google não enviado" })
    }
 
    try {
        // verifica o token com o google
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        })
 
        const dadosGoogle = ticket.getPayload()
        // sub, email, foto, nome
 
        if (!dadosGoogle.email_verified) {
            return res.status(401).json({ mensagem: "Email do Google não foi verificado" })
        }
 
        const [resultado] = await connect.query(
            "SELECT * FROM usuarios WHERE google_id = ? OR email = ?",
            [dadosGoogle.sub, dadosGoogle.email]
        )
 
        let usuario
 
        if (resultado.length > 0) {
            usuario = resultado[0]
 
            if (!usuario.google_id) {
                await connect.query(
                    "UPDATE usuarios SET google_id = ?, foto = ? WHERE id = ?",
                    [dadosGoogle.sub, dadosGoogle.picture || null, usuario.id]
                )
            }
        } else {
            // criar um novo usuário com o google
            const [novo] = await connect.query(
                `INSERT INTO usuarios (nome, email, senha, role, google_id, provedor, foto)
                 VALUES (?, ?, NULL, 'usuario', ?, 'google', ?)`,
                [dadosGoogle.name, dadosGoogle.email, dadosGoogle.sub, dadosGoogle.picture || null]
            )
           
            usuario = {
                id: novo.insertId,
                nome: dadosGoogle.name,
                role: 'usuario'
            }
        }
 
        const {token, payload} = gerarToken(usuario)
 
        return res.status(200).json({
            mensagem: "Login com o google realizado com sucesso",
            token,
            usuario: payload
        })
 
    } catch (erro) {
        console.log(erro)
        return res.status(401).json({ mensagem: "Não foi possivel validar o login com o Google" })
    }
};
 
//  PERFIL — agora busca no banco os dados + endereço do usuário logado
export const perfil = async (req, res) => {
    try{

        const usuarioId = req.usuarios.id;

        const [usuario] = await connect.query(
            `
            SELECT id, nome, email, role, provedor, foto, criado_em 
            FROM usuarios 
            WHERE id = ?
            `,
            [ usuarioId ]
        );

        const [endereco] = await connect.query(
            `
            SELECT cep, logradouro, numero, complemento, bairro, cidade, uf 
            FROM enderecos 
            WHERE usuario_id = ?
            `,
            [ usuarioId ]
        );

        return res.status(200).json({
            usuario: usuario[0],
            endereco: endereco[0]
        });

    }catch(erro){
        return res.status(500).json({
            mensagem: "Erro ao buscar perfil."
        });
    };
};