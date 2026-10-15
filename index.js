const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const fs = require("node:fs");
const path = require("node:path");

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const OWNER_ID = "1087079514569461871";
const DATA_FILE = path.join(__dirname, "data.json");
const PER_PAGE = 3;

if (!TOKEN) {
  console.error("Configure DISCORD_TOKEN na hospedagem.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const DEFAULT_FRUITS = [
  {
    id: "dragon",
    name: "Dragon",
    price: 80,
    stock: 0,
    image: "https://wikiassets.net/bloxfruits-3bec24/images/c17c3878fc62726beca8774a107e2e09.webp"
  },
  {
    id: "kitsune",
    name: "Kitsune",
    price: 20,
    stock: 0,
    image: "https://static.wikia.nocookie.net/roblox-blox-piece/images/6/65/Kitsune_Fruit.png/revision/latest?cb=20241223162956"
  },
  {
    id: "magnet",
    name: "Magnet",
    price: 45,
    stock: 0,
    image: "https://static.wikia.nocookie.net/roblox-blox-piece/images/2/2f/Magnet_Fruit.png/revision/latest?cb=20260905110645"
  },
  {
    id: "tiger",
    name: "Tiger",
    price: 11,
    stock: 0,
    image: "https://static.wikia.nocookie.net/roblox-blox-piece/images/1/14/Tiger_Fruit.png/revision/latest?cb=20251101005924"
  },
  {
    id: "yeti",
    name: "Yeti",
    price: 10,
    stock: 0,
    image: "https://static.wikia.nocookie.net/roblox-blox-piece/images/2/2f/Yeti_Fruit.png/revision/latest?cb=20260806232444"
  },
  {
    id: "control",
    name: "Control",
    price: 12,
    stock: 2,
    image: "https://static.wikia.nocookie.net/roblox-blox-piece/images/1/19/Control_Fruit.png/revision/latest?cb=20251223165924"
  },
  {
    id: "gas",
    name: "Gas",
    price: 6.5,
    stock: 0,
    image: "https://static.wikia.nocookie.net/roblox-blox-piece/images/e/ed/Gas_Fruit.png/revision/latest?cb=20241223162315"
  },
  {
    id: "dough",
    name: "Dough",
    price: 4.5,
    stock: 1,
    image: "https://static.wikia.nocookie.net/roblox-blox-piece/images/0/02/Dough_Fruit.png/revision/latest?cb=20260806235727"
  },
  {
    id: "venom",
    name: "Venom",
    price: 5,
    stock: 2,
    image: "https://static.wikia.nocookie.net/roblox-blox-piece/images/d/d2/Venom_Fruit.png/revision/latest?cb=20231027120425"
  },
  {
    id: "spirit",
    name: "Spirit",
    price: 4,
    stock: 1,
    image: "https://static.wikia.nocookie.net/roblox-blox-piece/images/6/66/Spirit_Fruit.png/revision/latest?cb=20240304190559"
  },
  {
    id: "shadow",
    name: "Shadow",
    price: 3,
    stock: 2,
    image: "https://static.wikia.nocookie.net/roblox-blox-piece/images/5/58/Shadow_Fruit.png/revision/latest?cb=20241229033053"
  },
  {
    id: "gravity",
    name: "Gravity",
    price: 2.5,
    stock: 0,
    image: "https://static.wikia.nocookie.net/roblox-blox-piece/images/5/5f/Gravity_Fruit.png/revision/latest?cb=20250418030958"
  },
  {
    id: "mammoth",
    name: "Mammoth",
    price: 0,
    stock: 0,
    image: "https://static.wikia.nocookie.net/roblox-blox-piece/images/9/95/Mammoth_Fruit.png/revision/latest?cb=20260806235956"
  },
  {
    id: "trex",
    name: "T-Rex",
    price: 0,
    stock: 0,
    image: "https://static.wikia.nocookie.net/roblox-blox-piece/images/d/d9/T-Rex_Fruit.png/revision/latest?cb=20231226191220"
  },
  {
    id: "lightning",
    name: "Lightning",
    price: 0,
    stock: 0,
    image: "https://static.wikia.nocookie.net/roblox-blox-piece/images/7/78/Lightning_Fruit.png/revision/latest?cb=20260806235926"
  },
  {
    id: "portal",
    name: "Portal",
    price: 0,
    stock: 0,
    image: "https://static.wikia.nocookie.net/roblox-blox-piece/images/8/8a/Portal_Fruit.png/revision/latest?cb=20231027115746"
  },
  {
    id: "buddha",
    name: "Buddha",
    price: 0,
    stock: 0,
    image: "https://static.wikia.nocookie.net/roblox-blox-piece/images/d/df/Buddha_Fruit.png/revision/latest?cb=20231027115325"
  }
];

function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(
        DATA_FILE,
        JSON.stringify({ fruits: DEFAULT_FRUITS }, null, 2)
      );
    }

    const parsed = JSON.parse(
      fs.readFileSync(DATA_FILE, "utf8")
    );

    if (!Array.isArray(parsed.fruits)) {
      throw new Error('O arquivo precisa ter uma lista "fruits".');
    }

    const fruits = parsed.fruits.map(fruit => {
      const defaults = DEFAULT_FRUITS.find(
        item => item.id === fruit.id
      );

      return defaults
        ? {
            ...defaults,
            ...fruit,
            image: fruit.image || defaults.image || ""
          }
        : fruit;
    });

    for (const defaults of DEFAULT_FRUITS) {
      if (!fruits.some(fruit => fruit.id === defaults.id)) {
        fruits.push(defaults);
      }
    }

    parsed.fruits = fruits;

    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(parsed, null, 2)
    );

    return parsed;
  } catch (error) {
    console.error("Erro ao ler data.json:", error.message);
    process.exit(1);
  }
}

let storeData = loadData();

function saveData() {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(storeData, null, 2)
  );
}

function isOwner(interaction) {
  return interaction.user.id === OWNER_ID;
}

function money(value) {
  return Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits:
      Number.isInteger(Number(value)) ? 0 : 2,
    maximumFractionDigits: 2
  });
}

function priceText(fruit) {
  if (
    !Number.isFinite(Number(fruit.price)) ||
    Number(fruit.price) <= 0
  ) {
    return "Preço a definir";
  }

  return `R$ ${money(fruit.price)}`;
}

function stockText(fruit) {
  return Number(fruit.stock) > 0
    ? `🟢 ${fruit.stock} disponível(is)`
    : "🔴 Sem estoque";
}

function fruitEmbed(fruit, index) {
  const embed = new EmbedBuilder()
    .setColor(0x2546a8)
    .setTitle(fruit.name)
    .setDescription(
      `💰 **Preço:** ${priceText(fruit)}\n` +
      `📦 **Estoque:** ${stockText(fruit)}`
    )
    .setFooter({
      text: `Bloxkz • Fruta ${index + 1}`
    });

  if (
    fruit.image &&
    /^https?:\/\/\S+$/i.test(fruit.image)
  ) {
    embed.setThumbnail(fruit.image);
  }

  return embed;
}

function panelComponents(page, totalPages) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`bloxkz_prev_${page}`)
        .setLabel("◀ Anterior")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page <= 0),

      new ButtonBuilder()
        .setCustomId(`bloxkz_page_${page}`)
        .setLabel(`${page + 1}/${totalPages}`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),

      new ButtonBuilder()
        .setCustomId(`bloxkz_next_${page}`)
        .setLabel("Próxima ▶")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page >= totalPages - 1)
    )
  ];
}

function panelPayload(page = 0) {
  const fruits = storeData.fruits;

  const totalPages = Math.max(
    1,
    Math.ceil(fruits.length / PER_PAGE)
  );

  const safePage = Math.min(
    Math.max(page, 0),
    totalPages - 1
  );

  const start = safePage * PER_PAGE;

  const pageFruits = fruits.slice(
    start,
    start + PER_PAGE
  );

  const header = new EmbedBuilder()
    .setColor(0x172554)
    .setTitle("🧢 BLOXKZ • LOJA DE FRUTAS")
    .setDescription(
      "Confira os preços e o estoque abaixo.\n" +
      "Frutas sem preço definido não estão disponíveis para compra ainda."
    )
    .setFooter({
      text: `Página ${safePage + 1}/${totalPages} • Bloxkz`
    });

  return {
    embeds: [
      header,
      ...pageFruits.map((fruit, i) =>
        fruitEmbed(fruit, start + i)
      )
    ],
    components: panelComponents(safePage, totalPages)
  };
}

const commands = [
  new SlashCommandBuilder()
    .setName("bloxkz")
    .setDescription("Mostra o painel da loja Bloxkz"),

  new SlashCommandBuilder()
    .setName("estoque")
    .setDescription("Altera o estoque de uma fruta (somente dono)")
    .addStringOption(option =>
      option
        .setName("fruta")
        .setDescription("ID da fruta, por exemplo venom")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("quantidade")
        .setDescription("Nova quantidade em estoque")
        .setMinValue(0)
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("preco")
    .setDescription("Altera o preço de uma fruta (somente dono)")
    .addStringOption(option =>
      option
        .setName("fruta")
        .setDescription("ID da fruta, por exemplo venom")
        .setRequired(true)
    )
    .addNumberOption(option =>
      option
        .setName("valor")
        .setDescription("Preço em reais; use 0 para deixar a definir")
        .setMinValue(0)
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("imagem")
    .setDescription("Altera a imagem de uma fruta (somente dono)")
    .addStringOption(option =>
      option
        .setName("fruta")
        .setDescription("ID da fruta, por exemplo dragon")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("url")
        .setDescription("URL direta da imagem")
        .setRequired(true)
    )
].map(command => command.toJSON());

async function registerCommands() {
  if (!CLIENT_ID || !GUILD_ID) {
    console.warn(
      "CLIENT_ID ou GUILD_ID não configurados. Comandos não registrados automaticamente."
    );
    return;
  }

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );

  console.log("Comandos slash registrados no servidor Bloxkz.");
}

client.once("ready", async () => {
  console.log(`Bloxkz online como ${client.user.tag}`);

  try {
    await registerCommands();
  } catch (error) {
    console.error("Erro ao registrar comandos:", error);
  }
});

client.on("interactionCreate", async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "bloxkz") {
        await interaction.reply(panelPayload(0));
        return;
      }

      if (
        ["estoque", "preco", "imagem"].includes(
          interaction.commandName
        )
      ) {
        if (!isOwner(interaction)) {
          await interaction.reply({
            content: "❌ Só o dono da Bloxkz pode usar esse comando.",
            ephemeral: true
          });
          return;
        }

        const fruitId = interaction
          .options
          .getString("fruta", true)
          .toLowerCase()
          .trim();

        const fruit = storeData.fruits.find(item =>
          item.id.toLowerCase() === fruitId ||
          item.name.toLowerCase() === fruitId
        );

        if (!fruit) {
          await interaction.reply({
            content:
              "❌ Fruta não encontrada. IDs disponíveis: " +
              storeData.fruits.map(item => item.id).join(", "),
            ephemeral: true
          });
          return;
        }

        if (interaction.commandName === "estoque") {
          fruit.stock = interaction.options.getInteger(
            "quantidade",
            true
          );

          saveData();

          await interaction.reply({
            content:
              `✅ Estoque de **${fruit.name}** atualizado para **${fruit.stock}**.`,
            ephemeral: true
          });
          return;
        }

        if (interaction.commandName === "preco") {
          fruit.price = interaction.options.getNumber(
            "valor",
            true
          );

          saveData();

          await interaction.reply({
            content:
              `✅ Preço de **${fruit.name}** atualizado para **${priceText(fruit)}**.`,
            ephemeral: true
          });
          return;
        }

        if (interaction.commandName === "imagem") {
          const url = interaction
            .options
            .getString("url", true)
            .trim();

          if (!/^https?:\/\/\S+$/i.test(url)) {
            await interaction.reply({
              content: "❌ Envie uma URL começando com http:// ou https://.",
              ephemeral: true
            });
            return;
          }

          fruit.image = url;
          saveData();

          await interaction.reply({
            content: `✅ Imagem de **${fruit.name}** atualizada.`,
            ephemeral: true
          });
          return;
        }
      }
    }

    if (interaction.isButton()) {
      const match = interaction.customId.match(
        /^bloxkz_(prev|next)_([0-9]+)$/
      );

      if (!match) return;

      const direction = match[1];
      const currentPage = Number(match[2]);

      const nextPage =
        direction === "next"
          ? currentPage + 1
          : currentPage - 1;

      await interaction.update(panelPayload(nextPage));
    }
  } catch (error) {
    console.error("Erro ao processar interação:", error);

    const message =
      "❌ Ocorreu um erro. Confira os logs da hospedagem.";

    if (
      interaction.isRepliable() &&
      !interaction.replied &&
      !interaction.deferred
    ) {
      await interaction.reply({
        content: message,
        ephemeral: true
      }).catch(() => {});
    } else if (
      interaction.isRepliable() &&
      interaction.deferred
    ) {
      await interaction.followUp({
        content: message,
        ephemeral: true
      }).catch(() => {});
    }
  }
});

client.login(TOKEN);
