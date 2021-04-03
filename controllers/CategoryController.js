const express = require("express");
const routerCategory = express.Router();
const { validationResult, body } = require("express-validator");
const knex = require("../config/database");

async function validation(req, res, next) {
  const result = await body("name").isLength({ min: 1 }).run(req);
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  flashMsg(req, res, 401, "Form tidak boleh kosong");
}

function flashMsg(req, res, status, msg) {
  req.flash("status", status);
  req.flash("msg", msg);
  res.redirect("/categories");
}

routerCategory.get("/", async function (req, res) {
  const data = {
    req: req.baseUrl,
    status: req.flash("status") || "",
    msg: req.flash("msg") || "",
    categories: [],
  };
  try {
    let categories = await knex("categories");
    data.categories = categories;
  } catch (e) {}
  res.render("pages/category", data);
});

routerCategory.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await knex("categories").where("id", id);
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json({ msg: "Data tidak ada" });
  }
});
routerCategory.post("/", validation, async (req, res) => {
  try {
    const { name } = req.body;
    let id = await knex("categories").insert({
      name,
    });
    flashMsg(req, res, 200, "Data Berhasil Ditambah");
  } catch (e) {
    flashMsg(req, res, 401, "Data Gagal Ditambah");
  }
});
routerCategory.put("/update/:id", validation, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await knex("categories").where("id", id).update({ name });
    flashMsg(req, res, 200, "Data Berhasil Diubah");
  } catch (e) {
    flashMsg(req, res, 401, "Data Gagal Diubah");
  }
});

routerCategory.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await knex("categories").where("id", id).delete();
    return res.status(200).json({ msg: "Berhasil" });
  } catch (e) {
    return res.status(400).json({ msg: "Gagal" });
  }
});
module.exports = {
  routerCategory,
};
