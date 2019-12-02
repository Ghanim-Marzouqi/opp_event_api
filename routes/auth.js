// import dependancies
const router = require("express").Router();

router.post("/", (req, res) => {

  // get authentication type => type = ad (ActiveDirectory), type = db (Database)
  const authType = req.query.type;
  const { username, password } = req.body;

  // get Active Directory and MySQL instances
  const ad = req.app.get('AD');
  const connection = req.app.get('dbConnection');

  if (authType) {
    if (authType === 'ad') { // Active Directory method is used
      ad.authenticate(`${username}@opphq.gov`, password, (err, auth) => {
        if (err) {
          res.json({
            status: 'error',
            message: 'حدث خطأ في Active Directory',
            results: `AD ERROR: ${JSON.stringify(err)}`
          });
        }

        if (auth) {
          // fetch all user data
          ad.findUser(username, (err, user) => {
            if (err) {
              res.json({
                status: 'error',
                message: 'حدث خطأ في Active Directory',
                results: `AD ERROR: ${JSON.stringify(err)}`
              });
            }

            if (!user) {
              res.json({
                status: 'error',
                message: `اسم المستخدم ${username} غير موجود`,
                results: `AD ERROR: ${JSON.stringify(err)}`
              });
            } else {
              res.json({
                status: 'success',
                message: 'تم تسجيل الدخول بنجاح',
                results: user
              });
            }
          });
        }
      });
    } else if (authType === 'db') { // Database method is used
      // fetch user from database
      connection.query(
        {
          sql: "SELECT * FROM `EMPLOYEES` WHERE EMP_USERNAME = ? AND EMP_PASSWORD = ?",
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
            if (results.length > 0) {
              res.json({
                status: "success",
                message: 'تم تسجيل الدخول بنجاح',
                results
              });
            } else {
              res.json({
                status: "error",
                message: "اسم المستخدم او كلمة المرور غير صحيحة",
                results
              });
            }
          }
        }
      );
    } else { // Unknown method
      res.status(400).json({
        status: 'error',
        message: 'لا يمكن التعرف على نوع طريقة تسجيل الدخول'
      });
    }
  } else {
    res.status(400).json({
      status: 'error',
      message: 'لا يمكن التعرف على نوع طريقة تسجيل الدخول'
    });
  }
});

// export router
module.exports = router;
