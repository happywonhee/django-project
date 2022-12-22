"use strict";

/* -----------------------------------------------------------------------
FirstMovie
----------------------------------------------------------------------- */
var FirstMovie = function(){
	var self = this;
	self.config = self.setConfig();
	self.registerHandlers();
};
FirstMovie.prototype = {
	setConfig:function(){
		var _config = {
			dur: 500,
			active: 'is-active',
			opened: 'is-opened-first-modal',
			closed: 'is-closed-first-modal',
			page: document.getElementById('wrap') ? document.getElementById('wrap') : null,
			main: document.querySelector('main') ? document.querySelector('main') : null,
			sidebar: document.querySelector('.l-sidebar') ? document.querySelector('.l-sidebar') : null,
			footer: document.querySelector('footer') ? document.querySelector('footer') : null,
			wrap: null,
			target: null,
			skip: null,
			medias: null,
			media: null,
			fullTime: null,
			currentTime: null,
			per: null,
			visited: false
	  };
		return _config;
	},
	registerHandlers:function(){
		var self = this;
		self.cookieCheck();
	},
	cookieCheck:function(){
		var self = this;
		if(Cookies.get('SportsCookie') !== 'visited'){
			self.config.visited = false;
		}else{
			self.config.visited = true;
		}
		self.initModal('.js-first-modal','js-first-modal');
	},
	initModal:function(className,ID){
		var self = this;
		self.config.wrap = document.querySelector(className + '-wrap');
		self.config.target = document.getElementById(ID + '-target') ? document.getElementById(ID + '-target') : null;
		self.config.skip = document.querySelectorAll(className + '-skip');
		self.config.medias = self.config.target.querySelectorAll('video');
		if(self.config.visited){
			self.config.main.removeAttribute('style');
			self.config.sidebar.removeAttribute('style');
			self.config.footer.removeAttribute('style');
			self.config.wrap.parentNode.removeChild(self.config.wrap);
			self.loadEvent();
		}else{
			Array.prototype.slice.call(self.config.medias,0).forEach(function(el){
				if(mqlSP.matches){
					el.classList.contains('is-pc-tb') ? el.parentNode.removeChild(el) : null;
				}else{
					el.classList.contains('is-sp') ? el.parentNode.removeChild(el) : null;
				}
			});
			self.openMovieModal();
			self.clickEvent();
		}
	},
	clickEvent:function(){
		var self = this;
		Array.prototype.slice.call(self.config.skip,0).forEach(function(el){
			el.addEventListener('click',function(e){
				e.preventDefault();
				self.closeMovieModal();
			})
			el.addEventListener('keypress',function(e){
				if(e.which === 13){
					e.preventDefault();
					self.closeMovieModal();
				}
			})
		});
	},
	playEvent:function(media){
		var self = this;
		media.autoplay = true;
		media.play();
		self.timeupdateEvent(media);
	},
	timeupdateEvent:function(media){
		var self = this;
		media.addEventListener('timeupdate',function(){
			Array.prototype.slice.call(self.config.skip,0).forEach(function(el){
				el.style.opacity = 1;
			});
			self.config.fullTime = media.duration;
			self.config.currentTime = media.currentTime;
			self.config.per = self.config.currentTime / self.config.fullTime;
			if(self.config.per >= 1){
				self.closeMovieModal();
			}
		})
	},
	loadEvent:function(){
		var self = this;
		window.addEventListener('load',function(){
			self.addActive();
		})
	},
	openMovieModal:function(){
		var self = this;
		Array.prototype.slice.call(self.config.skip,0).forEach(function(el){
			el.style.opacity = 0;
		});
		self.config.media = self.config.target.querySelector('video');
		if(self.config.media){
			toggleHidden(self.config.wrap,'false');
			toggleHidden(self.config.target,'false');
			setTimeout(function(){
				document.body.classList.add(self.config.opened);
				document.body.classList.remove(self.config.closed);
				self.playEvent(self.config.media);
			},1);
		}else{
			toggleHidden(self.config.wrap,'true');
			toggleHidden(self.config.target,'true');
		}
	},
	closeMovieModal:function(){
		var self = this;
		self.config.main.removeAttribute('style');
		self.config.footer.removeAttribute('style');
		self.config.media = self.config.target.querySelector('video');
		self.config.media.pause();
		document.body.classList.add(self.config.closed);
		document.body.classList.remove(self.config.opened);
		setTimeout(function(){
			document.body.classList.remove(self.config.closed);
			toggleHidden(self.config.wrap,'true');
			self.config.wrap ? self.config.wrap.parentNode.removeChild(self.config.wrap) : null;
			self.loadEvent();
		},self.config.dur);
		Cookies.set('SportsCookie','visited');
	},
	addActive:function(){
		var self = this;
		self.config.page.classList.add(self.config.active);
	}
};
FirstMovie.init = function(){
	new FirstMovie();
};

/* -----------------------------------------------------------------------
HeroMovie
----------------------------------------------------------------------- */
var HeroMovie = function(ID){
	var self = this;
	self.config = self.setConfig(ID);
	self.registerHandlers();
};
HeroMovie.prototype = {
	setConfig:function(ID){
		var _config = {
			ID: ID,
			movie: document.getElementById(ID),
			media: null,
			img: null
	  };
		return _config;
	},
	registerHandlers:function(){
		var self = this;
		self.initHero();
	},
	initHero:function(){
		var self = this;
		if(self.config.movie){
			self.config.media = self.config.movie.querySelector('video');
			self.config.media ? self.playEvent(self.config.media) : null;
		}
	},
	playEvent:function(media){
		var self = this;
		media.autoplay = true;
		media.play();
		self.config.img = self.config.movie.querySelector('img');
		self.config.img ? self.config.img.parentNode.removeChild(self.config.img) : null;
	}
};
HeroMovie.init = function(ID){
	new HeroMovie(ID);
};

/* -----------------------------------------------------------------------
ScrollAnime
----------------------------------------------------------------------- */
var ScrollAnime = function(className,obj){
	var self = this;
	self.config = self.setConfig(className,obj);
	self.registerHandlers();
};
ScrollAnime.prototype = {
	setConfig:function(className,obj){
		var _config = {
			dur: 200,
			active: 'is-active',
			className: className,
			obj: obj,
			children: obj.children,
			buffer: null,
			offset: null,
			bottom: null,
			rectTop: null
	  };
		return _config;
	},
	registerHandlers:function(){
		var self = this;
		self.scrollEvent();
	},
	scrollEvent:function(){
		var self = this;
		self.scrollActive();
		window.addEventListener('scroll',function(){
			self.scrollActive();
		})
	},
	scrollActive:function(){
		var self = this;
		self.config.buffer = window.innerHeight / 8;
		self.config.offset = window.pageYOffset || document.documentElement.scrollTop;
		self.config.bottom = self.config.offset + window.innerHeight;
		self.config.rectTop = self.config.obj.getBoundingClientRect().top;
		if(self.config.buffer > self.config.rectTop || self.config.bottom > document.body.clientHeight){
			for(var i = 0;i < self.config.children.length;i++){
				setTimeout(function(index){
					self.config.children[index].classList.add(self.config.active);
				}.bind(null,i),i * self.config.dur / 2);
			}
		}
	}
};
ScrollAnime.init = function(className){
	Array.prototype.slice.call(document.querySelectorAll(className),0).forEach(function(el){
		return new ScrollAnime(className,el);
	});
};

/* -----------------------------------------------------------------------
AboutSlide
----------------------------------------------------------------------- */
var AboutSlide = function(ID){
	var self = this;
	self.config = self.setConfig(ID);
	self.registerHandlers();
};
AboutSlide.prototype = {
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
AboutSlide.init = function(ID){
	new AboutSlide(ID);
};

/* -----------------------------------------------------------------------
PlaySlide
----------------------------------------------------------------------- */
var PlaySlide = function(ID){
	var self = this;
	self.config = self.setConfig(ID);
	self.registerHandlers();
};
PlaySlide.prototype = {
	setConfig:function(ID){
		var _config = {
			ID: ID,
			slide: document.getElementById(ID),
			mySwiper: null,
			activeSlide: null,
			slideHeight: null,
			offset: null,
			bottom: null,
			rectTop: null,
			media: null,
			medias: null,
			fullTime: null,
			currentTime: null,
			per: null
	  };
		return _config;
	},
	registerHandlers:function(){
		var self = this;
		self.initSlide();
	},
	zeroPad:function(index){
		var self = this;
		var num = ('00' + index).slice(-2);
		return num;
	},
	initSlide:function(){
		var self = this;
		if(self.config.slide){
			self.config.mySwiper = new Swiper(self.config.slide,{
				loop: true,
				centeredSlides: true,
				slidesPerView: 'auto',
				speed: 1000,
				pagination:{
					el: '#'+ self.config.ID + '-dot',
					type: 'bullets',
					clickable: true,
					renderBullet:function(index,className){
						return '<button class="top-play-slide-dot__item '+ className + '"><span><span class="u-sr">'+ self.zeroPad(index + 1) +'</span></span></button>';
					}
				},
				navigation:{
					nextEl: '#'+ self.config.ID + '-btn--next',
					prevEl: '#'+ self.config.ID + '-btn--prev'
				}
			});
			self.scrollEvent();
			self.swiperEvent();
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
		self.config.activeSlide = self.config.slide.querySelector('.swiper-slide-active');
		self.config.media = self.config.activeSlide.querySelector('video');
		self.config.slideHeight = self.config.slide.clientHeight;
		self.config.rectTop = self.config.slide.getBoundingClientRect().top;
		if(window.innerHeight > self.config.rectTop){
			if(self.config.rectTop + self.config.slideHeight > 0){
				self.playEvent(self.config.media);
			}else{
				self.pauseEvent(self.config.media);
			}
		}else{
			self.pauseEvent(self.config.media);
		}
	},
	swiperEvent:function(){
		var self = this;
		self.config.mySwiper.on('transitionStart',function(){
			self.config.slide.dataset.playing = false;
			self.config.medias = self.config.slide.querySelectorAll('video');
			Array.prototype.slice.call(self.config.medias,0).forEach(function(el){
				el.pause();
			});
		});
		self.config.mySwiper.on('transitionEnd',function(){
			Array.prototype.slice.call(self.config.medias,0).forEach(function(el){
				el.currentTime = 0;
			});
			self.config.activeSlide = self.config.slide.querySelector('.swiper-slide-active');
			self.config.media = self.config.activeSlide.querySelector('video');
			if(window.innerHeight > self.config.rectTop){
				if(self.config.rectTop + self.config.slideHeight > 0){
					self.playEvent(self.config.media);
				}
			}
		});
	},
	playEvent:function(media){
		var self = this;
		media.autoplay = true;
		self.config.slide.dataset.playing = true;
		media.play();
		self.timeupdateEvent(media);
	},
	pauseEvent:function(media){
		var self = this;
		self.config.slide.dataset.playing = false;
		media.pause();
	},
	timeupdateEvent:function(media){
		var self = this;
		media.addEventListener('timeupdate',function(){
			self.config.fullTime = media.duration;
			self.config.currentTime = media.currentTime;
			self.config.per = self.config.currentTime / self.config.fullTime;
			if(self.config.per >= 1){
				self.config.mySwiper.slideNext();
			}
		})
	}
};
PlaySlide.init = function(ID){
	new PlaySlide(ID);
};

/* -----------------------------------------------------------------------
ModalSlide
----------------------------------------------------------------------- */
var ModalSlide = function(className,slideID){
	var self = this;
	self.config = self.setConfig(className,slideID);
	self.registerHandlers();
};
ModalSlide.prototype = {
	setConfig:function(className,slideID){
		var _config = {
			dur: 500,
			opened: 'is-opened-modal',
			closed: 'is-closed-modal',
			className: className,
			closeClassName: className + '-close',
			slideID: slideID,
			open: document.querySelectorAll(className + '-slide-open'),
			close: document.querySelectorAll(className + '-close'),
			wrap: document.querySelector(className + '-wrap'),
			panel: document.querySelector(className + '-panel'),
			target: document.querySelectorAll(className + '-target'),
			lastFocused: null,
			y: null,
			id: null,
			openTarget: null,
			targetElm: null,
			focusFirst: null,
			focusLast: null,
			slided: false,
			modalSlide: slideID ? document.getElementById(slideID) : null,
			mySwiper: null
	  };
		return _config;
	},
	registerHandlers:function(){
		var self = this;
		self.initSlide();
		self.clickEvent();
	},
	initSlide:function(){
		var self = this;
		if(self.config.modalSlide){
			self.config.mySwiper = new Swiper(self.config.modalSlide,{
				loop: true,
				centeredSlides: true,
				autoHeight: true,
				slidesPerView: 1,
				init: false,
				pagination:{
					el: '#'+ self.config.slideID + '-dot',
					type: 'bullets',
					clickable: true,
					renderBullet:function(index,className){
						return '<button class="top-modal-slide-dot__item '+ className + '"><span class="u-sr">' + index + '</span></button>';
					}
				},
				navigation:{
					nextEl: '#'+ self.config.slideID + '-btn--next',
					prevEl: '#'+ self.config.slideID + '-btn--prev'
				}
			});
		}
	},
	clickEvent:function(){
		var self = this;
		Array.prototype.slice.call(self.config.open,0).forEach(function(el){
			el.addEventListener('click',function(e){
				e.preventDefault();
				self.openModal(e,this);
			})
			el.addEventListener('keypress',function(e){
				if(e.which === 13){
					e.preventDefault();
					self.openModal(e,this);
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
			document.body.style.top = ''+ self.config.y * -1 +'px';
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
		// carousel
		if(self.config.mySwiper){
			if(!self.config.slided){
				self.config.mySwiper.init();
				self.config.slided = true;
			}
		}
	},
	closeModal:function(e,obj){
		var self = this;
		self.config.y = parseInt(document.body.style.top);
		document.body.classList.add(self.config.closed);
		document.body.classList.remove(self.config.opened);
		setTimeout(function(){
			scrollTo(0,self.config.y * -1);
			setTimeout(function(){
				document.body.classList.remove(self.config.closed);
				toggleHidden(self.config.wrap,'true');
				document.body.removeAttribute('style');
				self.config.lastFocused.focus();
			},self.config.dur);
		},1);
	}
};
ModalSlide.init = function(className,slideID){
	new ModalSlide(className,slideID);
};

window.addEventListener("DOMContentLoaded",function(){
	FirstMovie.init();
	ScrollAnime.init('.js-scroll-anime');
	AboutSlide.init('js-about-slide');
	PlaySlide.init('js-play-slide');
	ModalSlide.init('.js-modal','js-modal-slide');
});
window.addEventListener("load", function () {
	HeroMovie.init('js-hero-movie');
});

