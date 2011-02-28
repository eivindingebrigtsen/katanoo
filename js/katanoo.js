jQuery(function(jQuery) {
	window.Katanoo = function(options) {
var self = this,		
		$ = jQuery,
		doc = document,
		nav = navigator,
		win = window,
		loc = doc.location,
		time = new Date().getTime();
		doc.__ = self;

		self.postURL = "http://server1.katanoo.com:8000/katanoo/put";
		self.interval = 5000;
		self.uniqueid = time;
		self.uri = loc.host+loc.pathname;
		self.it = 0;
		self.values = {};
		self.defaults = $.extend({
			controls: false
		}, options);

		self.keys = {
			8: 'backspace',
			9: 'tab',
			13: 'enter',
			16: 'shift',
			17: 'ctrl',
			18: 'alt',
			19: 'break',
			20: 'caps lock',
			27: 'escape',
			32: 'space',
			33: 'page up',
			34: 'page down',
			35: 'end',
			36: 'home',
			37: 'left arrow',
			38: 'up arrow',
			39: 'right arrow',
			40: 'down arrow',
			45: 'insert',
			46: 'delete',
			91: 'cmd',
			93: 'cmd',
      186: ':',
      188: ',',
			190: '.'
		};
		self.events = [
		{
			'name': 'mousemove',
			'short': 'mm',
			'play'		: function(ev){
				self.mouse.css({'left': ev[2]+'px', 'top': ev[3]+'px'});
			},
			'write': function(e) {
				return 'mm ' + self.getCoordinates(e);
			}
		},
		{
			'name': 'click',
			'short': 'cl',
			'play'		: function(ev){
				if(ev[2]){
					$(ev[2]).trigger('click');
				}
				self.mouse.css({width: '20px', height: '20px', margin: '-10px 0 0 -10px'});
				setTimeout(function(){
					self.mouse.css({width: '4px', height: '4px', margin: '-2px 0 0 -2px'});
				}, 250);
			},
			'write': function(e) {
				return 'cl ' + 	self.getTarget(e);
			}
		},
		{
			'name': 'mouseover',
			'short': 'mo',
			'play': function(ev){
					$(ev[2]).trigger('mouseover');
			},
			'write': function(e){
				return 'mo ' + 	self.getTarget(e);

			}
		},
		{
			'name': 'mouseout',
			'short': 'mu',
			'play': function(ev){
				$(ev[2]).trigger('mouseout');
			},
			'write': function(e){
				return 'mu ' + 	self.getTarget(e);

			}
		},
		{
			'name': 'keydown',
			'short': 'kd',
			'play'		: function(ev){
				var t = ev.slice(6).join(' ');				
				$(ev[5]).val(t);
			},
			'write': function(e) {
				var c = e.keyCode,
					p = (self.keys[c] ? self.keys[c] : String.fromCharCode(e.keyCode));
				return 'kd ' + p + ' ' + c + ' '+ self.getTarget(e)
			}
		},
		{
			'name': 'resize',
			'short': 'rs',
			'play'		: function(ev){
				win.resizeTo(parseFloat(ev[2]),parseFloat(ev[3]));
			},
			'write': function(e) {
				return 'rs ' + self.getScreenSize();
			}
		},
		{
			'name': 'scroll',
			'short': 'sc',
			'play'		: function(ev){
				win.scroll(parseFloat(ev[2]),parseFloat(ev[3]));				
			},
			'write': function(e) {
				return 'sc ' + self.getScreenScroll();
			}
		},
		{
			'name': 'focusout',
			'short': 'bl',
			'play'		: function(ev){
				var t = ev.slice(4).join(' ');				
				$(ev[3]).val(t);
			},
			'write': function(e) {
				return 'bl ' + self.getTarget(e) + ' ' + e.target.value;
			}
		},
		{
			'name'	: 'focusin',
			'short'	: 'fo',
			'play'		: function(ev){
				var t = ev.slice(4).join(' ');				
				$(ev[3]).val(t);
			},
			'write': function(e) {
				return 'fo ' + self.getTarget(e) + ' ' + e.target.value;
			}
		}];

		self.init = function() {
			self.checkValues();
			self.addSender();
			self.attachEvents();
			self.sendData();
		};
		self.addSender = function(){
			self.send = $('<div>', {
				'id': 'katanoo_send',
				'css': {
					'position': 'absolute',
					'top': '-9999px',
					'left': '-9999px'
				}
			}).appendTo('body');			

		};
		self.checkValues = function(){
			self.inputs = $('input:not(:submit)');
			self.inputs.each(function(){
				self.values[self.inputs.index(this)] = $(this).val();
			});
		};
		self.attachEvents = function() {
			win.onresize = doc.onscroll = self.writeLog; 
			doc.onunload = self.sendData;
			$('body').live('click mousemove keydown mouseover mouseout', self.writeLog);
			$(':text').live('focusin focusout', self.writeLog);
		};
		self.writeLog = function(e) {
			var ev = null;
			for (var a in self.events) {
				if (self.events[a].name === e.type) {
					ev = self.events[a].write(e);
				}
			}
			if (ev) {
				var t = new Date().getTime();
				self.data.events['ev_'+(t-time)] = ev;
        console.log('ev_'+(t-time), ev);
				if(self.eventslength()>650){
					self.sendData();
				}
			}
		};
		self.eventslength = function(){
			var i = 0, str = '';
			for(var a in self.data.events){
				str += self.data.events[a].toString();
				i++;
			}
			return str.length;
		};
		self.getTarget = function(e){
				var el = e.target,
						path = [], index;
				do {
    			path.unshift(el.nodeName + (el.className ? '.' + el.className + '' : ''));
				} while ((el.nodeName.toLowerCase() != 'html') && (el = el.parentNode));

				path = path.join('>');	
				index = $('*').index(e.target);
								
				if (el.id){ 
				  return '#' + el.id;
				}
				if(el.className) {
				  return path + '.' + el.className; 
				}
				if(el.nodeName.toLowerCase() === 'img') {
				  return path + '[src=' + el.src +']';
				}
				return ' *:eq('+index+')';
		};
		self.getCoordinates = function(e) {
			return e.pageX + ' ' + e.pageY;
		};
		self.getScreenSize = function() {
			var w = 0,
				h = 0;
			if (typeof(win.innerWidth) == 'number') {
				w = win.innerWidth;
				h = win.innerHeight;
			} else if (doc.documentElement && (doc.documentElement.outerWidth || doc.documentElement.outerHeight)) {
				w = doc.documentElement.outerWidth;
				h = doc.documentElement.outerHeight;
			} else if (doc.body && (doc.body.outerWidth || doc.body.outerHeight)) {
				w = doc.body.outerWidth;
				h = doc.body.outerHeight;
			} else {
				return false;
			}
			return w + ' ' + h;
		};
		self.getScreenScroll = function() {
			var x = 0,
				y = 0;
			if (typeof(win.pageYOffset) == 'number') {
				x = win.pageXOffset;
				y = win.pageYOffset;
			} else if (doc.documentElement && (doc.documentElement.scrollLeft || doc.documentElement.scrollTop)) {
				y = doc.documentElement.scrollTop;
				x = doc.documentElement.scrollLeft;
			} else if (doc.body && (doc.body.scrollTop !== undefined)) {
				x = doc.body.scrollLeft;
				y = doc.body.scrollTop;
			} else {
				return false;
			}
			return x + ' ' + y;
		};
		self.escapeData = function(data){
      var str = "";
		  for (var a in data){
		    if(typeof(data[a]) === 'object'){
		      str += self.escapeData(data[a]);
		    }else if(data[a]){
		      str += "&"+a+'='+escape(data[a]);		      
		    }
		  }
		  return str;
		};
		self.storeData = function(data){
			for(var a in data){
				self.storage[a] = data[a];
			}
		};
		self.sendData = function() {			
			var sendData = self.data;			
			self.send.append('<img src="'+self.postURL+'?uri='+self.uri+'&id='+self.uniqueid+self.escapeData(sendData)+'"/>');
			self.storeData(self.data.events);
			self.data.events = null;
			self.data.events = {};
			self.uniqueid = self.uniqueid;
			self.it++;
		};
		self.play = function(){
      var v;
			win.scroll(0,0);
			self.inputs.each(function(){
				$(this).val(self.values[self.inputs.index(this)]);
			});
			self.mouse = $('<div>', {
				css: {
					'background': 'red', 
					'width': '4px', 
					'height': '4px', 
					'margin': '-2px 0 0 -2px',
					'position': 'absolute'
				}
			}).appendTo('body');
      for(var a in self.storage){
        v =  self.storage[a];
				var time = a.substring(3);
				var ev = v.split(' ');
				console.log(time, ev)
				setTimeout(function(){
					for ( a in self.events ){
						if( self.events[a]['short'] === ev[0] ){
								self.events[a]['play'](ev);
						}
					}
				}, parseFloat(time));        
      }
		};
		self.storage = {};
		self.data = {
			cached_inputs: self.values,
			agent: nav.userAgent,
			oscpu: nav.oscpu,
			language: nav.language,
			window: win.outerWidth + ' ' + win.outerHeight,
			screen: screen.availWidth + ' ' + screen.availHeight,
			browser: self.getScreenSize(),
			cookies: doc.cookie,
			events: {}
		};
		self.init();
		return self;
	}();
});
