const { Pool } = require("pg");

// Configurações de conexão
const pool = new Pool({
  user: "Teste", // Substitua pelo seu usuário do PostgreSQL
  host: "localhost", // Ou o host onde o PostgreSQL está rodando
  database: "MA", // Substitua pelo nome do seu banco de dados
  password: "1234", // Substitua pela sua senha do PostgreSQL
  port: 5432, // Porta padrão do PostgreSQL
});

pool
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL database");
  })
  .catch((err) => {
    onsole.error("Error connecting to PostgreSQL database", err);
  });
  module.exports = pool; // Exporta o pool para uso em outros arquivos
