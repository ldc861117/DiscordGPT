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
  console.log(
    `Message received: ${message.content} from ${message.author.username}`
  );
  if (message.author.bot) return;

  let conversationLog = [
    { role: "system", content: "You are a friendly chatbot." },
  ];
  conversationLog.push({ role: "user", content: message.content });
  await message.channel.sendTyping();
  //const backendUrl = "http://chatapi.andylyu.com/chat";

  try {
    async function fetchReply(conversationLog) {
      const response = await axios.post(
        'http://chatapi.andylyu.com/chat',
        JSON.stringify({ messages: conversationLog }),
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      let botReply = '';
  
      if (typeof response.data === 'string') {
        response.data.split('\n').forEach((line) => {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data !== '[DONE]') {
              botReply += data;
            }
          }
        });
      }
  
      return botReply;
    }
  
    const result = await fetchReply(conversationLog);
    message.reply(result);
  } catch (error) {
    console.error(`Backend ERR: ${error.message}`);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);