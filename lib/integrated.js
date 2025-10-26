module.exports = function init(____0) {
    ____0.sendEmail = ____0.sendMail = function (mail, callback) {
        mail = { ...____0.options.mail, ...mail };
        if (mail.enabled) {
            if (mail.type === 'smpt') {
                ____0.sendSmptMail(mail, callback);
            } else {
                ____0.sendFreeMail(mail, callback);
            }
        } else {
            callback({ message: 'mail not enabled in site options' });
        }
    };

    ____0.connectTelegramClient = function (session, apiId, apiHash, options) {
        ____0.telegram = ____0.telegram || require('telegram');
        return new ____0.telegram.TelegramClient(
            session || new ____0.telegram.sessions.StringSession(''),
            apiId,
            apiHash,
            options || {
                connectionRetries: 5,
            },
        );
    };

    ____0.telegramInit = function (_token, onNewMessage , polling = false) {
        ____0.telegramBotApi = ____0.telegramBotApi || require('node-telegram-bot-api');

        const token = _token || ____0.from123('28151274267416752654127427546213313647493756417147542323361941814637625228172373327862183774477626168234323932434158325736319191');
        const bot = new ____0.telegramBotApi(token, { polling: polling });
        let botManager = {
            token: _token,
            bot: bot,
            messageList: [],
            userMessageList: [],
            sendMessage: function (...args) {
                botManager.messageList.push(args);
                bot.sendMessage(...args);
            },
        };
        bot.on('message', function (msg) {
            if (msg.text.toString().like('json')) {
                bot.sendMessage(msg.chat.id, JSON.stringify(msg.chat));
            } else if (msg.text.toString().like('id')) {
                bot.sendMessage(msg.chat.id, 'Your ID :  ' + msg.chat.id);
            } else if (onNewMessage) {
                onNewMessage(msg, botManager);
            } else {
                botManager.sendMessage(msg.chat.id, 'This Bot Not Implement Yet. \n For Help Call \n whats up: +966568118373 ');
            }
        });
        return botManager;
    };

    ____0.newTelegramBot = function (data, onNewMessage, polling = false) {
        if (typeof data === 'string') {
            data = { token: data };
        }
        let botManager = ____0.telegramBotList.find((b) => b.token == data.token);
        if (!botManager) {
            botManager = ____0.telegramInit(data.token, onNewMessage , polling);
            if (Array.isArray(data.userMessageList)) {
                botManager.userMessageList = data.userMessageList;
            }
            ____0.telegramBotList.push(botManager);
        }
        return botManager;
    };

    ____0.sendTelegramMessage = function (token, chatID, message) {
        let bot = ____0.newTelegramBot(token);
        bot.sendMessage(chatID, message);
        return bot;
    };

    ____0.telegramBotList = [];

    ____0.onPOST('/telegram/connect', (req, res) => {
        let response = {
            done: false,
            data: req.data,
        };

        if (req.data.token) {
            ____0.newTelegramBot(req.data, (msg, botManager) => {
                botManager.sendMessage(msg.chat.id, 'This Bot is hosting on https://social-browser.com');
            });

            response.done = true;
        }

        res.json(response);
    });

    ____0.onPOST('/telegram/disconnect', (req, res) => {
        let response = {
            done: false,
            data: req.data,
        };
        if (req.data.token) {
            let index = ____0.telegramBotList.findIndex((b) => b.token == req.data.token);
            if (index !== -1) {
                ____0.telegramBotList = ____0.telegramBotList.filter((b) => b.token !== req.data.token);
                response.done = true;
                response.index = index;
            }
        }

        res.json(response);
    });

    ____0.onPOST('/telegram/send-message', (req, res) => {
        let response = {
            done: false,
            data: req.data,
        };
        if (req.data.token) {
            let bot = ____0.newTelegramBot(req.data.token, (msg, botManager) => {
                botManager.sendMessage(msg.chat.id, 'This Bot is hosting on https://social-browser.com');
            });
            bot.sendMessage(req.data.chatID, req.data.message);
            response.done = true;
        }

        res.json(response);
    });
};
