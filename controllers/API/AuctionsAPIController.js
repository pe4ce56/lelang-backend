const express = require("express");
const apiAuctions = express.Router();
const knex = require("../../config/database");
const { authenticateToken } = require("./AuthAPIController");
function joinOutput(input) {
  const hydrated = [],
    lookup = {};
  for (let note of input) {
    if (!lookup[note.item_id]) {
      lookup[note.item_id] = note;
      lookup[note.item_id].images = [];
      hydrated.push(lookup[note.item_id]);
    }

    if (note.id) {
      lookup[note.item_id].images.push({
        id: note.id,
        path: note.path,
        sort_order: note.sort_order || null,
      });
    }
    delete lookup[note.item_id].id;
    delete lookup[note.item_id].path;
  }
  return hydrated;
}

apiAuctions.get("/", async (req, res) => {
  try {
    let auctions = await knex("auctions")
      .select([
        "*",
        "auctions.id as auctions_id",
        "categories.name as category_name",
        "items.name as item_name",
        "images.id as image_id",
      ])
      .innerJoin("items", "auctions.item_id", "items.id")
      .innerJoin("images", "items.id", "images.item_id")
      .innerJoin("categories", "items.category_id", "categories.id")
      .orderBy("status", "asc")
      .orderBy("sort_order", "asc");
    // .where("status", "=", "open");
    auctions = joinOutput(auctions);
    return res.status(200).json({ data: auctions });
  } catch (e) {
    return res.status(401).json({ msg: "Data gagal diambil", error: e });
  }
});

apiAuctions.get("/search/:name", async (req, res) => {
  try {
    const { name } = req.params;
    let auctions = await knex("auctions")
      .select([
        "*",
        "auctions.id as auctions_id",
        "categories.name as category_name",
        "items.name as item_name",
        "images.id as image_id",
      ])
      .innerJoin("items", "auctions.item_id", "items.id")
      .innerJoin("images", "items.id", "images.item_id")
      .innerJoin("categories", "items.category_id", "categories.id")
      .where("items.name", "like", `%${name}%`)
      .orderBy("status", "asc");
    // .where("status", "=", "open");
    auctions = joinOutput(auctions);
    return res.status(200).json({ data: auctions });
  } catch (e) {
    return res.status(401).json({ msg: "Data gagal diambil", error: e });
  }
});
apiAuctions.get("/category/:category_name/:product_name", async (req, res) => {
  try {
    let auctions = await knex("auctions")
      .select([
        "*",
        "auctions.id as auctions_id",
        "categories.name as category_name",
        "items.name as item_name",
        "images.id as image_id",
      ])
      .innerJoin("items", "auctions.item_id", "items.id")
      .innerJoin("images", "items.id", "images.item_id")
      .innerJoin("categories", "items.category_id", "categories.id")
      .where("categories.name", "=", req.params.category_name)
      .andWhere("items.name", "like", `%${req.params.product_name}%`)
      .orderBy("status", "asc")
      .orderBy("auctions.id", "desc");
    auctions = joinOutput(auctions);
    return res.status(200).json({ data: auctions });
  } catch (e) {
    return res.status(401).json({ msg: "Data gagal diambil", error: e });
  }
});
apiAuctions.get("/category/:category_name/", async (req, res) => {
  try {
    let auctions = await knex("auctions")
      .select([
        "*",
        "auctions.id as auctions_id",
        "categories.name as category_name",
        "items.name as item_name",
        "images.id as image_id",
      ])
      .innerJoin("items", "auctions.item_id", "items.id")
      .innerJoin("images", "items.id", "images.item_id")
      .innerJoin("categories", "items.category_id", "categories.id")
      .where("categories.name", "=", req.params.category_name)
      .orderBy("status", "asc")
      .orderBy("auctions.id", "desc");
    auctions = joinOutput(auctions);

    return res.status(200).json({ data: auctions });
  } catch (e) {
    return res.status(401).json({ msg: "Data gagal diambil", error: e });
  }
});
apiAuctions.get("/home/category/:category_id", async (req, res) => {
  try {
    let auctions = await knex("auctions")
      .select([
        "*",
        "auctions.id as auctions_id",
        "categories.name as category_name",
        "items.name as item_name",
        "images.id as image_id",
      ])
      .innerJoin("items", "auctions.item_id", "items.id")
      .innerJoin("images", "items.id", "images.item_id")
      .innerJoin("categories", "items.category_id", "categories.id")
      .where("categories.id", "=", req.params.category_id)
      .orderBy("status", "asc")
      .orderBy("auctions.id", "desc");
    auctions = joinOutput(auctions);
    auctions.splice(3, auctions.length - 4);

    return res.status(200).json({ data: auctions });
  } catch (e) {
    return res.status(401).json({ msg: "Data gagal diambil", error: e });
  }
});
apiAuctions.get("/open", async (req, res) => {
  try {
    let auctions = await knex("auctions")
      .select([
        "*",
        "auctions.id as auctions_id",
        "categories.name as category_name",
        "items.name as item_name",
        "images.id as image_id",
      ])
      .innerJoin("items", "auctions.item_id", "items.id")
      .innerJoin("images", "items.id", "images.item_id")
      .innerJoin("categories", "items.category_id", "categories.id")
      .where("status", "=", "open")
      .orderBy("status", "asc");
    auctions = joinOutput(auctions);
    return res.status(200).json({ data: auctions });
  } catch (e) {
    return res.status(401).json({ msg: "Data gagal diambil", error: e });
  }
});
apiAuctions.get("/single", async (req, res) => {
  try {
    let auctions = await knex("auctions")
      .select([
        "*",
        "auctions.id as auctions_id",
        "categories.name as category_name",
        "items.name as item_name",
        "images.id as image_id",
      ])
      .innerJoin("items", "auctions.item_id", "items.id")
      .innerJoin("images", "items.id", "images.item_id")
      .innerJoin("categories", "items.category_id", "categories.id")
      .orderBy("status", "asc");

    // .where("status", "=", "open");
    auctions = joinOutput(auctions);
    return res.status(200).json({ data: auctions[0] });
  } catch (e) {
    return res.status(401).json({ msg: "Data gagal diambil", error: e });
  }
});
apiAuctions.get("/:id", async (req, res) => {
  try {
    let auctions = await knex("auctions")
      .select([
        "*",
        "auctions.id as auctions_id",
        "categories.name as category_name",
        "items.name as item_name",
        "images.id as image_id",
      ])
      .innerJoin("items", "auctions.item_id", "items.id")
      .innerJoin("images", "items.id", "images.item_id")
      .innerJoin("categories", "items.category_id", "categories.id")

      .where("auctions.id", "=", req.params.id);

    auctions = joinOutput(auctions);
    return res.status(200).json({ data: auctions[0] });
  } catch (e) {
    return res.status(401).json({ msg: "Data gagal diambil", error: e });
  }
});

apiAuctions.get("/bid/:auction_id", async (req, res) => {
  try {
    const { auction_id } = req.params;
    const auctionsMax = knex("histories")
      .max("histories.offers", { as: "current_bid" })
      .as("current_bid")
      .where("histories.auction_id", "=", auction_id);
    let data = await knex("auctions")
      .select([
        "histories.*",
        "auctions.start_date",
        "clients.name",
        "items.price",
        auctionsMax,
      ])
      .leftJoin("histories", "auctions.id", "histories.auction_id")
      .leftJoin("clients", "histories.client_id", "clients.id")
      .innerJoin("items", "auctions.item_id", "items.id")
      .where("auctions.id", "=", auction_id)
      .orderBy("histories.created_at", "desc");
    // .groupBy("histories.auction_id");
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(400).json({ msg: "Gagal", error });
  }
});
apiAuctions.post("/bid", authenticateToken, async (req, res) => {
  const { auction_id, client_id, offers } = req.body;
  try {
    const bid = await knex("auctions")
      .where("auctions.id", "=", auction_id)
      .andWhere("auctions.status", "=", "open")
      .then(async (row) => {
        return (
          row.length > 0 &&
          (await knex("histories").insert({ auction_id, client_id, offers }))
        );
      });
    if (bid) {
      const data = await knex("histories")
        .select(["name", "histories.id", "offers"])
        .innerJoin("clients", "histories.client_id", "clients.id")
        .where("histories.id", "=", bid);
      return res.status(200).json({ msg: "Berhasil", data });
    }
    return res.status(400).json({ msg: "Lelang sudah ditutup" });
  } catch (error) {
    return res.status(400).json({ msg: "Gagal" });
  }
});

apiAuctions.get("/comments/:auction_id", async (req, res) => {
  try {
    const { auction_id } = req.params;
    let data = await knex("auctions")
      .select([
        "comments.*",
        "auctions.start_date",
        "clients.name",
        "users.profile_image",
      ])
      .innerJoin("comments", "comments.auction_id", "auctions.id")
      .innerJoin("clients", "comments.client_id", "clients.id")
      .innerJoin("users", "clients.user_id", "users.id")
      .where("auctions.id", "=", auction_id)
      .orderBy("comments.created_at", "desc");
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(400).json({ msg: "Gagal", error });
  }
});
apiAuctions.post("/comment", authenticateToken, async (req, res) => {
  const { auction_id, client_id, text } = req.body;
  try { 
    await knex("comments").insert({ auction_id, client_id, text });
    return res.status(200).json({ msg: "Berhasil" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Terjadi Kesalahan" });
  }
});
module.exports = { apiAuctions };
