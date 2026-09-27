(function () {
    var data = window.CocoVerdeGalleryData || { actuals: [], renders: [] };
    var tabs = document.querySelectorAll('.media-tabs__button');
    var panels = {
        actuals: document.getElementById('actuals-panel'),
        renders: document.getElementById('renders-panel')
    };
    var lightboxCollections = {
        actuals: [],
        renders: []
    };
    var lightboxItems = [];
    var lightboxIndex = 0;

    function formatMonth(value) {
        var parts = value.split('-');
        var date = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
        return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    }

    function formatDate(value) {
        var parts = value.split('-');
        var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).replace(' ', '-');
    }

    function groupBy(items, keyFn) {
        return items.reduce(function (groups, item) {
            var key = keyFn(item);
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
            return groups;
        }, {});
    }

    function imageCard(item, showDate, collection, index) {
        var date = showDate ? '<time datetime="' + item.dateTaken + '">' + formatDate(item.dateTaken) + '</time>' : '';
        return [
            '<a class="media-card" href="' + item.src + '" data-lightbox-collection="' + collection + '" data-lightbox-index="' + index + '">',
            '  <span class="media-card__image"><img src="' + item.src + '" alt="' + item.title + '" loading="lazy"></span>',
            '  <span class="media-card__caption">',
            '    <strong>' + item.title + '</strong>',
            date,
            '  </span>',
            '</a>'
        ].join('');
    }

    function renderActuals() {
        if (!panels.actuals) return;
        if (!data.actuals.length) {
            panels.actuals.innerHTML = '<div class="media-empty">No actual images have been processed yet.</div>';
            return;
        }

        var actualIndex = 0;
        lightboxCollections.actuals = [];
        var villaGroups = groupBy(data.actuals, function (item) { return item.villa; });
        panels.actuals.innerHTML = Object.keys(villaGroups).sort().map(function (villaKey) {
            var villaItems = villaGroups[villaKey];
            var monthGroups = groupBy(villaItems, function (item) { return item.month; });
            var monthKeys = Object.keys(monthGroups).sort().reverse();
            var months = monthKeys.map(function (month, monthIndex) {
                var isOpen = monthIndex === 0;
                var gridId = 'actuals-villa-' + villaKey + '-month-' + month;
                return [
                    '<section class="media-month' + (isOpen ? ' is-open' : '') + '">',
                    '  <button class="media-month__toggle" type="button" aria-expanded="' + (isOpen ? 'true' : 'false') + '" aria-controls="' + gridId + '">',
                    '    <span>' + formatMonth(month) + '</span>',
                    '    <span class="media-month__count">' + monthGroups[month].length + ' images</span>',
                    '  </button>',
                    '  <div class="media-grid media-month__grid" id="' + gridId + '"' + (isOpen ? '' : ' hidden') + '>',
                    monthGroups[month].map(function (item) {
                        lightboxCollections.actuals.push(item);
                        return imageCard(item, true, 'actuals', actualIndex++);
                    }).join(''),
                    '  </div>',
                    '</section>'
                ].join('');
            }).join('');

            return [
                '<section class="media-villa">',
                '  <div class="media-villa__heading">',
                '    <p>Villa ' + villaKey + '</p>',
                '    <h2>' + villaItems[0].villaName + '</h2>',
                '  </div>',
                months,
                '</section>'
            ].join('');
        }).join('');
    }

    function renderRenders() {
        if (!panels.renders) return;
        var renderIndex = 0;
        lightboxCollections.renders = [];
        var villaGroups = groupBy(data.renders, function (item) { return item.villa; });
        panels.renders.innerHTML = Object.keys(villaGroups).sort().map(function (villaKey) {
            var villaItems = villaGroups[villaKey];
            return [
                '<section class="media-villa">',
                '  <div class="media-villa__heading">',
                '    <p>Villa ' + villaKey + '</p>',
                '    <h2>' + villaItems[0].villaName + '</h2>',
                '  </div>',
                '  <div class="media-grid">',
                villaItems.map(function (item) {
                    lightboxCollections.renders.push(item);
                    return imageCard(item, false, 'renders', renderIndex++);
                }).join(''),
                '  </div>',
                '</section>'
            ].join('');
        }).join('');
    }

    function buildLightbox() {
        var markup = [
            '<div class="media-lightbox" aria-hidden="true">',
            '  <button class="media-lightbox__close" type="button" aria-label="Close image">&times;</button>',
            '  <button class="media-lightbox__nav media-lightbox__nav--prev" type="button" aria-label="Previous image">&#8249;</button>',
            '  <figure class="media-lightbox__figure">',
            '    <img class="media-lightbox__image" src="" alt="">',
            '    <figcaption class="media-lightbox__caption"></figcaption>',
            '  </figure>',
            '  <button class="media-lightbox__nav media-lightbox__nav--next" type="button" aria-label="Next image">&#8250;</button>',
            '</div>'
        ].join('');
        document.body.insertAdjacentHTML('beforeend', markup);
    }

    function setLightboxItem(index) {
        if (!lightboxItems.length) return;
        lightboxIndex = (index + lightboxItems.length) % lightboxItems.length;
        var item = lightboxItems[lightboxIndex];
        var lightbox = document.querySelector('.media-lightbox');
        var caption = 'Villa ' + item.villa + ' - ' + item.title;
        lightbox.querySelector('.media-lightbox__image').src = item.src;
        lightbox.querySelector('.media-lightbox__image').alt = item.title;
        lightbox.querySelector('.media-lightbox__caption').textContent = item.dateTaken ? caption + ' | ' + formatDate(item.dateTaken) : caption;
    }

    function openLightbox(collection, index) {
        lightboxItems = lightboxCollections[collection] || [];
        setLightboxItem(index);
        document.body.classList.add('media-lightbox-open');
        document.querySelector('.media-lightbox').setAttribute('aria-hidden', 'false');
    }

    function closeLightbox() {
        document.body.classList.remove('media-lightbox-open');
        document.querySelector('.media-lightbox').setAttribute('aria-hidden', 'true');
    }

    function bindLightbox() {
        buildLightbox();
        document.addEventListener('click', function (event) {
            var monthToggle = event.target.closest('.media-month__toggle');
            var card = event.target.closest('.media-card[data-lightbox-collection]');
            var lightbox = event.target.closest('.media-lightbox');
            if (monthToggle) {
                var month = monthToggle.closest('.media-month');
                var grid = document.getElementById(monthToggle.getAttribute('aria-controls'));
                var nextOpen = monthToggle.getAttribute('aria-expanded') !== 'true';
                monthToggle.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
                month.classList.toggle('is-open', nextOpen);
                if (grid) grid.hidden = !nextOpen;
                return;
            }
            if (card) {
                event.preventDefault();
                openLightbox(card.getAttribute('data-lightbox-collection'), Number(card.getAttribute('data-lightbox-index')));
                return;
            }
            if (event.target.closest('.media-lightbox__close') || (lightbox && event.target.classList.contains('media-lightbox'))) {
                closeLightbox();
                return;
            }
            if (event.target.closest('.media-lightbox__nav--prev')) {
                setLightboxItem(lightboxIndex - 1);
                return;
            }
            if (event.target.closest('.media-lightbox__nav--next')) {
                setLightboxItem(lightboxIndex + 1);
            }
        });
        document.addEventListener('keydown', function (event) {
            if (!document.body.classList.contains('media-lightbox-open')) return;
            if (event.key === 'Escape') closeLightbox();
            if (event.key === 'ArrowLeft') setLightboxItem(lightboxIndex - 1);
            if (event.key === 'ArrowRight') setLightboxItem(lightboxIndex + 1);
        });
    }

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            var target = tab.getAttribute('data-tab');
            tabs.forEach(function (button) {
                button.classList.toggle('is-active', button === tab);
                button.setAttribute('aria-selected', button === tab ? 'true' : 'false');
            });
            Object.keys(panels).forEach(function (key) {
                panels[key].classList.toggle('is-active', key === target);
            });
        });
    });

    renderActuals();
    renderRenders();
    bindLightbox();
})();
