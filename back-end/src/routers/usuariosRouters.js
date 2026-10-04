import { Router } from "express";

import {
    cadastroUsuarios,
    login,
    loginGoogle,
    perfil,
    salvarEndereco
} from "../controllers/usuarioControllers.js";

import autenticar from "../middleware/autenticar.js";

const router = Router();

router.post("/cadastro", cadastroUsuarios);
router.post("/login", login);
router.post("/login/google", loginGoogle);

router.get("/perfil", autenticar, perfil);
router.put("/endereco", autenticar, salvarEndereco);

export default router;
