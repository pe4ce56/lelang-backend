const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("express-flash");
const cors = require("cors");

const app = express();
const http = require("http").createServer(app);
const routes = require("./routes");
const service = require("./socket/service");
const maintenance = require("./utils/maintenance");
maintenance();
const port = 3001;

var corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5000",
    "http://139.228.249.118/",
  ],
  optionsSuccessStatus: 200,
};
app.use(cors());

const sessionStore = new session.MemoryStore();
app.use(
  session({
    cookie: { maxAge: 3600000 },
    store: sessionStore,
    saveUninitialized: true,
    resave: "true",
    secret: "secret",
  })
);

app.use(flash());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride("_method"));

routes(app);

// socket service
service(http);

http.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
