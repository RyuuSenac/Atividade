import "dotenv/config";
import app from "./src/app.js";

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log("\n========================================");
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
    console.log("========================================\n");
});