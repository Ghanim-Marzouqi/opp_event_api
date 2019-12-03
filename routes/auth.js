// import dependancies
const router = require("express").Router();

/**
 * USE: Authenticate Users
 * METHOD: POST
 * QUERY STRING: type => (ad = Active Directory) - (db = Database)
 * POST DATA: username - password
 * FULL URL: http://localhost:3000/auth?type=db
 */
router.post("/", (req, res) => {
  // get authentication type => type = ad (ActiveDirectory), type = db (Database)
  const authType = req.query.type;
  const { username, password } = req.body;

  // get Active Directory and MySQL instances
  const ad = req.app.get("AD");
  const connection = req.app.get("dbConnection");

  if (authType) {
    if (authType === "ad") {
      // Active Directory method is used
      ad.authenticate(`${username}@opphq.gov`, password, (err, auth) => {
        if (err) {
          res.json({
            status: "error",
            message: "حدث خطأ في Active Directory",
            results: `AD ERROR: ${JSON.stringify(err)}`
          });
        }

        if (auth) {
          // fetch all user data
          ad.findUser(username, (err, user) => {
            if (err) {
              res.json({
                status: "error",
                message: "حدث خطأ في Active Directory",
                results: `AD ERROR: ${JSON.stringify(err)}`
              });
            }

            if (!user) {
              res.json({
                status: "error",
                message: `اسم المستخدم ${username} غير موجود`,
                results: `AD ERROR: ${JSON.stringify(err)}`
              });
            } else {
              res.json({
                status: "success",
                message: "تم تسجيل الدخول بنجاح",
                results: user
              });
            }
          });
        }
      });
    } else if (authType === "db") {
      // Database method is used
      // fetch user from database
      connection.query(
        {
          sql:
            "SELECT * FROM `EMPLOYEES` WHERE EMP_USERNAME = ? AND EMP_PASSWORD = ?",
          values: [username.toUpperCase(), password]
        },
        (err, results, fields) => {
          if (err) {
            res.json({
              status: "error",
              message: "حدث خطأ اثناء تسجيل الدخول",
              results: err.message
            });
          } else {
            if (results.length === 0) {
              res.json({
                status: "error",
                message: "اسم المستخدم او كلمة المرور غير صحيحة",
                results
              });
            } else {
              // create new array of users
              const users = results.map(e =>
                JSON.parse(
                  JSON.stringify({
                    username: e.EMP_USERNAME,
                    password: e.EMP_PASSWORD,
                    name: e.EMP_NAME,
                    email: e.EMP_EMAIL,
                    department: e.EMP_DEPR
                  })
                )
              );

              res.json({
                status: "success",
                message: "تم تسجيل الدخول بنجاح",
                results: users
              });
            }
          }
        }
      );
    } else {
      // unknown method
      res.status(400).json({
        status: "error",
        message: "لا يمكن التعرف على نوع طريقة تسجيل الدخول"
      });
    }
  } else {
    // method is undefined
    res.status(400).json({
      status: "error",
      message: "لا يمكن التعرف على نوع طريقة تسجيل الدخول"
    });
  }
});

// export router
module.exports = router;
