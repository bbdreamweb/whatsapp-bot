const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode-terminal'); // We keep this just in case

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

// --- ಹೊಸ ಬದಲಾವಣೆ ಇಲ್ಲಿದೆ ---
client.on('qr', (qr) => {
    // QR ಕೋಡ್ ಅನ್ನು ಲಿಂಕ್ ರೂಪದಲ್ಲಿ ಬದಲಾಯಿಸುವುದು
    const qrLink = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
    
    console.log('------------------------------------------------');
    console.log('ಕೆಳಗಿನ ಲಿಂಕ್ ಅನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ:');
    console.log(qrLink);
    console.log('------------------------------------------------');
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
                if (isMember) count++;
            }
        }

        if (count > 1) {
            console.log('User already in another group. Removing...');
            await chat.removeParticipants([newParticipantId]);
            // Optional: Send message
            // await client.sendMessage(newParticipantId, "You are strictly allowed in only one group.");
        }

    } catch (error) {
        console.error('Error:', error);
    }
});

client.initialize();
