const { json } = require("body-parser");
const express = require("express");
const routerAuction = express.Router();
const { validationResult, body } = require("express-validator");
const knex = require("../config/database");

routerAuction.get("/", async (req, res) => {
  const data = {
    req: req.baseUrl,
  };

  try {
    return res.render("pages/auction", data);
  } catch (e) {
    return res.status(400).msg({ msg: "Kesalahan mengambil data" });
  }
});
routerAuction.get("/find/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await knex("items")
      .innerJoin("auctions", "items.id", "auctions.item_id")
      .where("auctions.id", id);

    return res.status(200).json({ msg: "Berhasil", data: data[0] });
  } catch (e) {
    console.log(e);
  }
});
routerAuction.post("/", async (req, res) => {
  const data = {
    item_id: req.body.item_id,
    operator_id: 9,
    start_date: setFormatDate(req.body.start_date, req.body.start_time),
    end_date:
      req.body.end_date && req.body.end_time
        ? setFormatDate(req.body.end_date, req.body.end_time)
        : null,
    status: "open",
  };

  try {
    await knex("auctions").insert(data);
    return res.status(200).json({ msg: "Berhasil" });
  } catch (e) {
    return res.status(400).json({ msg: e });
  }
});
routerAuction.put("/:id", async (req, res) => {
  const data = {
    item_id: req.body.item_id,
    operator_id: 9,
    start_date: setFormatDate(req.body.start_date, req.body.start_time),
    end_date:
      req.body.end_date && req.body.end_time
        ? setFormatDate(req.body.end_date, req.body.end_time)
        : null,
  };
  try {
    await knex("auctions").where("id", req.params.id).update(data);
    return res.status(200).json({ msg: "Berhasil" });
  } catch (e) {
    return res.status(400).json({ msg: e });
  }
});
routerAuction.put("/close/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await knex("auctions")
      .where("id", id)
      .update({ end_date: knex.fn.now(), status: "close" });
    return res.status(200).json({ msg: "Berhasil" });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ msg: "Gagal" });
  }
});
routerAuction.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await knex("auctions").where("id", id).delete();
    return res.status(200).json({ msg: "Berhasil" });
  } catch (error) {
    return res.status(400).json({ msg: error });
  }
});

routerAuction.get("/api/auctions", async (req, res) => {
  const data = {};
  try {
    data.data = await knex("items").innerJoin(
      "auctions",
      "items.id",
      "auctions.item_id"
    );
    return res.status(200).json(data);
  } catch (e) {
    return res.status(400).json({ msg: "Data tidak ada" });
  }
});
routerAuction.get("/api/items", async (req, res) => {
  const data = {};
  try {
    data.data = await knex("items").whereNotExists(function () {
      this.select("*").from("auctions").whereRaw("auctions.item_id = items.id");
    });
    return res.status(200).json(data);
  } catch (e) {
    return res.status(400).json({ msg: "Data tidak ada" });
  }
});
module.exports = { routerAuction };

function dateToYMD(date) {
  var d = date.getDate();
  var m = date.getMonth() + 1; //Month from 0 to 11
  var y = date.getFullYear();
  return "" + y + "-" + (m <= 9 ? "0" + m : m) + "-" + (d <= 9 ? "0" + d : d);
}

function setFormatDate(date, time) {
  return dateToYMD(new Date(date)) + " " + time + ":00";
}
