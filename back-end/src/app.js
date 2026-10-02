import express from "express";
import cors from "cors";

import usuarios from "./routers/usuariosRouters.js";

const app = express();

// Permite que o front-end em Vite acesse a API.
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware para permitir JSON no corpo das requisições.
app.use(express.json());

// ROTA RAIZ:
app.get("/", (req, res) => {
    res.json({ mensagem: "API funcionando" });
});

// Rotas de usuários:
app.use("/", usuarios);

// Rota não encontrada.
app.use((req, res) => {
    res.status(404).json({ mensagem: "Rota não encontrada." });
});

export default app;