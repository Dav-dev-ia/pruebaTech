const express = require("express");
const routes = require("./routes");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Configurar rutas de API
app.use("/api", routes);

// Servir archivos estáticos de React
const buildPath = path.resolve(__dirname, "../../..", "test react/test-sps-react-main/build");
app.use(express.static(buildPath));

// Manejar cualquier solicitud que no coincida con las rutas anteriores
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
