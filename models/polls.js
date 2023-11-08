const mongoose = require("mongoose");


const PollsSchema = mongoose.Schema({
  Question: String,
  options: [
    {
        id : Number,
        text : String,
        votes : Number,
    }
  ]
});

const Poll = mongoose.model("poll", PollsSchema);
  
  module.exports = Poll;