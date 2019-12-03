// import needed depandancies
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// add .env configuration
dotenv.config();

module.exports = () => {
  // create email transporter
  const transporter = nodemailer.createTransport({
    host: "mail.opp.gov.om",
    port: 25,
    secure: false,
    auth: {
      user: "GhanimAdmin",
      pass: "Ghanim@1"
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Name: Ghanim Salim Said Al Marzouqi</li>
      <li>Workplace: Oman Public Prosecution</li>
      <li>Email: GhanimAdmin@opp.gov.om</li>
      <li>Phone: +968 96132329</li>
    </ul>
    <h3>Message</h3>
    <p>Hello There</p>
  `;

  let mailOptions = {
    from: '"مهامي" <GhanimAdmin@opp.gov.om>', // sender address
    to: "HafNas@opp.gov.om", // list of receivers
    subject: "Test Email from Opp Event", // Subject line
    text: "Hello world", // plain text body
    html: null // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  });
};
