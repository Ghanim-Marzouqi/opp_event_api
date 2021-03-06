// import depandencies
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const serveIndex = require("serve-index");
const mysql = require("mysql");
const ActiveDirectory = require("activedirectory");

// import routers
const Auth = require("./routes/Auth");
const Event = require("./routes/Event");

// add .env configuration
// dotenv.config();

// create app and set port
const app = express();
const port = process.env.PORT;

// Active Directory configuration
const adConfig = {
  url: process.env.AD_HOST,
  baseDN: process.env.AD_BASE,
  username: process.env.AD_USER,
  password: process.env.AD_PASS
};

// Active Directory instance
const ad = new ActiveDirectory(adConfig);

// set a global variable for Active Directory instance
app.set("AD", ad);

// MySQL connection
const mysqlConfig = {
  connectionLimit: 1000,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
};

// create MySQL connection
const mysqlConnection = mysql.createPool(mysqlConfig);

// set a global variable for MySQL connection
app.set("dbConnection", mysqlConnection);

// middlewares
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  "/ftp",
  express.static("public"),
  serveIndex("public", { icons: true })
);

// default route
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Welcome To OPP Event API"
  });
});

// routers
app.use("/auth", Auth);
app.use("/events", Event);

// run app
app.listen(port, () =>
  console.log(`OPP Event API is running on port: ${port}`)
);
