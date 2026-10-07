const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const fruits = [
  ['dragon', '🐉', 'Dragão', 50.00, 0],
  ['kitsune', '🦊', 'Kitsune', 20.00, 0],
  ['magnet', '🧲', 'Magnet', 45.00, 0],
  ['tiger', '🐯', 'Tiger', 10.00, 0],
  ['yeti', '🥶', 'Yeti', 9.00, 2],
  ['control', '🌀', 'Control', 12.00, 1],
  ['gas', '💨', 'Gas', 6.50, 0],
  ['dough', '🍩', 'Dough', 4.00, 1],
  ['venom', '☠️', 'Venom', 5.00, 2],
  ['spirit', '👻', 'Spirit', 4.00, 1],
  ['shadow', '🌑', 'Shadow', 2.00, 2],
  ['gravity', '🪐', 'Gravity', 2.50, 2]
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

      const embed = new EmbedBuilder()
        .setColor('#2563EB')
        .setTitle('🍎 BLOXKZ — FRUTAS')
        .setDescription(
          'Confira nossas frutas, valores e disponibilidade abaixo. 💙\n'
        )
        .addFields(
          fruits.map(([id, emoji, name, price, stock]) => ({
            name: `${emoji} ${name}`,
            value:
              `💰 **Valor:** R$ ${price.toFixed(2).replace('.', ',')} — ` +
              `📦 **Estoque:** ${stock}`,
            inline: false
          }))
        )
        .setFooter({
          text: 'Bloxkz • Qualidade e confiança em cada troca.'
        });

      const menu = new StringSelectMenuBuilder()
        .setCustomId('fruit_select')
        .setPlaceholder('🍎 Escolha uma fruta')
        .addOptions(
          fruits.map(([value, emoji, name, price, stock]) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(name)
              .setValue(value)
              .setEmoji(emoji)
              .setDescription(
                `R$ ${price.toFixed(2).replace('.', ',')} • ${stock} em estoque`
              )
          )
        );

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        embeds: [embed],
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

      const [id, emoji, name, price, stock] = selectedFruit;

      const status = stock > 0
        ? `🟢 ${stock} unidade${stock > 1 ? 's' : ''} disponível${stock > 1 ? 'is' : ''}`
        : '🔴 Sem estoque';

      const embed = new EmbedBuilder()
        .setColor('#2563EB')
        .setTitle(`${emoji} ${name}`)
        .addFields(
          {
            name: '💰 Valor',
            value: `R$ ${price.toFixed(2).replace('.', ',')}`,
            inline: true
          },
          {
            name: '📦 Estoque',
            value: status,
            inline: true
          }
        )
        .setFooter({
          text: 'Bloxkz • Confira a disponibilidade antes de comprar.'
        });

      await interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
