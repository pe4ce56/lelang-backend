const express = require("express");
const { createHash } = require("crypto");
const router = express.Router();
const { validationResult, body } = require("express-validator");
const knex = require("../config/database");

function flashMsg(req, res, status, msg) {
  req.flash("status", status);
  req.flash("msg", msg);
  res.redirect("/users");
}
router.get("/", async (req, res) => {
  const data = {
    req: req.baseUrl,
    status: req.flash("status") || "",
    msg: req.flash("msg") || "",
    users: [],
  };
  try {
    let users = await knex("users").innerJoin(
      "operators",
      "users.id",
      "operators.user_id"
    );
    data.users = users;
  } catch (e) {}
  res.render("pages/users/users", data);
});
router.get("/add", (req, res) => {
  const data = {
    req: req.baseUrl,
  };
  res.render("pages/users/create", data);
});

router.post("/", async (req, res) => {
  const {
    username,
    password,
    role,
    name,
    email,
    whatsapp_number,
    gender,
  } = req.body;
  try {
    const hashPassword = createHash("md5").update(password).digest("hex");
    await knex("users")
      .insert({ username, password: hashPassword, role })
      .then(async (id) => {
        console.log(id);
        await knex("operators")
          .insert({
            user_id: id,
            name,
            email,
            whatsapp_number,
            gender,
          })
          .catch(async (e) => {
            await knex("users").where("id", id).delete();
            flashMsg(req, res, 400, "Data Gagal Ditambah");
          });
      });
  } catch (e) {
    console.log(e);
    flashMsg(req, res, 400, "Data Gagal Ditambah");
  }
  flashMsg(req, res, 200, "Data Berhasil Ditambah");
});
router.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const data = {
    req: req.baseUrl,
    user: {},
  };
  try {
    let user = await knex("users")
      .innerJoin("operators", "users.id", "operators.user_id")
      .where("users.id", id);

    data.user = user[0];
    res.render("pages/users/update", data);
  } catch (e) {
    res.status(400).json({ msg: "Data tidak ada" });
  }
});
router.put("/update/:id", async (req, res) => {
  const { username, role, name, email, whatsapp_number, gender } = req.body;
  const { id } = req.params;
  try {
    await knex("users")
      .where("id", id)
      .update({ username, role })
      .then(async () => {
        await knex("operators").update({
          user_id: id,
          name,
          email,
          whatsapp_number,
          gender,
        });
      });
  } catch (e) {
    console.log(e);
    flashMsg(req, res, 400, "Data Gagal Diubah");
  }
  flashMsg(req, res, 200, "Data Berhasil Diubah");
});
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await knex("users").where("id", id).delete();
    return res.status(200).json({ msg: "Berhasil" });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ msg: "Gagal" });
  }
});
module.exports = {
  routerUser: router,
};
