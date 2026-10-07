const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const fruits = [
  ['dragon', '🐉 Dragon'],
  ['kitsune', '🦊 Kitsune'],
  ['magnet', '🧲 Magnet'],
  ['tiger', '🐯 Tiger'],
  ['yeti', '🥶 Yeti'],
  ['control', '🎛️ Control'],
  ['gas', '💨 Gas'],
  ['trex', '🦖 T-Rex'],
  ['dough', '🍩 Dough'],
  ['venom', '☠️ Venom'],
  ['spirit', '👻 Spirit'],
  ['mammoth', '🦣 Mammoth'],
  ['shadow', '🌑 Shadow'],
  ['gravity', '🪐 Gravity']
];

const commands = [
  new SlashCommandBuilder()
    .setName('bloxkz')
    .setDescription('Abre o painel de frutas da Bloxkz.')
    .toJSON()
];

client.once('clientReady', async () => {
  console.log(`Bloxkz Bot online como ${client.user.tag}`);

  const rest = new REST({ version: '10' })
    .setToken(process.env.DISCORD_TOKEN);

  try {
    for (const guild of client.guilds.cache.values()) {
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, guild.id),
        { body: commands }
      );

      console.log(`Comando /bloxkz registrado no servidor ${guild.name}!`);
    }
  } catch (error) {
    console.error('Erro ao registrar comando:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'bloxkz') {

      const menu = new StringSelectMenuBuilder()
        .setCustomId('fruit_select')
        .setPlaceholder('🍎 Escolha uma fruta')
        .addOptions(
          fruits.map(([value, label]) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(label.replace(/^.{2} /, ''))
              .setValue(value)
          )
        );

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        content:
          '🍎 **ESTOQUE BLOXKZ**\n\n' +
          'Selecione uma fruta abaixo para consultar disponibilidade e preço. 💙',
        components: [row]
      });
    }
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'fruit_select') {
      const selectedFruit = fruits.find(
        fruit => fruit[0] === interaction.values[0]
      );

      await interaction.reply({
        content: `🍎 **${selectedFruit[1]}**\n\n💰 Preço: em breve\n📦 Estoque: em breve`,
        ephemeral: true
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
