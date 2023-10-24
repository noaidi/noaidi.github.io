$(function() {
	$('a').focus(function() {
		$(this).blur();
	});

	var _ = $('.observer').hide();
	var _a = _.children('a').hide().click(function() {
		var bbx = $('.bbx');
		var sto = 0;

		if ($(this).hasClass('prev')) {
			var scrolltop = $(window).scrollTop()
			bbx.each(function() {
				if ($(this).offset().top < scrolltop) {
					sto = $(this).offset().top;
				}
			});
		} else if ($(this).hasClass('next')) {
			var scrolltop = $(window).scrollTop()
			bbx.each(function() {
				if (sto == 0 && $(this).offset().top > scrolltop) {
					sto = $(this).offset().top;
				}
			});
		}

		$('html, body').animate({
			scrollTop: sto
		});
		return false;
	});

	function scroll() {
		var scrolltop = $(window).scrollTop();
		var start = $('#header').outerHeight() - _.outerHeight();

		/*
		var colorR = Math.floor(Math.random() * 255);
		var colorG = Math.floor(Math.random() * 255);
		var colorB = Math.floor(Math.random() * 255);
		var color = 'rgb(' + colorR + ', ' + colorG + ', ' + colorB + ')';
		$('.bbx').css('background-color', color);
		*/

		if (scrolltop < start) {
			_.hide();
			_a.hide();
			return;
		}

		_.show();
		_a.fadeIn()
	}

	$(window).scroll(scroll);
	scroll();
});
