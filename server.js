const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const mongoStore = require('connect-mongo')(session)
const formatMessage = require('./utils/messages')

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, { debug: true });


//passport
require('./config/passport')(passport)
//db config
const db = require("./config/keys").MongoURI;

// connect to db
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((err) => {
    console.log(err);
  });

//body-parser
app.use(express.urlencoded({ extended: false }));

//express session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  store: new mongoStore({mongooseConnection: mongoose.connection})
}))

//passport middleware
app.use(passport.initialize());
app.use(passport.session());


//connect flash
app.use(flash())

//global variables
app.use((req,res,next)=>{
res.locals.success_msg = req.flash('success_msg')
res.locals.error_msg = req.flash('error_msg')
res.locals.error = req.flash('error')
next()
})

app.use(expressLayouts);

//set view engine
app.set("view engine", "ejs");

//static files
app.use(express.static("public"));

app.use("/peerjs", peerServer);

app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    // join a specfic room with the roomid
    socket.join(roomId);
    //tell that a user is connected
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("message", (message) => {
      // send that message back to the same room
      io.to(roomId).emit("createMessage", message);
      
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("server connected");
});
