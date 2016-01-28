(function($) {
  PointerEventsPolyfill.initialize({});
  // Player deferred callback on API Ready
  if(nightingaleYTDeferred){
    nightingaleYTDeferred.done(function(YT) {
      nightingalePlayer.init();
    });
  }
})(jQuery);
