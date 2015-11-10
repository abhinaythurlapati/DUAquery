var moment = require("moment");
var momentz = require("moment-timezone");
var fs = require('fs');
var path = require('path');
var mongodb = require("mongojs");

var url = "localhost:27017/" ;
var dburl1 = url + "test";
var coll = 'dummy2';

var jsonFile = path.join(__dirname,"output1.json");
var db = mongodb.connect(dburl1);
var getdata = db.collection(coll);


var jsondata = fs.readFileSync(jsonFile);


jsondata  = JSON.parse(jsondata);
console.log(jsondata);
for(var i = 0;i < jsondata.length;i++){
  jsondata[i].date = new Date(jsondata[i].date);
  jsondata[i].server_synctime = new Date(jsondata[i].server_synctime);

  //console.log(jsondata[i]);
}

getdata.insert(jsondata,function(err){
				if(err){
					console.log(err);
				}
				else{
					console.log("hehe");
					//console.log("successfully synced data " + request.connection.remoteAddress); 
					//response.write("successfully synced data " + request.connection.remoteAddress);
					//response.end();	
				}
			});

//console.log(jsondata);
