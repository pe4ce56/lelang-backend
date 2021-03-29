const fs = require("fs");

function maintenance() {
  fs.rmdirSync(`public/items_image/temp`, { recursive: true });
}

function resetFolderTemp() {
  fs.rmdirSync(`public/items_image/temp`, { recursive: true });
  fs.mkdirSync(`public/items_image/temp`, { recursive: true });
}
module.exports = maintenance();
