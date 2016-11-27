const express = require('express');
const packageInfo = require('./package.json');
const bodyParser = require('body-parser');
const cors = require('cors');
const bot = require('./bot.js');

const app = express();

process.on('unhandledRejection', err => {
	bot.sendMessage(feedbackChat, '#SRS_ERROR: ' + err);
});

app.use(bodyParser.json());

app.listen(process.env.PORT || 3000);
