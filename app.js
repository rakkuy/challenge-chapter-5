require("dotenv").config();
const express = require("express");
const {
  prismaError,
  serverError,
  notFound,
  clientError,
} = require("./middlewares/errorHandling");
const { PORT = 3000 } = process.env;
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
const yaml = require("yaml");
const app = express();

app.use(express.json());

const file = fs.readFileSync("./swagger.yaml", "utf8");
const swaggerDocument = yaml.parse(file);

app.use("/api/v1", require("./routes"));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/api/health", (req, res) => res.send("OK"));

app.use(prismaError);
app.use(clientError);
app.use(serverError);
app.use(notFound);

module.exports = app;
