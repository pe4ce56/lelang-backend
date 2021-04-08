const express = require("express");

const { createHash } = require("crypto");
const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN } = require("../../config/config");
const knex = require("../../config/database");
const { writeFileSync, exists, existsSync, unlinkSync } = require("fs");

const AuthAPIRouter = express.Router();
function generateAccessToken(username) {
  return jwt.sign(username, ACCESS_TOKEN, { expiresIn: "1h" });
}
AuthAPIRouter.post("/", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashPassword = createHash("md5").update(password).digest("hex");
    let data = await knex("users")
      .innerJoin("clients", "clients.user_id", "users.id")
      .where("username", "=", username)
      .where("password", "=", hashPassword)
      .where("role", "=", "client");
    if (data.length > 0) {
      data = {
        id: data[0].user_id,
        client_id: data[0].id,
        username: data[0].username,
        profile_image: data[0].profile_image,
      };
      const token = generateAccessToken({ username });
      return res.status(200).json({ token, user: data });
    }
    return res.status(400).json({ msg: "Username/password salah!!" });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ msg: "Username/password salah!!" });
  }
});
AuthAPIRouter.get("/getUser/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let data = await knex("users")
      .select([
        "user_id",
        "username",
        "profile_image",
        "email",
        "name",
        "place_of_birth",
        "date_of_birth",
        "profile_image",
      ])
      .innerJoin("clients", "users.id", "clients.user_id")
      .where("users.id", "=", id);
    return res.status(200).json({ user: data });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ msg: "Kesalahan mengambil data" });
  }
});
AuthAPIRouter.put("/edit/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, name, email, place_of_birth, date_of_birth } = req.body;
    const user_id = await knex("users")
      .where("users.id", "=", id)
      .update({ username });
    if (user_id) {
      const client_id = await knex("clients")
        .where("clients.user_id", "=", id)
        .update({
          name,
          email,
          place_of_birth,
          date_of_birth,
        });
      if (client_id) return res.status(200).json({ msg: "Berhasil Diubah" });
    }

    return res.status(400).json({ msg: "Gagal Diubah" });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ msg: "Gagal Diubah" });
  }
});
AuthAPIRouter.patch(
  "/update_image/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { image, username, imageName } = req.body;
      // console.log(image);
      const fileContents = image.split(";base64,").pop();
      const fileName = `${username}${makeid(10)}.png`;

      writeFileSync(`public/profile_images/clients/${fileName}`, fileContents, {
        encoding: "base64",
      });

      const data = await knex("users").where("users.id", "=", id);
      if (
        data[0].profile_image &&
        existsSync(`public/profile_images/clients/${data[0].profile_image}`)
      ) {
        unlinkSync(`public/profile_images/clients/${data[0].profile_image}`);
      }
      await knex("users")
        .where("users.id", "=", id)
        .update({ profile_image: fileName });
      return res.status(200).json({ image: fileName });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: "Gagal Diubah" });
    }
  }
);

AuthAPIRouter.patch(
  "/changePassword/:user_id",
  authenticateToken,
  async (req, res) => {
    try {
      const { user_id } = req.params;
      const { new_password, old_password } = req.body;
      const newHashPassword = createHash("md5")
        .update(new_password)
        .digest("hex");
      const oldHashPassword = createHash("md5")
        .update(old_password)
        .digest("hex");

      const updatePasssword = await knex("users")
        .where("id", "=", user_id)
        .where("password", "=", oldHashPassword)
        .update({ password: newHashPassword });
      if (updatePasssword)
        return res.status(200).json({ msg: "Password Berhasil Diubah" });
      return res
        .status(400)
        .json({ error: { old_password: "Password Lama Salah" } });
    } catch (e) {
      return res.status(401).json({ error: "Kesalahan mengambil data" });
    }
  }
);

AuthAPIRouter.delete(
  "/deleteProfileImage/:user_id",
  authenticateToken,
  async (req, res) => {
    try {
      const { user_id } = req.params;
      const deleted = await knex("users")
        .where("users.id", "=", user_id)
        .update({ profile_image: "" });
      return res.status(200).json({ msg: "Berhasil dihapus" });
    } catch (e) {
      console.log(e);
      return res.status(400).json({ msg: "Gagal Diubah" });
    }
  }
);

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

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = { AuthAPIRouter, authenticateToken };
