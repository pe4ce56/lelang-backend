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

apiCategory.get("/home", async (req, res) => {
  try {
    // let count = knex("items")
    //   .count("items.id")
    //   .as("item_count")
    //   .("categories.id", "=", "category_id");

    let categories = await knex("categories")
      .select([
        "categories.id",
        "categories.name",
        knex.raw(`count(items.id) AS count_item`),
      ])
      .rightJoin("items", "categories.id", "items.category_id")
      .rightJoin("auctions", "items.id", "auctions.item_id")
      .groupBy("category_id");
    if (categories.length > 2) {
      categories.slice(3, categories.length - 4);
    }
    console.log(categories);
    return res.status(200).json({ data: categories });
  } catch (e) {
    return res.status(401).json({ msg: "Data gagal diambil" });
  }
});
module.exports = { apiCategory };
