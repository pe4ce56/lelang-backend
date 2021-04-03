const fs = require("fs");

const maintenance = () => {
  resetFolderTemp();
};

function resetFolderTemp() {
  fs.rmdirSync(`public/items_image/temp`, { recursive: true });
  if (!fs.existsSync(`public/items_image/temp`))
    fs.mkdirSync(`public/items_image/temp`, { recursive: true });
}
module.exports = maintenance;
