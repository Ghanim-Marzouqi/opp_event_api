// import depandancies
const router = require("express").Router();
const multer = require("multer");

// create a storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

// create an instance of upload to receive a single file
const upload = multer({ storage });

/**
 * USE: Fetch Events based on Logged User
 * METHOD: GET
 * QUERY STRING: username
 * FULL URL: http://localhost:3000/events?username=GhanimAdmin
 */
router.get("/", (req, res) => {
  // get username from query string
  const username = req.query.username;

  // get MySQL connection
  const connection = req.app.get("dbConnection");

  if (username) {
    // fetch events from database
    connection.query(
      {
        sql: "SELECT * FROM `EVENT_MST` WHERE EMP_USERNAME = ?",
        values: [username.toUpperCase()]
      },
      (err, results, fields) => {
        if (err) {
          res.json({
            status: "error",
            message: "حدث خطأ اثناء جلب المهام",
            results: err.message
          });
        } else {
          // create a new array of events
          const events = results.map(e =>
            JSON.parse(
              JSON.stringify({
                id: e.MST_ID,
                title: e.MST_TITLE,
                desc: e.MST_DESC,
                file: e.MST_FILE,
                startDate: e.MST_START,
                endDate: e.MST_END,
                status: e.MST_STATUS,
                username: e.EMP_USERNAME,
                category: e.CAT_ID
              })
            )
          );

          res.json({
            status: "success",
            message: "تم جلب المهام بنجاح",
            results: events
          });
        }
      }
    );
  } else {
    res.status(400).json({
      status: "error",
      message: "لم يتم النعرف على اسم المستخدم"
    });
  }
});

/**
 * USE: Create an Event without a File based on Logged User
 * METHOD: POST
 * QUERY STRING: username
 * POST DATA: title - desc - startDate - endDate - catId
 * FULL URL: http://localhost:3000/events?username=GhanimAdmin
 */
router.post("/", (req, res) => {
  // get username from query string
  const username = req.query.username;

  // extract post data
  const { title, desc, startDate, endDate, catId } = req.body;

  // get MySQL connection
  const connection = req.app.get("dbConnection");

  if (username) {
    // insert data into database
    connection.query(
      {
        sql:
          "INSERT INTO `EVENT_MST` (`MST_TITLE`, `MST_DESC`, `MST_START`, `MST_END`, `EMP_USERNAME`, `CAT_ID`) VALUES (?,?,?,?,?,?)",
        values: [title, desc, startDate, endDate, username.toUpperCase(), catId]
      },
      (err, results, fields) => {
        if (err) {
          res.json({
            status: "error",
            message: "حدث خطأ أثناء إضافة المهمة",
            results: err.message
          });
        } else {
          res.json({
            status: "success",
            message: "تم إضافة المهمة بنجاح",
            results: { username, title, desc, startDate, endDate, catId }
          });
        }
      }
    );
  } else {
    res.status(400).json({
      status: "error",
      message: "لم يتم النعرف على اسم المستخدم"
    });
  }
});

/**
 * USE: Create an Event with a File based on Logged User
 * METHOD: POST
 * QUERY STRING: username
 * POST DATA: title - desc - startDate - endDate - catId
 * FULL URL: http://localhost:3000/events/file?username=GhanimAdmin
 */
router.post("/file", upload.single("file"), (req, res) => {
  // get username from query string
  const username = req.query.username;

  // extract post data
  const { title, desc, startDate, endDate, catId } = req.body;

  // construct a file url
  const fileUrl = `${req.protocol}://${req.get("host")}/ftp/${
    req.file.filename
  }`;

  // get MySQL connection
  const connection = req.app.get("dbConnection");

  if (username) {
    // insert data into database
    connection.query(
      {
        sql:
          "INSERT INTO `EVENT_MST` (`MST_TITLE`, `MST_DESC`, `MST_FILE`, `MST_START`, `MST_END`, `EMP_USERNAME`, `CAT_ID`) VALUES (?,?,?,?,?,?,?)",
        values: [
          title,
          desc,
          fileUrl,
          startDate,
          endDate,
          username.toUpperCase(),
          catId
        ]
      },
      (err, results, fields) => {
        if (err) {
          res.json({
            status: "error",
            message: "حدث خطأ أثناء إضافة المهمة",
            results: err.message
          });
        } else {
          res.json({
            status: "success",
            message: "تم إضافة المهمة بنجاح",
            results: {
              username,
              title,
              desc,
              startDate,
              endDate,
              catId,
              fileUrl
            }
          });
        }
      }
    );
  } else {
    res.status(400).json({
      status: "error",
      message: "لم يتم النعرف على اسم المستخدم"
    });
  }
});

/**
 * USE: Create an Sub Event based on Logged User and Selected Event
 * METHOD: POST
 * QUERY STRING: username
 * URL PARAMETER: id
 * POST DATA: title - startDate - endDate
 * FULL URL: http://localhost:3000/events/sub/1?username=GhanimAdmin
 */
router.post("/sub/:id", (req, res) => {
  // get username from query string
  const username = req.query.username;

  // get parameter data
  const eventId = req.params.id;

  // get post data
  const { title, startDate, endDate } = req.body;

  if (eventId && username) {
    // get MySQL connection
    const connection = req.app.get("dbConnection");

    // insert post data to MySQL
    connection.query(
      {
        sql:
          "INSERT INTO `EVENT_TRS` (`TRS_TITLE`, `TRS_START`, `TRS_END`, `MST_ID`) VALUES (?,?,?,?)",
        values: [title, startDate, endDate, eventId]
      },
      (err, results, fields) => {
        if (err) {
          res.json({
            status: "error",
            message: "حدث خطأ اثناء إضافة تفاصيل المهمة",
            results: err.message
          });
        } else {
          res.json({
            status: "success",
            message: "تم إضافة تفاصيل المهمة بنجاح",
            results: {
              eventId,
              title,
              startDate,
              endDate,
              username: username.toUpperCase()
            }
          });
        }
      }
    );
  } else {
    res.status(400).json({
      status: "error",
      message: "حدث خطأ اثناء إضافة تفاصيل المهمة"
    });
  }
});

// export router
module.exports = router;
