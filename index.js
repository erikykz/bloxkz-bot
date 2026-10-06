const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
  console.log(`Bloxkz Bot online como ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
