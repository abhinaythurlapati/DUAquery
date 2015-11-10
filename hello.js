var moment = require("moment");
var momentz = require("moment-timezone");
var fs = require('fs');
var path = require('path');
var mongodb = require("mongojs");

var url = "localhost:27017/" ;
var dburl1 = url + "mobiledata";
var coll = 'logs';

var jsonFile = path.join(__dirname,"db_data.json");
var db = mongodb.connect(dburl1);
var getdata = db.collection(coll);

getdata.find({},function(err,docs){
	if(err){
		console.log(err);	
	}
	else{
		fs.appendFileSync(jsonFile, JSON.stringify(docs));	
	}

});
