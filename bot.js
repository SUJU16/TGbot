const TGBot = require('node-telegram-bot-api');
const moment = require('moment');
const fetch = require('isomorphic-fetch');
const token = process.env.TG_TOKEN;

var bot;
if (process.env.NODE_ENV === 'production') {
	bot = new TGBot(token);
} else {
	bot = new TGBot(token, {
		polling: true
	});
}

let hasLocation = false;
let location = { latitude: 0.0, longitude: 0.0 }

bot.onText(/(.*)/, (msg, match) => {
  if (hasLocation) {
    const time = moment(match[0], 'hh:mm')
    const json = JSON.stringify({latitude: location.latitude, longitude: location.longitude, date: time.unix()});
    var request = new Request('https://suju.online/api/database/', {
      method: 'POST',
      body: json,
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
    });
    fetch(request)
    .then(res => res.json())
    .catch(err => {
      console.log(err);
    });

    fetch('https://suju.online/api/cluster')
    .then(res => {
      return res.json()
    })
    .then(json => {
      console.log('Cluster recieved');
      let min = 100;
      let minPoint = { lat: 0, long: 0, time: 0 };
      json.clusters.forEach( point => {
      let dist = (location.latitude- point.latitude)*(location.latitude- point.latitude) + (location.longitude - point.longitude)*(location.longitude - point.longitude);
      if (dist < min) { min = dist; minPoint = {lat: point.latitude, long: point.longitude, time: point.date} }
      });
      bot.sendMessage(msg.chat.id, "Suggested connection leaves here at approximately " + moment.unix(minPoint.time).format('hh:mm'));
      bot.sendLocation(msg.chat.id, minPoint.lat, minPoint.long);
    });
  }
});

bot.on('location', msg => {
  bot.sendMessage(msg.chat.id, "When do you want to be picked up?");
  location = msg.location;
  hasLocation = true;
});

module.exports = bot;
