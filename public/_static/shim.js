/* Static-hosting shim: serve Slider Revolution's REST calls from pre-exported JSON files. */
(function () {
  var open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    var m = typeof url === "string" && url.match(/\/wp-json\/sliderrevolution\/sliders\/(\d+)\?([^#]*)/);
    if (m) {
      var slide = (m[2].match(/(?:^|&)slideid=(\d+)/) || [])[1];
      arguments[0] = "GET";
      arguments[1] = "/wp-json/sliderrevolution/sliders/" + m[1] + (slide ? "-" + slide : "") + ".json";
    }
    return open.apply(this, arguments);
  };
})();
