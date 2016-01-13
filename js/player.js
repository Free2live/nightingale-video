var s,
    ytp,
    availableQuality,
    previousQualityState,
    totalDuration,
    updateTimer,

Player = {

  settings:{

    playerWrapper: '#yt-wrapper',
    playerElem: 'yt-player',
    playerWidth: '100%',
    playerHeight: '100%',
    videoKey: 'H6SsB3JYqQg',
    autoPlay: 1,
    enableYouTubeApi: 1,
    enableControls: 0,
    showPlayerInfo: 0,
    showRelatedContent: 0,
    enableModestBranding: 1,
    standardPlayerControls: $('.controls__standard'),
    expandingPlayerControls: $('.controls__expanding'),
    controlsContainer: $('#controls__expanding_centre'),
    controlsList: $('#controls__expanding_centre ul'),
    playPauseBtn: $('#controls__standard--play-pause'),
    playerSeekSlider: $('#seekslider'),
    currentQualityHighlightColor: '#f44c02'
  },

  init: function(){

    s = this.settings;

    ytp = new YT.Player(s.playerElem, {
        width: s.playerWidth,
        height: s.playerHeight,
        videoId: s.videoKey,
        playerVars: {
        autoplay: s.autoPlay,
        enablejsapi: s.enableYouTubeApi,
        controls: s.enableControls,
        rel: s.showRelatedContent,
        showinfo: s.showPlayerInfo,
        modestbranding: s.enableModestBranding
      },
      events: {
        'onReady': this.onPlayerReady,
        'onStateChange': this.onPlayerStateChange,
        'onPlaybackQualityChange': this.onPlaybackQualityChange
      }
    });

    this.bindEvents();
  },

  bindEvents: function(){
    s.playerSeekSlider.on('change', this.videoSeek);
    s.standardPlayerControls.on('click', this.onStandardPlayerControlsClick);
    s.expandingPlayerControls.on('click', this.onExpandingPlayerControlsClick);
  },

  /*
  ██    ██ ████████     ███████ ██    ██ ███████ ███    ██ ████████ ███████
   ██  ██     ██        ██      ██    ██ ██      ████   ██    ██    ██
    ████      ██        █████   ██    ██ █████   ██ ██  ██    ██    ███████
     ██       ██        ██       ██  ██  ██      ██  ██ ██    ██         ██
     ██       ██        ███████   ████   ███████ ██   ████    ██    ███████
  */

  onPlayerReady: function(event){

    console.log('Player event: Ready');

    event.target.setPlaybackQuality('default');
    TweenMax.to(s.playerWrapper, 1, {opacity: 1});
  },

  onPlayerStateChange: function(event){

    console.log('Player event: State change');

    // Request available qualities and load into controls display
    // getAvailableQualityLevels is only available on playerStateChange (this function and not onPlayerReady), so it's wrapped in an undefined check to run once only
    if(typeof availableQuality === 'undefined'){
      //Get available qualities
      availableQuality = ytp.getAvailableQualityLevels();
      Player.setAvailablePlaybackQualities(availableQuality);
    }

    // If video playing...
    if (event.data == YT.PlayerState.PLAYING) {

      // Get current vid duration and set up interval timer to move silder thumb along the track
      totalDuration = ytp.getDuration();
      updateTimer = setInterval(function() {

        var currentTime = ytp.getCurrentTime(),
        thumbValue = currentTime * (100 / totalDuration);

        s.playerSeekSlider.val(thumbValue);

      }, 800);

    // If not playing, kill the interval timer
    } else {

      clearTimeout(updateTimer);
    }

    // Store reference to previous quality to update the UI
    previousQualityState = ytp.getPlaybackQuality();

    // Update quality display in UI
    Player.updateQualityDisplay(previousQualityState, ytp.getPlaybackQuality(), s.currentQualityHighlightColor);

    // Toggle play / pause
    s.playPauseBtn.toggleClass('active');//.ripple();
  },

  onPlaybackQualityChange: function(event){
    console.log('Player event: Quality change');

    Player.updateQualityDisplay(previousQualityState, ytp.getPlaybackQuality(), s.currentQualityHighlightColor);
  },

  /*
  ██████  ██       █████  ██    ██ ███████ ██████      ███████ ██    ██ ███████ ███    ██ ████████ ███████
  ██   ██ ██      ██   ██  ██  ██  ██      ██   ██     ██      ██    ██ ██      ████   ██    ██    ██
  ██████  ██      ███████   ████   █████   ██████      █████   ██    ██ █████   ██ ██  ██    ██    ███████
  ██      ██      ██   ██    ██    ██      ██   ██     ██       ██  ██  ██      ██  ██ ██    ██         ██
  ██      ███████ ██   ██    ██    ███████ ██   ██     ███████   ████   ███████ ██   ████    ██    ███████
  */

  onStandardPlayerControlsClick: function(){

    console.log('Player: Standard control click (' + $(this).attr('id') + ')');

    var _id = $(this).attr('id');

    switch(_id){

      case 'controls__standard--play-pause':

        if (ytp.getPlayerState() == YT.PlayerState.PLAYING) {
            ytp.pauseVideo();
        } else {
            ytp.playVideo();
        }

      break;

      case 'controls__standard--toggle-mute':

        if (ytp.isMuted()) {
            ytp.unMute();
        } else {
            ytp.mute();
        }

      break;

      case 'controls__standard--fs':

        Player.requestFullScreen($(this).hasClass('active'));

      break;
    }

    if(_id != 'controls__standard--play-pause'){

      $(this).toggleClass('active');
    }
  },

  onExpandingPlayerControlsClick: function(){

    console.log('Player event: expanding control click');

    var _activeElems = [s.controlsContainer, s.exapandingPlayerControls];

    if(!s.controlsContainer.hasClass('active')){

      s.controlsContainer.css( "width", s.controlsList.width() + 10).find('ul').delay(500).fadeIn(500);

    }else{

      s.controlsList.fadeOut(100, function(){
        s.controlsContainer.css( "width", '0px');
      });
    }

    $.each(_activeElems, function(index, value){
      $(this).toggleClass('active');
    });
  },

  /*
   ██████ ██    ██ ███████ ████████  ██████  ███    ███
  ██      ██    ██ ██         ██    ██    ██ ████  ████
  ██      ██    ██ ███████    ██    ██    ██ ██ ████ ██
  ██      ██    ██      ██    ██    ██    ██ ██  ██  ██
   ██████  ██████  ███████    ██     ██████  ██      ██
  */

  setAvailablePlaybackQualities: function(qualityLevel){

    // Loop through available qualities
    $.each(qualityLevel, function(index, value){

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
        s.controlsList.append('<li id="controls__video_quality__'+ value +'" data-quality="'+ value +'">'+ outputValue +'</li>').find('li:eq('+ index +')').bind('click', function(event){

          // Store previous quality state for reference during update of color values onPlaybackQualityChange()
          previousQualityState = ytp.getPlaybackQuality();

       });
    });
  },

  updateQualityDisplay: function(previousQualityState, currentQualityState, color){

    $('#controls__video_quality__'+previousQualityState).css('color', '#ffffff');
    $('#controls__video_quality__'+currentQualityState).css('color', s.currentQualityHighlightColor);
  },

  requestFullScreen: function(isFullscreen){

    var _requestMethod,
        _element;

    if(!isFullscreen){
      _element = document.body;
      _requestMethod = _element.requestFullScreen || _element.webkitRequestFullScreen || _element.mozRequestFullScreen || _element.msRequestFullscreen;
    } else {

      _element = document;
      _requestMethod = _element.cancelFullScreen || _element.webkitCancelFullScreen || _element.mozCancelFullScreen || _element.msExitFullscreen;
    }

    if (_requestMethod) {
        _requestMethod.call(_element);
    } else if (typeof window.ActiveXObject !== "undefined") {
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
  },

  videoSeek: function(){

    clearTimeout(updateTimer);

    var seekValue = ytp.getDuration() * (s.playerSeekSlider.val() / 100);
    ytp.seekTo(seekValue);
  }

};
