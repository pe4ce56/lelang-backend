const express = require("express");
const { createHash } = require("crypto");
const routerAuth = express.Router();

const knex = require("../config/database");

routerAuth.get("/", (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");

  return res.render("auth/login");
});

routerAuth.post("/login", async (req, res) => {
  if (req.session.user) return redirect("/dashboard");

  const { username, password } = req.body;
  try {
    const hashPassword = createHash("md5").update(password).digest("hex");
    const data = await knex("users")
      .innerJoin("operators", "operators.user_id", "users.id")
      .where("username", "=", username)
      .where("password", "=", hashPassword);
    console.log(data);
    if (data) {
      req.session.user = data[0];
      return res.redirect("/items");
    }
  } catch (e) {
    console.log(e);
    return res.redirect("/");
  }
});

routerAuth.get("/logout", (req, res) => {
  delete req.session.user;
  res.redirect("/");
});
const authChecking = (roleRequired) => {
  return (req, res, next) => {
    if (!req.session.user) return res.redirect("/");
    const { role } = req.session.user;
    if (roleRequired !== role) {
      return res.redirect("/404");
    }
    return next();
  };
};

module.exports = { routerAuth, authChecking };
