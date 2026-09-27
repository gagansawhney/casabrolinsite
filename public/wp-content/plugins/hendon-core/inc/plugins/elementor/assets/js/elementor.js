(function ($) {
	"use strict";

	$( window ).on(
		'elementor/frontend/init',
		function () {
			// shortcodes
			qodefElementorShortcodes.init();
		}
	);

	$(window).on('load', function () {
		qodefElementorSection.init();
		elementorSection.init();
	});

	// shortcodes
	var qodefElementorShortcodes = {
		init           : function () {
			var isEditMode = Boolean( elementorFrontend.isEditMode() );

			if (isEditMode) {
				for (var key in qodefCore.shortcodes) {
					for (var keyChild in qodefCore.shortcodes[key]) {
						qodefElementorShortcodes.reInitShortcode( key, keyChild );
					}
				}
			}
		},
		reInitShortcode: function (key, keyChild) {
			elementorFrontend.hooks.addAction(
				'frontend/element_ready/' + key + '.default',
				function (e) {

					// check if object doesn't exist and print the module where is the error
					if (typeof qodefCore.shortcodes[key][keyChild] === 'undefined') {
						console.log( keyChild );
					} else if (typeof qodefCore.shortcodes[key][keyChild].initSlider === 'function' && e.find( '.qodef-instagram-swiper-container' ).length) {
						qodefCore.shortcodes[key][keyChild].initSlider( e.find( '.qodef-instagram-swiper-container' ), false );
					} else if (typeof qodefCore.shortcodes[key][keyChild].initSlider === 'function' ) {
						if ( e.find( '.qodef-swiper-container' ).length ) {
							qodefCore.shortcodes[key][keyChild].initSlider( e.find( '.qodef-swiper-container' ) );
						}
					} else if (typeof qodefCore.shortcodes[key][keyChild].initPopup === 'function' && e.find( '.qodef-magnific-popup' ).length) {
						qodefCore.shortcodes[key][keyChild].initPopup( e.find( '.qodef-magnific-popup' ) );
					} else if (typeof qodefCore.shortcodes[key][keyChild].initItem === 'function' && e.find( '.qodef-shortcode' ).length) {
						qodefCore.shortcodes[key][keyChild].initItem( e.find( '.qodef-shortcode' ) );
					} else {
						qodefCore.shortcodes[key][keyChild].init();
					}
				}
			);
		}
	};
	
	var qodefElementorSection = {
		init: function () {
			$(window).on('elementor/frontend/init', function () {
				elementorFrontend.hooks.addAction('frontend/element_ready/section', elementorSection.init);
			});
		}
	};
	
	var elementorSection = {
		init: function ($scope) {
			var $target = $scope,
				isEditMode = Boolean(elementorFrontend.isEditMode()),
				settings = [],
				sectionData = {};
			
			//generate parallax settings
			if (isEditMode && typeof $scope !== 'undefined') {
				// generate options when in admin
				var editorElements = window.elementor.elements,
					sectionId = $target.data('id');
				
				$.each(editorElements.models, function (index, object) {
					if (sectionId === object.id) {
						sectionData = object.attributes.settings.attributes;
					}
				});
				
				if (typeof sectionData.qodef_enable_parallax !== 'undefined') {
					settings['enable_parallax'] = sectionData.qodef_enable_parallax;
				}
				
				if (typeof sectionData.qodef_parallax_image !== 'undefined' && sectionData.qodef_parallax_image['url']) {
					settings['image_url'] = sectionData.qodef_parallax_image['url'];
				}
				
				if (typeof sectionData.qodef_parallax_height !== 'undefined') {
					settings['section_height'] = sectionData.qodef_parallax_height;
				}
				
			} else {
				// generate options when in frontend using global js variable
				var sectionHandlerData = qodefElementorGlobal.vars.elementorSectionHandler;
				
				$.each(sectionHandlerData, function (index, property) {
					$target = $('[data-id="' + index + '"]');
					settings['image_url'] = property[0].url;
					settings['section_height'] = property[1];
					
					if (typeof settings['image_url'] !== 'undefined') {
						settings['enable_parallax'] = 'yes';
					}
					
					//generate output
					if (typeof $target !== 'undefined' && $target.length) {
						elementorSection.generateOutput($target, settings);
					}
				});
			}
			
			//generate output
			if (typeof $target !== 'undefined') {
				elementorSection.generateOutput($target, settings);
			}
		},
		generateOutput: function ($target, settings) {
			$('.qodef-parallax-img-holder', $target).remove();
			$target.removeClass('qodef-parallax qodef--parallax-row');
			$target.css({'overflow': 'hidden'});
			
			if (typeof settings['enable_parallax'] !== 'undefined' && settings['enable_parallax'] == 'yes' && typeof settings['image_url'] !== 'undefined') {
				var $layout = null;
				
				$target.addClass('qodef-parallax qodef--parallax-row');
				$target.css({'height': settings['section_height'], 'background': 'transparent'});
				
				$layout = $('<div class="qodef-parallax-img-holder"><div class="qodef-parallax-img-wrapper"><img src="' + settings['image_url'] + '" alt="Parallax image"></div></div>').prependTo($target);
				
				//wait for image src to be loaded
				var newImg = new Image;
				newImg.onload = function () {
					$target.find('img').attr('src', this.src);
					qodefCore.qodefParallaxBackground.init();
				};
				newImg.src = settings['image_url'];
			}
		}
	};
	
})(jQuery);
