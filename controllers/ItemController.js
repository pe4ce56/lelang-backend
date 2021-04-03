const express = require("express");
const routerItem = express.Router();
const formidable = require("formidable");
const { validationResult, body } = require("express-validator");
const fs = require("fs");
const util = require("util");
const path = require("path");
const knex = require("../config/database");

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

routerItem.get("/", async function (req, res) {
  const data = {
    req: req.baseUrl,
    status: req.flash("status") || "",
    msg: req.flash("msg") || "",
    items: [],
  };
  try {
    let items = await knex("items")
      .select([
        "items.id",
        "items.name as items_name",
        "items.price",
        "items.description",
        "categories.name as category_name",
      ])
      .innerJoin("categories", "items.category_id", "categories.id");
    data.items = items;
    console.log(items);
  } catch (e) {}
  res.render("pages/items/items", data);
});
routerItem.get("/categories/all", async function (req, res) {
  try {
    let categories = await knex("categories");
    return res.status(200).json(categories);
  } catch (e) {
    return res.status(401).json({ msg: "Data gagal diambil" });
  }
});
routerItem.get("/add", function (req, res) {
  const data = {
    req: req.baseUrl,
  };
  res.render("pages/items/create", data);
});

routerItem.post("/", async (req, res) => {
  try {
    const {
      name,
      price,
      category_id,
      description,
      images,
      folderTemp,
    } = req.body;
    let id = await knex("items").insert({
      name,
      price,
      category_id,
      description,
    });
    if (id) {
      const dataToInsert = images.map((image, index) => ({
        item_id: id,
        path: image,
        sort_order: index + 1,
      }));
      if (images.length > 0) {
        let insertedImage = await knex("images")
          .insert(dataToInsert)
          .catch(async (err) => {
            console.error(err);
            await knex("items").where("id", id).delete();
            await knex("images").where("item_id", id).delete();
            return res.status(400).json({ msg: "Data Gagal Ditambah" });
          });
        if (insertedImage) {
          copyFolderSync(
            `public/items_image/temp/${folderTemp}`,
            `public/items_image/${id}`
          );
        }
        return res.status(200).json({ msg: "Data Berhasil Ditambah" });
      }
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ msg: "Data Gagal Ditambah" });
  }
});

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

routerItem.get("/edit/:id", async function (req, res) {
  const data = {
    req: req.baseUrl,
    item: {},
  };

  try {
    const { id } = req.params;
    const item = await knex("items")
      .leftJoin("images", "images.item_id", "=", "items.id")
      .where("items.id", id);
    if (item.length > 0) {
      data.item = joinOutput(item)[0];
      data.item.item_id = id;
      return res.render("pages/items/update", data);
    }
    return res.status(400).send("Data tidak ada");
  } catch (e) {
    res.status(300).json({ msg: "Data tidak ada", error: e });
  }
});

routerItem.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      category_id,
      description,
      images,
      folderTemp,
    } = req.body;

    // console.log(images);
    // return;

    const updateItem = await knex("items").where("id", id).update({
      name,
      price,
      category_id,
      description,
    });
    if (updateItem) {
      await knex("images").where("item_id", id).delete();
      if (images.length > 0) {
        for (const image of images) {
          image.item_id = id;
        }
        const updateImage = await knex("images").insert(images);

        if (updateImage) {
          // jika item sudah memliki gambar
          if (fs.existsSync(`public/items_image/${id}`)) {
            const fileFolder = fs.readdirSync(`public/items_image/${id}`);

            const imagesDeleted = fileFolder.filter((path) => {
              return (
                images
                  .map(function (e) {
                    return e.path;
                  })
                  .indexOf(path) < 0
              );
            });
            imagesDeleted.map((path) => {
              if (path && fs.existsSync(`public/items_image/${id}/${path}`)) {
                fs.unlinkSync(`public/items_image/${id}/${path}`);
              }
            });
          }
          if (fs.existsSync(`public/items_image/temp/${folderTemp}`)) {
            copyFolderSync(
              `public/items_image/temp/${folderTemp}`,
              `public/items_image/${id}`
            );
          }
        }
      } else {
        fs.rmdirSync(`public/items_image/${id}`, { recursive: true });
      }
    }
    return res.status(200).json({ msg: "Data Berhasil Diubah" });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ msg: "Data Gagal Diubah" + e });
  }
});
routerItem.post("/uploadTemp/:idSocket", (req, res) => {
  const { idSocket } = req.params;
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    if (err) throw err;
    const { path, name } = files.file;
    const rand = makeid(10);
    const dir = `public/items_image/temp/${idSocket}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    var newpath =
      __dirname + `/../public/items_image/temp/${idSocket}/${rand}-${name}`;
    fs.copyFile(path, newpath, function (err) {
      return res.status(200).json({ name: `${rand}-${name}` });
    });
  });
});

routerItem.delete("/deleteImageTemp/:id/:img", (req, res) => {
  const { id, img } = req.params;
  try {
    const path = `public/items_image/temp/${id}/${img}`;

    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
    return res.json(200);
  } catch (e) {
    return res.json(400);
  }
});

routerItem.delete("/:id", async (req, res) => {
  try {
    console.log(req.params);
    const { id } = req.params;
    const deleted = await knex("items").where("id", id).delete();
    if (deleted) {
      fs.rmdirSync(`public/items_image/${id}`, { recursive: true });
    }
    return res.status(200).json({ msg: "Berhasil" });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ msg: e });
  }
});
module.exports = { routerItem };

var mkdir = function (dir) {
  // making directory without exception if exists
  try {
    fs.mkdirSync(dir, 0755);
  } catch (e) {
    if (e.code != "EEXIST") {
      throw e;
    }
  }
};

var copyDir = function (src, dest) {
  mkdir(dest);
  var files = fs.readdirSync(src);
  for (var i = 0; i < files.length; i++) {
    var current = fs.lstatSync(path.join(src, files[i]));
    if (current.isDirectory()) {
      copyDir(path.join(src, files[i]), path.join(dest, files[i]));
    } else if (current.isSymbolicLink()) {
      var symlink = fs.readlinkSync(path.join(src, files[i]));
      fs.symlinkSync(symlink, path.join(dest, files[i]));
    } else {
      copy(path.join(src, files[i]), path.join(dest, files[i]));
    }
  }
};

function copyFolderSync(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest);

  fs.readdirSync(src).forEach((dirent) => {
    const [srcPath, destPath] = [src, dest].map((dirPath) =>
      path.join(dirPath, dirent)
    );
    const stat = fs.lstatSync(srcPath);
    switch (true) {
      case stat.isFile():
        fs.copyFileSync(srcPath, destPath);
        break;
      case stat.isSymbolicLink():
        fs.symlinkSync(fs.readlinkSync(srcPath), destPath);
        break;
    }
  });
}
