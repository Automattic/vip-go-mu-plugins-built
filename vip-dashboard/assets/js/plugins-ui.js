(function ($) {

	function init() {
		bindActions();
		goResize();
		goFilter();
		evenHeights('.plugin');
	}

	function bindActions() {
		$('.plugin').hover(
			function() {
				var plugin = $(this);
				pluginHover( plugin );
			},
			function() {
				var plugin = $(this);
				pluginReset( plugin );
			}
		);

		$('.fp-button').on('click', function(event) {
			var button = $(this);
			var plugin = button.closest('.plugin');
			activatePlugin( button, plugin );
			event.preventDefault();
		});

		//$('#search').focus();
	}

	function pluginHover( plugin ) {
		plugin.addClass('hovered'),
		plugin.find('.interstitial').addClass('visible');
		setTimeout(function() {
			plugin.find('.fp-button').addClass('visible');
		}, 280);
	}

	function pluginReset( plugin ) {
		plugin.removeClass('hovered'),
		plugin.find('.interstitial').removeClass('visible'),
		plugin.find('.fp-button').removeClass('visible');
	}

	function activatePlugin( button, plugin ) {
		plugin.addClass('activating'),
		plugin.find('.fp-button').removeClass('visible'),
		plugin.find('.fp-text').addClass('visible');
		setTimeout(function() {
			window.location.href = button.attr('href');
		}, 850);
	}

	function goFilter() {
		var plugins = $('#showcase > div');
		$('input[type=search]').on('search', function () {
			var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();
			plugins.show().filter(function() {
				var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
				return !~text.indexOf(val);
			}).hide();
		});
	}

	function evenHeights(selector) {
		var maxHeight = 0;
		$(selector).each(function(){
			$(this).height('auto');
			maxHeight = Math.max(maxHeight, $(this).height());
		});
		if ( maxHeight === 0 ) {
			maxHeight = 'auto';
		}
		$(selector).each(function(){
			$(this).height(maxHeight);
		});
	}

	function goResize() {
		function onResize(c,t) {
			onresize=function() {
				clearTimeout(t);
				t = setTimeout(c,100);
			};
		return c;
		}

		onResize(function() {
			evenHeights('.plugin');
		});
	}

	$(function() {
		init();
	});

}(jQuery));
