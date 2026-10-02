import { Router } from "express";

import {
    cadastroUsuarios,
    login,
    loginGoogle,
    perfil
} from "../controllers/usuarioControllers.js";

import autenticar from "../middleware/autenticar.js";

const router = Router();

router.post("/cadastro", cadastroUsuarios);
router.post("/login", login);
router.post("/login/google", loginGoogle);

router.get("/perfil", autenticar, perfil);

export default router;