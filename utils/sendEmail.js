const nodemailer = require("nodemailer");

const sendEmailTo = async (options) => {
  // Create a transporter  , the specified email service and authentication credentials like gmail.
  const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: process.env.PORT_SECURE,
    secure: true,
    auth: {
      user: process.env.EMAIl,
      pass: process.env.PASSWORD,
    },
  });

  // Define the mail options for sending the email.
  const mailOptions = {
    from: `Ahmed Shop App <${process.env.EMAIL}>`,
    to: options.email,
    subject: options.subject,
    // try sending html
    text: options.message,
  };

  // Send the email using the transporter and mail options.
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmailTo;
