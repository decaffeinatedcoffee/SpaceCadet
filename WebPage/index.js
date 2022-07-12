var express = require('express');
var app = express();
const Keyv = require('keyv');
let path = require("path")
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use("/assets",express.static(path.join(__dirname, 'assets')));
let process = require('process');
require('dotenv').config();
const keyv = new Keyv(process.env.MONGODB);
keyv.on('error', err => console.log('Connection Error', err));
app.set("view engine", "ejs");




app.get("/", async function(req,res){
    let waitlist = await keyv.get("waiting");
    if(!waitlist){
        waitlist = 0;
       }
    res.render("index",{"waiting":waitlist})
})

app.post("/waitlist", async function(req,res){
    let json = req.body;
    if(json.waiting == true){
   let waitlist = await keyv.get("waiting");
   if(!waitlist){
    waitlist = 0;
   }
   keyv.set("waiting", parseInt(waitlist)+1);
    }
})
app.listen(process.env.PORT) 