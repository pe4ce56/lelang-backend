const express = require("express");
const { createHash } = require("crypto");
const routerAuth = express.Router();

const knex = require("../config/database");

routerAuth.get("/", (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");
  return res.render("auth/login", { err: req.flash("login") || "" });
});

routerAuth.post("/login", async (req, res) => {
  if (req.session.user) return redirect("/dashboard");

  const { username, password } = req.body;
  try {
    const hashPassword = createHash("md5").update(password).digest("hex");
    const data = await knex("users")
      .innerJoin("operators", "operators.user_id", "users.id")
      .where("username", "=", username)
      .where("password", "=", hashPassword)
      .where("role", "<>", "client");
    if (data.length > 0) {
      req.session.user = data[0];
      return res.redirect("/dashboard");
    }
    req.flash("status", "401");
    req.flash("login", "Failed");
    res.redirect("/");
  } catch (e) {
    console.log(e);
    req.flash("status", "401");
    req.flash("login", "Failed");
    res.redirect("/");
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
    if (!roleRequired) return next();

    if (roleRequired !== role) {
      return res.redirect("/404");
    }
    return next();
  };
};

module.exports = { routerAuth, authChecking };
