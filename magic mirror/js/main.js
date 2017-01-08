var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var latitude = "40.001687", longtitude = "-83.151565";
var api = "e0be9ef8e1f460d42415e76155d07b56";
var base_url = "https://api.darksky.net/forecast/";

var weatherUpdateTime = 1000*60*30;//every 30 mins
var quoteUpdateTime = 1000*60*20;//every 20 mins

function init(){
	var goFS = document.getElementById("container");
  	goFS.addEventListener("click", function() {
		toggleFullScreen();
  	}, false);
	setTime();
	setWeather();
	setQuote();
}

function toggleFullScreen() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  }
  else {
    cancelFullScreen.call(doc);
  }
}

function setTime(){
	var now = new Date();
	var hours = 
	$("#clock").text((now.getHours()<10 ? "0" : "")+now.getHours()+":"+(now.getHours()===0 ? "00" : (now.getMinutes()<10 ? "0" : ""))+now.getMinutes());
	setDate();
	window.setTimeout(setTime, 100);
}

function setDate(){
	var now = new Date();
	$("#date").text(days[now.getDay()]+", "+month[now.getMonth()]+" "+now.getDate());
}

function setWeather(){
	$.ajax({
		type: "POST",
  		dataType: 'jsonp',
		url: base_url+api+'/'+latitude+','+longtitude, 
		success: function(data){
			console.log(data);
			$("#temp").text(data['currently']['temperature']);
			$("#appTemp").text(data['currently']['apparentTemperature']);
			var icon = "<i class=\"wi ";
			switch(data['currently']['icon']){
				case 'clear-day': icon+="wi-day-sunny"; break;
				case 'clear-night':  icon+="wi-night-clear"; break;
				case 'rain':  icon+="wi-rain"; break;
				case 'snow':  icon+="wi-snow"; break;
				case 'sleet':  icon+="wi-sleet"; break;
				case 'wind':  icon+="wi-strong-wind"; break;
				case 'fog':  icon+="wi-dust"; break;
				case 'cloudy':  icon+="wi-cloudy"; break;
				case 'partly-cloudy-day':  icon+="wi-day-cloudy"; break;
				case 'partly-cloudy-night': icon+="wi-night-alt-cloudy";  break;
				default: break;
			}
			icon += "\"></i>";
			$('#icon').html(icon);
			$('#humidity').text('Humidity:'+data['currently']['humidity']*100+'%');
		}
	});
	window.setTimeout(setWeather, weatherUpdateTime);
}

function setQuote(){
	$.ajax({
		type: 'GET',
  		dataType: 'jsonp',
  		jsonp: 'jsonp',
		url: "http://api.forismatic.com/api/1.0/",
		data: {
			method: 'getQuote',
			key: '2',
			format: 'jsonp',
			lang: 'en',
		},
		success: function(data){
			console.log(data);
	        $('#quote').text(data['quoteText']);
	    }
	});
	window.setTimeout(setQuote, quoteUpdateTime);
}
function quoteSuccess(data){
	console.log(data);
	$('#quote').text(data['quoteText']);
}
$(document).ready(function(){
	init();	
});

