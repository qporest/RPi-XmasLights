#!/usr/bin/env python
from bottle import route, run, static_file, get, post, request
import json
import smbus
import threading
from Queue import Queue, Empty
import time
import RPi.GPIO as GPIO
import subprocess
import glob
import os.path
import os
import signal

music_list = glob.glob('/home/pi/music/*.mp3')+glob.glob('/home/pi/music/*.wav')
for i in range(len(music_list)):
	music_list[i] = music_list[i].split('/')[-1]
relaySequence = ['11','12','16','36','38']
relays = {
	'11': False,
	'12': False,
	'16': False,
	'36': False,
	'38': False
}
process = None

def stop_music(pid):
	print('Stopping '+str(pid))
	os.killpg(os.getpgid(pid), signal.SIGTERM)
	process = None
	updateRelayBoard([False]*len(relaySequence))

def updateRelay(num, value):
	"""Updates separate relays with inverted values"""
	#check is music is running, if so kill it and turn off all relays
	global process
	if process is not None:	
		if process.poll() is None:
			stop_music(process.pid)	
	GPIO.output(int(relaySequence[num]), int(value))
	relays[relaySequence[num]] = value

GPIO.cleanup()
GPIO.setmode(GPIO.BOARD)
for i in range(len(relaySequence)):
	GPIO.setup(int(relaySequence[i]),GPIO.OUT)
	updateRelay(i, False)
newData = False
new_data = []

def updateRelayBoard(seq):
	"""Updates 5 output channels of the relay
	@param seq
		contrains true or false values, to turn on or off relay channel
	"""
	for i in range(len(seq)):
		if seq[i]==True or seq[i]==False:
			updateRelay(i, seq[i])
		else:
			updateRelay(i, False)


#Serve the html file
@route('/')
def serve_index():
	return static_file('index.html',root='/home/pi/music')

@post('/update')
def update():
	"""
		Processes the action requested by the user.
		Two possible values of 'command'
		- relays
			'value'
			- all_on
			- all_off
			- sequence
				'parameter'
				list of 5 true/false values
		- music
			'value' has two possible values
			- play
				'parameter' - name of mp3 file
			- stop 
	"""
	response = {}
	postdata = request.body.read()
	value = json.loads(postdata)
	if value['command'] == 'relays':
		print('[Relays '+value['value']+']')
		if value['value'] == 'all_on':
			print('on')
			updateRelayBoard([True]*len(relaySequence))
		elif value['value'] == 'all_off':
			print('off')
			updateRelayBoard([False]*len(relaySequence))
		elif value['value'] == 'sequence':
			updateRelayBoard(value['parameter'])
		else:
			print("Unexpected value for command RELAYS: "+str(value['value']))
	elif value['command'] == 'music':
		if(os.path.isfile(value['value'])):
			global process
			updateRelay(0, False)
			#to make sure that prev. music is stopped		
			process = subprocess.Popen('sudo python /home/pi/music/lightshowpi/py/synchronized_lights.py --file=/home/pi/music/"'+value['value']+'"',stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True, preexec_fn=os.setsid)
			print('Started process '+str(process.pid))
		else:
			print('[Unknown file '+value['command']+']')
	return json.dumps(response)

@post('/component')
def update_component():
	"""
		Processes the action requested by the user regarding to a specific component 
		Returns info relevant to the component or an empty object.
	"""
	postdata = request.body.read()
	value = json.loads(postdata)
	component = value['component'].split('/')
	response = {}
	if value['command'] == "toggle":
		if component[0] == 'relay': 
			component[1] = int(component[1])
			print('[relay '+str(component[1])+']')
			if component[1] < len(relaySequence):
				updateRelay(component[1], not relays[relaySequence[component[1]]])
				response = {"state": relays[relaySequence[component[1]]]}
	return json.dumps(response)

@get('/status')
def get_status():
	"""
	Return json with status of whatever's connected.
	I add dictionary of arrays.
	"""
	response = {'relay':{}}
	for i in range(len(relaySequence)):
		response['relay'][i] = relays[relaySequence[i]]
	return json.dumps(response)

@get('/getMusic')
def get_music_list():
	"""
	Return a preloaded music list.
	"""
	response = {'list':[]}
	response['list'] = music_list
	return json.dumps(response)

@route('/css/<filename>')
def server_static_css(filename):
    return static_file(filename, root='/home/pi/music/css')

@route('/js/<filename>')
def server_static_js(filename):
    return static_file(filename, root='/home/pi/music/js')

@route('/img/<filename>')
def server_static_img(filename):
    return static_file(filename, root='/home/pi/music/img')

@route('/js/vendor/<filename>')
def server_static_js_vendor(filename):
    return static_file(filename, root='/home/pi/music/js/vendor')

if __name__ == "__main__":
	#i'm using this port just because I've already had settings for it
	run(host="0.0.0.0", port=12300)
