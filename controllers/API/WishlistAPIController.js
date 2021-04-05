const express = require("express");
const WishlistAPIRouter = express.Router();
const knex = require("../../config/database");
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
WishlistAPIRouter.get("/:client_id", async (req, res) => {
  try {
    const { client_id } = req.params;
    let data = await knex("wishlist")
      .select([
        "wishlist.*",
        "wishlist.id as wishlist_id",
        "items.*",
        "images.*",
      ])
      .innerJoin("auctions", "wishlist.auction_id", "auctions.id")
      .innerJoin("items", "auctions.item_id", "items.id")
      .innerJoin("images", "items.id", "images.item_id")
      .where("wishlist.client_id", "=", client_id);
    data = joinOutput(data);
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(400).json({ msg: "Gagal", error });
  }
});

WishlistAPIRouter.post("/", async (req, res) => {
  try {
    const { auction_id, client_id } = req.body;
    await knex("wishlist").insert({ auction_id, client_id });
    return res.status(200).json({ msg: "Berhasil" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Gagal" });
  }
});
WishlistAPIRouter.delete("/", async (req, res) => {
  try {
    const { auction_id, client_id } = req.body;
    await knex("wishlist")
      .where("auction_id", "=", auction_id)
      .where("client_id", "=", client_id)
      .delete();
    return res.status(200).json({ msg: "Berhasil" });
  } catch (error) {
    return res.status(400).json({ msg: "Gagal" });
  }
});

module.exports = { WishlistAPIRouter };
