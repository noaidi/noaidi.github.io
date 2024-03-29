/* hash
 * --------------------------------------------------------------------- */
$(function() {
	$(window).bind('hashchangedone', function(_, url) {
		$('#nav a').removeClass('current');
		var href = (url.replace(/^\//, '').split('/'))[0];
		$('#nav a[href="#/'+href+'"]').addClass('current');
	});
});

$(function() {
	var target = $('#page');

	$.dWinResize();

	$('#logo a').click(function(e) {
		if (location.hash == $(this).attr('href')) {
			$('#bg').dfullbgPlay(false, false, e);
			return false;
		}

		return true;
	});

	$(window).hashchange(function(e) {
		var hash = location.hash;
		if (!hash.match(/^#\//)) {
			return;
		}

		var url = hash.replace(/^#/, '');
		if (url == '/') {
			/* main page */
			target.empty();
			$('#nav a').removeClass('current');
			$('#bg').dfullbgPlay(false, false, e);
			return;
		}

		$.dWinResize();
		if (!$.isSingleView())
			$('#bg').dfullbgPlay(false, false, e);

		$(window).trigger('hashchangedone', url);
		target.fadeOut(function() {
			target.empty();

			/* segment */
			var segment = url.split('/');
			if (segment.length < 2)
				return;
			var tag = segment[1];
			var id = '';
			if (segment.length > 2 && segment[2].match(/^[0-9]+$/)) {
				id = segment[2];
			}

			/* load */
			switch (tag) {
			case 'photo':
			case 'drawing':
			case 'movie':
				var page = $('<div />')
					.attr('id', 'page-photo')
					.addClass('d-page')
					.appendTo(target);
				$('<div class="clear" />').appendTo(target);
				page.loadPhoto({
					'id': id,
					'tag': tag,
					'callback': function() {
						target.fadeIn();
					}
				});
				break;
			case 'blah':
				var page = $('<div />')
					.attr('id', 'page-text')
					.appendTo(target);
				$('<div class="clear" />').appendTo(target);
				page.loadText({
					'id': id,
					'callback': function() {
						target.fadeIn();
					}
				});
				break;
			case 'quote':
				var page = $('<div />')
					.attr('id', 'page-text')
					.appendTo(target);
				$('<div class="clear" />').appendTo(target);
				page.loadQuote({
					'id': id,
					'callback': function() {
						target.fadeIn();
					}
				});
				break;
			}
			$.dofirst();
		});
	}).hashchange();
});

/* init background
 * --------------------------------------------------------------------- */
$(function() {
	var bg = $('#bg').dfullbg({
		autoplay: false,
		dloading: true,
		birdscreen: false
	});

	$.loadTumblr({
		'type': 'photo',
		'tag': 'bg',
		'limit': 30,
		'offset': 0
	}, function(data) {
		if (data.meta.msg != 'OK')
			return;

		var images = [];

		$(data.response.posts).each(function() {
			var post = this;
			$(post.photos).each(function() {
				images.push($.tumblrPhotoSrc(this));
			});
		});

		var opt = bg.data('dfullbgOpt');
		if (opt) {
			opt.images = images;
			if (!$.isSingleView() &&
				!bg.hasClass('dfullbg-paused')) {
				bg.dfullbgPlay();
			}
		}
	});
});

/* draw
 * --------------------------------------------------------------------- */
$.convertDate = function(post) {
	var d = post.date.replace(' GMT', '');
	var t;
	d = d.split(' ');
	t = d[1].split(':');
	d = d[0].split('-');
	d = new Date(d[0], parseInt(d[1]) - 1, d[2],
		t[0], t[1], t[2]);
	d = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
	return d.toString().replace(/\ GMT.*/, '');
};

$.fn.drawPostText = function(data, opt) {
	var target = $(this);

	if (data.meta.msg != 'OK')
		return;

	$(data.response.posts).each(function() {
		var post = this;

		target.append($('<div class="entry"></div>')
			.append($('<div class="date d-page"></div>')
				.html($.convertDate(post)))
			.append('<div class="hr" />')
			.append(post.title ?
				$('<div class="title d-page"></div>')
					.html(post.title) : '')
			.append(post.body ?
				$('<div class="body d-page redohtml"></div>')
					.html(post.body) : '')
		);

		if (opt.id) {
			target.find('a.launcher').click();
		}
	});

	return this;
};

$.fn.drawPostQuote = function(data, opt) {
	var target = $(this);

	if (data.meta.msg != 'OK')
		return;

	$(data.response.posts).each(function() {
		var post = this;

		target.append($('<div class="entry"></div>')
			.append($('<div class="date d-page"></div>')
				.html($.convertDate(post)))
			.append('<div class="hr" />')
			.append(post.source ?
				$('<div class="title d-page"></div>')
					.html(post.source) : '')
			.append(post.text ?
				$('<div class="body d-page redohtml"></div>')
					.append($('<p></p>').html(post.text)) : '')
		);

		if (opt.id) {
			target.find('a.launcher').click();
		}
	});

	return this;
};

$.fn.drawPostPhoto = function(data, opt) {
	var target = $(this);

	if (data.meta.msg != 'OK')
		return;

	var caption = target.children('.caption');
	
	if (caption.length == 0) {
		caption = $('<div class="caption"></div>').appendTo(target);
	}

	function srcFromSrcset(src) {
		var [s, _] = src.trim().split(' ')
		return s;
	}

	$(data.response.posts).each(function() {
		var post = this;
		var src = '';
		var href = '';

		switch (post.type) {
		case 'text':
			var div = $('<div />').html(post.body);
			if (div.length > 0) {
				var img = div.find('img');
				var srcset = img.attr('srcset').split(',');
				if (srcset.length > 2) {
					src = srcFromSrcset(srcset[0]);
					href = srcFromSrcset(srcset[srcset.length - 1]);
				}
			}
			break;
		case 'photo':
			$(post.photos).each(function() {
				src = this.alt_sizes[this.alt_sizes.length - 1].url
				href = $.tumblrPhotoSrc(this);
			});
			break;
		}

		if (!src || !href) {
			return;
		}

		var parsedUrl = location.hash.split('/');
		var controller = '';
		var id = '';

		if (parsedUrl.length > 1) {
			controller = parsedUrl[1];
		}

		if (parsedUrl.length > 2) {
			id = parsedUrl[2];
		}

		target.append(
			$('<div class="article" />').append(
				$('<a class="entry"></a>').append(
					$('<span class="screen"></span>')
				).append(
					$('<img src="'+src+'" alt="" />')
				).append(
					$('<img src="'+href+'" alt="" />')
				).attr('href', href)
				.click(function(e) {
					var href = $(this).attr('href');
					$('#bg').dfullbgPlay(href, true, e);
					target.find('a.entry').not(
						$(this).addClass('current')
							.addClass('view')
					).removeClass('current');
					caption.empty().append(
						$('<span class="date"></span>')
							.append($.convertDate(post))
					).append(
						$('<span class="text"></span>')
							.append(post.caption)
					);
					return false;
				})
			)
		);

		if (opt.id) {
			target.find('a.entry').click();
		}
	});

	return this;
};

/* load
 * --------------------------------------------------------------------- */
$.tumblrPhotoSrc = function(data) {
	var org = data.original_size;
	var alt = data.alt_sizes[0];

	if (data.alt_sizes.length > 1 &&
		!alt.url.match(/_500\./) &&
		alt.width == org.width) {
		alt = data.alt_sizes[1];
	}

	return (Math.max(org.width, org.height) == 1280) ? org.url : alt.url;
};

$.loadTumblr = function(opt, callback) {
	opt = $.extend(true, {
		'apiurl': 'https://api.tumblr.com/v2/blog/',
		'apikey': 'DsMmlOE6uCtdVCAMVyfgIFW8BYfm6rTczLSggQYQ5WCdpfMSGj',
		'basehost': 'noaidi.tumblr.com',
		'type': 'text',
		'id': '',
		'tag': '',
		'limit': 20,
		'offset': 0
	}, opt);

	$.dloadingPlay();

	var apidata = { 'api_key': opt.apikey };
	if (opt.limit > 0) {
		apidata.limit = opt.limit;
	}
	if (opt.offset > 0) {
		apidata.offset = opt.offset;
	}
	if (opt.id) {
		apidata.id = opt.id;
	}
	if (opt.tag) {
		apidata.tag = opt.tag;
	}
	$.getJSON(opt.apiurl + opt.basehost +
		'/posts/' + opt.type + '?jsonp=?', apidata, function(data) {
		$.dloadingStop();
		callback(data);
	});
};

$.fn.loadSomething = function(opt) {
	var me = $(this);
	var target = $('<div class="target"></div>').appendTo(me);
	var more = $('<a href="#" class="entry more">+</a>')
		.appendTo(me).hide();

	opt = $.extend(true, {
		'type': 'text',
		'id': '',
		'tag': '',
		'limit': 20,
		'offset': 0,
		'callback': function(data) { }
	}, opt);

	var loading = false;

	more.click(function(e) {
		if (more.hasClass('loading'))
			return false;
		more.trigger('loading');

		$.loadTumblr({
			'type': opt.type,
			'id': opt.id,
			'tag': opt.tag,
			'limit': opt.limit,
			'offset': opt.offset
		}, function(data) {
			more.show().trigger('loaded');
			opt.offset += opt.limit;
			switch (opt.type) {
			case 'text':
				target.drawPostText(data, opt);
				break;
			case 'photo':
				target.drawPostPhoto(data, opt);
				break;
			case 'quote':
				target.drawPostQuote(data, opt);
				break;
			}
			if ((data && data.response && data.response.posts) &&
				data.response.posts.length == 0)
				more.hide().unbind('click');
			opt.callback(data);
		}, 'json');
		return false;
	}).bind('loading', function() {
		more.addClass('loading').dblink();
	}).bind('loaded', function() {
		$(this).removeClass('loading').dblinkStop();
	}).click();

	$(window).scroll(function() {
		if ($(window).height() + $(window).scrollTop() ==
			$('body').height()) {
			more.click();
		}
	});

	if (opt.id) {
		more.remove();
	}

	return this;
};

$.fn.loadText = function(opt) {
	opt = $.extend(true, {
		'type': 'text',
		'limit': 5
	}, opt);
	$(this).loadSomething(opt);
	return this;
};

$.fn.loadQuote = function(opt) {
	opt = $.extend(true, {
		'type': 'quote',
		'limit': 5
	}, opt);
	$(this).loadSomething(opt);
	return this;
};

$.fn.loadPhoto = function(opt) {
	opt = $.extend(true, {
		'type': 'photo',
		'limit': 20
	}, opt);
	$(this).loadSomething(opt);
	return this;
};

$.isSingleView = function() {
	return !!location.hash.match(/\/[0-9]+$/);
};
