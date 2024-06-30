const TelegramBot = require('node-telegram-bot-api');

// Replace with your bot token
const token = '7331679550:AAFaI7m0r2qoRVSMSoqXuKMNHhZsvCuFcyo';
const bot = new TelegramBot(token, { polling: true });

// Log message when bot starts
console.log("Bot is running...");

// Get updates and log chat IDs
bot.on('message', (msg) => {
    console.log('Received a message:', msg);
    if (msg.chat) {
        console.log(`Chat ID: ${msg.chat.id}`);
        console.log(`Chat Type: ${msg.chat.type}`);
        console.log(`Chat Title: ${msg.chat.title}`);
    }
});

bot.on('polling_error', (error) => {
    console.error(`Polling error: ${error.code}`);
    console.error(error);
});

bot.on('webhook_error', (error) => {
    console.error('Webhook error:', error);
});

bot.on('error', (error) => {
    console.error('Bot error:', error);
});
