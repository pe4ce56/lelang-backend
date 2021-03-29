const { apiAuctions } = require("./controllers/API/AuctionsAPIController");
const { apiCategory } = require("./controllers/API/CategoryAPIController");
const { routerAuction } = require("./controllers/AuctionController");
const { routerAuth, authChecking } = require("./controllers/AuthController");
const { routerCategory } = require("./controllers/CategoryController");
const { routerItem } = require("./controllers/ItemController");
const { routerUser } = require("./controllers/UserController");
module.exports = (app) => {
  app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    next();
  });
  
  app.use("/", routerAuth);
  app.use("/auctions", authChecking("operator"), routerAuction);
  app.use("/items", authChecking("admin"), routerItem);
  app.use("/categories", authChecking("admin"), routerCategory);
  app.use("/users", authChecking("admin"), routerUser);

  // API
  app.use("/api/categories", apiCategory);
  app.use("/api/auctions", apiAuctions);

  app.use(function (req, res) {
    res.render("error/404");
  });
  app.use("/404", function (req, res) {
    res.render("error/404");
  });
};
