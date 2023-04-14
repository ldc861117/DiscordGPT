require('dotenv/config');
const axios = require('axios');
const { Client, IntentsBitField } = require('discord.js')


const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', () => {
  console.log('The bot is online!');
});

client.on("messageCreate", async (message) => {
  // Create a console log for each message
  console.log(
    `Message received: ${message.content} from ${message.author.username}`
  );
  if (message.author.bot) return;
  if (message.channel.id !== process.env.CHANNEL_ID) return;
  if (message.content.startsWith("!")) return;

  let conversationLog = [
    { role: "system", content: "You are a friendly chatbot." },
  ];

  try {
    await message.channel.sendTyping();

    let prevMessages = await message.channel.messages.fetch({ limit: 15 });
    prevMessages.reverse();

    prevMessages.forEach((msg) => {
      if (message.content.startsWith("!")) return;
      if (msg.author.id !== client.user.id && message.author.bot) return;
      if (msg.author.id !== message.author.id) return;

      conversationLog.push({
        role: "user",
        content: msg.content,
      });
    });

    const backendUrl = "http://chatapi.andylyu.com/chat"; // Replace with your backend URL

    try {
      // Start axios request to backend print to console
      console.log("Sending request to backend...");
      const response = await axios.post(backendUrl, {
        messages: conversationLog,
      });

      const data = response.data;
      let botResponse = "";

      data.forEach((item) => {
        if (item.choices && item.choices[0].delta.content) {
          botResponse += item.choices[0].delta.content;
          // Print to console
          console.log(`Bot response: ${botResponse}`);
        }
      });

      message.reply(botResponse);
    } catch (error) {
      console.error(`Backend ERR: ${error.message}`);
    }
  } catch (error) {
    console.log(`ERR: ${error}`);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);