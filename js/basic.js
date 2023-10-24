/* misc
 * ===================================================================== */
$.extend({
	min: function(a, b) { return a < b ? a : b; },
	max: function(a, b) { return a > b ? a : b; },
	isset: function(x) { return ((typeof x) != 'undefined'); },
	isempty: function(x) { return (!$.isset(x) || x == ''); },
	defval: function(x, val) { return ($.isset(x) ? x : val); },
	isie6: function() {
		return ($.browser.msie && $.browser.version == '6.0');
	},
	cookie: function(name, value, options) {
		// name and value given, set cookie
		if (typeof value != 'undefined') {
			options = options || {};
			if (value === null) {
				value = '';
				options.expires = -1;
			}
			var expires = '';
			if (options.expires &&
				(typeof options.expires == 'number' ||
				 options.expires.toUTCString)) {
				var date;
				if (typeof options.expires == 'number') {
					date = new Date();
					date.setTime(date.getTime() +
							(options.expires * 24 * 60 * 60 * 1000));
				} else {
					date = options.expires;
				}
				// use expires attribute, max-age is not supported by IE
				expires = '; expires=' + date.toUTCString();
			}
			// CAUTION: Needed to parenthesize options.path and
			// options.domain in the following expressions,
			// otherwise they evaluate to undefined in the packed
			// version for some reason...
			var path = options.path ? '; path=' + (options.path) : '';
			var domain = options.domain ?
				'; domain=' + (options.domain) : '';
			var secure = options.secure ? '; secure' : '';
			document.cookie = [name, '=',
				encodeURIComponent(value), expires,
				path, domain, secure].join('');
		} else { // only name given, get cookie
			var cookieValue = null;
			if (document.cookie && document.cookie != '') {
				var cookies = document.cookie.split(';');
				for (var i = 0; i < cookies.length; i++) {
					var cookie = jQuery.trim(cookies[i]);
					// Does this cookie string begin with
					// the name we want?
					if (cookie.substring(0, name.length + 1) ==
							(name + '=')) {
						cookieValue = decodeURIComponent(
								cookie.substring(name.length + 1));
						break;
					}
				}
			}
			return cookieValue;
		}
	}
});

/* plugins
 * ===================================================================== */
$.fn.clickOutside = function(func) {
	if (!func) {
		this.trigger('clickOutsideCallback');
		return this;
	}

	var target = this;

	setTimeout(function() {
		target.bind('clickOutsideCallback', func);
		$('html').bind('click.Outside', function(e) {
			if (!target.is(':visible'))
				return true;
			if (e.pageX == 0 && e.pageY == 0) {
				/* fix for webkit */
				return true;
			}
			if (e.pageX >= target.offset().left &&
				e.pageX <= target.offset().left +
					target.outerWidth() &&
				e.pageY >= target.offset().top &&
				e.pageY <= target.offset().top +
					target.outerHeight())
				return true;
			if (true) {
				var dsq = $('.dsq-tooltip-big:visible');
				if (dsq.length > 0) {
					if (e.pageX >= dsq.offset().left &&
						e.pageX <= dsq.offset().left +
							dsq.outerWidth() &&
						e.pageY >= dsq.offset().top &&
						e.pageY <= dsq.offset().top +
							dsq.outerHeight()) {
						return true;
					}
				}
			}
			target.trigger('clickOutsideCallback', e);
			$(this).unbind('click.Outside');
			target.unbind('clickOutsideCallback');
			return true;
		});
	}, 1);

	return this;
};

$.fn.dblink = function(opt) {
	opt = $.extend(true, {
		'on': '1',
		'off': '.2',
		'interval': 300
	}, opt);

	var me = $(this);

	me
	.data('dblink-opt', opt)
	.data('dblink-timer', setInterval(function() {
		me.toggleClass('dblink-on');
		me.animate({
			'opacity': me.hasClass('dblink-on') ? opt.off : opt.on
		}, {
			'duration': opt.interval
		});
	}, opt.interval));
	return this;
};

$.fn.dblinkStop = function() {
	var me = $(this);
	var opt = me.data('dblink-opt');
	if (!opt)
		return this;
	clearInterval(me.data('dblink-timer'));
	me.animate({
		'opacity': opt.off
	}, {
		'duration': opt.interval
	});
	return this;
};

$.fn.dfadeIn = function(opacity) {
	var me = $(this);
	me.css({
		'opacity': '0'
	}).show().animate({
		'opacity': opacity
	});
};

/* menus
 * ===================================================================== */
$.fn.menus = function() {
	var me = $(this);

	if (me.find('span.menus-hover').length > 0)
		return this;

	if (me.css('background-image') == 'none')
		return this;

	me.append($('<span class="menus-hover"></span>')
		.css('display', 'block')
		.css('width', me.width() + 'px')
		.css('height', me.height() + 'px')
		.css('opacity', '0')
		.css('background-image', me.css('background-image'))
		.css('background-position',
			'0 -' + (me.height() + 1) + 'px')
	).hover(function() {
		$('.dhnav').find('> li > a')
		.not(this).not('.hover').children('span').animate({
			opacity: '0'
		}, {
			duration: 320,
			queue: false
		});

		$(this).children('span').animate({
			opacity: '1'
		}, {
			duration: 320,
			queue: false
		});
	}, function() {
		if ($(this).hasClass('hover'))
			return;
		$(this).children('span').animate({
			opacity: '0'
		}, {
			duration: 320,
			queue: false
		});
	});

	return this;
};

/* firstLast
 * ===================================================================== */
$.firstLast = function() {
	$('ul').each(function() {
		$(this).children('li:first').addClass('first');
		$(this).children('li:last').addClass('last');
	});
	$('table').each(function() {
		$(this).children('tr:first').addClass('first');
		$(this).children('tr:last').addClass('last');
		$(this).find('> tbody > tr:first').addClass('first');
		$(this).find('> tbody > tr:last').addClass('last');
		$(this).find('> thead > tr:first').addClass('first');
		$(this).find('> thead > tr:last').addClass('last');
	});
	$('tr').each(function() {
		$(this).children('th:first, td:first').addClass('first');
		$(this).children('th:last, td:last').addClass('last');
	});

	$('#path > a:last').addClass('last');
};

/* resize
 * ===================================================================== */
$(function() {
	$.dWinResize = function() {
		var winw = $(window).width();
		var winh = $(window).height();

		$('.d-win-width').width(winw);
		$('.d-win-height').height(winh);

		if (winw <= 480) {
			$('#css-winsize').attr('href', '/css/winsize-480.css');
		} else {
			$('#css-winsize').attr('href', '/css/winsize.css');
		}
	}
	$.dWinResize();
	$(window).resize($.dWinResize);
});

/* scroll
 * ===================================================================== */
$(function() {
	$.dWinScroll = function() {
		if ($.isie6()) {
			var wintop = $(window).scrollTop();
			$('.d-position-fixed').each(function() {
				var me = $(this);
				var inittop = me.data('d-position-fixed-init-top');
				if (typeof inittop == 'undefined') {
					inittop = parseInt(me.css('top').replace('px', ''));
					me.data('d-position-fixed-init-top', inittop);
				}

				$(this).css({
					'top': (inittop + wintop) + 'px',
					'position': 'absolute'
				});
			});
		}
	}
	$.dWinScroll();
	$(window).scroll($.dWinScroll);
});

/* common
 * ===================================================================== */
$.dofirst = function() {
	/* focus-blur */
	$('a').focus(function() {
		$(this).blur();
	});

	/* first, last */
	$.firstLast();

	/* menus */
	$('a.menus').each(function() {
		$(this).menus();
	});
};

$(function() {
	$.dofirst();
});
