var fetch = require('node-fetch');
var https = require( "https")
const agent = new https.Agent({
  rejectUnauthorized: false
});
var resp;

function reg(resu) {
    fetch("https://mobilegw.eurest.hu/eurest/anonymousRegistration", {
        agent,
        "headers": {
            'Content-Type': 'application/json; charset=UTF-8',
            'Host': 'mobilegw.eurest.hu',
            'Connection': 'Keep-Alive',
            'Accept-Encoding': 'gzip',
            'User-Agent': 'okhttp/3.12.0'
                },
        "method": "POST",
        body: JSON.stringify({
            deviceId: "123",
            deviceType: "ANDROID",
            language: "hu",
            pushToken: "valami?",
        })
    }).then(res => res.text())
    .then(body => {
        addFav(JSON.parse(body),resu);
    });
}


function addFav(session,resu) {
    fetch("https://mobilegw.eurest.hu/eurest/addFavouriteRestaurant?restaurantId=3", {
        agent,
      "headers": {
          "sessionId": session.sessionId,
          'Content-Type': 'application/json; charset=UTF-8',
          'Host': 'mobilegw.eurest.hu',
          'Connection': 'Keep-Alive',
          'Accept-Encoding': 'gzip',
          'User-Agent': 'okhttp/3.12.0'
              },
      "method": "POST",

  }).then(res => res.text())
  .then(body => {
      getMenu(session,resu);
  });

}

function getMenu(session, resu) {
    fetch("https://mobilegw.eurest.hu/eurest/getPersonalizedMenuWithOffset", {
        agent,
        "headers": {
            "sessionId": session.sessionId,
            'language': 'hu',
            'Host': 'mobilegw.eurest.hu',
            'Connection': 'Keep-Alive',
            'Accept-Encoding': 'gzip',
            'User-Agent': 'okhttp/3.12.0'
        },
        "method": "GET",
    }).then(res => res.text())
    .then(body => {
        menu = JSON.parse(body)
        var fin = menu.days.map(x => { return {date: x.date, foods:x.acceptable.foods.map(x => {return {name: x.name, price1: x.price1, price2: x.price2};})}});
        fin = fin.sort((a, b) => (a.date > b.date) ? 1 : -1);
        fin = JSON.stringify(fin)
        // console.log(fin)
        resu.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
        resu.end(fin);
    });
}

const http = require('http');

const requestListener = function (req, res) {
  reg(res);
}

const server = http.createServer(requestListener);
server.listen(1338);