const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const mongoose = require("mongoose")
const User = require('./models/users')
//pipeline and middleware
const router = express.Router();
const Auth = require('./middleware/auth')
const Token = require('./service/token')
const Poll = require('./models/polls');

const app = express();
const server = http.createServer(app);
const io = socketIo(server,{
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
app.use(cors({
  origin: '*'
}));
app.use(express.json());
const dbUrl = "mongodb+srv://mukulOmer:9044%40Mukul@cluster0.resqjyw.mongodb.net/project1?retryWrites=true&w=majority";
mongoose
  .connect(dbUrl)
  .then(() => console.log("connect to database"))
  .catch((err) => console.log("exception occured", err));


const chatMessages = [];

io.on('connection', (socket) => {
  console.log('Client connected',socket.id);

  socket.emit('chatMessages', chatMessages);

  socket.on('vote',async (pollId,optionId) => {
    try {
      const poll = await Poll.findById(pollId);
      console.log("poll data",poll);
      poll.options[optionId].votes++;
      await poll.save();
     let polls = await Poll.find({});
      io.emit('pollOptions', polls);
    } catch (error) {
      console.error('Error updating poll:', error);
    }
  });

  socket.on('type',(username)=>{
  io.emit('onType',username) 
  })

  socket.on('chatMessage', (data) => {
    console.log("chatMessage",data)
    chatMessages.push({username: data.username ,message:data.message });
    io.emit('chatMessages', chatMessages);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.post("/api/sign_in", async (req, res) => {
  try{
  const {email,password} = req.body;
  if(!email || !password)
  {
    return res.send({
      status: false,
      data: '',
      message: 'all fields are mandatory'
    }) 
  }
  let user = await User.findOne({email,password})
  if(!user)
  return res.send({
    status: false,
    message : 'email or password is wrong please try again'
  });

  let token = Token.generateToken(user._id);
  user.token = token;
  await user.save();
   
  res.send({
    status : true,
    data : user,
    message: 'success'
  });
  return;
  }
  catch(error)
  {
    console.log(error);
  }
});

app.post("/api/sign_up", async (req, res) => {
  try {
  const {email,username,password} = req.body;
  if(!email || !username,!password)
  {
    return res.send({
      status: false,
      data: '',
      message: 'all fields are mandatory'
    }) 
  }
  let user = await User.findOne({email})
  if(user)
  {
    return res.send({
    status: false,
    data: '',
    message: 'user is already exist'
  })
}

  user = new User({email,username,password});
  
  let token = Token.generateToken(user._id);
  user.token = token;
  console.log("user",token)

  await user.save();
  return res.send({
    status: true,
    data : user,
    message: 'success'
  });
  }
  catch(error)
  {
    console.log(error);
  }
});


app.get('/api/polls', async (req, res) => {
  const polls = await Poll.find({});
  res.json(polls);
});

// Vote on a poll
app.post('/api/polls/:id/vote', async (req, res) => {
  const { id } = req.params;
  const { optionIndex } = req.body;

  try {
    const poll = await Poll.findById(id);
    poll.votes[optionIndex]++;
    await poll.save();
    res.json(poll);
  } catch (error) {
    res.status(404).json({ error: 'Poll not found' });
  }
});

server.listen(3001, () => {
  console.log('Server listening on port 3001');
});
