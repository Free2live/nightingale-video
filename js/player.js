var player
,   elem = document.body
,   playPause = $('#controls__play_pause')
,   seekSlider = $('#seekslider')
,   totalDuration
,   updateTimer;

function onYouTubePlayerAPIReady() {
  
  player = new YT.Player('ytplayer', {
  	width: '100%',
  	height: '100%',
    videoId: 'H6SsB3JYqQg',
    playerVars: {
    	autoplay: 1,
    	enablejsapi: 1,
    	controls: 0,
    	rel: 0,
    	showinfo: 0,
    	modestbranding: 1
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });

  $('.controls__control').bind('click', function(){

    var _id = $(this).attr('id');

    switch(_id){

      case 'controls__play_pause':

        if (player.getPlayerState() == YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }

      break;

      case 'controls__toggle_mute':

        if (player.isMuted()) {
            player.unMute();
        } else {
            player.mute();
        }

      break;

      case 'controls__toggle_fs':

        requestFullScreen(elem);

      break;
    }

    if(_id == "controls__toggle_mute"){

      $(this).toggleClass('active');
    }

  });

  seekSlider.on('change', videoSeek);

}

function requestFullScreen(element) {

    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullscreen;

    if (requestMethod) {
        requestMethod.call(element);
    } else if (typeof window.ActiveXObject !== "undefined") {
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
}

function onPlayerReady(event){}

function onPlayerStateChange(event){

  if (event.data == YT.PlayerState.PLAYING) {

    totalDuration = player.getDuration()
    updateTimer = setInterval(function() {

      var currentTime = player.getCurrentTime()
      ,   thumbValue = currentTime * (100 / totalDuration);

      seekSlider.val(thumbValue);

    }, 1000);

  } else {
    
    clearTimeout(updateTimer);
  }

  playPause.toggleClass('active');
}

function videoSeek(){

  clearTimeout(updateTimer);
  var seekValue = player.getDuration() * (seekSlider.val() / 100);
  player.seekTo(seekValue);
  
}