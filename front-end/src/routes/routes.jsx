import { Navigate, Route, Routes } from "react-router-dom";
import Cadastro from "../pages/Cadastro.jsx";
import Login from "../pages/Login.jsx";
import Perfil from "../pages/Perfil.jsx";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default AppRoutes;
