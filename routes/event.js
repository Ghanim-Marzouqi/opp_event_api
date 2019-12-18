// import depandancies
const router = require("express").Router();
const multer = require("multer");
const request = require("request");

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
 * QUERY STRING: username - category
 * FULL URL: http://localhost:3000/events?username=GhanimAdmin
 */
router.get("/", (req, res) => {
  // get username and category from query string
  const username = req.query.username;
  const category = req.query.category;
  let sqlQuery =
    "SELECT MST_ID, MST_TITLE, MST_DESC, MST_FILE, DATE_FORMAT(MST_START,'%Y-%m-%d %H:%i') AS MST_START, DATE_FORMAT(MST_END,'%Y-%m-%d %H:%i') AS MST_END, MST_ALLDAY, MST_STATUS, MST_READ, MST_DELETE, MST_UPDATE, EMP_USERNAME FROM `EVENT_MST` WHERE EMP_USERNAME = ? ";

  // get MySQL connection
  const connection = req.app.get("dbConnection");

  if (username) {
    if (category === "active") {
      sqlQuery += "AND `MST_STATUS` = 1";
    } else if (category === "deleted") {
      sqlQuery += "AND `MST_STATUS` = 0";
    }

    // fetch events from database
    connection.query(
      {
        sql: sqlQuery,
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
                eventId: e.MST_ID,
                title: e.MST_TITLE,
                desc: e.MST_DESC,
                file: e.MST_FILE,
                start: e.MST_START,
                end: e.MST_END,
                allDay: e.MST_ALLDAY,
                status: e.MST_STATUS,
                canView: e.MST_READ,
                canDelete: e.MST_DELETE,
                canUpdate: e.MST_UPDATE,
                username: e.EMP_USERNAME
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
      message: "لا يمكن إتمام طلب جلب المهام المسجلة"
    });
  }
});

/**
 * USE: Fetch a Single Event based on Logged User
 * METHOD: GET
 * QUERY STRING: username
 * URL PARAMETER: eventId
 * FULL URL: http://localhost:3000/events/1?username=GhanimAdmin
 */
router.get("/:eventId", (req, res) => {
  // get username from query string
  const username = req.query.username;

  // get event id
  const eventId = req.params.eventId;

  // get MySQL connection
  const connection = req.app.get("dbConnection");

  if (username && eventId) {
    // fetch events from database
    connection.query(
      {
        sql:
          "SELECT MST_ID, MST_TITLE, MST_DESC, MST_FILE, DATE_FORMAT(MST_START,'%Y-%m-%d %H:%i') AS MST_START, DATE_FORMAT(MST_END,'%Y-%m-%d %H:%i') AS MST_END, MST_ALLDAY, MST_STATUS, EMP_USERNAME FROM `EVENT_MST` WHERE `EMP_USERNAME` = ? AND `MST_ID` = ? AND `MST_STATUS` = 1",
        values: [username.toUpperCase(), eventId]
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
                eventId: e.MST_ID,
                title: e.MST_TITLE,
                desc: e.MST_DESC,
                file: e.MST_FILE,
                start: e.MST_START,
                end: e.MST_END,
                allDay: e.MST_ALLDAY,
                status: e.MST_STATUS,
                canView: e.MST_READ,
                canDelete: e.MST_DELETE,
                canUpdate: e.MST_UPDATE,
                username: e.EMP_USERNAME
              })
            )
          );

          res.json({
            status: "success",
            message: "تم جلب المهمة بنجاح",
            results: events
          });
        }
      }
    );
  } else {
    res.status(400).json({
      status: "error",
      message: "لا يمكن إتمام طلب جلب المهام المسجلة"
    });
  }
});

/**
 * USE: Create an Event without a File based on Logged User
 * METHOD: POST
 * QUERY STRING: username - allDay (yes / no)
 * POST DATA: title - desc - startDate - endDate - canView - canDelete - canUpdate
 * FULL URL: http://localhost:3000/events?username=GhanimAdmin&allDay=yes
 */
router.post("/", (req, res) => {
  // get username and allDay from query string
  const { username, allDay } = req.query;

  // extract post data
  const {
    title,
    desc,
    startDate,
    endDate,
    canView,
    canDelete,
    canUpdate
  } = req.body;

  // get MySQL connection
  const connection = req.app.get("dbConnection");

  if (username && allDay) {
    // check for all day query string
    let allDayStatus = 0;
    allDay === "yes" ? (allDayStatus = 1) : (allDayStatus = 0);

    // insert data into database
    connection.query(
      {
        sql:
          "INSERT INTO `EVENT_MST` (`MST_TITLE`, `MST_DESC`, `MST_START`, `MST_END`, `MST_ALLDAY`, `MST_READ`, `MST_DELETE`, `MST_UPDATE`, `EMP_USERNAME`) VALUES (?,?,?,?,?,?,?,?,?)",
        values: [
          title,
          desc,
          startDate,
          endDate,
          allDayStatus,
          canView,
          canDelete,
          canUpdate,
          username.toUpperCase()
        ]
      },
      (err, results, fields) => {
        if (err) {
          console.log(err.message);
          res.json({
            status: "error",
            message: "حدث خطأ أثناء إضافة المهمة",
            results: err.message
          });
        } else {
          // send an email
          request.post(
            "http://10.147.3.11/OppEventEmailAPI/api/email/event",
            {
              From: "",
              To: `${username}@opp.gov.om`,
              Subject: "مهمة جديدة",
              Body: `تم إنشاء مهمة جديدة بتاريخ ${startDate}`
            },
            (error, response, body) => {
              if (error) {
                console.log(error);
              } else {
                console.log(response);
              }
            }
          );

          // send response
          res.status(201).json({
            status: "success",
            message: "تم إضافة المهمة بنجاح",
            results: {
              title,
              desc,
              start: startDate,
              end: endDate,
              allDay,
              canView,
              canDelete,
              canUpdate,
              username: username.toUpperCase()
            }
          });
        }
      }
    );
  } else {
    res.status(400).json({
      status: "error",
      message: "لا يمكن إتمام طلب تسجيل مهمة جديدة"
    });
  }
});

/**
 * USE: Create an Event with a File based on Logged User
 * METHOD: POST
 * QUERY STRING: username - allDay (yes / no)
 * POST DATA: title - desc - startDate - endDate - file - canView - canDelete - canUpdate
 * FULL URL: http://localhost:3000/events/file?username=GhanimAdmin&allDay=yes
 */
router.post("/file", upload.single("file"), (req, res) => {
  // get username from query string
  const { username, allDay } = req.query;

  // extract post data
  const {
    title,
    desc,
    startDate,
    endDate,
    canView,
    canDelete,
    canUpdate
  } = req.body;

  // construct a file url
  const file = `${req.protocol}://${req.get("host")}/ftp/${req.file.filename}`;

  // get MySQL connection
  const connection = req.app.get("dbConnection");

  if (username && allDay) {
    // check for all day query string
    let allDayStatus = 0;
    allDay === "yes" ? (allDayStatus = 1) : (allDayStatus = 0);

    // insert data into database
    connection.query(
      {
        sql:
          "INSERT INTO `EVENT_MST` (`MST_TITLE`, `MST_DESC`, `MST_FILE`, `MST_START`, `MST_END`, `MST_ALLDAY`, `MST_READ`, `MST_DELETE`, `MST_UPDATE`, `EMP_USERNAME`) VALUES (?,?,?,?,?,?,?,?,?,?)",
        values: [
          title,
          desc,
          file,
          startDate,
          endDate,
          allDayStatus,
          canView,
          canDelete,
          canUpdate,
          username.toUpperCase()
        ]
      },
      (err, results, fields) => {
        if (err) {
          console.log(err.message);
          res.json({
            status: "error",
            message: "حدث خطأ أثناء إضافة المهمة",
            results: err.message
          });
        } else {
          res.status(201).json({
            status: "success",
            message: "تم إضافة المهمة بنجاح",
            results: {
              title,
              desc,
              file,
              start: startDate,
              end: endDate,
              allDay,
              canView,
              canDelete,
              canUpdate,
              username: username.toUpperCase()
            }
          });
        }
      }
    );
  } else {
    res.status(400).json({
      status: "error",
      message: "لا يمكن إتمام طلب تسجيل مهمة جديدة"
    });
  }
});

/**
 * USE: Delete Event
 * METHOD: DELETE
 * QUERY STRING: username
 * URL PARAMETER: eventId
 * FULL URL: http://localhost:3000/events/1?username=GhanimAdmin
 */
router.delete("/:eventId", (req, res) => {
  // get username from query string
  const username = req.query.username;

  // get parameter data
  const eventId = req.params.eventId;

  // get MySQL connection
  const connection = req.app.get("dbConnection");

  if (username && eventId) {
    // update data into database
    connection.query(
      {
        sql:
          "UPDATE `EVENT_MST` SET MST_STATUS = 0 WHERE EMP_USERNAME = ? AND MST_ID = ?",
        values: [username.toUpperCase(), eventId]
      },
      (err, results, fields) => {
        if (err) {
          console.log(err.message);
          res.json({
            status: "error",
            message: "حدث خطأ اثناء حذف المهمة",
            results: err.message
          });
        } else {
          res.json({
            status: "success",
            message: "تم حذف المهمة بنجاح",
            results: { eventId, username: username.toUpperCase() }
          });
        }
      }
    );
  } else {
    res.status(400).json({
      status: "error",
      message: "لا يمكن إتمام طلب حذف المهمة"
    });
  }
});

/**
 * USE: Update Event without a File
 * METHOD: PATCH
 * QUERY STRING: username - allDay (yes / no)
 * URL PARAMETER: eventId
 * POST DATA: title - desc - startDate - endDate
 * FULL URL: http://localhost:3000/events/1?username=GhanimAdmin&allDay=yes
 */
router.patch("/:eventId", (req, res) => {
  // get username from query string
  const { username, allDay } = req.query;

  // get event id parameter
  const eventId = req.params.eventId;

  // get post data
  const { title, desc, startDate, endDate } = req.body;

  // get MySQL connection
  const connection = req.app.get("dbConnection");

  if (username && eventId && allDay) {
    // check for all day query string
    let allDayStatus = 0;
    allDay === "yes" ? (allDayStatus = 1) : (allDayStatus = 0);

    // insert data into database
    connection.query(
      {
        sql:
          "UPDATE `EVENT_MST` SET `MST_TITLE` = ?, `MST_DESC` = ?, `MST_START` = ?, `MST_END` = ?, `MST_ALLDAY` = ? WHERE `EMP_USERNAME` = ? AND `MST_ID` = ? AND `MST_STATUS` = 1",
        values: [
          title,
          desc,
          startDate,
          endDate,
          allDayStatus,
          username.toUpperCase(),
          eventId
        ]
      },
      (err, results, fields) => {
        if (err) {
          res.json({
            status: "error",
            message: "حدث خطأ اثناء تعديل المهمة",
            results: err.message
          });
        } else {
          if (results.changedRows === 0) {
            res.json({
              status: "success",
              message: "لم يتم إجراء اي تعديل",
              results: {
                eventId,
                title,
                desc,
                start: startDate,
                end: endDate,
                allDay,
                username: username.toUpperCase()
              }
            });
          } else {
            res.json({
              status: "success",
              message: "تم تعديل المهمة بنجاح",
              results: {
                eventId,
                title,
                desc,
                start: startDate,
                end: endDate,
                allDay,
                username: username.toUpperCase()
              }
            });
          }
        }
      }
    );
  } else {
    res.status(400).json({
      status: "error",
      message: "لا يمكن إتمام طلب التعديل على المهمة"
    });
  }
});

/**
 * USE: Update Event with a File
 * METHOD: PATCH
 * QUERY STRING: username - allDay (yes / no)
 * URL PARAMETER: eventId
 * POST DATA: title - desc - startDate - endDate - file
 * FULL URL: http://localhost:3000/events/file/1?username=GhanimAdmin&allDay=yes
 */
router.patch("/file/:eventId", upload.single("file"), (req, res) => {
  // get username from query string
  const { username, allDay } = req.query;

  // get event id parameter
  const eventId = req.params.eventId;

  // get post data
  const { title, desc, startDate, endDate } = req.body;

  // construct a file url
  const file = `${req.protocol}://${req.get("host")}/ftp/${req.file.filename}`;

  // get MySQL connection
  const connection = req.app.get("dbConnection");

  if (username && eventId && allDay) {
    // check for all day query string
    let allDayStatus = 0;
    allDay === "yes" ? (allDayStatus = 1) : (allDayStatus = 0);

    // insert data into database
    connection.query(
      {
        sql:
          "UPDATE `EVENT_MST` SET `MST_TITLE` = ?, `MST_DESC` = ?, `MST_FILE` = ?, `MST_START` = ?, `MST_END` = ?, `MST_ALLDAY` = ? WHERE `EMP_USERNAME` = ? AND `MST_ID` = ? AND `MST_STATUS` = 1",
        values: [
          title,
          desc,
          file,
          startDate,
          endDate,
          allDayStatus,
          username.toUpperCase(),
          eventId
        ]
      },
      (err, results, fields) => {
        if (err) {
          res.json({
            status: "error",
            message: "حدث خطأ اثناء تعديل المهمة",
            results: err.message
          });
        } else {
          if (results.changedRows === 0) {
            res.json({
              status: "success",
              message: "لم يتم إجراء اي تعديل",
              results: {
                eventId,
                title,
                desc,
                file,
                start: startDate,
                end: endDate,
                allDay,
                username: username.toUpperCase()
              }
            });
          } else {
            res.json({
              status: "success",
              message: "تم تعديل المهمة بنجاح",
              results: {
                eventId,
                title,
                desc,
                file,
                start: startDate,
                end: endDate,
                allDay,
                username: username.toUpperCase()
              }
            });
          }
        }
      }
    );
  } else {
    res.status(400).json({
      status: "error",
      message: "لا يمكن إتمام طلب التعديل على المهمة"
    });
  }
});

// export router
module.exports = router;
