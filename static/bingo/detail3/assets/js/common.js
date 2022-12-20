"use strict";
// userAgent
const UA = window.navigator.userAgent.toLowerCase();
var SP;
var TAB;
var PC;
if(UA.indexOf('android') > 0 || UA.indexOf('iphone') > 0 || UA.indexOf('ipod') > 0){SP = true;}
else if(UA.indexOf('ipad') > 0){TAB = true;}
else{PC = true;}
const mqlSP = window.matchMedia('screen and (max-width:759px)');

// ariaExpanded
function toggleExpanded(obj,boolean){
	obj.setAttribute('aria-expanded',boolean);
}
// ariaHidden
function toggleHidden(obj,boolean){
	obj.setAttribute('aria-hidden',boolean);
}
// ariaSelected
function toggleSelected(obj,boolean){
	obj.setAttribute('aria-selected',boolean);
}

/* -----------------------------------------------------------------------
Scroll
----------------------------------------------------------------------- */
var Scroll = function(className,obj){
	var self = this;
	self.config = self.setConfig(className,obj);
	self.registerHandlers();
};

Scroll.prototype = {
	setConfig:function(className,obj){
		var _config = {
			dur: 500,
			className: className,
			obj: obj,
			swing: function swing(t, b, c, d) {
				return c * (0.5 - Math.cos((t / d) * Math.PI) / 2) + b;
			},
			scrollElm: (function(){
				if('scrollingElement' in document) return document.scrollingElement;
				return document.documentElement;
			})(),
			buffer: null,
			targetElm: null,
			targetPos: null,
			startTime: null,
			scrollFrom: null,
			currentTime: null
	  };
		return _config;
	},
	registerHandlers:function(){
		var self = this;
		self.clickEvent();
	},
	clickEvent:function(){
		var self = this;
		self.config.obj.addEventListener('click',function(e){
			self.smoothScroll(e);
		})
		self.config.obj.addEventListener('keypress',function(e){
			if(e.which === 13){
				self.smoothScroll(e);
			}
		})
	},
	smoothScroll:function(e){
		var self = this;
		e.preventDefault();
		self.config.buffer = 0;
		self.config.targetElm = document.querySelector(e.currentTarget.getAttribute('href'));
		self.config.targetPos = self.config.targetElm.getBoundingClientRect().top - self.config.buffer;
		if(!self.config.targetElm) return;
		self.config.startTime = Date.now();
		self.config.scrollFrom = self.config.scrollElm.scrollTop;
		(function loop(){
			self.config.currentTime = Date.now() - self.config.startTime;
			if(self.config.currentTime < self.config.dur){
				scrollTo(0,self.config.swing(self.config.currentTime,self.config.scrollFrom,self.config.targetPos,self.config.dur));
				window.requestAnimationFrame(loop);
			}else{
				scrollTo(0,self.config.targetPos + self.config.scrollFrom);
				self.config.targetElm.focus();
			}
		})();
		setTimeout(function(){
			if(self.config.targetElm !== e){
				self.config.targetElm.tabIndex = -1;
				self.config.targetElm.focus();
			}
		},self.config.dur);
	}
};
Scroll.init = function(className){
	document.querySelectorAll(className).forEach(function(el){
		return new Scroll(className,el);
	});
};

/* -----------------------------------------------------------------------
Tab
----------------------------------------------------------------------- */
var Tab = function(className,obj){
	var self = this;
	self.config = self.setConfig(className,obj);
	self.registerHandlers();
};
Tab.prototype = {
	setConfig:function(className,obj){
		var _config = {
			className: className,
			obj: obj,
			trigger: obj.querySelectorAll('[role="tab"]'),
			target: obj.querySelectorAll('[role="tabpanel"]'),
			index: null
	  };
		return _config;
	},
	registerHandlers:function(){
		var self = this;
		self.clickEvent();
	},
	clickEvent:function(){
		var self = this;
		Array.prototype.slice.call(self.config.trigger,0).forEach(function(el){
			el.addEventListener('click',function(e){
				e.preventDefault();
				self.changeTab(this);
			})
			el.addEventListener('keypress',function(e){
				if(e.which === 13){
					e.preventDefault();
					self.changeTab(this);
				}
			})
		});
	},
	changeTab:function(obj){
		var self = this;
		self.config.index = obj.getAttribute('aria-posinset');
		self.config.obj.dataset.opened = self.config.index;
		for(var i = 0;i < self.config.trigger.length;i++){
			toggleSelected(self.config.trigger[i],'false');
			toggleSelected(self.config.trigger[self.config.index - 1],'true');
		}
		for(var i = 0;i < self.config.target.length;i++){
			toggleHidden(self.config.target[i],'true');
			toggleHidden(self.config.target[self.config.index - 1],'false');
		}
	}
};
Tab.init = function(className){
	Array.prototype.slice.call(document.querySelectorAll(className + '-group'),0).forEach(function(el){
		return new Tab(className,el);
	});
};

/* -----------------------------------------------------------------------
Modal
----------------------------------------------------------------------- */
var Modal = function(className){
	var self = this;
	self.config = self.setConfig(className);
	self.registerHandlers();
};
Modal.prototype = {
	setConfig:function(className){
		var _config = {
			dur: 500,
			opened: 'is-opened-modal',
			closed: 'is-closed-modal',
			changed: 'is-changed-modal',
			className: className,
			closeClassName: className + '-close',
			open: document.querySelectorAll(className + '-open'),
			close: document.querySelectorAll(className + '-close'),
			change: document.querySelectorAll(className + '-change'),
			wrap: document.querySelector(className + '-wrap'),
			panel: document.querySelector(className + '-panel'),
			target: document.querySelectorAll(className + '-target'),
			lastFocused: null,
			y: null,
			id: null,
			openTarget: null,
			targetElm: null,
			focusFirst: null,
			focusLast: null
	  };
		return _config;
	},
	registerHandlers:function(){
		var self = this;
		self.clickEvent();
	},
	clickEvent:function(){
		var self = this;
		Array.prototype.slice.call(self.config.open,0).forEach(function(el){
			el.addEventListener('click',function(e){
				e.preventDefault();
				if(!document.body.classList.contains(self.config.closed)){
					if(el.classList.contains('js-header-toggle-close')){
						setTimeout(function(_this){
							self.openModal(e,_this);
						}.bind(null,this),self.config.dur / 4);
					}else{
						self.openModal(e,this);
					}
				}
			})
			el.addEventListener('keypress',function(e){
				if(e.which === 13){
					e.preventDefault();
					if(!document.body.classList.contains(self.config.closed)){
						if(el.classList.contains('js-header-toggle-close')){
							setTimeout(function(_this){
								self.openModal(e,_this);
							}.bind(null,this),self.config.dur / 4);
						}else{
							self.openModal(e,this);
						}
					}
				}
			})
		});
		Array.prototype.slice.call(self.config.close,0).forEach(function(el){
			el.addEventListener('click',function(e){
				e.preventDefault();
				self.closeModal(e,this);
			})
			el.addEventListener('keypress',function(e){
				if(e.which === 13){
					e.preventDefault();
					self.closeModal(e,this);
				}
			})
		});
		Array.prototype.slice.call(self.config.change,0).forEach(function(el){
			el.addEventListener('click',function(e){
				e.preventDefault();
				self.changeModal(e,this);
			})
			el.addEventListener('keypress',function(e){
				if(e.which === 13){
					e.preventDefault();
					self.changeModal(e,this);
				}
			})
		});
	},
	openModal:function(e,obj){
		var self = this;
		self.config.lastFocused = document.activeElement;
		self.config.y = window.scrollY || window.pageYOffset;
		self.id = obj.getAttribute('href').substr(1);
		self.config.openTarget = document.getElementById(self.id);
		toggleHidden(self.config.wrap,'false');
		for(var i = 0;i < self.config.target.length;i++){
			toggleHidden(self.config.target[i],'true');
			toggleHidden(self.config.openTarget,'false');
		}
		setTimeout(function(){
			document.body.classList.add(self.config.opened);
			document.body.classList.remove(self.config.closed);
			if(!document.body.classList.contains('page-guide')){
				document.body.style.top = ''+ self.config.y * -1 +'px';
			}else{
				scrollTo(0,0);
			}
		},1);
		self.config.targetElm = document.querySelector(e.currentTarget.getAttribute('href'));
		if(!self.config.targetElm) return;
		setTimeout(function(){
			if(self.config.targetElm !== e){
				self.config.targetElm.tabIndex = -1;
				self.config.targetElm.focus();
			}
		},self.config.dur);
		// focus
		self.config.focusFirst = self.config.targetElm;
		self.config.focusLast = self.config.targetElm.querySelector(self.config.closeClassName);
		self.config.focusLast.addEventListener('keydown',function(e){
			if((e.which === 9 && !e.shiftKey)){
				e.preventDefault();
				self.config.focusFirst.focus();
			}
		});
		self.config.focusFirst.addEventListener('keydown',function(e){
			if((e.which === 9 && e.shiftKey)){
				e.preventDefault();
				self.config.focusLast.focus();
			}
		});
	},
	closeModal:function(e,obj){
		var self = this;
		self.config.y = parseInt(document.body.style.top);
		document.body.classList.add(self.config.closed);
		document.body.classList.remove(self.config.opened);
		setTimeout(function(){
			if(!document.body.classList.contains('page-guide')){
				scrollTo(0,self.config.y * -1);
			}else{
				scrollTo(0,0);
			}
			setTimeout(function(){
				document.body.classList.remove(self.config.closed);
				toggleHidden(self.config.wrap,'true');
				document.body.removeAttribute('style');
				self.config.lastFocused.focus();
			},self.config.dur);
		},1);
	},
	changeModal:function(e,obj){
		var self = this;
		self.id = obj.getAttribute('href').substr(1);
		self.config.openTarget = document.getElementById(self.id);
		setTimeout(function(){
			document.body.classList.add(self.config.changed);
		},1);
		self.config.targetElm = document.querySelector(e.currentTarget.getAttribute('href'));
		if(!self.config.targetElm) return;
		setTimeout(function(){
			for(var i = 0;i < self.config.target.length;i++){
				toggleHidden(self.config.target[i],'true');
				toggleHidden(self.config.openTarget,'false');
			}
			setTimeout(function(){
				document.body.classList.remove(self.config.changed);
			},self.config.dur);
			if(self.config.targetElm !== e){
				self.config.targetElm.tabIndex = -1;
				self.config.targetElm.focus();
			}
		},self.config.dur);
		// focus
		self.config.focusFirst = self.config.targetElm;
		self.config.focusLast = self.config.targetElm.querySelector(self.config.closeClassName);
		self.config.focusLast.addEventListener('keydown',function(e){
			if((e.which === 9 && !e.shiftKey)){
				e.preventDefault();
				self.config.focusFirst.focus();
			}
		});
		self.config.focusFirst.addEventListener('keydown',function(e){
			if((e.which === 9 && e.shiftKey)){
				e.preventDefault();
				self.config.focusLast.focus();
			}
		});
	},
};
Modal.init = function(className){
	new Modal(className);
};

window.addEventListener("DOMContentLoaded",function(){
	Scroll.init('.js-scroll');
	Tab.init('.js-tab');
	Modal.init('.js-modal');
});
