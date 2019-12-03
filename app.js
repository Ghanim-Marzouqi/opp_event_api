// import depandencies
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const serveIndex = require("serve-index");
const mysql = require("mysql");
const ActiveDirectory = require("activedirectory");

// import routers
const auth = require("./routes/auth");
const event = require("./routes/event");

// add .env configuration
dotenv.config();

// create app and set port
const app = express();
const port = process.env.PORT;

// Active Directory configuration
const adConfig = {
  url: "ldap://almizan.opphq.gov:389",
  baseDN: "DC=opphq,DC=gov",
  username: "opphq\\ESRVLink",
  password: "11223344"
};

// Active Directory instance
const ad = new ActiveDirectory(adConfig);

// set a global variable for Active Directory instance
app.set("AD", ad);

// MySQL connection
const mysqlConfig = {
  connectionLimit: 10,
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
app.use("/auth", auth);
app.use("/events", event);

/**
 * USE: Fetch Event Categories
 * METHOD: GET
 * FULL URL: http://localhost:3000/categories
 */
app.get("/categories", (req, res) => {
  mysqlConnection.query(
    {
      sql: "SELECT * FROM `EVENT_CAT`"
    },
    (err, results, fields) => {
      if (err) {
        res.json({
          status: "error",
          message: "حدث خطأ اثناء جلب انواع المهام",
          results: err.message
        });
      } else {
        // create a new array of categories
        const categories = results.map(e =>
          JSON.parse(
            JSON.stringify({
              id: e.CAT_ID,
              name: e.CAT_NAME
            })
          )
        );

        res.json({
          status: "success",
          message: "تم جلب انواع المهام بنجاح",
          results: categories
        });
      }
    }
  );
});

// run app
app.listen(port, () =>
  console.log(`OPP Event API is running on port: ${port}`)
);
