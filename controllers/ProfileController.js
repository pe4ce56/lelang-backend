const routerProfiie = require("express").Router();

routerProfiie.get("/", (req, res) => {
  const data = {
    req: req.baseUrl,
  };
  return res.render("pages/profile/profile", data);
});

module.exports = { routerProfiie };
