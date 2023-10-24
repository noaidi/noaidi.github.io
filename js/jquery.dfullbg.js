$.fn.dfullbg = function(opt) {
	opt = $.extend(true, {
		images: [],
		dloading: true,
		random: true,
		birdscreen: '/img/birdscreen.gif',
		duration: 'slow',
		delay: 30000,
		mouseMovementDelay: 1500,
		traceMouse: true,
		autoplay: true,
		centered: 'horizon' /* all, horizon, no */
	}, opt);

	var isie6 = ($.browser.msie && $.browser.version == '6.0');

	var body = $('body')
		.css('width', '100%')
		.css('height', '100%');

	if (opt.birdscreen) {
		var birdscreen = $('<div></div>')
			.css('position', isie6 ? 'absolute' : 'fixed')
			.css('top', '0')
			.css('left', '0')
			.css('z-index', '2')
			.css('width', '100%')
			.css('height', '100%')
			.css('background', 'transparent url('+opt.birdscreen+')')
			.addClass('dfullbg-birdscreen')
			.prependTo(body).append(
				$('<div></div>')
					.css('width', '100%')
					.css('height', '100%')
					.css('position', isie6 ? 'absolute' : 'fixed')
					.css('top', '0')
					.css('left', '0')
					.css('background', '#000')
					.css('opacity', '0.2')
					.css('filter', 'alpha(opacity = 20)')
			);
	}

	if (opt.mouseMovementDelay > 0) {
		var mmscreen = $('<div></div>')
			.css('position', isie6 ? 'absolute' : 'fixed')
			.css('top', '0')
			.css('left', '0')
			.css('z-index', '2')
			.css('width', '100%')
			.css('height', '100%')
			.css('background', '#000')
			.addClass('dfullbg-mmscreen')
			.prependTo(body);

		function mmscreenEvent() {
			if (mmscreen.hasClass('mm-ing'))
				return;

			mmscreen.addClass('mm-ing').animate({
				'opacity': $('#page-text:visible').length > 0 ?
					'.4' : '.3'
			}, {
				'complete': function() {
					mmscreen.removeClass('mm-ing');
				},
				'queue': false
			});

			var t = $(this).data('dfullbgMouseMovementTimer');
			if (t)
				clearTimeout(t);

			$(this).data('dfullbgMouseMovementTimer',
			setTimeout(function() {
				mmscreen.addClass('mm-ing').animate({
					'opacity': '.15'
				}, {
					'complete': function() {
						mmscreen.removeClass('mm-ing');
					},
					'queue': false
				});
			}, opt.mouseMovementDelay));
		}

		$($.browser.msie ? 'html' : window)
			.scroll(mmscreenEvent)
			.mousemove(mmscreenEvent);
		mmscreenEvent();
	}

	var div = this
		.data('dfullbgOpt', opt)
		.css('position', isie6 ? 'absolute' : 'fixed')
		.css('top', '0')
		.css('left', '0')
		.css('z-index', '1')
		.css('background', '#222')
		.css('overflow', 'hidden')
		.css('width', '100%')
		.css('height', '100%')
		.addClass('dfullbg');

	if (isie6) {
		$(window).scroll(function() {
			var t = $(this).scrollTop();
			var l = $(this).scrollLeft();
			if (opt.birdscreen) {
				birdscreen.css('top', t + 'px');
				birdscreen.css('left', l + 'px');
			}
			div.css('top', t + 'px');
			div.css('left', l + 'px');
		});
	}

	$(window).resize(function() {
		div.dfullbgResize();
	});

	if (opt.autoplay)
		div.dfullbgPlay();

	if (opt.traceMouse) {
		$($.browser.msie ? 'html' : window).mousemove(function(e) {
			if (!e.clientX || !e.clientY) {
				e = $(window).data('dfullbg-trace-mouse-e');
				if (!e)
					return;
			} else {
				$(window).data('dfullbg-trace-mouse-e', e);
			}

			var winw = div.width();
			var winh = div.height();
			var curr = div.find('img.dfullbg-current');

			if (curr.length != 1) {
				return;
			}

			if (winw == curr.width()) {
				var ratio = e.clientY / winh;
				if (ratio > 1)
					ratio = 1;
				var h = curr.height();
				curr.css('margin-left', '0')
					.css('margin-top',
						-((h - winh) * ratio) + 'px');
			} else {
				var ratio = e.clientX / winw;
				if (ratio > 1)
					ratio = 1;
				var w = curr.width();
				curr.css('margin-top', '0')
					.css('margin-left',
						-((w - winw) * ratio) + 'px');
			}
		});
	}

	return this;
};

$.fn.dfullbgResize = function() {
	var opt = this.data('dfullbgOpt');
	if (!opt)
		return this;
	var winw = this.width();
	var winh = this.height();

	this.find('img').each(function() {
		var imgw = $(this).data('w');
		var imgh = $(this).data('h');
		if (!imgw || !imgh) {
			return;
		}

		/* width and height */
		var ratio = imgh / imgw;
		imgw = winw;
		imgh = winw * ratio;
		if (imgh < winh) {
			imgh = winh;
			imgw = imgh / ratio;
		}

		/* centered */
		if (!opt.traceMouse) {
			var centered = false;
			switch (opt.centered) {
			case 'all':
				centered = true;
				break;
			case 'horizon':
				if (imgh < imgw)
					centered = true;
				break;
			case 'no':
			default:
				break;
			}
			if (centered) {
				$(this).css({
					'top': -(winh < imgh ? (imgh - winh) / 2 : 0) + 'px',
					'left': -(winw < imgw ? (imgw - winw) / 2 : 0) + 'px' 
				});
			}
		}

		$(this).width(imgw).height(imgh);
	});

	if (opt.traceMouse) {
		setTimeout(function() {
			$($.browser.msie ? 'html' : window).mousemove();
		}, 1);
	}

	return this;
};

$.fn.dfullbgAddImage = function(src, cb, ee) {
	var opt = this.data('dfullbgOpt');
	if (!opt)
		return this;
	var div = this;
	var suffix = $.browser.msie ? '?' + new Date().getTime() : '';
	var img = $('<img />').attr('src', src + suffix).hide()
		.css('position', 'absolute')
		.appendTo(this);

	var oldimg = div.data('dfullbg-requested-img');
	div.data('dfullbg-requested-img', img);
	if (oldimg) {
		oldimg.unbind('load');
	}

	if (opt.dloading && $.dloadingPlay)
		$.dloadingPlay({}, ee);
	img.load(function() {
		if (opt.dloading && $.dloadingPlay)
			$.dloadingStop({}, ee);
		$(this).data('w', $(this).width());
		$(this).data('h', $(this).height());
		div.dfullbgResize();
		cb(img);
	});

	return this;
}

$.fn.dfullbgShowImage = function(img) {
	var opt = this.data('dfullbgOpt');
	if (!opt)
		return this;

	var last = this.find('img:last');
	var curr = this.find('img.dfullbg-current')
		.removeClass('dfullbg-current')
		.fadeOut(opt.duration, function() {
			curr.remove();
		});
	if (!img) {
		img = (curr.length == 0 || last.get(0) == curr.get(0)) ?
			this.find('img:first') : curr.next();
	}
	img.addClass('dfullbg-current').fadeIn(opt.duration);

	return this;
};

$.fn.dfullbgPlay = function(src, pause, ee) {
	var div = this;
	var opt = div.data('dfullbgOpt');
	if (!opt)
		return this;
	var curr = this.find('img.dfullbg-current');

	function getPureSrc(str) {
		var arr = str.split('?');
		if (arr.length > 0)
			return arr[0];
		return str;
	}

	if (!src) {
		if (opt.random) {
			do {
				var rand = Math.floor(Math.random() *
						opt.images.length % opt.images.length);
				src = opt.images[rand];
			} while (curr && curr.length > 0 &&
					getPureSrc(curr.attr('src')) == src);
		} else {
			var i = div.data('dfullbg-image-index');
			if (typeof i == 'undefined') {
				i = 0;
			} else {
				i++;
				if (i >= opt.images.length)
					i = 0;
			}
			src = opt.images[i];
			div.data('dfullbg-image-index', i);
		}
	}

	div.dfullbgStop();
	div.dfullbgAddImage(src, function(img) {
		div.dfullbgShowImage(img);
		div.dfullbgStop();
		if (pause) {
			div.addClass('dfullbg-paused');
		} else {
			div.removeClass('dfullbg-paused');
			div.data('dfullbgTimer', setTimeout(function() {
				div.dfullbgPlay();
			}, opt.delay));
		}
	}, ee);

	return this;
};

$.fn.dfullbgStop = function() {
	var t = this.data('dfullbgTimer');
	if (t)
		clearTimeout(t);
	return this;
}

$.fn.dfullbgPause = function() {
	return this.dfullbgStop();
}

$.fn.dfullbgResume = function() {
	var div = this;
	var opt = div.data('dfullbgOpt');
	if (!opt)
		return this;

	div.data('dfullbgTimer', setTimeout(function() {
		div.dfullbgPlay();
	}, opt.delay));

	return this;
}