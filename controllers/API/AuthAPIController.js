const express = require("express");

const { createHash } = require("crypto");
const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN } = require("../../config/config");
const knex = require("../../config/database");

const AuthAPIRouter = express.Router();
function generateAccessToken(username) {
  return jwt.sign(username, ACCESS_TOKEN, { expiresIn: "1800s" });
}
AuthAPIRouter.post("/", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashPassword = createHash("md5").update(password).digest("hex");
    let data = await knex("users")
      .innerJoin("clients", "users.id", "clients.user_id")
      .where("username", "=", username)
      .where("password", "=", hashPassword)
      .where("role", "=", "client");
    console.log(data);
    console.log(username);
    if (data) {
      data = {
        id: data[0].id,
        username: data[0].username,
        profile_image: data[0].profile_image,
      };
      const token = generateAccessToken({ username });
      return res.status(200).json({ token, user: data });
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ msg: "Username/password salah!!" });
  }
});

AuthAPIRouter.post("/register", async (req, res) => {
  try {
    const {
      username,
      password,
      name,
      email,
      place_of_birth,
      date_of_birth,
    } = req.body;
    // checking username
    await knex("users")
      .where("username", "=", username)
      .then((user) => {
        if (user.length > 0) {
          return res
            .status(400)
            .json({ error: { username: "Username sudah digunakan!!" } });
        }
      });
    const hashPassword = createHash("md5").update(password).digest("hex");
    await knex("users")
      .insert({ username, password: hashPassword, role: "client" })
      .then(async (user_id) => {
        if (user_id) {
          await knex("clients")
            .insert({
              user_id,
              name,
              email,
              place_of_birth,
              date_of_birth,
            })
            .then(async (client_id) => {
              if (!client_id)
                await knex("users").where("id", "=", user_id).delete();
              return res.status(200).json({ msg: "Registrasi Berhasil" });
            });
        }
      });
    return res.status(400).json({ msg: "Registrasi Gagal" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Registrasi Gagal" });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.sendStatus(403);
  let token = authHeader?.split(" ")[1];
  token = token.replace(",", "");
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, ACCESS_TOKEN, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;

    next();
  });
}

module.exports = { AuthAPIRouter, authenticateToken };
