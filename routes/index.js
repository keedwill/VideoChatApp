const route = require("express").Router();
const { v4 } = require("uuid");
const {ensureAuth} = require('../config/auth')


let meetingId = v4()

route.get("/", (req, res) => {
    res.render('welcome')
  });

  route.get("/join", (req, res) => {
    res.render('join')
  });

  route.get("/dashboard", ensureAuth, (req, res) => {
    res.render('dashboard',{user:req.user})
  });

route.get("/room", (req, res) => {
  res.redirect(`/${meetingId}`);
});

route.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

route.post('/room',(req,res)=>{
  const id =  req.body.meeting_id
  res.redirect(`/${id}`)
  
})

module.exports = route;
