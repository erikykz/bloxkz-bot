
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  PermissionFlagsBits
} = require('discord.js');

const fs = require('node:fs');
const path = require('node:path');

const OWNER_ID = '1087079514569461871';
const TOKEN = process.env.DISCORD_TOKEN;
const DATA_FILE = path.join(__dirname, 'data.json');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (error) {
    console.error('Erro ao ler data.json:', error);
    return { fruits: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function money(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function makePanel(page = 0) {
  const data = loadData();
  const fruits = data.fruits || [];
  const pageSize = 5;
  const pages = Math.max(1, Math.ceil(fruits.length / pageSize));
  page = Math.max(0, Math.min(page, pages - 1));

  const current = fruits.slice(page * pageSize, (page + 1) * pageSize);

  const embed = new EmbedBuilder()
    .setColor('#2563EB')
    .setTitle('🍎 BLOXKZ — ESTOQUE DE FRUTAS')
    .setDescription(
      'Confira os preços e a disponibilidade das frutas abaixo.\n' +
      'Para consultar uma fruta, use o menu. 💙'
    )
    .setFooter({ text: `Bloxkz • Página ${page + 1}/${pages}` });

  for (const fruit of current) {
    embed.addFields({
      name: `${fruit.name} ${fruit.stock > 0 ? '🟢' : '🔴'}`,
      value: `💰 **Preço:** ${money(fruit.price)}\n📦 **Estoque:** ${fruit.stock}`,
      inline: true
    });
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId('bloxkz:select')
    .setPlaceholder('🍎 Selecione uma fruta para ver detalhes')
    .addOptions(
      current.map(fruit => ({
        label: fruit.name.slice(0, 100),
        value: fruit.id,
        description: `${money(fruit.price)} • Estoque: ${fruit.stock}`.slice(0, 100)
      }))
    );

  const selectRow = new ActionRowBuilder().addComponents(menu);

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`bloxkz:prev:${page}`)
      .setLabel('◀ Anterior')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId(`bloxkz:next:${page}`)
      .setLabel('Próxima ▶')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page >= pages - 1)
  );

  return { embeds: [embed], components: [selectRow, buttons] };
}

const commands = [
  new SlashCommandBuilder()
    .setName('bloxkz')
    .setDescription('Abre o painel de frutas da Bloxkz.'),

  new SlashCommandBuilder()
    .setName('estoque')
    .setDescription('Mostra o estoque atual da Bloxkz.')
    .addStringOption(option =>
      option.setName('fruta')
        .setDescription('ID da fruta (ex.: control, dragon, portal)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('quantidade')
        .setDescription('Nova quantidade em estoque')
        .setRequired(true)
        .setMinValue(0))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('preco')
    .setDescription('Altera o preço de uma fruta.')
    .addStringOption(option =>
      option.setName('fruta')
        .setDescription('ID da fruta (ex.: control, dragon, portal)')
        .setRequired(true))
    .addNumberOption(option =>
      option.setName('valor')
        .setDescription('Novo preço em reais')
        .setRequired(true)
        .setMinValue(0))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('imagem')
    .setDescription('Define a imagem de uma fruta por URL.')
    .addStringOption(option =>
      option.setName('fruta')
        .setDescription('ID da fruta')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('url')
        .setDescription('URL direta da imagem')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(command => command.toJSON());

client.once('ready', async () => {
  console.log(`Bloxkz online como ${client.user.tag}`);

  if (!TOKEN) {
    console.error('DISCORD_TOKEN não foi configurado.');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  try {
    for (const guild of client.guilds.cache.values()) {
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, guild.id),
        { body: commands }
      );
      console.log(`Comandos registrados em ${guild.name}`);
    }
  } catch (error) {
    console.error('Erro ao registrar comandos:', error);
  }
});

client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'bloxkz') {
        return interaction.reply(makePanel(0));
      }

      if (interaction.user.id !== OWNER_ID) {
        return interaction.reply({
          content: '⛔ Somente o dono da Bloxkz pode usar esse comando.',
          ephemeral: true
        });
      }

      const data = loadData();
      const fruitId = interaction.options.getString('fruta').toLowerCase();
      const fruit = data.fruits.find(item => item.id === fruitId);

      if (!fruit) {
        return interaction.reply({
          content: `❌ Fruta "${fruitId}" não encontrada. Use o ID cadastrado no data.json.`,
          ephemeral: true
        });
      }

      if (interaction.commandName === 'estoque') {
        fruit.stock = interaction.options.getInteger('quantidade');
        saveData(data);
        return interaction.reply({
          content: `✅ Estoque de **${fruit.name}** atualizado para **${fruit.stock}**.`,
          ephemeral: true
        });
      }

      if (interaction.commandName === 'preco') {
        fruit.price = interaction.options.getNumber('valor');
        saveData(data);
        return interaction.reply({
          content: `✅ Preço de **${fruit.name}** atualizado para **${money(fruit.price)}**.`,
          ephemeral: true
        });
      }

      if (interaction.commandName === 'imagem') {
        const url = interaction.options.getString('url');
        if (!/^https?:\/\/\S+$/i.test(url)) {
          return interaction.reply({
            content: '❌ Informe uma URL HTTP ou HTTPS válida.',
            ephemeral: true
          });
        }
        fruit.image = url;
        saveData(data);
        return interaction.reply({
          content: `✅ Imagem de **${fruit.name}** atualizada.`,
          ephemeral: true
        });
      }
    }

    if (interaction.isButton()) {
      const [prefix, action, pageText] = interaction.customId.split(':');
      if (prefix !== 'bloxkz') return;

      const page = Number(pageText);
      const newPage = action === 'next' ? page + 1 : page - 1;
      return interaction.update(makePanel(newPage));
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'bloxkz:select') {
      const data = loadData();
      const fruit = data.fruits.find(item => item.id === interaction.values[0]);

      if (!fruit) {
        return interaction.reply({
          content: 'Essa fruta não está mais cadastrada.',
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor('#2563EB')
        .setTitle(`🍎 ${fruit.name}`)
        .setDescription(
          `💰 **Preço:** ${money(fruit.price)}\n` +
          `📦 **Estoque:** ${fruit.stock > 0 ? `${fruit.stock} disponível(is)` : 'Sem estoque'}`
        )
        .setFooter({ text: 'Bloxkz • Confira a disponibilidade antes de comprar.' });

      if (fruit.image) embed.setThumbnail(fruit.image);

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  } catch (error) {
    console.error('Erro na interação:', error);

    const response = {
      content: '❌ Ocorreu um erro. Confira os logs do bot.',
      ephemeral: true
    };

    if (interaction.replied || interaction.deferred) {
      return interaction.followUp(response).catch(() => {});
    }
    return interaction.reply(response).catch(() => {});
  }
});

if (!TOKEN) {
  console.error('Configure a variável DISCORD_TOKEN no FadeHost.');
} else {
  client.login(TOKEN);
          }
  
