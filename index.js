require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  ChannelType,
  Partials,
} = require("discord.js");
const cron = require("node-cron");

const TOKEN = process.env.DISCORD_TOKEN;
const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message], // ADD THIS to allow DMs to be received (piss take)
});
cron.schedule("0 9 * * *", async () => {
  const targetChannel = client.channels.cache.get("1361555963559153795");
  if (targetChannel && targetChannel.isTextBased()) {
    try {
      await targetChannel.send(
        "🌄 *SECRET TUNNEL!* DAILY 🎶\nhttps://www.youtube.com/watch?v=7o4EI_-5reA"
      );
      console.log("Sent daily Secret Tunnel video!");
    } catch (error) {
      console.error("Failed to send daily message:", error);
    }
  } else {
    console.warn("Target channel not found or not text-based.");
  }
});
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Bot is ready to relay anonymous messages.`);
  const targetChannel = client.channels.cache.get(TARGET_CHANNEL_ID);
  if (targetChannel) {
    console.log(
      `Anonymous messages will be sent to channel: #${targetChannel.name} in ${targetChannel.guild.name}`
    );
  } else {
    console.warn(
      `WARNING: Target channel with ID ${TARGET_CHANNEL_ID} not found. Make sure the bot is in the server and has access to it.`
    );
  }
});

client.on("messageCreate", async (message) => {
  console.log("message created", message);
  if (message.author.bot) return;

  if (message.channel.type === ChannelType.DM) {
    const anonymousMessageContent = message.content;

    const targetChannel = client.channels.cache.get(TARGET_CHANNEL_ID);

    if (!targetChannel) {
      console.error(
        `Error: Could not find target channel with ID ${TARGET_CHANNEL_ID}.`
      );
      await message.author.send(
        "I'm sorry, I couldn't find the designated channel to send your message. Please contact a server administrator."
      );
      return;
    }

    if (targetChannel.isTextBased()) {
      try {
        await targetChannel.send(
          `**Anonymous Message:**\n${anonymousMessageContent}`
        );
        await message.author.send("Your anonymous message has been sent!");
      } catch (error) {
        console.error(`Failed to send message to target channel: ${error}`);
        await message.author.send(
          "I encountered an error trying to send your message. Please try again later or contact a server administrator."
        );
      }
    } else {
      console.error(
        `Error: Channel with ID ${TARGET_CHANNEL_ID} is not a text-based channel.`
      );
      await message.author.send(
        "I'm sorry, the designated channel is not a text channel. Please contact a server administrator."
      );
    }
  }
});

client.login(TOKEN);
