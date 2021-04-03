const express = require("express");
const knex = require("../config/database");
const routerDashboard = express.Router();

routerDashboard.get("/", async (req, res) => {
  const data = {
    req: req.baseUrl,
    items: {},
    auctions: {},
  };
  try {
    data.items.isNotAuctions = await knex
      .raw(
        `SELECT count(*) as items from auctions right outer join items on items.id = auctions.item_id WHERE auctions.item_id IS NULL`
      )
      .then((res) => res[0][0].items);
    data.items.isAuctions = await knex
      .raw(
        `SELECT COUNT(items.id) as items from items right join auctions on items.id = auctions.item_id`
      )
      .then((res) => res[0][0].items);
    data.auctions.isAuctions = await knex("auctions")
      .count("id", { as: "auctions_open" })
      .where("status", "=", "open")
      .then((res) => res[0].auctions_open);
    data.auctions.isNotAuctions = await knex("auctions")
      .count("id", { as: "auctions_close" })
      .where("status", "=", "close")
      .then((res) => res[0].auctions_close);
  } catch (e) {}
  res.render("pages/dashboard", data);
});

module.exports = { routerDashboard };
