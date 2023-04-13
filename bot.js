// Initialize the Discord bot client
const Discord = require('discord.js')
const client = new Discord.Client()

// Listen for the 'ready' event and log a message
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

// Listen for the 'message' event and call your backend
client.on('message', async message => {
  const text = message.content
  const response = await fetch('localhost/chat:12345', { body: { text } })
  const data = await response.json()
  message.channel.send(data.message)
})

// Connect the bot to Discord using your bot token
client.login('MTA5NTk1MzAxNDgzNTEzODYyMA.GglmMS.EMHVojF7O_gUMyS_xht42kB9XfOcz-ARffEGNg')
