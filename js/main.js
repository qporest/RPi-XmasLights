var base_url = "http://192.168.0.25:12300/";
//not sure if base url is actually needed

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
				$(self).children(".text").html('On <i class="fa fa-lightbulb-o on" aria-hidden="true"></i>');
			} else {
				$(self).children(".text").html('Off <i class="fa fa-lightbulb-o off" aria-hidden="true"></i>');
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

//called once to get the list of music and state of relays
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

//loads all the enviromental variables
function update(){
	$.get(base_url+"status", 
	function(data){
		data = JSON.parse(data);
		console.log(data);
		for(var i in data['relay']){
			if(data['relay'].hasOwnProperty(i)){
				if(data['relay'][i]){
					$('#relay-'+i).children(".text").html('On <i class="fa fa-lightbulb-o on" aria-hidden="true"></i>');
				} else {
					$('#relay-'+i).children(".text").html('Off <i class="fa fa-lightbulb-o off" aria-hidden="true"></i>');
				}
			}
		}
	});
}
