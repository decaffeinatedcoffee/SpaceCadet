const { channel } = require("diagnostics_channel");
const Discord = require("discord.js");
let process = require('process');
let fetch = require('node-fetch')
const { MessageActionRow, MessageButton} = require('discord.js');
const os = require("os");
var express = require('express');
var crg = require('country-reverse-geocoding').country_reverse_geocoding();
var app = express();
var cors = require('cors');
require('dotenv').config();
app.use(express.json());
app.use(cors());
var app = express();
app.set("view engine", "ejs");
const http = require('http');
const server = http.createServer(app);
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES", "DIRECT_MESSAGE_TYPING", "GUILD_VOICE_STATES", "GUILD_PRESENCES", "GUILD_MEMBERS", "GUILD_INVITES"], partials: ["CHANNEL", "SEND_TTS_MESSAGES"] });
const Keyv = require('keyv');
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus, createAudioPlayer, AudioResource, StreamType, play, getVoiceConnection } = require('@discordjs/voice');
const audioPlayer = createAudioPlayer();
const keyv = new Keyv(process.env.MONGODB);
keyv.on('error', err => console.error('Keyv connection error:', err));
var date;
var hour;
var minute;
var second;
var day;
var month;
var year;

client.on("ready", (client) => {
setTime();  
keepBotAlive();                   
});

function setTime() {
    let datebase = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
    date = new Date(datebase)
    hour = date.getHours();
    minute = date.getMinutes();
    second = date.getSeconds();
    day = date.getDate()
    month = date.getMonth() + 1;
    year = date.getFullYear()
    if (hour == 2 && minute == 0 && second == 10) {
      apod();
    }
    setTimeout(setTime, 1000)
  }

client.on("messageCreate", (msg) => {


    if(msg.content.toLocaleLowerCase() == "!iss"){
        fetch("http://api.open-notify.org/iss-now.json")
        .then(function (iss) {
          return iss.json();
        })
        .then(function (issInfo) {       
       var country = crg.get_country(parseInt(issInfo.iss_position.latitude), parseInt(issInfo.iss_position.longitude)); 
       const embediss = new Discord.MessageEmbed()
       .setColor('#05204a')
       .setTitle('ISS')
       .setDescription('The ISS is now at:')
       .addFields(
         { name: 'Latitude', value: issInfo.iss_position.latitude },
         { name: 'Longitude', value: issInfo.iss_position.longitude },
       )
       .setTimestamp()
       if(country == null){
        embediss.addFields(
        { name: 'Country', value: "Not on any country"},
        )
       }else{
        embediss.addFields(
            { name: 'Country', value: country.name},
            )
       }
              msg.channel.send({ embeds: [embediss] });
            })
    }

    if(msg.content.toLocaleLowerCase() == "!whosthere"){
        fetch("http://api.open-notify.org/astros.json")
        .then(function (astro) {
          return astro.json();
        })
        .then(function (astroInfo) {       
       const embedastro = new Discord.MessageEmbed()
       .setColor('#05204a')
       .setTitle('WHO?')
       .setDescription("Who's in space now?")
       .setTimestamp()
       for(var i = 0; i < astroInfo.people.length; i++){
           embedastro.addFields(
            { name: astroInfo.people[i].name, value: astroInfo.people[i].craft},            
           )
       }
              msg.channel.send({ embeds: [embedastro] });
            })
    }
    
    if(msg.content.toLocaleLowerCase() == "!apod"){
        fetch("https://api.nasa.gov/planetary/apod?api_key=" + process.env.NASAKEY)
        .then(function (apod) {
          return apod.json();
        })
        .then(function (apod) {       
        var author;
       if(apod.copyright){
       author = apod.copyright;
         }else{
         author = "NASA";
         }
       const embedapod = new Discord.MessageEmbed()
       .setTitle(apod.title)
       .setAuthor("Author: " + author, "")
       .setColor('#05204a')
       .setImage(apod.hdurl)
       .setDescription(apod.explanation)
       .setTimestamp()
              msg.channel.send({ embeds: [embedapod] });
            })
    }

    if (msg.content.toLowerCase().startsWith("eval")) {
      (async () => {
        if (msg.author.id == process.env.OWNERID) {
          var result = msg.content.split(" ").slice(1).join(" ");
          let evaled = await eval(result)
            .catch(function (err) {
              msg.reply("❌ Error! ```" + err + "```");
            })
        } else {
          msg.reply("❌ only the bot owner can use this!");
          console.log(msg.author.tag + " on " + msg.guild.name + " tried to use eval command!");
        }
      })()
    }
})

client.on('interactionCreate', interaction => {
	if (!interaction.isButton()) return;
	if(interaction.customId == "apod"){
    let apodrole = interaction.guild.roles.cache.get("962583936901459988");
    let user = interaction.guild.members.cache.get(interaction.user.id);
    if(!user.roles.cache.some(role => role.id === apodrole.id)){
    user.roles.add(apodrole)
    interaction.reply({ephemeral: true, content:"The role was added successfully!"});
    }else{
      user.roles.remove(apodrole)
      interaction.reply({ephemeral: true, content:"The role was removed successfully!"});
    }
  }
});

function apod(){
    fetch("https://api.nasa.gov/planetary/apod?api_key=" + process.env.NASAKEY)
        .then(function (apod) {
          return apod.json();
        })
        .then(function (apod) {       
        var author;
       if(apod.copyright){
       author = apod.copyright;
         }else{
         author = "NASA";
         }
       const embedapod = new Discord.MessageEmbed()
       .setTitle(apod.title)
       .setAuthor("Author: " + author, "")
       .setColor('#05204a')
       .setImage(apod.hdurl)
       .setDescription(apod.explanation)
       .setTimestamp()
          let a = client.channels.cache.get('962516472381452339');
             a.send({content:"<@&962583936901459988>",embeds: [embedapod] });
            })



}

client.login(process.env.DISCORDTOKEN);



app.get('/', function (req, res) {
  res.sendFile('index.html', {root: './WebPage'});
});


server.listen(process.env.PORT || 5000, () => {
  console.log("Listening Ports 5000 and " + process.env.PORT)
})

function keepBotAlive() {
  fetch('https://spacecadetproject.herokuapp.com/')  //////////////Its cause i need a worked dyno, but worker dynos cant handle web requests, i should fix it on next versions
  setTimeout(keepBotAlive, 600000)
}
