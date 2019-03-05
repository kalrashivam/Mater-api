var express = require("express");
var bodyparser = require('body-parser');
var request = require("request");
var redis = require("redis"),
    client = redis.createClient();


var app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

url = "https://tgftp.nws.noaa.gov/data/observations/metar/stations/"
    
app.all("/*", function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});

app.listen(8080, () => {
    console.log('listening on port 8080');
});



app.get('/metar/ping', (req,res) => {
    ping = {"data":"pong"};
    res.status(200).send(ping);
});

app.get('/metar/info', (req,res) => {
    if(req.query.scode){
        newurl = url + req.query.scode.toUpperCase() + '.TXT';
        request(newurl, (error,response,body) => {
            if(error){
                console.log(error)
                res.send(error);
            } else if(body) {
                res.send(body);
            }
            
        })

    } else {
        res.send('{"data":"No Scode In Query"}');
    }
});


