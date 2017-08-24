var http = require("http");
var url = require('url'); 
var fs = require('fs'); 
var schedule = require('node-schedule');

//var funds = require('./funds.js');
var map = require('./map.js');
//var veryhd = require('./veryhd.js');
var buscard = require('./buscard.js');

var handle={};
handle["/"] = root;
//handle["/funds"] = funds.funds;
handle["/map"] = map.map;
//handle["/veryhd"] = veryhd.veryhd;
handle["/buscard"] = buscard.buscard;

function root(req,res) {
    fs.readFile('index.html', 'utf-8',function (err, data) {
        if (err) throw err;
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(data);
        res.end();
    });
}

// create a server
http.createServer(function(req, res) {
    var pathname = url.parse(req.url).pathname;
    var ext = pathname.match(/(\.[^.]+|)$/)[0];
    switch(ext){
        case ".css":
        case ".js":
            fs.readFile("."+req.url, 'utf-8',function (err, data) {
                if (err) throw err;
                res.writeHead(200, {
                    "Content-Type": {
                        ".css":"text/css",
                        ".js":"application/javascript",
                    }
                });
                res.write(data);
                res.end();
            });
            break;
        default:
            if(typeof handle[pathname.match(/\/[^\/]*/)[0]] === 'function') {  
                handle[pathname.match(/\/[^\/]*/)[0]](req,res);
            }
            else {
                res.writeHead(404,{"Content-Type":"text/plain"});  
                res.write("404 not found");  
                res.end();  
            }
    }
}).listen(process.env.PORT || 1337, null);

//schedule.scheduleJob('31 * * * * *', buscard.collect);
