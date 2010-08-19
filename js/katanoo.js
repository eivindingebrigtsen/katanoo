jQuery(function() {
	var Katanoo = function(options) {
		var self = this,		
				lib = jQuery,
				doc = document,
				nav = navigator,
				win = window,
				time = new Date().getTime();
				doc.__ = self;


				// From Server
				self.postURL = "#";
				self.interval = 5000;
				self.uniqueid = 'uniqueid';


		self.defaults = lib.extend({
			controls: true
		}, options);


		self.eventsStorage = [];
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
			93: 'cmd'
		};
		self.events = [
		{
			'name': 'mousemove',
			'short': 'mm',
			'play'		: function(ev){
				self.mouse.css({'left': ev[2]+'px', 'top': ev[3]+'px', })
			},
			'write': function(e) {
				return 'mm ' + self.getCoordinates(e);
			}
		},
		{
			'name': 'click',
			'short': 'cl',
			'play'		: function(ev){
				console.log(ev[2]);
				if(ev[3]){
					lib(ev[3]).trigger('click');
				}
				self.mouse.css({width: '20px', height: '20px', margin: '-10px 0 0 -10px'});
				setTimeout(function(){
					self.mouse.css({width: '4px', height: '4px', margin: '-2px 0 0 -2px'});
				}, 250);
			},
			'write': function(e) {
				console.log(self.getTarget(e));
				return 'cl ' + 	self.getTarget(e);
			}
		},
		{
			'name': 'keyup',
			'short': 'kd',
			'play'		: function(ev){
				console.info(ev);
				lib(ev[5]).val(ev[6]);
			},
			'write': function(e) {
				var c = e.keyCode,
					p = (self.keys[c] ? self.keys[c] : String.fromCharCode(e.keyCode));
				return 'kd ' + p + ' ' + c + ' '+ self.getTarget(e) + ' ' +e.target.value;
			}
		},
		{
			'name': 'resize',
			'short': 'rs',
			'play'		: function(ev){
			},
			'write': function(e) {
				return 'rs ' + self.getScreenSize()
			}
		},
		{
			'name': 'scroll',
			'short': 'sc',
			'play'		: function(ev){
				console.log(ev);
			},
			'write': function(e) {
				return 'sc ' + self.getScreenScroll()
			}
		},
		{
			'name': 'focusout',
			'short': 'bl',
			'play'		: function(ev){
				lib(ev[3]).val(ev[4]);
			},
			'write': function(e) {
				return 'bl ' + self.getTarget(e) + ' ' + e.target.value;
			}
		},
		{
			'name'	: 'focusin',
			'short'	: 'fo',
			'play'		: function(ev){
				lib(ev[3]).val(ev[4]);
			},
			'write': function(e) {
				return 'fo ' + self.getTarget(e) + ' ' + e.target.value;
			}
		}];

		self.init = function() {
			if(self.defaults.controls){
				self.buildControls();
			}
			self.attachEvents();
			self.setTimer();
		};
		self.buildControls = function(){
			var controls =  '<ul style="margin:0;padding:0;float:left;">';
					controls += '<li id="katanoo" style="padding-left:2px; display:inline;margin:0;padding:0; line-height: 16px; list-style: none;font-size:9px; font-family: Monaco, courier; height: 16px; float: left; margin-right: 5px;">Katanoo</li>';
					controls += '<li id="katanoo_stop" style="display:inline;margin:0;padding:0;list-style: none; width:16px; height: 16px; float: left; background: url(http://jqueryui.com/themeroller/images/?new=454545&w=256&h=240&f=png&fltr[]=rcd|256&fltr[]=mask|icons/icons.png) no-repeat -32px -192px;;"></li>';
					controls += '<li id="katanoo_play" style="display:inline;margin:0;padding:0;list-style: none; width:16px; height: 16px; float: left; background: url(http://jqueryui.com/themeroller/images/?new=454545&w=256&h=240&f=png&fltr[]=rcd|256&fltr[]=mask|icons/icons.png) no-repeat -48px -192px"></li>';
					controls += '</ul>';
			var wrap = lib('<div>', {
				'id': 'katanoo_controls', 
				'html': controls,
				'css': {
					'background': '#eee',
					'float': 'left', 
					'padding': '2px',
					'height': '16px', 
					'margin': '0 4px 0 0',
					'position': 'absolute',
					'-moz-border-radius': '4px',
					'-webkit-border-radius': '4px',
					'border-radius': '4px'
				}
			}).appendTo('body');
			lib('#katanoo_stop').click(function(e){
				self.stop();
			});
			lib('#katanoo_play').click(function(e){
				self.play();
			});
			
		};
		self.setTimer = function() {
			self.timer = setTimeout(function() {
				self.sendData();
				self.setTimer();
			},self.interval);
		};
		self.attachEvents = function() {
			win.onresize = doc.onscroll = self.writeLog; 
			doc.onunload = self.sendLog;
			lib('body').live('click mousemove keyup', self.writeLog)
			lib(':text').live('focusin focusout', self.writeLog);
		};
		self.writeLog = function(e) {
			var ev = null;
			for (a in self.events) {
				if (self.events[a].name === e.type) {
					ev = self.events[a].write(e);
				}
			}
			if (ev) {
				var t = new Date().getTime();
				self.data.events.push( (t-time) +' '+ ev );
			}
		};
		self.getTarget = function(e){
				var el = e.target,
						path = [];
				do {
    			path.unshift(el.nodeName + (el.className ? ' class="' + el.className + '"' : ''));
				} while ((el.nodeName.toLowerCase() != 'html') && (el = el.parentNode));

				path = path.join('>');	
				index = lib('*').index(e.target);
								
				if (el.id) return '#' + el.id; 				
				if(el.className) return path + '.' + el.className; 
				if(el.nodeName.toLowerCase() === 'img') return path + '[src=' + el.src +']';
				
				return path+' *:eq('+index+')';
		};
		self.getCoordinates = function(e) {
			return e.pageX + ' ' + e.pageY;
		}
		self.getScreenSize = function() {
			var w = 0,
				h = 0;
			if (typeof(win.innerWidth) == 'number') {
				w = win.innerWidth;
				h = win.innerHeight
			} else if (doc.documentElement && (doc.documentElement.clientWidth || doc.documentElement.clientHeight)) {
				w = doc.documentElement.clientWidth;
				h = doc.documentElement.clientHeight
			} else if (doc.body && (doc.body.clientWidth || doc.body.clientHeight)) {
				w = doc.body.clientWidth;
				h = doc.body.clientHeight
			} else {
				return false
			}
			return w + ' ' + h
		}
		self.getScreenScroll = function() {
			var x = 0,
				y = 0;
			if (typeof(win.pageYOffset) == 'number') {
				x = win.pageXOffset;
				y = win.pageYOffset
			} else if (doc.documentElement && (doc.documentElement.scrollLeft || doc.documentElement.scrollTop)) {
				y = doc.documentElement.scrollTop;
				x = doc.documentElement.scrollLeft
			} else if (doc.body && (doc.body.scrollTop !== undefined)) {
				x = doc.body.scrollLeft;
				y = doc.body.scrollTop
			} else {
				return false
			}
			return x + ' ' + y
		}
		self.sendData = function() {
			var sendData = JSON.stringify(self.data);
			lib.ajax({
				type: 'POST',
				data: sendData,
				url: self.postURL
			});
//			console.log(JSON.parse(sendData), sendData);
//			self.data.events = [];
			self.eventsStorage.push(self.data.events);
		};
		self.stop = function(){
			clearTimeout(self.timer);
		};
		self.record = function(){
			self.setTimer();
		};
		self.play = function(){
			console.time('playing is delayed')
			self.mouse = lib('<div>', {
				css: {
					'background': 'red', 
					'width': '4px', 
					'height': '4px', 
					'margin': '-2px 0 0 -2px',
					'position': 'absolute'
				}
			}).appendTo('body');
			lib(self.data.events).each(function(k,v){
				var ev = v.split(' ');
				setTimeout(function(){
					for ( a in self.events ){
						if( self.events[a]['short'] === ev[1] ){
								self.events[a]['play'](ev);
						}
					}
				}, parseFloat(ev[0]));
			});			
			console.timeEnd('playing is delayed')
			console.log('starting to play '+ self.data.events.length + ' events')
		};
		self.data = {
			id: self.uniqueid,
			time: time,
			url: doc.location,
			browser: {
				agent: nav.userAgent,
				oscpu: nav.oscpu,
				language: nav.language,
				screen: screen.availWidth + ' ' + screen.availHeight,
				browser: self.getScreenSize(),
				cookies: doc.cookie
			},
			events: []
		};

		self.init();
	}();
});
