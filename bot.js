require("dotenv/config");
const EventSource = require('eventsource');
const axios = require("axios");
const { Client, IntentsBitField, resolveColor } = require("discord.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", () => {
  console.log("The bot is online!");
});

client.on("messageCreate", async (message) => {
  
  const username = message.author.username;
  
  if (message.author.bot) return;

  let conversationLog = [
    { role: "system", content: "You are a friendly chatbot." },
  ];
  conversationLog.push({ role: "user", content: message.content });
  await message.channel.sendTyping();

  try {
    async function fetchReply(conversationLog) {
      console.log("Fetching reply...");
      const response = await axios.post(
        "http://chatapi.andylyu.com:12345/chat",
        { 
          messages: conversationLog,
          username: username,
          stream: false, 
        },
        { 
          headers: { "Content-Type": "application/json" } 
        },
      );
  
      const botReply = response.data.content;
  
      return botReply;
    }
  
    const result = await fetchReply(conversationLog);
    message.reply(result);
  } catch (error) {
    console.error(`Backend ERR: ${error.message}`);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);