"use strict";
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
charaSlide
----------------------------------------------------------------------- */
var CharaSlide = function(ID){
	var self = this;
	self.config = self.setConfig(ID);
	self.registerHandlers();
};
CharaSlide.prototype = {
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
				speed: 300,
				allowTouchMove: false,
        effect: 'fade',
        fadeEffect: {
          crossFade: true
        },
				autoplay:{
					delay: 5000
				},
				slidesPerView: 'auto'
			});
		}
	}
};
CharaSlide.init = function(ID){
	new CharaSlide(ID);
};


window.addEventListener("DOMContentLoaded", function () {
	Slide.init('js-slide-01');
	Slide.init('js-slide-02');
  CharaSlide.init('js-chara-slide');
});
