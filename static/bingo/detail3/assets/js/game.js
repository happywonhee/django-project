"use strict";

/* -----------------------------------------------------------------------
Parallax
----------------------------------------------------------------------- */
var Parallax = function(className,obj){
	var self = this;
	self.config = self.setConfig(className,obj);
	self.registerHandlers();
};
Parallax.prototype = {
	setConfig:function(className,obj){
		var _config = {
			className: className,
			obj: obj,
			mainW: null,
			label: null,
			dur: {
				symbol: null,
				chara: null
			},
			isVolleyball: null,
			isBadminton: null,
			isBowling: null,
			isSoccer: null,
			isTennis: null,
			isChambara: null
	  };
		return _config;
	},
	registerHandlers:function(){
		var self = this;
		self.scrollEvent();
	},
	scrollEvent:function(){
		var self = this;
		self.moveParallax();
		window.addEventListener('scroll',function(){
			self.moveParallax();
		})
	},
	moveParallax:function(){
		var self = this;
		self.config.mainW = document.querySelector('.game-content-main__inner') ? document.querySelector('.game-content-main__inner').clientWidth : null;
		self.config.label = self.config.obj;
		self.config.isVolleyball = document.body.classList.contains('page-volleyball');
		self.config.isBadminton = document.body.classList.contains('page-badminton');
		self.config.isBowling = document.body.classList.contains('page-bowling');
		self.config.isSoccer = document.body.classList.contains('page-soccer');
		self.config.isTennis = document.body.classList.contains('page-tennis');
		self.config.isChambara = document.body.classList.contains('page-chambara');
		self.config.dur.symbol = -0.05 * (window.scrollY);
		self.config.dur.chara = -0.025 * (window.scrollY);
		if(self.config.obj.classList.contains('is-symbol')){
			self.config.label.style.transform = 'translate3d('+ self.config.dur.symbol +'px,0,0)';
		}
		if(self.config.obj.classList.contains('is-chara')){
			self.config.label.style.transform = 'translate3d(0,'+ self.config.dur.chara +'px,0)';
		}
	}
};
Parallax.init = function(className){
	Array.prototype.slice.call(document.querySelectorAll(className),0).forEach(function(el){
		return new Parallax(className,el);
	});
};

/* -----------------------------------------------------------------------
Movie
----------------------------------------------------------------------- */
var Movie = function(className,obj){
	var self = this;
	self.config = self.setConfig(className,obj);
	self.registerHandlers();
};
Movie.prototype = {
	setConfig:function(className,obj){
		var _config = {
			className: className,
			obj: obj,
			buffer: null,
			offset: null,
			bottom: null,
			rectTop: null,
			media: null,
			img: null,
			playing: false
	  };
		return _config;
	},
	registerHandlers:function(){
		var self = this;
		self.config.media = self.config.obj.querySelector('video') ? self.config.obj.querySelector('video') : null;
		self.config.img = self.config.obj.querySelector('img') ? self.config.obj.querySelector('img') : null;
		if(self.config.media && self.config.img){
			self.scrollEvent();
		}
	},
	scrollEvent:function(){
		var self = this;
		self.scrollMovie();
		window.addEventListener('scroll',function(){
			self.scrollMovie();
		})
	},
	scrollMovie:function(){
		var self = this;
		self.config.buffer = window.innerHeight / 3 * 2;
		self.config.offset = window.pageYOffset || document.documentElement.scrollTop;
		self.config.bottom = self.config.offset + window.innerHeight;
		self.config.rectTop = self.config.obj.getBoundingClientRect().top;
		if(self.config.buffer > self.config.rectTop || self.config.bottom > document.body.clientHeight){
			if(!self.config.playing){
				self.playEvent(self.config.media);
			}
		}
	},
	playEvent:function(media){
		var self = this;
		self.config.playing = true;
		media.autoplay = true;
		media.play();
		media.addEventListener('playing', function(){
			self.config.img.parentNode.removeChild(self.config.img);
		})
	}
};
Movie.init = function(className){
	Array.prototype.slice.call(document.querySelectorAll(className),0).forEach(function(el){
		return new Movie(className,el);
	});
};

/* -----------------------------------------------------------------------
Slide
----------------------------------------------------------------------- */
var Slide = function(ID){
	var self = this;
	self.config = self.setConfig(ID);
	self.registerHandlers();
};
Slide.prototype = {
	setConfig:function(ID){
		var _config = {
			ID: ID,
			slide: document.getElementById(ID),
			mySwiper: null
	  };
		return _config;
	},
	registerHandlers:function(){
		var self = this;
		self.initSlide();
	},
	initSlide:function(){
		var self = this;
		if(self.config.slide){
			self.config.mySwiper = new Swiper(self.config.slide,{
				loop: true,
				speed: 10000,
				autoplay:{
					delay: 0
				},
				slidesPerView: 'auto'
			});
		}
	}
};
Slide.init = function(ID){
	new Slide(ID);
};

/* -----------------------------------------------------------------------
PlayVideo
----------------------------------------------------------------------- */
var PlayVideo = function(ID, className){
	var self = this;
	self.config = self.setConfig(ID, className);
	self.registerHandlers();
};
PlayVideo.prototype = {
	setConfig:function(ID, className){
		var _config = {
			ID: ID,
			className: className,
			obj: null,
			buffer: null,
			offset: null,
			bottom: null,
			rectTop: null,
			media: null,
			img: null,
			playing: false,
			seekTimes:[]
	  };
		return _config;
	},
	registerHandlers:function(){
		var self = this;
		self.config.obj = document.getElementById(self.config.ID);
		self.config.media = self.config.obj.querySelector('video') ? self.config.obj.querySelector('video') : null;
		self.scrollEvent();
		self.clickEvent(self.config.media);
	},
	getSeekTime:function(){
		var self = this;
		Array.prototype.slice.call(document.querySelectorAll(self.config.className),0).forEach(function(el){
			self.config.seekTimes.push(el.dataset.seek);
		});
		return self.config.seekTimes;
	},
	scrollEvent:function(){
		var self = this;
		self.scrollMovie();
		window.addEventListener('scroll',function(){
			self.scrollMovie();
		})
	},
	scrollMovie:function(){
		var self = this;
		self.config.buffer = window.innerHeight / 3 * 2;
		self.config.offset = window.pageYOffset || document.documentElement.scrollTop;
		self.config.bottom = self.config.offset + window.innerHeight;
		self.config.rectTop = self.config.obj.getBoundingClientRect().top;
		if(self.config.buffer > self.config.rectTop || self.config.bottom > document.body.clientHeight){
			if(!self.config.playing){
				self.playEvent(self.config.media);
			}
		}
	},
	playEvent:function(media){
		var self = this;
		var times = self.getSeekTime();
		self.config.playing = true;
		media.autoplay = true;
		media.loop = true;
		media.play();
		self.timeupdateEvent(media, times);
	},
	timeupdateEvent:function(media,seekTimes){
		var self = this;
		media.addEventListener('timeupdate',function(){
			self.config.fullTime = media.duration;
			self.config.currentTime = media.currentTime;
			for(var i = 0; i < seekTimes.length; i++){
				if(Number(seekTimes[i]) <= Number(self.config.currentTime) && (i + 1 === seekTimes.length || Number(self.config.currentTime) <= Number(seekTimes[i + 1]))){ //[0.00, 5.10, 9.10]
					Array.prototype.slice.call(document.querySelectorAll(self.config.className),0).forEach(function(el){
						if(el.dataset.seek === seekTimes[i]) {
							el.classList.add('is-current');
						} else {
							el.classList.remove('is-current');
						}
					});
				};
			};
		});
	},
	clickEvent:function(media){
		var self = this;
		Array.prototype.slice.call(document.querySelectorAll(self.config.className),0).forEach(function(el){
			el.addEventListener("click", function() {
				media.currentTime = Number(el.dataset.seek);
			});
		});
	}
};
PlayVideo.init = function(ID, className){
	new PlayVideo(ID, className);
};


window.addEventListener("DOMContentLoaded", function () {
	Parallax.init('.js-parallax');
	PlayVideo.init('js-play-video', '.js-play-btn');
});
window.addEventListener("load", function () {
	Movie.init('.js-movie');
});
