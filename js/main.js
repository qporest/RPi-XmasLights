var base_url = "http://192.168.0.25:12300/";

$(document).ready(function(){
	init();
	//toggle to change each relay by itself
	$(".toggle").click(function(){
		var self = this;
		$.post(base_url+"component", JSON.stringify({
			'command': 'toggle',
			'component': $(this).attr("component")
		}), function(data){
			console.log(data);	
			data = JSON.parse(data);
			if(data["state"]){
				$(self).children(".text").text("On");
			} else {
				$(self).children(".text").text("Off");
			}
		});
	});

	$(".command").click(function(){
		$.post(base_url+"update", JSON.stringify({
			'value': $(this).attr("command"),
			'command': 'relays'
		}), function(data){
			data = JSON.parse(data);
			update();
		});
	});

});

function init(){
	loadMusicList();
	update();
}

function loadMusicList(){
	$.get(base_url+"getMusic", 
		function(data){
			data = JSON.parse(data);
			console.log(data);
			var text;
			for(var i=0;i<data['list'].length; i++){
					text = "<div class='card song' song=\""+data['list'][i]+"\">"+
						"<div class='title'>"+data['list'][i]+"</div>"+
						"</div>";
					$("#musicList").append($("<div/>").html(text).contents());
				
			}
			$(".song").click(function(){
                $.post(base_url+"update", JSON.stringify({
                        "value": $(this).attr("song"),
                        'command': 'music'
                }), function(data){
                        data = JSON.parse(data);
                        update();
           		});
        	});

		}
	);


}
//loads all the envviromental variables
function update(){
	$.get(base_url+"status", 
	function(data){
		data = JSON.parse(data);
		console.log(data);
		for(var i in data['relay']){
			if(data['relay'].hasOwnProperty(i)){
				if(data['relay'][i]){
					$('#relay-'+i).children(".text").text("On");
				} else {
					$('#relay-'+i).children(".text").text("Off");
				}
			}
		}
	});
}
