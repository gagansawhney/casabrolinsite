////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// jQuery
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var resizeId;

// The srcset candidate the browser chose (phones get the small file); for images it has
// not picked yet (lazy/hidden), use the small one on narrow screens, like the sizes attr.
function responsiveImgSrc(img){
    if (!img) return '';
    if (img.currentSrc) return img.currentSrc;
    var srcset = img.getAttribute('srcset');
    if (srcset && window.innerWidth <= 767) {
        var small = srcset.split(',')[0].trim().split(/\s+/)[0];
        if (small) return small;
    }
    return img.getAttribute('src');
}


$(document).ready(function($) {
    "use strict";

    var lastScrollTop = 0;
    var $nav = $(".navbar.fixed-top");
    // Initialize hero layout on load
    $(function(){
        heroHeight();
    });
    
    $(window).on("scroll", function(){
        var st = $(this).scrollTop();
        if (st > lastScrollTop && st > 50) {
            $nav.addClass("navbar-hidden");
            $(".floating-contact").addClass("is-visible");
        } else {
            $nav.removeClass("navbar-hidden");
            if (st <= 50) { $(".floating-contact").removeClass("is-visible"); }
        }
        lastScrollTop = st;
    });

//  "img" into "background-image" transfer

    $("[data-background-image]").each(function() {
        $(this).css("background-image", "url("+ $(this).attr("data-background-image") +")" );
    });

    $(".background--image, .img-into-bg").each(function() {
        $(this).css("background-image", "url("+ responsiveImgSrc($(this).find("img")[0]) +")" );
    });

//  Custom background color

    $("[data-background-color]").each(function() {
        $(this).css("background-color", $(this).attr("data-background-color")  );
    });

//  Parallax Background Image

    $("[data-parallax='scroll']").each(function() {
        var speed = $(this).attr("data-parallax-speed");
        var $this = $(this);
        var isVisible;
        var backgroundPosition;

        $this.isInViewport(function(status) {
            if (status === "entered") {
                isVisible = 1;
                var position;

                $(window).scroll(function () {
                    if( isVisible === 1 ){
                        position = $(window).scrollTop() - $this.offset().top;
                        backgroundPosition = (100 - (Math.abs((-$(window).height()) - position) / ($(window).height()+$this.height()))*100);
                        //$this.find(".parallax-element").css("background-position-y", (backgroundPosition/2) + "%");
                        if( $this.find(".parallax-element").hasClass("background--image") ){
                            $this.find(".background--image.parallax-element").css("background-position-y", (position/speed) + "px");
                        }
                        else {
                            $this.find(".parallax-element").css("transform", "translateY(" +(position/speed)+ "px)");
                        }
                    }
                });
            }
            if (status === "leaved"){
                isVisible = 0;
            }
        });
    });

    // Removed particles background for performance

    var $owlCarousel = $(".owl-carousel").not('.modal__carousel');

    if( $owlCarousel.length ){
        $owlCarousel.each(function() {

            var items = parseInt( $(this).attr("data-owl-items"), 10);
            if( !items ) items = 1;

            var nav = parseInt( $(this).attr("data-owl-nav"), 2);
            if( !nav ) nav = 0;

            var dots = parseInt( $(this).attr("data-owl-dots"), 2);
            if( !dots ) dots = 0;

            var center = parseInt( $(this).attr("data-owl-center"), 2);
            if( !center ) center = 0;

            var loop = parseInt( $(this).attr("data-owl-loop"), 2);
            if( !loop ) loop = 0;

            var margin = parseInt( $(this).attr("data-owl-margin"), 2);
            if( !margin ) margin = 0;

            var autoWidth = parseInt( $(this).attr("data-owl-auto-width"), 2);
            if( !autoWidth ) autoWidth = 0;

            var navContainer = $(this).attr("data-owl-nav-container");
            if( !navContainer ) navContainer = 0;

            var autoplay = $(this).attr("data-owl-autoplay");
            if( !autoplay ) autoplay = 0;

            var fadeOut = $(this).attr("data-owl-fadeout");
            if( !fadeOut ) fadeOut = 0;
            else fadeOut = "fadeOut";

            if( $("body").hasClass("rtl") ) var rtl = true;
            else rtl = false;

            if( items === 1 ){
                $(this).owlCarousel({
                    navContainer: navContainer,
                    animateOut: fadeOut,
                    autoplaySpeed: 2000,
                    autoplay: autoplay,
                    center: center,
                    loop: loop,
                    margin: margin,
                    autoWidth: autoWidth,
                    items: 1,
                    nav: nav,
                    dots: dots,
                    autoHeight: true,
                    rtl: rtl,
                    navText: ['<i class="fa fa-chevron-left"></i>','<i class="fa fa-chevron-right"></i>']
                });
            }
            else {
                $(this).owlCarousel({
                    navContainer: navContainer,
                    animateOut: fadeOut,
                    autoplaySpeed: 2000,
                    autoplay: autoplay,
                    autoheight: items,
                    center: center,
                    loop: loop,
                    margin: margin,
                    autoWidth: autoWidth,
                    items: 1,
                    nav: nav,
                    dots: dots,
                    autoHeight: true,
                    rtl: rtl,
                    navText: ['<i class="fa fa-chevron-left"></i>','<i class="fa fa-chevron-right"></i>'],
                    responsive: {
                        1199: {
                            items: items
                        },
                        992: {
                            items: 3
                        },
                        768: {
                            items: 2
                        },
                        0: {
                            items: 1
                        }
                    }
                });
            }

            if( $(this).find(".owl-item").length === 1 ){
                $(this).find(".owl-nav").css( { "opacity": 0,"pointer-events": "none"} );
            }

        });
    }

    $(".popup-image").magnificPopup({
        type:'image',
        fixedContentPos: false,
        gallery: { enabled:true },
        removalDelay: 300,
        mainClass: 'mfp-fade',
        callbacks: {
            open: function() {
                $(".page-wrapper, .navbar-nav").css("margin-right", getScrollBarWidth());
            },
            close: function() {
                $(".page-wrapper, .navbar-nav").css("margin-right", 0);
            }
        }
    });

    //  Scroll Reveal

    if ( $(window).width() > 768 && $("[data-scroll-reveal]").length ) {
        window.scrollReveal = new scrollReveal();
    }

    heroHeight();

});

$(window).on("resize", function(){
    clearTimeout(resizeId);
    resizeId = setTimeout(doneResizing, 250);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Lead tracking helper with single-fire guard and debug logs
window.__leadTracked = window.__leadTracked || false;
function trackLeadOnce(meta){
    try {
        var details = meta || {};
        if (!window.__leadTracked && typeof window.fbq === 'function') {
            console.log('[lead] firing fbq Lead', details);
            window.fbq('track', 'Lead', details);
            window.__leadTracked = true;
        } else {
            console.log('[lead] skipped (already fired or fbq missing)', { already: window.__leadTracked, hasFbq: typeof window.fbq === 'function' });
        }
    } catch(e) {
        // no-op
    }
}

// GA4 generate_lead single-fire helper
window.__gaLeadTracked = window.__gaLeadTracked || false;
function trackGAGenerateLeadOnce(meta){
    try {
        var details = meta || {};
        if (!window.__gaLeadTracked && typeof window.gtag === 'function') {
            console.log('[lead] firing GA4 generate_lead', details);
            window.gtag('event', 'generate_lead', details);
            window.__gaLeadTracked = true;
        } else {
            console.log('[lead] skipped GA4 generate_lead', { already: window.__gaLeadTracked, hasGtag: typeof window.gtag === 'function' });
        }
    } catch(e) {}
}

// Google Ads conversion single-fire helper
window.__adsConversionTracked = window.__adsConversionTracked || false;
function trackAdsConversionOnce(){
    try {
        if (!window.__adsConversionTracked && typeof window.gtag_report_conversion === 'function') {
            console.log('[lead] firing Google Ads conversion');
            window.gtag_report_conversion();
            window.__adsConversionTracked = true;
        } else {
            console.log('[lead] skipped Ads conversion', { already: window.__adsConversionTracked, hasConv: typeof window.gtag_report_conversion === 'function' });
        }
    } catch(e) {}
}

// Capture campaign parameters (persist for the session for subsequent interactions)
function captureTrackingParams(){
    var keys = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
        'fbclid', 'gclid', 'gbraid', 'wbraid', 'msclkid',
        'keyword', 'matchtype', 'campaignid', 'adgroupid', 'creative', 'network', 'device',
        'placement', 'targetid', 'loc_physical_ms', 'loc_interest_ms'
    ];
    var params = {};
    try {
        var search = window.location.search ? window.location.search.substring(1).split('&') : [];
        search.forEach(function(pair){
            if (!pair) return;
            var parts = pair.split('=');
            if (!parts.length) return;
            var k = decodeURIComponent(parts[0].replace(/\+/g, ' ')).toLowerCase();
            var v = parts.length > 1 ? decodeURIComponent(parts.slice(1).join('=').replace(/\+/g, ' ')) : '';
            if (keys.indexOf(k) !== -1) {
                params[k] = v;
            }
        });

        if (window.sessionStorage) {
            if (Object.keys(params).length) {
                sessionStorage.setItem('landing_tracking_params', JSON.stringify(params));
            } else {
                var stored = sessionStorage.getItem('landing_tracking_params');
                if (stored) {
                    params = JSON.parse(stored) || {};
                }
            }
        }
    } catch (e) {
        try { console.warn('[tracking] unable to capture params', e); } catch(_){}
    }

    keys.forEach(function(key){
        if (!(key in params)) params[key] = '';
    });

    window.__landingTrackingParams = params;
    return params;
}

var landingTrackingParams = captureTrackingParams();

function sendPartyWebhook(formLocation, name, email, phoneE164, remarks){
    try {
        var phoneDigits = (phoneE164 || '').toString().replace(/\D+/g, '');
        var payload = {
            party_name: name || '',
            party_email: email || '',
            party_phone: phoneDigits,
            party_remarks: remarks || '',
            utm_source: landingTrackingParams.utm_source || '',
            utm_medium: landingTrackingParams.utm_medium || '',
            utm_campaign: landingTrackingParams.utm_campaign || '',
            utm_term: landingTrackingParams.utm_term || '',
            utm_content: landingTrackingParams.utm_content || '',
            utm_id: landingTrackingParams.utm_id || '',
            fbclid: landingTrackingParams.fbclid || '',
            gclid: landingTrackingParams.gclid || '',
            gbraid: landingTrackingParams.gbraid || '',
            wbraid: landingTrackingParams.wbraid || '',
            msclkid: landingTrackingParams.msclkid || '',
            keyword: landingTrackingParams.keyword || '',
            matchtype: landingTrackingParams.matchtype || '',
            campaignid: landingTrackingParams.campaignid || '',
            adgroupid: landingTrackingParams.adgroupid || '',
            creative: landingTrackingParams.creative || '',
            network: landingTrackingParams.network || '',
            device: landingTrackingParams.device || '',
            placement: landingTrackingParams.placement || '',
            targetid: landingTrackingParams.targetid || '',
            loc_physical_ms: landingTrackingParams.loc_physical_ms || '',
            loc_interest_ms: landingTrackingParams.loc_interest_ms || '',
            landing_page_url: window.location.href || '',
            referrer: document.referrer || '',
            submitted_at: new Date().toISOString()
        };

        if (formLocation) {
            payload.party_remarks = payload.party_remarks ? payload.party_remarks + ' (form: ' + formLocation + ')' : 'Form: ' + formLocation;
        }

        $.ajax({
            url: 'https://us-central1-attendance-system-e312c.cloudfunctions.net/createPartyFromWebhook?token=s294',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload)
        }).done(function(resp){
            try { console.log('[partyWebhook] success', resp); } catch(_){}
        }).fail(function(xhr){
            try { console.error('[partyWebhook] failed', xhr && xhr.status, xhr && xhr.responseText); } catch(_){}
        });
    } catch (e) {
        try { console.error('[partyWebhook] exception', e); } catch(_){}
    }
}

// Do after resize

function doneResizing(){
    heroHeight();
}

// Set Hero height

function heroHeight(){
    var $nav = $(".navbar.fixed-top");
    var navHeight = $nav.outerHeight() || 0; // use full height to ensure image fully visible on load
    $("#hero").css({
        marginTop: navHeight + "px",
        height: "100vh"
    });
}

// Google Map

function simpleMap(latitude, longitude, markerImage, mapTheme, mapElement, markerDrag){
    if (!markerDrag){
        markerDrag = false;
    }
    if ( mapTheme === "light" ){
        var mapStyles = [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":21}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#e9e9e9"},{"lightness":17}]}];
    }
    else if ( mapTheme === "dark" ){
        mapStyles = [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":17}]}]
    }
    var mapCenter = new google.maps.LatLng(latitude,longitude);
    var mapOptions = {
        zoom: 13,
        center: mapCenter,
        disableDefaultUI: false,
        scrollwheel: false,
        styles: mapStyles
    };
    var element = document.getElementById(mapElement);
    var map = new google.maps.Map(element, mapOptions);
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(latitude,longitude),
        map: map,
        icon: markerImage,
        draggable: markerDrag
    });

    // autoComplete(map, marker); // Commented out to debug ReferenceError

}

// Smooth Scroll

$('a[href*="#"]')
    .not('[href="#"]')
    .not('[href="#0"]')
    .click(function(event) {
        if (
            location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '')
            &&
            location.hostname === this.hostname
        ) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                event.preventDefault();
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, 1000, function() {
                    var $target = $(target);
                    $target.focus();
                    if ($target.is(":focus")) {
                        return false;
                    } else {
                        $target.attr('tabindex','-1');
                        $target.focus();
                    }
                });
            }
        }
    });

function getScrollBarWidth () {
    var $outer = $('<div>').css({visibility: 'hidden', width: 100, overflow: 'scroll'}).appendTo('body'),
        widthWithScroll = $('<div>').css({width: '100%'}).appendTo($outer).outerWidth();
    $outer.remove();
    return 100 - widthWithScroll;
}

// Load MSG91 OTP SDK when needed
function ensureMsg91Loaded(callback){
    if (window.initSendOTP) { callback(); return; }
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.onload = callback;
    s.src = 'https://verify.msg91.com/otp-provider.js';
    document.body.appendChild(s);
}

// Hero form submission flow, gated by MSG91 OTP verification
$(function(){
    var $heroForm = $('#form-hero');
    if (!$heroForm.length) return;

    // Ensure tab order: after Email, focus Message before Submit
    $('#form-hero-email').on('keydown', function(ev){
        if ((ev.key === 'Tab' || ev.keyCode === 9) && !ev.shiftKey) {
            ev.preventDefault();
            $('#form-hero-message').focus();
        }
    });

    // After Message, focus Submit on forward Tab
    $('#form-hero-message').on('keydown', function(ev){
        if ((ev.key === 'Tab' || ev.keyCode === 9) && !ev.shiftKey) {
            ev.preventDefault();
            $('#form-hero-submit').focus();
        }
    });

    function normalizeE164(cc, phone){
        cc = (cc || '+91').toString().trim();
        phone = (phone || '').toString().trim();
        if (cc.charAt(0) !== '+') cc = '+' + cc;
        phone = phone.replace(/\D+/g, '').replace(/^0+/, '');
        return cc + phone;
    }

    function submitHeroFormAjax(){
        try {
            $('#formSubmitModal .modal-title').text('Thank You for sharing your information');
            $('#formSubmitModal .modal-body').text('Our agent will soon get in touch with you.');
            $('#formSubmitModal').modal('show');
        } catch(e){}
        // Fallback: ensure tracking if OTP path didn't run
        trackGAGenerateLeadOnce({ form_location: 'hero' });
        trackAdsConversionOnce();
        trackLeadOnce({
            content_name: 'Nerul landing form (AJAX success fallback)',
            form_location: 'hero'
        });
        $heroForm[0].reset();
        $('#form-hero-submit').prop('disabled', false);
    }

    function startOtpVerification(e164Phone){
        var configuration = {
            widgetId: '356844694444383834333338',
            tokenAuth: '466799TwbvCuEjh68b2c585P1',
            identifier: e164Phone,
            exposeMethods: false,
            success: function(data){
                // data should contain the verified token
                try { console.log('[otp][hero] success payload', data); } catch(e){}
                var token = (data && (data.token || data['access-token'] || data.accessToken)) || '';
                if (!token && data && typeof data.message === 'string' && data.message.length > 10) {
                    token = data.message; // MSG91 sometimes returns JWT in `message`
                }
                try { console.log('[otp][hero] extracted token', token ? '[present]' : '[missing]'); } catch(e){}
                if (!token) {
                    sendPartyWebhook(
                        'hero',
                        $('#form-hero-name').val(),
                        $('#form-hero-email').val(),
                        normalizeE164($('#form-hero-cc').val(), $('#form-hero-phone').val()),
                        $('#form-hero-message').val()
                    );
                    submitHeroFormAjax();
                    return;
                }
                // Call our server to verify token against MSG91
                $.ajax({
                    url: 'assets/api/verify_otp.php',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ access_token: token })
                }).done(function(resp){
                    try { console.log('[otp][hero] verify_otp response', resp); } catch(e){}
                    if (resp && resp.ok) {
                        try {
                            trackGAGenerateLeadOnce({ form_location: 'hero' });
                            trackAdsConversionOnce();
                            trackLeadOnce({
                                content_name: 'Nerul landing form (OTP success)',
                                form_location: 'hero'
                            });
                            sendPartyWebhook(
                                'hero',
                                $('#form-hero-name').val(),
                                $('#form-hero-email').val(),
                                normalizeE164($('#form-hero-cc').val(), $('#form-hero-phone').val()),
                                $('#form-hero-message').val()
                            );
                        } catch(e){}
                        submitHeroFormAjax();
                    }
                    else {
                        // If server not configured for MSG91, optimistically proceed
                        if (resp && typeof resp.error === 'string' && /Server not configured|MSG91_AUTHKEY/i.test(resp.error)) {
                            try {
                                trackGAGenerateLeadOnce({ form_location: 'hero' });
                                trackAdsConversionOnce();
                                trackLeadOnce({ content_name: 'Nerul landing form (OTP client success)', form_location: 'hero' });
                                sendPartyWebhook(
                                    'hero',
                                    $('#form-hero-name').val(),
                                    $('#form-hero-email').val(),
                                    normalizeE164($('#form-hero-cc').val(), $('#form-hero-phone').val()),
                                    $('#form-hero-message').val()
                                );
                            } catch(e){}
                            submitHeroFormAjax();
                            return;
                        }
                        try {
                            $('#formSubmitModal .modal-title').text('Verification failed');
                            $('#formSubmitModal .modal-body').text('We could not verify your number. Please try again.');
                            $('#formSubmitModal').modal('show');
                        } catch(e){}
                        $('#form-hero-submit').prop('disabled', false);
                    }
                }).fail(function(xhr){
                    try { console.error('[otp][hero] verify_otp failed', xhr && xhr.status, xhr && xhr.responseText); } catch(e){}
                    // If server not configured for MSG91, optimistically proceed
                    try {
                        var rt = (xhr && xhr.responseText) || '';
                        if (xhr && xhr.status === 500 && /Server not configured|MSG91_AUTHKEY/i.test(rt)) {
                            trackGAGenerateLeadOnce({ form_location: 'hero' });
                            trackAdsConversionOnce();
                            trackLeadOnce({ content_name: 'Nerul landing form (OTP client success)', form_location: 'hero' });
                            sendPartyWebhook(
                                'hero',
                                $('#form-hero-name').val(),
                                $('#form-hero-email').val(),
                                normalizeE164($('#form-hero-cc').val(), $('#form-hero-phone').val()),
                                $('#form-hero-message').val()
                            );
                            submitHeroFormAjax();
                            return;
                        }
                    } catch(e){}
                    try {
                        $('#formSubmitModal .modal-title').text('Verification error');
                        $('#formSubmitModal .modal-body').text('A server error occurred. Please try again.');
                        $('#formSubmitModal').modal('show');
                    } catch(e){}
                    $('#form-hero-submit').prop('disabled', false);
                });
            },
            failure: function(error){
                try { console.warn('[otp][hero] failure callback', error); } catch(e){}
                try {
                    $('#formSubmitModal .modal-title').text('Verification failed');
                    $('#formSubmitModal .modal-body').text('We could not verify your number. Please try again.');
                    $('#formSubmitModal').modal('show');
                } catch(e){}
                $('#form-hero-submit').prop('disabled', false);
            }
        };
        ensureMsg91Loaded(function(){
            try { console.log('[otp][hero] calling initSendOTP', { identifier: configuration.identifier, exposeMethods: configuration.exposeMethods }); window.initSendOTP(configuration); }
            catch(e){
                try {
                    $('#formSubmitModal .modal-title').text('Verification unavailable');
                    $('#formSubmitModal .modal-body').text('OTP service is unavailable. Please try again later.');
                    $('#formSubmitModal').modal('show');
                } catch(_){}
                $('#form-hero-submit').prop('disabled', false);
            }
        });
    }

    $heroForm.on('submit', function(e){
        e.preventDefault();
        var e164 = normalizeE164($('#form-hero-cc').val(), $('#form-hero-phone').val());
        $('#form-hero-submit').prop('disabled', true);
        startOtpVerification(e164);
    });
});

// Contact form (bottom) – same OTP-gated flow
$(function(){
    var $contactForm = $('#form-contact');
    if (!$contactForm.length) return;

    function normalizeE164(cc, phone){
        cc = (cc || '+91').toString().trim();
        phone = (phone || '').toString().trim();
        if (cc.charAt(0) !== '+') cc = '+' + cc;
        phone = phone.replace(/\D+/g, '').replace(/^0+/, '');
        return cc + phone;
    }

    function submitContactAjax(){
        try {
            $('#formSubmitModal .modal-title').text('Thank You for sharing your information');
            $('#formSubmitModal .modal-body').text('Our agent will soon get in touch with you.');
            $('#formSubmitModal').modal('show');
        } catch(e){}
        // Fallback: ensure tracking if OTP path didn't run
        trackGAGenerateLeadOnce({ form_location: 'contact' });
        trackAdsConversionOnce();
        trackLeadOnce({
            content_name: 'Nerul landing form (AJAX success fallback)',
            form_location: 'contact'
        });
        $contactForm[0].reset();
        $('#form-contact-submit').prop('disabled', false);
    }

    function startOtpVerificationContact(e164Phone){
        var configuration = {
            widgetId: '356844694444383834333338',
            tokenAuth: '466799TwbvCuEjh68b2c585P1',
            identifier: e164Phone,
            exposeMethods: false,
            success: function(data){
                try { console.log('[otp][contact] success payload', data); } catch(e){}
                var token = (data && (data.token || data['access-token'] || data.accessToken)) || '';
                if (!token && data && typeof data.message === 'string' && data.message.length > 10) {
                    token = data.message; // MSG91 sometimes returns JWT in `message`
                }
                try { console.log('[otp][contact] extracted token', token ? '[present]' : '[missing]'); } catch(e){}
                if (!token) {
                    sendPartyWebhook(
                        'contact',
                        $('#form-contact-name').val(),
                        $('#form-contact-email').val(),
                        normalizeE164($('#form-contact-cc').val(), $('#form-contact-phone').val()),
                        $('#form-contact-message').val()
                    );
                    submitContactAjax();
                    return;
                }
                $.ajax({
                    url: 'assets/api/verify_otp.php',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ access_token: token })
                }).done(function(resp){
                    try { console.log('[otp][contact] verify_otp response', resp); } catch(e){}
                    if (resp && resp.ok) {
                        try {
                            trackGAGenerateLeadOnce({ form_location: 'contact' });
                            trackAdsConversionOnce();
                            trackLeadOnce({
                                content_name: 'Nerul landing form (OTP success)',
                                form_location: 'contact'
                            });
                            sendPartyWebhook(
                                'contact',
                                $('#form-contact-name').val(),
                                $('#form-contact-email').val(),
                                normalizeE164($('#form-contact-cc').val(), $('#form-contact-phone').val()),
                                $('#form-contact-message').val()
                            );
                        } catch(e){}
                        submitContactAjax();
                    } else {
                        // If server not configured for MSG91, optimistically proceed
                        if (resp && typeof resp.error === 'string' && /Server not configured|MSG91_AUTHKEY/i.test(resp.error)) {
                            try {
                                trackGAGenerateLeadOnce({ form_location: 'contact' });
                                trackAdsConversionOnce();
                                trackLeadOnce({ content_name: 'Nerul landing form (OTP client success)', form_location: 'contact' });
                                sendPartyWebhook(
                                    'contact',
                                    $('#form-contact-name').val(),
                                    $('#form-contact-email').val(),
                                    normalizeE164($('#form-contact-cc').val(), $('#form-contact-phone').val()),
                                    $('#form-contact-message').val()
                                );
                            } catch(e){}
                            submitContactAjax();
                            return;
                        }
                        try {
                            $('#formSubmitModal .modal-title').text('Verification failed');
                            $('#formSubmitModal .modal-body').text('We could not verify your number. Please try again.');
                            $('#formSubmitModal').modal('show');
                        } catch(e){}
                        $('#form-contact-submit').prop('disabled', false);
                    }
                }).fail(function(xhr){
                    try { console.error('[otp][contact] verify_otp failed', xhr && xhr.status, xhr && xhr.responseText); } catch(e){}
                    // If server not configured for MSG91, optimistically proceed
                    try {
                        var rt = (xhr && xhr.responseText) || '';
                        if (xhr && xhr.status === 500 && /Server not configured|MSG91_AUTHKEY/i.test(rt)) {
                            trackGAGenerateLeadOnce({ form_location: 'contact' });
                            trackAdsConversionOnce();
                            trackLeadOnce({ content_name: 'Nerul landing form (OTP client success)', form_location: 'contact' });
                            sendPartyWebhook(
                                'contact',
                                $('#form-contact-name').val(),
                                $('#form-contact-email').val(),
                                normalizeE164($('#form-contact-cc').val(), $('#form-contact-phone').val()),
                                $('#form-contact-message').val()
                            );
                            submitContactAjax();
                            return;
                        }
                    } catch(e){}
                    try {
                        $('#formSubmitModal .modal-title').text('Verification error');
                        $('#formSubmitModal .modal-body').text('A server error occurred. Please try again.');
                        $('#formSubmitModal').modal('show');
                    } catch(e){}
                    $('#form-contact-submit').prop('disabled', false);
                });
            },
            failure: function(){
                try { console.warn('[otp][contact] failure callback'); } catch(e){}
                try {
                    $('#formSubmitModal .modal-title').text('Verification failed');
                    $('#formSubmitModal .modal-body').text('We could not verify your number. Please try again.');
                    $('#formSubmitModal').modal('show');
                } catch(e){}
                $('#form-contact-submit').prop('disabled', false);
            }
        };
        ensureMsg91Loaded(function(){ try { console.log('[otp][contact] calling initSendOTP', { identifier: configuration.identifier, exposeMethods: configuration.exposeMethods }); window.initSendOTP(configuration); } catch(e){ $('#form-contact-submit').prop('disabled', false); }});
    }

    $contactForm.on('submit', function(e){
        e.preventDefault();
        var e164 = normalizeE164($('#form-contact-cc').val(), $('#form-contact-phone').val());
        $('#form-contact-submit').prop('disabled', true);
        startOtpVerificationContact(e164);
    });
});

// Defer-load modal gallery slides on first open (responsive, folder-based with explicit filenames)
$('#modal-feature').off('show.bs.modal').on('show.bs.modal', function (ev) {
	var $modal = $(this);
	var trigger = $(ev.relatedTarget);
	var initialKey = trigger && trigger.attr('data-gallery') || 'villa1';

	// Villa meta content
	var meta = {
		villa1: {
			title: 'Villa Verde Luna',
			subtitle: 'Your Private Oasis of Luxury',
			builtUp: '2,781 Sq Ft',
			descriptionHtml: [
				'<p>Villa Verde Luna offers 4 bedrooms, 5 bathrooms, and spacious living and dining areas crafted with luxury fittings and a modular kitchen. With a private splash pool, wooden deck, and exclusive entrance, this villa is a haven for those who value elegance and solitude. Enjoy the finest in luxurious living with every modern comfort.</p>',
				'<ul class="mt-2">',
				'  <li><strong>Built Up Area:</strong> 2,781 Sq Ft</li>',
				'  <li>4 Bedrooms, 5 Bathrooms</li>',
				'  <li>Spacious Living & Dining, Modular Kitchen</li>',
				'  <li>Private splash pool with wooden deck</li>',
				'  <li>Exclusive entrance; designed for privacy</li>',
				'</ul>'
			].join(''),
			otherVillas: [
				{ label: 'Villa Verde Sol', key: 'villa2' },
				{ label: 'Villa Verde Brisa', key: 'villa3' },
				{ label: 'Villa Verde Mar', key: 'villa4' }
			]
		},
		villa2: {
			title: 'Villa Verde Sol',
			subtitle: 'Luxury Living with a Natural Twist',
			builtUp: '3,031 Sq Ft',
			descriptionHtml: [
				'<p>Experience Villa Verde Sol, a 4-bedroom, 5-bathroom sanctuary that combines luxurious interiors with nature. Featuring a lap pool, outdoor bar, and shower with forest views, this villa is perfect for relaxation and entertainment alike. With spacious living, dining, and modern kitchen spaces, Villa Verde Sol offers a blend of style and serenity.</p>',
				'<ul class="mt-2">',
				'  <li><strong>Built Up Area:</strong> 3,031 Sq Ft</li>',
				'  <li>4 Bedrooms, 5 Bathrooms</li>',
				'  <li>Lap pool, outdoor bar, shower with forest views</li>',
				'</ul>'
			].join(''),
			otherVillas: [
				{ label: 'Villa Verde Luna', key: 'villa1' },
				{ label: 'Villa Verde Brisa', key: 'villa3' },
				{ label: 'Villa Verde Mar', key: 'villa4' }
			]
		},
		villa3: {
			title: 'Villa Verde Brisa',
			subtitle: 'An Escape of Pure Indulgence',
			builtUp: '3,035 Sq Ft',
			descriptionHtml: [
				'<p>Villa Verde Brisa is an elegant 4-bedroom, 5-bathroom villa, complete with a large living area, modular kitchen, and high-end fittings. With a lap pool, poolside Jacuzzi, lush garden, and serene forest views, this villa invites you to unwind in luxury and peace.</p>',
				'<ul class="mt-2">',
				'  <li><strong>Built Up Area:</strong> 3,035 Sq Ft</li>',
				'  <li>Lap pool, poolside Jacuzzi, lush garden</li>',
				'</ul>'
			].join(''),
			otherVillas: [
				{ label: 'Villa Verde Luna', key: 'villa1' },
				{ label: 'Villa Verde Sol', key: 'villa2' },
				{ label: 'Villa Verde Mar', key: 'villa4' }
			]
		},
		villa4: {
			title: 'Villa Verde Mar',
			subtitle: 'Elegance with Coastal Charm',
			builtUp: '2,829 Sq Ft',
			descriptionHtml: [
				'<p>Villa Verde Mar captures coastal elegance with its 4 bedrooms, 5 bathrooms, and expansive living spaces. Enjoy the lap pool, wooden deck, and a beautifully landscaped garden, perfect for outdoor relaxation. Crafted with luxury finishes and a modern kitchen, Villa Verde Mar is where sophistication meets comfort.</p>',
				'<ul class="mt-2">',
				'  <li><strong>Built Up Area:</strong> 2,829 Sq Ft</li>',
				'  <li>Lap pool with wooden deck, landscaped garden</li>',
				'</ul>'
			].join(''),
			otherVillas: [
				{ label: 'Villa Verde Luna', key: 'villa1' },
				{ label: 'Villa Verde Sol', key: 'villa2' },
				{ label: 'Villa Verde Brisa', key: 'villa3' }
			]
		}
	};

	var galleries = {
		villa1: [
			{ normal: 'assets/img/Villa-1/Villa-1-Living-1-3K.webp', small: 'assets/img/Villa-1/Villa-1-Living-1-3K-small.webp' },
			{ normal: 'assets/img/Villa-1/Villa-1-Living-4-3K.webp', small: 'assets/img/Villa-1/Villa-1-Living-4-3K-small.webp' },
			{ normal: 'assets/img/Villa-1/Villa-1-Living-6-3K.webp', small: 'assets/img/Villa-1/Villa-1-Living-6-3K-small.webp' },
			{ normal: 'assets/img/Villa-1/Villa-1-Bedroom-3-4K.webp', small: 'assets/img/Villa-1/Villa-1-Bedroom-3-4K-small.webp' }
		],
		villa2: [
			{ normal: 'assets/img/Villa-2/Villa-2-Cam-1-Final-3K.webp', small: 'assets/img/Villa-2/Villa-2-Cam-1-Final-3K-small.webp' },
			{ normal: 'assets/img/Villa-2/Villa-2-Cam-7-Final-3K.webp', small: 'assets/img/Villa-2/Villa-2-Cam-7-Final-3K-small.webp' },
			{ normal: 'assets/img/Villa-2/Villa-2-Cam-8-Final-3K.webp', small: 'assets/img/Villa-2/Villa-2-Cam-8-Final-3K-small.webp' },
			{ normal: 'assets/img/Villa-2/Villa-2-Bedroom-3-Final-4K.webp', small: 'assets/img/Villa-2/Villa-2-Bedroom-3-Final-4K-small.webp' }
		],
		villa3: [
			{ normal: 'assets/img/Villa-3/Villa-3-Cam-1-Final-4K.webp', small: 'assets/img/Villa-3/Villa-3-Cam-1-Final-4K-small.webp' },
			{ normal: 'assets/img/Villa-3/Villa-3-Cam-2-Final-4K.webp', small: 'assets/img/Villa-3/Villa-3-Cam-2-Final-4K-small.webp' },
			{ normal: 'assets/img/Villa-3/Villa-3-Cam-3-Final-3K.webp', small: 'assets/img/Villa-3/Villa-3-Cam-3-Final-3K-small.webp' },
			{ normal: 'assets/img/Villa-3/Villa-3-Bedroom-3-Final-4K.webp', small: 'assets/img/Villa-3/Villa-3-Bedroom-3-Final-4K-small.webp' }
		],
		villa4: [
			{ normal: 'assets/img/Villa-4/Villa-4-Living-Cam-1-3K.webp', small: 'assets/img/Villa-4/Villa-4-Living-Cam-1-3K-small.webp' },
			{ normal: 'assets/img/Villa-4/Villa-4-Living-Cam-2-3K.webp', small: 'assets/img/Villa-4/Villa-4-Living-Cam-2-3K-small.webp' },
			{ normal: 'assets/img/Villa-4/Villa-4-Living-Cam-3-3K.webp', small: 'assets/img/Villa-4/Villa-4-Living-Cam-3-3K-small.webp' },
			{ normal: 'assets/img/Villa-4/Villa-4-Bedroom-Final-4K.webp', small: 'assets/img/Villa-4/Villa-4-Bedroom-Final-4K-small.webp' }
		]
	};

	var currentKey;
	function buildModal(key) {
		if (currentKey === key) return; // no-op if already on this villa
		currentKey = key;
		var slides = galleries[key] || galleries.villa1;
		var info = meta[key] || meta.villa1;

		// Update title and body text
		$modal.find('.modal__title h2').text(info.title);
		var $left = $modal.find('.modal-body .float-left');
		$left.find('h4').text(info.subtitle);
		$left.find('p').html(info.descriptionHtml);

		// Update right column with fixed villa list
		var allVillas = [
			{ label: 'Villa Verde Luna', key: 'villa1' },
			{ label: 'Villa Verde Sol', key: 'villa2' },
			{ label: 'Villa Verde Brisa', key: 'villa3' },
			{ label: 'Villa Verde Mar', key: 'villa4' }
		];
		var $right = $modal.find('.modal-body .float-right');
		$right.find('h4').text('');
		$right.children('figure').remove();
		var linksHtml = allVillas.map(function(l){
			var active = l.key === key ? ' is-active' : '';
			var attrs = l.key === key ? ' aria-current="true"' : '';
			return '<figure><a href="#" class="js-switch-villa'+active+'" data-target-villa="'+l.key+'"'+attrs+'><i class="fa fa-home"></i><span>'+l.label+'</span></a></figure>';
		}).join('');
		$right.prepend(linksHtml);

		// Ensure CTA exists
		var $body = $modal.find('.modal-body');
		var $cta = $body.find('.modal-cta');
		if (!$cta.length) {
			$cta = $('<div class="modal-cta"><button class="btn btn-contact js-modal-contact">Contact Us</button></div>');
			$body.append($cta);
		}

		// Rebuild carousel
		var $c = $modal.find('.modal__carousel');
		try {
			// Properly destroy if already initialized
			$c.trigger('destroy.owl.carousel');
		} catch(e) {}
		// Clean up DOM and data
		$c.off('.owl.carousel');
		$c.removeClass('owl-loaded owl-hidden');
		$c.find('.owl-stage-outer').children().unwrap();
		$c.removeData('owl.carousel');
		$c.removeData('owlCarousel');
		$c.removeData('owl-initialized');
		$c.empty();
		slides.forEach(function(it){
			var slide = [
				'<div class="slide">',
				'  <img src="'+it.normal+'"',
				'       srcset="'+it.small+' 600w, '+it.normal+' 1200w"',
				'       sizes="(max-width: 767px) 100vw, 1200px" alt="">',
				'</div>'
			].join('');
			$c.append(slide);
		});
		$c.owlCarousel({ items:1, nav:0, dots:1, loop:1, autoplay:1, autoplaySpeed:2000, autoHeight:true });
		// Ensure height recalculates after images load
		$c.find('img').one('load', function(){
			try { $c.trigger('refresh.owl.carousel'); } catch(e) {}
		}).each(function(){
			if (this.complete) $(this).trigger('load');
		});
	}

	// Bind internal switching and contact button actions (once per modal instance)
	$modal.off('click.modalSwitch', '.js-switch-villa')
		.on('click.modalSwitch', '.js-switch-villa', function(e){
			console.log('Switch villa link clicked');
			e.preventDefault();
			e.stopPropagation();
			var k = $(this).data('target-villa');
			buildModal(k);
		});
	$modal.off('click.modalContact', '.js-modal-contact')
		.on('click.modalContact', '.js-modal-contact', function(e){
			e.preventDefault();
			e.stopPropagation();
			$modal.modal('hide');
			var $target = $('#contact');
			if ($target.length) {
				$('html, body').animate({ scrollTop: $target.offset().top }, 800);
			}
		});

	// initial build
	buildModal(initialKey);
});

// Accordion icon toggle
$('#amenities-accordion').on('show.bs.collapse', function (e) {
    $(e.target).prev('.card-header').find('.fa').removeClass('fa-plus').addClass('fa-minus');
});

$('#amenities-accordion').on('hide.bs.collapse', function (e) {
    $(e.target).prev('.card-header').find('.fa').removeClass('fa-minus').addClass('fa-plus');
});

// Skip background transfer for modal to avoid eager loads
$('.background--image, .img-into-bg').not('#modal-feature .img-into-bg').each(function() {
    $(this).css('background-image', 'url('+ responsiveImgSrc($(this).find('img')[0]) +')' );
});
