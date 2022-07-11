const { channel } = require("diagnostics_channel");
const Discord = require("discord.js");
let process = require('process');
let fetch = require('node-fetch')
const Jimp = require('jimp');
const fs = require("fs")
const { MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const os = require("os");
let commands = [] 
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
var crg = require('country-reverse-geocoding').country_reverse_geocoding();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
require('dotenv').config();
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES", "DIRECT_MESSAGE_TYPING", "GUILD_VOICE_STATES", "GUILD_PRESENCES", "GUILD_MEMBERS", "GUILD_INVITES"], partials: ["CHANNEL", "SEND_TTS_MESSAGES"] });
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus, createAudioPlayer, AudioResource, StreamType, play, getVoiceConnection } = require('@discordjs/voice');
const audioPlayer = createAudioPlayer();
var date;
var hour;
var minute;
var second;
var day;
var month;
var year;
var ttscountry;
var ttscountryb4;
var player = 1;

let filesNames = [
  "not a file lol",
  "x.mp3",
  "x.mp3",
  "x.mp3",
  "x.mp3",
  "x.mp3",
  "x.mp3",
  "x.mp3",
  "x.mp3",
  "x.mp3",
  "x.mp3",
  "x.mp3",
  "x.mp3"
];
client.on("ready", (client) => {
  setTime();
  let channel = client.guilds.cache.get("guild id").channels.cache.get("voice channel id");
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  conexaoaudio = connection;
  connection.subscribe(audioPlayer);
  setTimeout(checkiss, 2000);
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
  }
  
  const rest = new REST({ version: '9' }).setToken(process.env.DISCORDTOKEN);
  
  (async () => {
    try {
      console.log('Reloading slash commands');
  
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, "962500257986514975"),
        { body: commands },
      );
  
      console.log('Successfully reloaded slash commands.');
    } catch (error) {
      console.error(error);
    }
  })();
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


  if (msg.content.toLocaleLowerCase() == "!iss") {
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
        if (country == null) {
          embediss.addFields(
            { name: 'Country', value: "Not on any country" },
          )
        } else {
          embediss.addFields(
            { name: 'Country', value: country.name },
          )
        }
        msg.channel.send({ embeds: [embediss] });
      })
  }

  if (msg.content.toLocaleLowerCase() == "!whosthere") {
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
        for (var i = 0; i < astroInfo.people.length; i++) {
          embedastro.addFields(
            { name: astroInfo.people[i].name, value: astroInfo.people[i].craft },
          )
        }
        msg.channel.send({ embeds: [embedastro] });
      })
  }


  if (msg.content.toLocaleLowerCase() == "!apod") {
    fetch("https://api.nasa.gov/planetary/apod?api_key=" + process.env.NASAKEY)
      .then(function (apod) {
        return apod.json();
      })
      .then(function (apod) {
        var author;
        if (apod.copyright) {
          author = apod.copyright;
        } else {
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

  if (msg.content.toLowerCase().startsWith("$eval")) {
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
function checkiss() {
  fetch("http://api.open-notify.org/iss-now.json")
    .then(function (iss) {
      return iss.json();
    })
    .then(function (issInfo) {
      ttscountry = crg.get_country(parseInt(issInfo.iss_position.latitude), parseInt(issInfo.iss_position.longitude));
      if (ttscountry) {
        ttscountry = ttscountry.name
      } else {
        ttscountry = "Ocean"
      }
      if (ttscountry != ttscountryb4) {
        ttscountryb4 = ttscountry;
        say();
      }
    })

  function say() {
    player = player - 1;
    const resource = createAudioResource("https://api.voicerss.org/?key=" + process.env.TTSKEY + "&hl=en-us&src=the iss is now at " + ttscountry, {
      inputType: StreamType.Arbitrary,
      inlineVolume: true,
      bitrate: 192000
    });
    audioPlayer.play(resource)
  }
  setTimeout(checkiss, 2000);
}
client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()){

	if (interaction.commandName === 'roles') {
		const a = new MessageActionRow()
      .addComponents(
       new MessageButton()
          .setCustomId("astronomia")
          .setLabel('Astronomy')
      )
      .addComponents(
        new MessageButton()
          .setCustomId("astrofisica")
          .setLabel('Astrophysics')
      )
      .addComponents(
        new MessageButton()
          .setCustomId("astroquimica")
          .setLabel('Astrochemistry')
      )
      .addComponents(
        new MessageButton()
          .setCustomId("matematica")
          .setLabel('Math')
      )
      .addComponents(
        new MessageButton()
          .setCustomId("programacao")
          .setLabel('Programming')
      );
      const b = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId("astrobiologia")
          .setLabel('Astrobiology')
      )
      .addComponents(
        new MessageButton()
          .setCustomId("cosmologia")
          .setLabel('Cosmology')
      )
      .addComponents(
        new MessageButton()
          .setCustomId("astrogeologia")
          .setLabel('Astrogeology')
      )
      .addComponents(
        new MessageButton()
          .setCustomId("design")
          .setLabel('Design')
      )
      .addComponents(
        new MessageButton()
          .setCustomId("eventos")
          .setLabel('Events Ping')
      );
      const c = new MessageActionRow()
      .addComponents(
       new MessageButton()
          .setCustomId("apod")
          .setLabel('APOD Ping')
      )
      let arole = interaction.guild.roles.cache.get("975584883126714458");
      let brole = interaction.guild.roles.cache.get("975584929926754334");
      let crole = interaction.guild.roles.cache.get("975585034683711520");
      let drole = interaction.guild.roles.cache.get("975585110453801070");
      let erole = interaction.guild.roles.cache.get("975585313202249759");
      let frole = interaction.guild.roles.cache.get("975585804338495498");
      let grole = interaction.guild.roles.cache.get("975585939319570452");
      let hrole = interaction.guild.roles.cache.get("975587764236066916");
      let irole = interaction.guild.roles.cache.get("975589565517684737");
      let jrole = interaction.guild.roles.cache.get("975603767783325716");
      let krole = interaction.guild.roles.cache.get("962583936901459988");
      let user = interaction.guild.members.cache.get(interaction.user.id);
      if (!user.roles.cache.some(role => role.id === arole.id)) {
      a.components[0].setStyle("SUCCESS")
    } else {
      a.components[0].setStyle("DANGER")
    }
    if (!user.roles.cache.some(role => role.id === brole.id)) {
      a.components[1].setStyle("SUCCESS")
    } else {
      a.components[1].setStyle("DANGER")
    }
    if (!user.roles.cache.some(role => role.id === crole.id)) {
      a.components[2].setStyle("SUCCESS")
    } else {
      a.components[2].setStyle("DANGER")
    }
    if (!user.roles.cache.some(role => role.id === drole.id)) {
      a.components[3].setStyle("SUCCESS")
    } else {
      a.components[3].setStyle("DANGER")
    }
    if (!user.roles.cache.some(role => role.id === erole.id)) {
      a.components[4].setStyle("SUCCESS")
    } else {
      a.components[4].setStyle("DANGER")
    }
    if (!user.roles.cache.some(role => role.id === frole.id)) {
      b.components[0].setStyle("SUCCESS")
    } else {
      b.components[0].setStyle("DANGER")
    }
    if (!user.roles.cache.some(role => role.id === grole.id)) {
      b.components[1].setStyle("SUCCESS")
    } else {
      b.components[1].setStyle("DANGER")
    }
    if (!user.roles.cache.some(role => role.id === hrole.id)) {
      b.components[2].setStyle("SUCCESS")
    } else {
      b.components[2].setStyle("DANGER")
    }
    if (!user.roles.cache.some(role => role.id === irole.id)) {
      b.components[3].setStyle("SUCCESS")
    } else {
      b.components[3].setStyle("DANGER")
    }
    if (!user.roles.cache.some(role => role.id === jrole.id)) {
      b.components[4].setStyle("SUCCESS")
    } else {
      b.components[4].setStyle("DANGER")
    }
    if (!user.roles.cache.some(role => role.id === krole.id)) {
      c.components[0].setStyle("SUCCESS")
    } else {
      c.components[0].setStyle("DANGER")
    }
   interaction.reply({ephemeral: true, components: [a, b, c]});
	}
}else{
  if (!interaction.isButton()) return;
  if (interaction.customId == "apod") {
    let apodrole = interaction.guild.roles.cache.get("962583936901459988");
    let user = interaction.guild.members.cache.get(interaction.user.id);
    if (!user.roles.cache.some(role => role.id === apodrole.id)) {
      user.roles.add(apodrole)
      interaction.component.setStyle("DANGER");
      interaction.update({
        components: interaction.message.components
    });
    } else {
      user.roles.remove(apodrole)
      interaction.component.setStyle("SUCCESS");
      interaction.update({
        components: interaction.message.components
    });
    }
  } else if (interaction.customId == "eventos") {
    let eventsrole = interaction.guild.roles.cache.get("975603767783325716");
    let user = interaction.guild.members.cache.get(interaction.user.id);
    if (!user.roles.cache.some(role => role.id === eventsrole.id)) {
      user.roles.add(eventsrole)
      interaction.component.setStyle("DANGER");
      interaction.update({
        components: interaction.message.components
    });
    } else {
      user.roles.remove(eventsrole)
      interaction.component.setStyle("SUCCESS");
      interaction.update({
        components: interaction.message.components
    });
    }
  } else if (interaction.customId == "astronomia") {
    let eventsrole = interaction.guild.roles.cache.get("975584883126714458");
    let user = interaction.guild.members.cache.get(interaction.user.id);
    if (!user.roles.cache.some(role => role.id === eventsrole.id)) {
      user.roles.add(eventsrole)
      interaction.component.setStyle("DANGER");
      interaction.update({
        components: interaction.message.components
    });
    } else {
      user.roles.remove(eventsrole)
      interaction.component.setStyle("SUCCESS");
      interaction.update({
        components: interaction.message.components
    });
    }
  }
  else if (interaction.customId == "astrofisica") {
    let eventsrole = interaction.guild.roles.cache.get("975584929926754334");
    let user = interaction.guild.members.cache.get(interaction.user.id);
    if (!user.roles.cache.some(role => role.id === eventsrole.id)) {
      user.roles.add(eventsrole)
      interaction.component.setStyle("DANGER");
      interaction.update({
        components: interaction.message.components
    });
    } else {
      user.roles.remove(eventsrole)
      interaction.component.setStyle("SUCCESS");
      interaction.update({
        components: interaction.message.components
    });
    }
  } else if (interaction.customId == "astroquimica") {
    let eventsrole = interaction.guild.roles.cache.get("975585034683711520");
    let user = interaction.guild.members.cache.get(interaction.user.id);
    if (!user.roles.cache.some(role => role.id === eventsrole.id)) {
      user.roles.add(eventsrole)
      interaction.component.setStyle("DANGER");
      interaction.update({
        components: interaction.message.components
    });
    } else {
      user.roles.remove(eventsrole)
      interaction.component.setStyle("SUCCESS");
      interaction.update({
        components: interaction.message.components
    });
    }
  } else if (interaction.customId == "matematica") {
    let eventsrole = interaction.guild.roles.cache.get("975585110453801070");
    let user = interaction.guild.members.cache.get(interaction.user.id);
    if (!user.roles.cache.some(role => role.id === eventsrole.id)) {
      user.roles.add(eventsrole)
      interaction.component.setStyle("DANGER");
      interaction.update({
        components: interaction.message.components
    });
    } else {
      user.roles.remove(eventsrole)
      interaction.component.setStyle("SUCCESS");
      interaction.update({
        components: interaction.message.components
    });
    }
  } else if (interaction.customId == "programacao") {
    let eventsrole = interaction.guild.roles.cache.get("975585313202249759");
    let user = interaction.guild.members.cache.get(interaction.user.id);
    if (!user.roles.cache.some(role => role.id === eventsrole.id)) {
      user.roles.add(eventsrole)

      interaction.component.setStyle("DANGER");
      interaction.update({
        components: interaction.message.components
    });
    } else {
      user.roles.remove(eventsrole)
      interaction.component.setStyle("SUCCESS");
      interaction.update({
        components: interaction.message.components
    });
    }
  } else if (interaction.customId == "astrobiologia") {
    let eventsrole = interaction.guild.roles.cache.get("975585804338495498");
    let user = interaction.guild.members.cache.get(interaction.user.id);
    if (!user.roles.cache.some(role => role.id === eventsrole.id)) {
      user.roles.add(eventsrole)
      interaction.component.setStyle("DANGER");
      interaction.update({
        components: interaction.message.components
    });
    } else {
      user.roles.remove(eventsrole)
      interaction.component.setStyle("SUCCESS");
      interaction.update({
        components: interaction.message.components
    });
    }
  } else if (interaction.customId == "cosmologia") {
    let eventsrole = interaction.guild.roles.cache.get("975585939319570452");
    let user = interaction.guild.members.cache.get(interaction.user.id);
    if (!user.roles.cache.some(role => role.id === eventsrole.id)) {
      user.roles.add(eventsrole)
      interaction.component.setStyle("DANGER");
      interaction.update({
        components: interaction.message.components
    });
    } else {
      user.roles.remove(eventsrole)
      interaction.component.setStyle("SUCCESS");
      interaction.update({
        components: interaction.message.components
    });
    }
  } else if (interaction.customId == "astrogeologia") {
    let eventsrole = interaction.guild.roles.cache.get("975587764236066916");
    let user = interaction.guild.members.cache.get(interaction.user.id);
    if (!user.roles.cache.some(role => role.id === eventsrole.id)) {
      user.roles.add(eventsrole)
      interaction.component.setStyle("DANGER");
      interaction.update({
        components: interaction.message.components
    });
    } else {
      user.roles.remove(eventsrole)
      interaction.component.setStyle("SUCCESS");
      interaction.update({
        components: interaction.message.components
    });
    }
  } else if (interaction.customId == "design") {
    let eventsrole = interaction.guild.roles.cache.get("975589565517684737");
    let user = interaction.guild.members.cache.get(interaction.user.id);
    if (!user.roles.cache.some(role => role.id === eventsrole.id)) {
      user.roles.add(eventsrole)
      interaction.component.setStyle("DANGER");
      interaction.update({
        components: interaction.message.components
    });
    } else {
      user.roles.remove(eventsrole)
      interaction.component.setStyle("SUCCESS");
      interaction.update({
        components: interaction.message.components
    });
    }
  }
}
});




function apod() {
  fetch("https://api.nasa.gov/planetary/apod?api_key=" + process.env.NASAKEY)
    .then(function (apod) {
      return apod.json();
    })
    .then(function (apod) {
      var author;
      if (apod.copyright) {
        author = apod.copyright;
      } else {
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
      a.send({ content: "<@&962583936901459988>", embeds: [embedapod] });
    })



}

client.login(process.env.DISCORDTOKEN);

audioPlayer.on(AudioPlayerStatus.Idle, () => {
  if(player < 12){
  player++;
  }else{
    player = 1;
  }
  const resource = createAudioResource(__dirname + "/assets/songs/" + filesNames[player], {
    inputType: StreamType.Arbitrary,
    inlineVolume: true,
    bitrate: 192000
  });
  audioPlayer.play(resource)
});


client.on('guildMemberAdd', function (member) {
  console.log(member)
  var role = member.guild.roles.cache.find(role => role.name === "Astronauta(o)");
  member.roles.add(role)
  let c = member.guild.channels.cache.find(c => c.name.toLowerCase() === "entrada");
  if (c) {
    overlay()
    async function overlay() {
      const image = await Jimp.read(__dirname + "/assets/base.png");
      const mask = await Jimp.read(__dirname + "/assets/mask.png");
      const avatar = await Jimp.read("https://cdn.discordapp.com/avatars/" + member.id + "/" + member.user.avatar + ".png")
      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
      var h = image.bitmap.height;
      var w = image.bitmap.width;
      avatar.resize(200, 200)
      avatar.mask(mask)
      image.print(font, 0, 30, { text: "Welcome", alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, }, w, h)
      image.blit(avatar, 260, 105);
      image.print(font, 0, 340, { text: member.user.tag, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, }, w, h)
      await image.writeAsync(__dirname + "/assets/welcome.png").then(() => {
        c.send({ content: "<@" + member.id + ">", files: [__dirname + "/assets/welcome.png"] })
      })
    }
  }
})

client.on('guildMemberRemove', function (member) {
  console.log(member)
  let c = member.guild.channels.cache.find(c => c.name.toLowerCase() === "saida");
  if (c) {
    const embedleft = new Discord.MessageEmbed()
      .setColor("#00FFFF")
      .setTitle("Saída")
      .setAuthor(member.user.tag + " Saiu da nave!", "https://cdn.discordapp.com/avatars/" + member.id + "/" + member.user.avatar + ".png")
      .setTimestamp()
    c.send({ embeds: [embedleft] })
  }
})
