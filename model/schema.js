const mongoose = require("mongoose");

// initialize Schema
const empolyeeSchema = new mongoose.Schema({
  name: String,
  password: String,
  email: {
    type: String,
    unique: true,
  },
});

// creating Schema

const Empolyee = new mongoose.model("Empolyees", empolyeeSchema);

module.exports = Empolyee;
