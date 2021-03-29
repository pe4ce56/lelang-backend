const knex = require("knex")({
  client: "mysql",
  connection: {
    host: "localhost",
    port: "1080",
    user: "root",
    password: "sayasendiri123",
    database: "auction_db",
  }, 
});

module.exports = knex;
