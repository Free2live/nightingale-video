var s,
    ytp,
    availableQuality,
    previousQualityState,
    totalDuration,
    updateTimer,

Player = {

  settings:{

    playerWrapper: $('#yt-wrapper'),
    playerElem: 'yt-player',
    playerPoster: '#poster-overlay',
    playerWidth: '100%',
    playerHeight: '100%',
    videoKey: 'Mnf15KwPV-Q',
    autoPlay: 1,
    enableYouTubeApi: 1,
    enableControls: 0,
    showPlayerInfo: 0,
    showRelatedContent: 0,
    enableModestBranding: 1,
    standardPlayerControls: $('.controls__standard'),
    expandingPlayerControls: $('.controls__expanding'),
    expandingPlayerControlIcon: $('.controls__expanding__icon'),
    controlsContainer: $('#controls__expanding_centre'),
    controlsList: $('#controls__expanding_centre ul'),
    playPauseBtn: $('#controls__standard--play-pause'),
    playerSeekSlider: $('#seekslider'),
    colorTheme:{
      primary: '#ffffff',
      secondary: '#f44c02'
    }
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
    s.playerSeekSlider.on('mousedown', this.onSeekMouseDown);
    s.playerSeekSlider.on('mouseup', this.onSeekRelease);
    s.playerSeekSlider.on('change', this.videoSeek);
    s.standardPlayerControls.on('click', this.onStandardPlayerControlsClick);
    s.expandingPlayerControlIcon.on('click', this.onExpandingPlayerControlsClick);
  },

  /*
  ██    ██ ████████     ███████ ██    ██ ███████ ███    ██ ████████ ███████
   ██  ██     ██        ██      ██    ██ ██      ████   ██    ██    ██
    ████      ██        █████   ██    ██ █████   ██ ██  ██    ██    ███████
     ██       ██        ██       ██  ██  ██      ██  ██ ██    ██         ██
     ██       ██        ███████   ████   ███████ ██   ████    ██    ███████
  */

  onPlayerReady: function(event){

    event.target.setPlaybackQuality('default');
    ytp.mute();
    Player.toggleFade();
    console.log('Player event: Ready');
  },

  onPlayerStateChange: function(event){

    // Request available qualities and load into controls display
    // getAvailableQualityLevels is only available on playerStateChange (this function and not onPlayerReady), so it's wrapped in an undefined check to run once only
    if(typeof availableQuality === 'undefined'){
      //Get available qualities
      availableQuality = ytp.getAvailableQualityLevels();
      Player.setAvailablePlaybackQualities(availableQuality);
    }

    if(event.data == YT.PlayerState.BUFFERING){
      Player.onPlayerStateBuffering();
      console.log('Player state: BUFFERING');
    }

    // If video playing...
    if (event.data == YT.PlayerState.PLAYING) {
      Player.onPlayerStatePlaying();
      console.log('Player state: PLAYING');
    // If not playing, kill the interval timer
    } else {
      clearTimeout(updateTimer);
    }

    if(event.data == YT.PlayerState.ENDED){
      Player.onPlayerStateEnded();
      console.log('Player state: ENDED');
    }

    // Store reference to previous quality to update the UI
    previousQualityState = ytp.getPlaybackQuality();

    // Update quality display in UI
    Player.updateQualityDisplay(previousQualityState, ytp.getPlaybackQuality());

    // Toggle play / pause
    s.playPauseBtn.toggleClass('active');
  },

  onPlaybackQualityChange: function(event){
    Player.updateQualityDisplay(previousQualityState, ytp.getPlaybackQuality());
    console.log('Player event: Quality change');
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

    var _activeElems = [s.controlsContainer, s.exapandingPlayerControls];

    if(!s.controlsContainer.hasClass('active')){

      s.controlsContainer.css( "width", s.controlsList.width() + 20).find('ul').delay(500).fadeIn(500);

    }else{

      s.controlsList.fadeOut(100, function(){
        s.controlsContainer.css( "width", '0px');
      });
    }

    $.each(_activeElems, function(index, value){
      $(this).toggleClass('active');
    });

    console.log('Player event: expanding control click');
  },

  onSeekMouseDown: function(){
    clearInterval(updateTimer);
  },

  /*
   ██████ ██    ██ ███████ ████████  ██████  ███    ███
  ██      ██    ██ ██         ██    ██    ██ ████  ████
  ██      ██    ██ ███████    ██    ██    ██ ██ ████ ██
  ██      ██    ██      ██    ██    ██    ██ ██  ██  ██
   ██████  ██████  ███████    ██     ██████  ██      ██
  */

  toggleFade: function(){

    var _o = s.playerWrapper.css('opacity') == 1 ? 0 : 1;

    console.log(_o);

    // if(s.playerWrapper.css(opacity) == 1){
    //   _o = 0;
    // }else{
    //   _o = 1;
    // }
    TweenMax.to(s.playerWrapper, 1, {opacity: _o});
  },

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
        s.controlsList.append('<li id="controls__video_quality__'+ value +'" data-quality="'+ value +'">'+ outputValue +'</li>').find('li:eq('+ index +')').on('click', Player.onQualitySelect);
    });
  },

  onQualitySelect: function(event){
    // Store previous quality state for reference during update of color values onPlaybackQualityChange()
    previousQualityState = ytp.getPlaybackQuality();

    ytp.pauseVideo();
    ytp.playVideo();
  },

  updateQualityDisplay: function(previousQualityState, currentQualityState){
    $('#controls__video_quality__'+previousQualityState).css('color', s.colorTheme.primary);
    $('#controls__video_quality__'+currentQualityState).css('color', s.colorTheme.secondary);
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
  },

  onPlayerStatePlaying: function(){

    // Get current vid duration and set up interval timer to move silder thumb along the track
    totalDuration = ytp.getDuration();
    updateTimer = setInterval(function() {

      var currentTime = ytp.getCurrentTime(),
      thumbValue = currentTime * (100 / totalDuration);

      s.playerSeekSlider.val(thumbValue);

    }, 400);
  },

  onPlayerStateBuffering: function(){

  },

  onPlayerStateEnded: function(){

    var _t = new TimelineLite(),
        _poster = $(s.playerPoster),
        _share = _poster.find('.share');

    _poster.show();

    _t.to(s.playerPoster, 1, {opacity:1})
			.to(_share, 0.75, {top: 500}, '-=1');

    TweenMax.to(s.playerPoster, 0.3, {opacity: 1});
  }
};
