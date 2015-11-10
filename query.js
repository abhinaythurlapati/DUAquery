var fs = require('fs');
var path = require('path');
var mongodb = require("mongojs");
var moment = require("moment");
var momentz = require("moment-timezone");
var url = "localhost:27017/" ;
//var dburl1 = url + "mobiledata" ;
var dburl1 = url + "test";

var jsonFile = path.join(__dirname,"plot.json");

//var coll = 'logs';
var coll = 'dummy2';
var db = mongodb.connect(dburl1);
var getdata = db.collection(coll);

//dummy date,month and year only time is valid
var morning_start = moment("2015-05-26T06:00:00.000+0530");
var morning_end = moment("2015-05-26T11:00:00.000+0530");
morning_start = momentz.tz(morning_start._d,'GMT');
morning_end = momentz.tz(morning_end._d,'GMT');
morning_start = moment.utc(morning_start.format());
morning_end = moment.utc(morning_end.format());

var afternoon_start = moment("2015-05-26T11:00:00.000+0530");
var afternoon_end = moment("2015-05-26T16:00:00.000+0530");
afternoon_start = momentz.tz(afternoon_start._d,'GMT');
afternoon_end = momentz.tz(afternoon_end._d,'GMT');
afternoon_start = moment.utc(afternoon_start.format());
afternoon_end = moment.utc(afternoon_end.format());

var evening_start = moment("2015-05-26T16:00:00.000+0530");
var evening_end = moment("2015-05-26T20:00:00.000+0530");
evening_start = momentz.tz(evening_start._d,'GMT');
evening_end = momentz.tz(evening_end._d,'GMT');
evening_start = moment.utc(evening_start.format());
evening_end = moment.utc(evening_end.format());

var night_start = moment("2015-05-26T20:00:00.000+0530");
var night_end = moment("2015-05-26T01:00:00.000+0530");
night_start = momentz.tz(night_start._d,'GMT');
night_end = momentz.tz(night_end._d,'GMT');
night_start = moment.utc(night_start.format());
night_end = moment.utc(night_end.format());

var earlymorning_start = moment("2015-05-26T01:00:00.000+0530");
var earlymorning_end = moment("2015-05-26T06:00:00.000+0530");
earlymorning_start = momentz.tz(earlymorning_start._d,'GMT');
earlymorning_end = momentz.tz(earlymorning_end._d,'GMT');
earlymorning_start = moment.utc(earlymorning_start.format());
earlymorning_end = moment.utc(earlymorning_end.format());




var pad = function(num) {
    var norm = Math.abs(Math.floor(num));
    return (norm < 10 ? '0' : '') + norm;
};


//query collections with specific date
/*
function dates_between(var ISOdate1 = ,var ISOtime1, var ISOdate2, var ISOtime2){


}
 */

//defualt values f
var toDate = moment()._d;
var fromDate = moment().subtract('1','month').startOf('day')._d;


var getData = function(sessionStartHours,sessionStartMinutes,sessionEndHours,sessionEndMinutes,session){

	getdata.aggregate([{$match : { date: { "$gte" : fromDate,"$lte" : toDate}}},{ "$redact": {
	    "$cond": {
	        "if": {
	            "$and": [
	                { "$gte": [
	                    { "$add": [
	                        { "$hour": "$date" },
	                        { "$divide": [{ "$minute": "$date" }, 60] }
	                    ]},
	                    //morning_start.hours() + (morning_start.minutes()/60)
	                    sessionStartHours + (sessionStartMinutes/60)
	                ]},
	                { "$lte": [
	                    { "$add": [
	                        { "$hour": "$date" },
	                        { "$divide": [{ "$minute": "$date" }, 60] }
	                    ]},
	                    //morning_end.hours() + (morning_end.minutes()/60)
	                    sessionEndHours + (sessionEndMinutes/60)
	                ]}
	            ]
	        },
	        "then": "$$KEEP",
	        "else": "$$PRUNE"
	    }
	}},{
		$group: {
			_id : null,
			totalTxWifi : { $avg : "$txwifi"},
			totalRxWifi : { $avg : "$rxwifi"},
			totalTxCell : { $avg : "$txcell"},
			totalRxCell : { $avg : "$rxcell"},
			 
			//"AfterNoon", "Evening", "Night", "Early Morning"
		}
	} ],function(err,docs){
		if(err){
			console.log(err);
		}
		else{
			
			
				var y_variables = ["totalTxWifi","totalRxWifi","totalTxCell","totalRxCell" ];
				//var x_variables = ["Morning", "AfterNoon", "Evening", "Night", "Early Morning"];
				var givejson = function(session_val, data_type, data_val){
					var plotjson = {
							"Session" : session_val,
							"type" : data_type,
							"data" : data_val
							}
					return plotjson;
				}
				
				
				if(docs.length == 0){					
				    for(var j=0; j< 4; j++){
				    	
				    	var empty = givejson(session,y_variables[j],0);
						fs.appendFileSync(jsonFile, JSON.stringify(empty));
				    }
					
				}
				else{
					
					for(var i =0 ; i < docs.length;i++){
						docs[i].Session = session;
					    console.log(docs[i]);	
						//console.log("hello");
						//console.log(docs[i].date.toISOString());
					    var jsondata = givejson(session,"totalTxWifi",docs[i].totalTxWifi)
					    fs.appendFileSync(jsonFile, JSON.stringify(jsondata));
					    var jsondata = givejson(session,"totalRxWifi",docs[i].totalRxWifi)
					    fs.appendFileSync(jsonFile, JSON.stringify(jsondata));
					    var jsondata = givejson(session,"totalTxCell",docs[i].totalTxCell)
					    fs.appendFileSync(jsonFile, JSON.stringify(jsondata));
					    var jsondata = givejson(session,"totalRxCell",docs[i].totalRxCell)
					    fs.appendFileSync(jsonFile, JSON.stringify(jsondata));
					    }
					}
				}
		});
}

getData(morning_start.hours(),morning_start.minutes(),morning_end.hours(),morning_end.minutes(),"Morning");
getData(afternoon_start.hours(),afternoon_start.minutes(),afternoon_end.hours(),afternoon_end.minutes(),"AfterNoon");
getData(evening_start.hours(),evening_start.minutes(),evening_end.hours(),evening_end.minutes(),"Evening");
getData(night_start.hours(),night_start.minutes(),night_end.hours(),night_end.minutes(),"Night");
getData(earlymorning_start.hours(),earlymorning_start.minutes(),earlymorning_end.hours(),earlymorning_end.minutes(),"Early Morning");






//Date formate YYYY-MM-DD

/*getdata.aggregate({$match : { date: { "$gte" : fromDate,"$lte" : toDate}}},function(err,docs){
	if(err){
		console.log(err);
	}
	else{
		for (var i =0; i< docs.length;i++){
			
			var tmp = moment(docs[i].date);
			console.log(tmp._d);
			var year = tmp.year();
			var month = tmp.month();
			var day = tmp.date();
			if 
			console.log(year);
			console.log(month);
			console.log(day);
			
			var temp_date = year + "-" + month + "-" + day + "T" + morning_start;
			var temp_date2 = year + "-" + month + "-" + day + "T" + morning_end;
			console.log(temp_date);
			console.log(temp_date2);
			var query_fromTime =  moment(new Date(temp_date));
			var query_endTime = moment(new Date(temp_date2));
			console.log(query_fromTime._d); 
			console.log(query_endTime._d);
			
		}
	}

});

/*
 {
	$group: {
		_id : null,
		totalTxWifi : { $avg : "$txwifi"},
		totalRxWifi : { $avg : "$rxwifi"},
		totalTxCell : { $avg : "$txcell"},
		totalRxCell : { $avg : "$rxcell"},
		Session : "Morning", "AfterNoon", "Evening", "Night", "Early Morning"
	}
}

 
getdata.insert({"date" : moment().startOf('day')._d  },function(err,docs){
	if(err){
		console.log(err);
	}
	else{
			console.log(docs);
	}
});
 */
