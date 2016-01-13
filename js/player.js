var player,
playerContainer = $('#ytwrapper'),
videoKey = 'H6SsB3JYqQg',
elem = document.body,
playPause = $('#controls__play_pause'),
seekSlider = $('#seekslider'),
totalDuration,
updateTimer,
availableQuality,
previousQualityState,
controlsContainer = $('#controls__video_quality--centre'),
controlsList = controlsContainer.find('ul'),
controlsDisplay = $('#controls__quality-container__display'),
currentQualityHighlightColor = '#f44c02';

function onYouTubePlayerAPIReady() {

  // Initialise YTPlayer
  player = new YT.Player('ytplayer', {
  	width: '100%',
  	height: '100%',
    videoId: videoKey,
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
      'onStateChange': onPlayerStateChange,
      'onPlaybackQualityChange': onPlaybackQualityChange
    }
  });

  // Add event listener to the video seek slider
  seekSlider.on('change', videoSeek);

  // Set up custom player controls
  $('.controls__control').bind('click', function(){

    $(this).ripple();

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

        $(this).toggleClass('active');

      break;

      case 'controls__toggle_fs':

        requestFullScreen(elem, $(this).hasClass('active'));
        $(this).toggleClass('active');

      break;
    }

  });

  // Controls open / close button functionality
  $('.controls__quality-container__display').bind('click', function(){

      var activeElems = [controlsContainer, controlsDisplay];

      if(!controlsContainer.hasClass('active')){

        controlsContainer.css( "width", controlsList.width() + 10).find('ul').delay(500).fadeIn(500);

      }else{

        controlsList.fadeOut(100, function(){
          controlsContainer.css( "width", '0px');
        });
      }

      $.each(activeElems, function(index, value){
        $(this).toggleClass('active');
      });
  });

}

// Fullscreen functionality
function requestFullScreen(element, active) {

    var requestMethod;

    if(!active){

      requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullscreen;
    } else {

      element = document;
      requestMethod = element.cancelFullScreen || element.webkitCancelFullScreen || element.mozCancelFullScreen || element.msExitFullscreen;
    }

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
function onPlayerReady(event){

  console.log('Player ready');
  event.target.setPlaybackQuality('default');

  TweenMax.to(playerContainer, 1, {opacity: 1});
}

function onPlayerStateChange(event){

  // Request available qualities and load into controls display
  // getAvailableQualityLevels is only available on playerStateChange (this function and not onPlayerReady), so it's wrapped in an undefined check to run once only
  if(typeof availableQuality === 'undefined'){

    //Get available qualities
    availableQuality = player.getAvailableQualityLevels();

    // Loop through available qualities
    $.each(availableQuality, function(index, value){

        var subStr = "hd",
            caseMatches = ['large', 'medium', 'small', 'tiny', 'auto'],
            outputValue;

        // On looping through each available quality, if value begins with hd...
        if (value.substring(0, subStr.length) === subStr) {

          // Remove it from the string and store in outputValue
          outputValue = (value.replace(subStr, "")) + 'HD';

        // Else if value matches any of the caseMatches ('large', 'medium', 'small' etc)
        }else if(caseMatches.indexOf(value) > -1){

          // Then set outputValue to new appropiate string value.
          switch (value) {
            case 'large':
              outputValue = '480p';
              break;
            case 'medium':
              outputValue = '360p';
              break;
            case 'small':
              outputValue = '240p';
              break;
            case 'tiny':
              outputValue = '144p';
              break;
            case 'auto':
              outputValue = 'Auto';
              break;
            default:
              outputValue = value;
              break;
          }

        }else{

            // Else it is what it is..
            outputValue = value;
        }

        // Insert li element into display list. Add the display values to the elem id and data attr. outputValue is displayed to user.
        controlsList.append('<li id="controls__video_quality__'+ value +'" data-quality="'+ value +'">'+ outputValue +'</li>').find('li:eq('+ index +')').bind('click', function(event){

        // Store previous quality state for reference during update of color values onPlaybackQualityChange()
        previousQualityState = player.getPlaybackQuality();

       });

    });
  }

  // If video playing...
  if (event.data == YT.PlayerState.PLAYING) {

    // Get current vid duration and set up interval timer to move silder thumb along the track
    totalDuration = player.getDuration();
    updateTimer = setInterval(function() {

      var currentTime = player.getCurrentTime(),
      thumbValue = currentTime * (100 / totalDuration);

      seekSlider.val(thumbValue);

    }, 800);

  // If not playing, kill the interval timer
  } else {

    clearTimeout(updateTimer);
  }

  // Store reference to previous quality to update the UI
  previousQualityState = player.getPlaybackQuality();

  // Update quality display in UI
  updateQualityDisplay(previousQualityState, player.getPlaybackQuality(), currentQualityHighlightColor);

  // Toggle play / pause
  playPause.toggleClass('active').ripple();
}

function onPlaybackQualityChange(event){

  updateQualityDisplay(previousQualityState, player.getPlaybackQuality(), currentQualityHighlightColor);
}

function updateQualityDisplay(previousQualityState, currentQuality, color){

  $('#controls__video_quality__'+previousQualityState).css('color', '#ffffff');
  $('#controls__video_quality__'+currentQuality).css('color', currentQualityHighlightColor);
}

// Ripple function
$.fn.ripple = function() {

  var $rip = $(this).find('.ripple');
  var $cont = $rip.parent();

  // get size of parent element
  var $sz = (Math.max($cont.outerWidth(), $cont.outerHeight()));

  // prep to animate da ting
  $rip.addClass('animate');
  $rip.stop().animate({
    // animation starts
    opacity: 1,
    width: $sz,
    height: $sz
  }, 150, 'easeOutQuad', function() {

    // animation ends
    $rip.stop().animate({
      opacity: 0,
    });

    $rip.removeClass('animate');
  });
};
