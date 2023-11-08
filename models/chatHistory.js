const mongoose = require("mongoose");


const ChatSchema = mongoose.Schema({
  username: String,
  message: String,
});

const ChatHistory = mongoose.model("chat_history", ChatSchema);
  
  module.exports = ChatHistory;