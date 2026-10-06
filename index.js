const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName('bloxkz')
    .setDescription('Mostra informações sobre o bot da Bloxkz.')
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

client.once('ready', async () => {
  console.log(`Bloxkz Bot online como ${client.user.tag}`);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );

    console.log('Comando /bloxkz registrado!');
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'bloxkz') {
    await interaction.reply(
      '🍎 **Bloxkz Bot**\n🤖 Bot oficial da Bloxkz está online! 💙'
    );
  }
});

client.login(process.env.DISCORD_TOKEN);
