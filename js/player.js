var player
,   _videoId = 'H6SsB3JYqQg'
,   elem = document.body
,   playPause = $('#controls__play_pause')
,   seekSlider = $('#seekslider')
,   totalDuration
,   updateTimer
,   availableQuality
,   controlsWrapper = $('#controls__video_quality--centre')
,   controlsList = controlsWrapper.find('ul');

function onYouTubePlayerAPIReady() {
  
  // Initialise YTPlayer
  player = new YT.Player('ytplayer', {
  	width: '100%',
  	height: '100%',
    videoId: _videoId,
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

  // Add event listener to the video seek slider
  seekSlider.on('change', videoSeek);

  // Set up custom player controls
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

  $('#controls__quality-container > img').bind('click', function(){

      controlsWrapper.toggleClass('active').find('ul').delay(500).fadeIn(500);
  });

}

// Fullscreen functionality
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

// Video seek functionality
function videoSeek(){

  clearTimeout(updateTimer);
  var seekValue = player.getDuration() * (seekSlider.val() / 100);
  player.seekTo(seekValue);

}

// YT events
function onPlayerReady(event){}

function onPlayerStateChange(event){

  // Request available qualities and load into controls display
  // getAvailableQualityLevels is only available on playerStateChange so it's wrapped in an undefined check to run once only
  if(typeof availableQuality === 'undefined'){

    availableQuality = player.getAvailableQualityLevels();

    $.each(availableQuality, function(index, value){

       controlsList.append('<li data-quality="'+ value +'">'+ value +'</li>');

       // $(this).bind('click', function(event){

       //  player.setPlaybackQuality(this.data('quality'));

       // });

    });
  }

  // If video playing...
  if (event.data == YT.PlayerState.PLAYING) {

    // Get current vid duration and set up interval timer to move silder thumb along the track
    totalDuration = player.getDuration()
    updateTimer = setInterval(function() {

      var currentTime = player.getCurrentTime()
      ,   thumbValue = currentTime * (100 / totalDuration);

      seekSlider.val(thumbValue);

    }, 800);

    // If not playing, kill the interval timer
  } else {
    
    clearTimeout(updateTimer);
  }

  playPause.toggleClass('active');
}