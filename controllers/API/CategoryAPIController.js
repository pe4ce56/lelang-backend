const express = require("express");
const apiCategory = express.Router();
const knex = require("../../config/database");
apiCategory.get("/", async function (req, res) {
  try {
    let categories = await knex("categories");
    return res.status(200).json({ data: categories });
  } catch (e) {
    return res.status(401).json({ msg: "Data gagal diambil" });
  }
});

module.exports = { apiCategory };
