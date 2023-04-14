require("dotenv/config");
const EventSource = require('eventsource');
const axios = require("axios");
const { Client, IntentsBitField } = require("discord.js");

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
      const response = await axios.post('http://chatapi.andylyu.com/chat', {
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({ messages: conversationLog }),
      });
    
      let botReply = '';
      const stream = new ReadableStream({
        start(controller) {
          axios.interceptors.response.use((response) => {
            if (typeof response.data === 'string') {
              response.data.split('\n').forEach((line) => {
                controller.enqueue(line);
              });
            }
            return response;
          });
        },
      });
    
      const reader = stream.getReader();
      let result = await reader.read();
      while (!result.done) {
        const value = result.value;
        if (value.startsWith('data: ')) {
          const data = value.slice(6);
          if (data === '[DONE]') {
            break;
          } else {
            botReply += data;
          }
        }
        result = await reader.read();
      }
      return botReply;
    }

    const result = fetchReply(conversationLog);
    message.reply(result);
  } catch (error) {
    console.error(`Backend ERR: ${error.message}`);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);