var fs = require('fs'); 
var url = require('url'); 
var http = require("http");
var mysql = require('mysql');
var cheerio = require('cheerio');
var req = require('request');


var pad = function(tbl) {
    return function(str, n){
        return (str.length >= n) ? str : (tbl[n] || Array(n - str.length + 1).join(0)) + str;
    };
}([]);

var queryandstore = function(cardnumber, tree, trs){
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'jeffw',
        password : '',
        database : 'buscard'
    });
    
    var sql = 'select 消费时间 from pay_info where 卡号="0001' + cardnumber + '" order by 消费时间 desc limit 20\;';
    connection.connect();
    connection.query(sql,
        function(err,rows,fields) {
            if (err) throw err;
//            console.log(rows);
            store2database(cardnumber, rows, tree, trs);
        }
    ); 
    connection.end();
};

var store2database = function(cardnumber, pay_time, tree, trs) {
    var params = '';
    var count = 0;
    
    for(var i = 1; i < trs.length; i++) {
        var param = '';
        var tds = trs.eq(i).find('td');
        
        if(count < pay_time.length) {
            var a = new Date(pay_time[count]['消费时间']);
            var b = new Date(tds.eq(3).text());
//            console.log((a-b) + '++++++++++++' + b);
            if((a - b)/86400 === 0) {
                count++;
                continue;
            }
        }
        
        tds.each(function(j) {
            var colvalue = tree(this).text().replace(/[\r\n\s]+/g, ' ');
            if(j == 3) {
                colvalue = colvalue.replace(/ (.+) /, '$1');
            }
            else {
                colvalue = colvalue.replace(/[\r\n\s]+/g, '');
            }
            
            colvalue = colvalue.replace(/(.*)/, '"$1"');
            param += colvalue + ', ';
        });
        param = param.replace(/^(.*),\s$/, '($1),');
        params += param;
    }
    params = params.replace(/,$/, ';');
    
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'jeffw',
        password : '',
        database : 'buscard'
    });
    var sql = '';
    if(params.length > 0) {
        connection.connect();
        sql = 'insert into pay_info (卡号, 线路, 车号, 消费时间, 消费次数, 剩余次数, 电子钱包) values ';
        console.log(sql + params);
        connection.query(sql + params, function(err, result) {
                if (err) throw err;
            }
        );
    }
    var updatetime = new Date();
    updatetime = updatetime.getFullYear() + '/' + (updatetime.getMonth()+1) + '/' + updatetime.getDate() + 
                ' ' + updatetime.getHours() + ':' + updatetime.getMinutes() + ':' + updatetime.getSeconds();
    updatetime = "convert_tz('" + updatetime + "', '+00:00', '+08:00')";
    sql = 'insert into update_time (卡号, 更新时间) values ("0001' + cardnumber + '", ' + updatetime + ') on duplicate key \
            update 更新时间=' + updatetime + '';
            console.log(sql);
    connection.query(sql, function(err, result) {
            if (err) throw err;
        }
    );
    connection.end();
};

function convertJwd(lineResult, res) {
    var jwd = JSON.parse(lineResult).lineList[0].jwd;
    var postData = require('querystring').stringify({
        'p' : jwd,
    });
    var options = { 
        hostname : 'www.cdgjbus.com', 
        port : 8803, 
        path : '/BusLine/ConvertJwd?t='+Math.random(),
        method : 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
        }
    };
    var request = http.request(options, function(response) { 
        if (response.statusCode == 200) { 
            var convertResult = "";

            response.setEncoding('utf8');
            response.on('data', function(chunk) { 
                convertResult = convertResult.toString() + chunk.toString(); 
            });
            response.on('end', function() {
                var tmp = JSON.parse(lineResult);
                tmp['jwdconverted'] = JSON.parse(convertResult);
                lineResult = JSON.stringify(tmp);
                res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
                res.write(lineResult);
                res.end();
            });
        }
    });
    request.write(postData);
    request.end();
}

var handle={};
handle["line"] = line;
function line(lineno, res) {
    var postData = require('querystring').stringify({
        'linename' : lineno,
        'linedirection' : '1',
    });
    var options = { 
        hostname : 'www.cdgjbus.com', 
        port : 8803, 
        path : '/BusLine/GetNewLine?t='+Math.random(),
        method : 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
        }
    };
    var request = http.request(options, function(response) { 
        if (response.statusCode == 200) { 
            var lineResult = "";

            response.setEncoding('utf8');
            response.on('data', function(chunk) { 
                lineResult = lineResult.toString() + chunk.toString(); 
            });
            response.on('end', function() {
                if(JSON.parse(lineResult).lineList[0].jwd === '') {
                    res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
                    res.write(lineResult);
                    res.end();
                }
                else {
                    convertJwd(lineResult, res);
                }
            });
        }
    });
    request.write(postData);
    request.end();
//    console.log(postData.length);
/*    req.post({
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Length': postData.length,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:40.0) Gecko/20100101 Firefox/40.0',
          'Host':'www.cdgjbus.com:8803',
          'Referer':'http://www.cdgjbus.com:8803/busline',
          'Accept-Encoding':'gzip, deflate',
        },
        url: 'http://www.cdgjbus.com:8803/BusLine/GetNewLine?t='+Math.random(),
        form: {
        'linename' : lineno,
        'linedirection' : '1',
        },
        method: 'POST'
    },
        function (err, response, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            console.log(body); 
            res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
            res.write(body);
            res.end();
    });*/
}

exports.buscard = function(req, res) {
    var pathname = url.parse(req.url).pathname;
    var pathname1 = pathname.match(/[^\/]+/g)[1];
    var pathname2 = pathname.match(/[^\/]+/g)[2];
    if(typeof handle[pathname1] === 'function') {
        handle[pathname1](pathname2, res);
    }
    else {
        var buscardno = pathname1;
        var connection = mysql.createConnection({
            host     : 'localhost',
            user     : 'jeffw',
            password : '',
            database : 'buscard'
        });
    
        var sql = 'select * from pay_info where 卡号="0001' + pad(buscardno,8) + '" order by 消费时间 desc limit 20';
        connection.connect();
        connection.query(sql,
            function(err,rows,fields) {
                if (err) throw err;
                res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
                res.write(JSON.stringify(rows));
                res.end();
            }
        );
        connection.end();
    }
};

var collect = function(cardnumber) {
    var options = { 
        hostname : 'www.cdgjbus.com', 
        port : 80, 
        path : '/Card.aspx?Pid=96&CardNumder='+cardnumber,
        method : 'GET',
        headers : {
            'User-Agent' : 'RealtekVOD'
        }
    };
    
    http.get(options, function(response) { 
        if (response.statusCode == 200) { 
            var cardResult = "";
            response.on('data', function(chunk) { 
                cardResult = cardResult.toString() + chunk.toString(); 
            });
            response.on('end', function() {
                console.log('buscard.collect:' + '---' + cardnumber + '---' + new Date() );
                var tree = cheerio.load(cardResult.match(/<table[\s\S]+<\/table>/)[0]);
                var trs = tree('table').find('table').find('tr');
                if(trs.length >= 2) {
                    var td = trs.eq(1).find('td').eq(0).text().replace(/[\r\n\s]+/g, '');
                    if(td.length == 12) {
                        queryandstore(cardnumber, tree, trs);
                    }
                    else {
                        console.log(td);
/*                        if(interval < 200000) {
                            interval *= 2;
                            clearInterval(int);
                            int = setInterval(function() {
                                collectrange(z, 50);
                            }, interval);
                        }
                        return;*/
                    }
                }
                else {
                    console.log('no results returned');
                }
                z++;
            });
        }
    });
};
exports.collect = collect;

//collect(pad('20228066',8));

//console.log(table('tr').text());
var z = 500;
var interval = 15000;
/*var collectrange = function(from, to){
    console.log('buscard.collect:' + '---' + from + '---' + new Date() );
    if(from < to) {
        collect(pad((from).toString(),8));
    }
    else {
        clearInterval(int);
    }
};
var int = setInterval(function() {
    collectrange(z, 600);
}, interval);
*/
