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

		self.values = {};
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
//				//console.log(ev[2]);
				if(ev[2]){
					lib(ev[2]).trigger('click');
				}
				self.mouse.css({width: '20px', height: '20px', margin: '-10px 0 0 -10px'});
				setTimeout(function(){
					self.mouse.css({width: '4px', height: '4px', margin: '-2px 0 0 -2px'});
				}, 250);
			},
			'write': function(e) {
//				//console.log(self.getTarget(e));
				return 'cl ' + 	self.getTarget(e);
			}
		},
		{
			'name': 'mouseover',
			'short': 'mo',
			'play': function(ev){
					lib(ev[2]).trigger('mouseover');
			},
			'write': function(e){
				return 'mo ' + 	self.getTarget(e);

			}
		},
		{
			'name': 'mouseout',
			'short': 'mu',
			'play': function(ev){
				console.log(ev[1])
				lib(ev[2]).trigger('mouseout');
			},
			'write': function(e){
				return 'mu ' + 	self.getTarget(e);

			}
		},
		{
			'name': 'keydown',
			'short': 'kd',
			'play'		: function(ev){
				console.info(ev);
				var t = ev.slice(6).join(' ');				
				lib(ev[5]).val(t);
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
				win.resizeTo(parseFloat(ev[2]),parseFloat(ev[3]));
			},
			'write': function(e) {
//				//console.log(self.getScreenSize());
				return 'rs ' + self.getScreenSize()
			}
		},
		{
			'name': 'scroll',
			'short': 'sc',
			'play'		: function(ev){
				win.scroll(parseFloat(ev[2]),parseFloat(ev[3]));				
			},
			'write': function(e) {
				return 'sc ' + self.getScreenScroll()
			}
		},
		{
			'name': 'focusout',
			'short': 'bl',
			'play'		: function(ev){
				console.log(ev)
				var t = ev.slice(4).join(' ');				
				lib(ev[3]).val(t);
			},
			'write': function(e) {
				return 'bl ' + self.getTarget(e) + ' ' + e.target.value;
			}
		},
		{
			'name'	: 'focusin',
			'short'	: 'fo',
			'play'		: function(ev){
				console.log(ev)
				var t = ev.slice(4).join(' ');				
				lib(ev[3]).val(t);
			},
			'write': function(e) {
				return 'fo ' + self.getTarget(e) + ' ' + e.target.value;
			}
		}];

		self.init = function() {
			self.checkValues();
			if(self.defaults.controls){
				self.buildControls();
			}
			self.attachEvents();
			self.setTimer();
		};
		self.checkValues = function(){
			self.inputs = lib('input');
			self.inputs.each(function(){
				self.values[self.inputs.index(this)] = $(this).val();
			})
		};
		self.buildControls = function(){
			var css = '.ui-icon { width: 16px; height: 16px; float :left; background-image:'
				+ 'url(http://jqueryui.com//themeroller/images/?new=333333&w=256&h=240&f=png&fltr[]=rcd|256&fltr[]=mask|icons/icons.png); }'
				+'.ui-icon:hover {background-image: url(http://jqueryui.com//themeroller/images/?new=FF7700&w=256&h=240&f=png&fltr[]=rcd|256&fltr[]=mask|icons/icons.png); }'
				+'.ui-icon:active {background-image: url(http://jqueryui.com//themeroller/images/?new=222222&w=256&h=240&f=png&fltr[]=rcd|256&fltr[]=mask|icons/icons.png); }'
				+'.ui-icon-circle-triangle-e { background-position: -48px -192px; }'
				+'.ui-icon-circle-close { background-position: -32px -192px; }';
			
			$('<style>'+css+'</style>').appendTo('body');

			var controls =  '<ul style="margin:0;padding:0;float:left;">';
					controls += '<li id="katanoo" style="padding-left:2px; display:inline;margin:0;padding:0; line-height: 16px; list-style: none;font-size:9px; font-family: Monaco, courier; height: 16px; float: left; margin-right: 5px;">Katanoo</li>';
					controls += '<li id="katanoo_stop" style="display:inline;list-style: none;" class="ui-icon ui-icon-circle-close"></li>';
					controls += '<li id="katanoo_play" style="display:inline;list-style: none;" class="ui-icon ui-icon-circle-triangle-e"></li>';
					controls += '</ul>';
			var wrap = lib('<div>', {
				'id': 'katanoo_controls', 
				'html': controls,
				'css': {
					'background': '#eee',
					'float': 'left', 
					'padding': '2px',
					'height': '16px', 
					'top': '2px',
					'left': '2px',
					'margin': '0 4px 0 0',
					'position': 'fixed',
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
			lib('body').live('click mousemove keydown mouseover mouseout', self.writeLog)
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
				
				return ' *:eq('+index+')';
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
			} else if (doc.documentElement && (doc.documentElement.outerWidth || doc.documentElement.outerHeight)) {
				w = doc.documentElement.outerWidth;
				h = doc.documentElement.outerHeight
			} else if (doc.body && (doc.body.outerWidth || doc.body.outerHeight)) {
				w = doc.body.outerWidth;
				h = doc.body.outerHeight
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
/*			lib.ajax({
				type: 'POST',
				data: sendData,
				url: self.postURL
			}); */
//			//console.log(JSON.parse(sendData), sendData);
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
			//console.time('playing is delayed')
			win.scroll(0,0);
			// REsetting inputs
			self.inputs.each(function(){
				$(this).val(self.values[self.inputs.index(this)]);
			});
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
//			//console.timeEnd('playing is delayed')
//			//console.log('starting to play '+ self.data.events.length + ' events')
		};
		self.data = {
			id: self.uniqueid,
			time: time,
			url: doc.location,
			cached_inputs: self.values,
			browser: {
				agent: nav.userAgent,
				oscpu: nav.oscpu,
				language: nav.language,
				window: win.outerWidth + ' ' + win.outerHeight,
				screen: screen.availWidth + ' ' + screen.availHeight,
				browser: self.getScreenSize(),
				cookies: doc.cookie
			},
			events: []
		};
		self.init();
	}();
});
