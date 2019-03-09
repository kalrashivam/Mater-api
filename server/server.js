var express = require("express");
var bodyparser = require('body-parser');
var request = require("request");
var redis = require("redis"),
    client = redis.createClient(6379, '127.0.0.1');


var app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

client.on('error',(error) => {
    console.log('something is wrong with redis the follwing is the error: \n' + error);
})

client.on('connect', function() {
    console.log('Redis client connected');
});

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
    //scode -> stores the station query sent by the user
    scode = req.query.scode;
    if(scode){
        client.get(scode.toUpperCase(),(err,result) => {
            if(err) {
                console.log('error while getting from redis'+ err);
            } else if (result){
                let part = result.split(" ")
                console.log(part);
                res.send(`{"data":{"nocache":"0","station"="${scode}","last_observation":"${part[0]} at ${part[1]}","temerature":"${part[7]}","wind":"${part[4]}"}}`);
            } else {
                newurl = url + scode.toUpperCase() + '.TXT';
                request.get(newurl, (error,response,body) => {
                    if(error){
                        console.log(error)
                        res.send(error);
                    } else if(body) {
                        client.set(scode.toUpperCase(),body,'EX',300);
                        part = body.split(" ")
                        res.send(`{"data":{"nocache":"1","station"="${scode}","last_observation":"${part[0]} at ${part[1]}","temerature":"${part[7]}","wind":"${part[4]}"}}`);
                    }
                    
                })
            }
       
        });
    } else {
        res.send('{"data":"No Scode In Query"}');
    }
});




