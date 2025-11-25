const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('WhatsApp Bot is Running!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot is Ready!');
});

client.on('group_join', async (notification) => {
    try {
        const newParticipantId = notification.recipientIds[0];
        const chat = await notification.getChat();
        const allChats = await client.getChats();

        console.log('Checking user:', newParticipantId);

        let count = 0;

        for (const c of allChats) {
            if (c.isGroup) {
                const participants = c.participants;
                const isMember = participants.some(p => p.id._serialized === newParticipantId);

                if (isMember) {
                    count++;
                }
            }
        }

        if (count > 1) {
            console.log('User already in another group. Removing...');
            // Remove the user
            await chat.removeParticipants([newParticipantId]);
        }

    } catch (error) {
        console.error('Error:', error);
    }
});

client.initialize();
