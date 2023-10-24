$.dloadingPlay = function(opt, e) {
	var root = $('#dloading');
	if (root.length == 0) {
		root = $.dloading(opt);
	}
	root.trigger('dloading-play', e);
};

$.dloadingStop = function(opt) {
	var root = $('#dloading');
	if (root.length == 0) {
		root = $.dloading(opt);
	}
	root.trigger('dloading-stop');
};

$.dloading = function(opt) {
	opt = $.extend(true, {
		'blocker': true,
		'blockerColor': '#000',
		'blockerOpacity': '.3',
		'width': 40,
		'height': 1,
		'duration': 400,
		'baseColor': 'transparent',
		'barColor': '#fff',
		'barOpacity': '.7'
	}, opt);

	var isplaying = 0;

	var wrap = $('<div />')
		.addClass('dloading-wrap')
		.hide()
		.css('position', $.isie6() ? 'absolute' : 'fixed')
		.css('top', '0')
		.css('left', '0')
		.css('z-index', '99999')
		.appendTo($('body'));

	var blocker;
	if (opt.blocker) {
		wrap
			.css('width', '100%')
			.css('height', '100%');
		blocker = $('<div />')
			.addClass('dloading-blocker')
		//	.css('cursor', 'wait')
			.css('position', $.isie6() ? 'absolute' : 'fixed')
			.css('top', '0')
			.css('left', '0')
			.css('width', '100%')
			.css('height', '100%')
			.css('z-index', '1')
			.css('background', opt.blockerColor)
			.css('opacity', opt.blockerOpacity)
			.appendTo(wrap);
	}

	var root = $('<div />')
		.attr('id', 'dloading')
		.appendTo(wrap)
		.width(opt.width)
		.css('position', 'absolute')
		.css('z-index', '2')
		.css('background', opt.baseColor)
		.css('overflow', 'hidden');

	var bar = $('<div />')
		.addClass('dloading-bar')
		.css('background', opt.barColor)
		.css('overflow', 'hidden')
		.css('opacity', opt.barOpacity)
		.height(opt.height)
		.appendTo(root);

	bar.bind('dloading-long', function(e) {
		if (isplaying <= 0)
			return;
		bar
			.width(0)
			.css('marginLeft', '0')
			.animate({
				'width': root.width()
			}, {
				'duration': opt.duration,
				'complete': function() {
					bar.trigger('dloading-short');
				}
			});
	}).bind('dloading-short', function(e) {
		if (isplaying <= 0)
			return;
		bar
			.width(root.width())
			.css('marginLeft', '0')
			.animate({
				'marginLeft': bar.width()
			}, {
				'duration': opt.duration,
				'complete': function() {
					bar.trigger('dloading-long');
				}
			});
	});

	function mousemove(e) {
		if (!e || !e.clientY || !e.clientX)
			return;

		var offset = 16;
		var x = e.clientX;
		var y = e.clientY;

		if (y + offset + root.outerHeight() > $(window).height() ||
			x + offset + root.outerWidth() > $(window).width()) {
			root.hide();
			return;
		}

		root
			.css('top', (y + offset) + 'px')
			.css('left', (x + offset) + 'px')
			.css('marginLeft', '0')
			.css('marginTop', '0')
			.fadeIn('fast');
	}

	root.bind('dloading-play', function(e, ee) {
		isplaying++;
		if (isplaying > 1) {
			return;
		}

		if (!wrap.is(':visible')) {
			root
				.css('top', '50%')
				.css('left', '50%')
				.css('marginLeft', -root.width() / 2)
				.css('marginTop', -root.height() / 2)
		}

		$(document).bind('mousemove', mousemove);
		if (ee) {
			mousemove(ee);
		}
		wrap.fadeIn();
		bar.trigger('dloading-long');
	}).bind('dloading-stop', function(e) {
		isplaying--;
		if (isplaying > 0) {
			return;
		}

		isplaying = 0;
		wrap.fadeOut(function() {
			$(document).unbind('mousemove', mousemove);
		});
	});

	return root;
};
