const { apiAuctions } = require("./controllers/API/AuctionsAPIController");
const {
  AuthAPIRouter,
  authenticateToken,
} = require("./controllers/API/AuthAPIController");
const { apiCategory } = require("./controllers/API/CategoryAPIController");
const {
  WishlistAPIRouter,
} = require("./controllers/API/WishlistAPIController");
const { routerAuction } = require("./controllers/AuctionController");
const { routerAuth, authChecking } = require("./controllers/AuthController");
const { routerCategory } = require("./controllers/CategoryController");
const { routerDashboard } = require("./controllers/DashboardController");
const { routerItem } = require("./controllers/ItemController");
const { routerUser } = require("./controllers/UserController");
const { routerProfiie } = require("./controllers/ProfileController");
module.exports = (app) => {
  app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    next();
  });

  app.use("/", routerAuth);
  app.use("/dashboard", authChecking(), routerDashboard);
  app.use("/auctions", authChecking("operator"), routerAuction);
  app.use("/items", authChecking(), routerItem);
  app.use("/categories", authChecking("admin"), routerCategory);
  app.use("/users", authChecking("admin"), routerUser);
  app.use("/profile", routerProfiie);

  // API

  app.use("/api/auth", AuthAPIRouter);
  app.use("/api/categories", apiCategory);
  app.use("/api/auctions", apiAuctions);
  app.use("/api/auctions/wishlist", authenticateToken, WishlistAPIRouter);

  app.use(function (req, res) {
    res.render("error/404");
  });
  app.use("/404", function (req, res) {
    res.render("error/404");
  });
};
