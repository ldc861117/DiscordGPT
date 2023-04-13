const fetch = require("node-fetch");
const WebSocket = require("ws");
// Initialize the Discord bot client
const Discord = require('discord.js')
const client = new Discord.Client()

const ws = new WebSocket("wss://chatapi.andylyu.com/chat");
let requestId = 0;
let messageQueue = {};

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (message) => {
  if (message.author.bot) return;

  const text = message.content;
  const request = {
    id: requestId++,
    object: "text",
    created: Date.now(),
    text: text,
    model: "gpt-3.5-turbo-0301",
  };
  messageQueue[request.id] = {
    originalMessage: message,
    chunks: [],
  };

  ws.send(JSON.stringify(request));
});

ws.on("message", (data) => {
  const message = JSON.parse(data);

  if (message.object === "chat.completion.chunk") {
    const choices = message.choices;
    if (choices && choices.length > 0) {
      const lastChoice = choices[choices.length - 1];
      const id = message.id;
      messageQueue[id].chunks.push(lastChoice.delta.content);

      if (lastChoice.finish_reason === "stop") {
        const botResponse = messageQueue[id].chunks.join("");
        const originalMessage = messageQueue[id].originalMessage;
        originalMessage.channel.send(botResponse);
        delete messageQueue[id];
      }
    }
  } else if (message === "[DONE]") {
    ws.close();
  }
});

ws.on("close", () => {
  console.log("WebSocket closed");
});

// Connect the bot to Discord using your bot token
client.login('MTA5NTk1MzAxNDgzNTEzODYyMA.GglmMS.EMHVojF7O_gUMyS_xht42kB9XfOcz-ARffEGNg')
