(function($) {

  PointerEventsPolyfill.initialize({});

  // Player deferred callback on API Ready
  nightingaleYTDeferred.done(function(YT) {

      nightingalePlayer.init({
        videoKey: 'aQd41nbQM-U'
      });

  });

})(jQuery);
