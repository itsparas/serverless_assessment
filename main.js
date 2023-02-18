const connectDB = require("./config/db");
const Empolyee = require("./model/schema");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

connectDB();

module.exports.createEmployee = async (event) => {
  try {
    const parsedEmpolyeData = JSON.parse(event.body);
    const { name, email, password } = parsedEmpolyeData;

    const saltRound = process.env.SALTROUND;
    const hashedPassword = await bcrypt.hash(password, Number(saltRound));

    const employee = new Empolyee({
      name,
      password: hashedPassword,
      email,
    });
    const empoly = await employee.save();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "user saved",
        data: empoly,
      }),
    };
  } catch (error) {
    return {
      statusCode: 501,
      body: JSON.stringify({
        message: error.message,
      }),
    };
  }
};

module.exports.loginEmployee = async (event) => {
  try {
    const parsedEmpolyeData = JSON.parse(event.body);

    const { email, password } = parsedEmpolyeData;
    const empolyee = await Empolyee.findOne({ email });
    console.log(empolyee);
    const key = process.env.KEY;
    let token;

    const result = bcrypt.compare(password, empolyee.password);

    if (result) {
      token = jwt.sign({ email, password, id: empolyee._id }, key);
      console.log(token);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "token genarated",
          token,
        }),
      };
    } else {
      return {
        statusCode: 501,
        body: JSON.stringify({
          message: "invalid password",
        }),
      };
    }
  } catch (error) {
    return {
      statusCode: 501,
      body: JSON.stringify({
        message: error.message,
      }),
    };
  }
};

module.exports.sentMailafterSubmit = async (event) => {
  try {
    const key = process.env.KEY;

    const { token } = JSON.parse(event.body);

    const decoded = jwt.verify(token, key);

    const fromEmail = process.env.from;
    const mailPassword = process.env.password;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: fromEmail,
        pass: mailPassword,
      },
    });

    let info = await transporter.sendMail({
      from: fromEmail,
      to: decoded.email,
      subject: "welcome to inzint",
      html: `<b>welcome to inzint</b>`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "email sent succesfully",
        info: info.messageId,
      }),
    };
  } catch (error) {
    return {
      statusCode: 501,
      body: JSON.stringify({
        message: error.message,
      }),
    };
  }
};
