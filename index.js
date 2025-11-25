const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

 1. Render ಗಾಗಿ ಒಂದು ಚಿಕ್ಕ ವೆಬ್ ಸರ್ವರ್ (ಇದು ಇಲ್ಲದಿದ್ದರೆ Render ಬಾಟ್ ಅನ್ನು ನಿಲ್ಲಿಸುತ್ತದೆ)
const app = express();
const port = process.env.PORT  3000;

app.get('', (req, res) = {
  res.send('WhatsApp Bot is Running!');
});

app.listen(port, () = {
  console.log(`Server is running on port ${port}`);
});

 2. ವಾಟ್ಸಾಪ್ ಬಾಟ್ ಸೆಟಪ್ (Puppeteer ಸೆಟ್ಟಿಂಗ್ಸ್ ಜೊತೆ)
const client = new Client({
    authStrategy new LocalAuth(),
    puppeteer {
        args ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

 QR ಕೋಡ್ ಅನ್ನು ಟರ್ಮಿನಲ್ (Logs) ನಲ್ಲಿ ತೋರಿಸಲು
client.on('qr', (qr) = {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small true });
});

client.on('ready', () = {
    console.log('ಬಾಟ್ ಈಗ ಆನ್ಲೈನ್ ಇದೆ!');
});

 3. ಯಾರಾದರೂ ಗ್ರೂಪ್ ಸೇರಿದಾಗ ಪರಿಶೀಲಿಸುವ ಲಾಜಿಕ್
client.on('group_join', async (notification) = {
    try {
        const newParticipantId = notification.recipientIds[0];
        const chat = await notification.getChat();  ಯಾವ ಗ್ರೂಪ್ ಎಂದು ತಿಳಿಯಲು
        const allChats = await client.getChats();  ಎಲ್ಲಾ ಚಾಟ್ ಲಿಸ್ಟ್ ಪಡೆಯಲು
        
        console.log(`Checking user ${newParticipantId} in group ${chat.name}`);

        let count = 0;

         ಎಲ್ಲಾ ಗ್ರೂಪ್‌ಗಳನ್ನು ಚೆಕ್ ಮಾಡು
        for (const c of allChats) {
            if (c.isGroup) {
                 ಗ್ರೂಪ್ ಮೆಂಬರ್ಸ್ ಲಿಸ್ಟ್ ತೆಗೆದುಕೊಳ್ಳಿ
                const participants = c.participants;
                const isMember = participants.some(p = p.id._serialized === newParticipantId);
                
                if (isMember) {
                    count++;
                }
            }
        }

         ಒಂದು ವೇಳೆ 1 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಗ್ರೂಪ್‌ನಲ್ಲಿ ಇದ್ದರೆ (ಈಗ ಸೇರಿದ ಗ್ರೂಪ್ + ಹಳೆ ಗ್ರೂಪ್)
        if (count  1) {
            console.log(`${newParticipantId} ಈಗಾಗಲೇ ಬೇರೆ ಗ್ರೂಪ್ ನಲ್ಲಿದ್ದಾರೆ. ರಿಮೂವ್ ಮಾಡಲಾಗುತ್ತಿದೆ...`);
            
             1. ಅವರಿಗೆ ಮೆಸೇಜ್ ಕಳುಹಿಸು
             await client.sendMessage(newParticipantId, ಕ್ಷಮಿಸಿ, ನೀವು ಈಗಾಗಲೇ ನಮ್ಮ ಇನ್ನೊಂದು ಗ್ರೂಪ್ ನಲ್ಲಿರುವುದರಿಂದ ಈ ಗ್ರೂಪ್ ನಿಂದ ನಿಮ್ಮನ್ನು ತೆಗೆಯಲಾಗುತ್ತಿದೆ.);
            
             2. ಗ್ರೂಪ್ ನಿಂದ ರಿಮೂವ್ ಮಾಡು
            await chat.removeParticipants([newParticipantId]);
        }

    } catch (error) {
        console.error('ದೋಷ ಕಂಡುಬಂದಿದೆ', error);
    }
});

client.initialize();