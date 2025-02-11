import axios from "axios";

export async function sendMessage(chat_id: string, text: string, parse_mode: string = 'Markdown') {
    try {
        const result = await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, { chat_id, text, parse_mode });

        return result;
    } catch (error) {
        console.error(error);
        return null;
    };
};