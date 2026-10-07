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
  ['dragon', '🐉 Dragon', 50.00, 1],
  ['kitsune', '🦊 Kitsune', 20.00, 1],
  ['magnet', '🧲 Magnet', 45.00, 1],
  ['tiger', '🐯 Tiger', 10.00, 1],
  ['yeti', '🥶 Yeti', 9.00, 2],
  ['control', '🎛️ Control', 12.00, 1],
  ['gas', '💨 Gas', 6.50, 1],
  ['dough', '🍩 Dough', 4.00, 1],
  ['venom', '☠️ Venom', 5.00, 2],
  ['spirit', '👻 Spirit', 4.00, 1],
  ['shadow', '🌑 Shadow', 2.00, 2],
  ['gravity', '🪐 Gravity', 2.50, 2]
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
              .setDescription('Clique para ver preço e estoque')
          )
        );

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        content:
          '🍎 **ESTOQUE BLOXKZ**\n\n' +
          'Selecione uma fruta abaixo para consultar preço e disponibilidade. 💙',
        components: [row]
      });
    }
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'fruit_select') {

      const selectedFruit = fruits.find(
        fruit => fruit[0] === interaction.values[0]
      );

      if (!selectedFruit) return;

      const [id, name, price, stock] = selectedFruit;

      const status = stock > 0
        ? `🟢 ${stock} unidade${stock > 1 ? 's' : ''} disponível${stock > 1 ? 'eis' : ''}`
        : '🔴 Sem estoque';

      await interaction.reply({
        content:
          `🍎 **${name}**\n\n` +
          `💰 **Preço:** R$ ${price.toFixed(2).replace('.', ',')}\n` +
          `📦 **Estoque:** ${status}`,
        ephemeral: true
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
