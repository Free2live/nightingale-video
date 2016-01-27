
// Set player YT Deferred
var nightingaleYTDeferred = $.Deferred();
window.onYouTubeIframeAPIReady = function() {
  nightingaleYTDeferred.resolve(window.YT);
};

// YouTube API ajax call
$.getScript( "https://www.youtube.com/player_api")
  .done(function(script, textStatus) {
});

// nightingalePlayer constructor
var nightingalePlayer = (function() {
  // Player vars
  var $d = $(document),
      isWebKit = 'WebkitAppearance' in document.documentElement.style,
      updateTimer,
      totalDuration,
      ytp,
      s,
      // Player settings
      settings = {
        // Define player elements
        $playerWrapper: $('#nightingalePlayer'),
        $playerElem: $('#nightingalePlayer__player'),
        $playerEndframe: $('#endframe-overlay'),
        $allControlsWrapper: $('.controls'),
        $standardPlayerControls: $('.controls__standard'),
        $controlsContainer: $('#controls__expanding_centre'),
        $playPauseBtn: $('#controls__standard--play-pause'),
        $muteToggleBtn: $('#controls__standard--toggle-mute'),
        $fsToggleBtn: $('#controls__standard--fs'),
        $facebookShareBtn: $('.facebook-share'),
        $twitterShareBtn: $('.twitter-share'),
        $playerSeekSlider: $('.seekslider'),
        $playedBar: $('.seekslider__played'),
        thumbDragging: false,
        $volContainer: $('.volume'),
        colorTheme:{
          primary: '#ffffff',
          secondary: '#f44c02'
        },
        // Overridable default settings
        defaults: {
          videoKey: 'Mnf15KwPV-Q'
        },
        // YouTube Api params
        playerWidth: '100%',
        playerHeight: '100%',
        autoPlay: 1,
        enableYouTubeApi: 1,
        enableControls: 0,
        showPlayerInfo: 0,
        showRelatedContent: 0,
        enableModestBranding: 1,

        initSettingsChildren: function() {
          // Settings that need sibling reference
          this.$replayVideoBtn = this.$playerEndframe.find('button');
          this.$controlsList = this.$controlsContainer.find('ul');
          this.$volTrack = this.$volContainer.find('.volume__track');
          this.$volSlider = this.$volContainer.find('.volume__track__slider');

          delete this.initSettingsChildren;
          return this;
        }
    };

    function init(options){

      if(window.innerWidth > 760){

      }

      s = settings;
      s.initSettingsChildren();

      // If set, apply override options to settings
      if(options){
        for(var prop in options){
          if(options.hasOwnProperty(prop)){
              s.defaults[prop] = options[prop];
          }
        }
      }

      // Check for target div
      if(s.$playerElem.length){

        // New up YouTube player with player settings
        ytp = new YT.Player(s.$playerElem.attr('id'), {
            width: s.playerWidth,
            height: s.playerHeight,
            videoId: s.defaults.videoKey,
            playerVars: {
            autoplay: s.autoPlay,
            enablejsapi: s.enableYouTubeApi,
            controls: s.enableControls,
            rel: s.showRelatedContent,
            showinfo: s.showPlayerInfo,
            modestbranding: s.enableModestBranding
          },
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });

      }else{
        // Throw an error if no target div found.
        console.error('nightingalePlayer Error: Cannot initialise, no target div found. Please add a div with id "nightingalePlayer__player" to the page.');
      }

    }

    // Bind custom player events
    function bindCustomEvents(){
      // DOCUMENT on FULLSCREEN
      $d.on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', onFullscreenChange);
      // SEEK slider on MOUSE DOWN / UP / CHANGE
      s.$playerSeekSlider.on('mousedown', onSeekMouseDown)
      .on('mouseup', onSeekMouseUp)
      .on('mousemove', onSeekMouseMove);
      // STANDARD player control on CLICK
      s.$standardPlayerControls.on('click', onStandardPlayerControlsClick);
      // REPLAY video button on CLICK
      s.$replayVideoBtn.on('click', onReplayBtnClick);
      // VOLUME container on CLICK
      s.$volContainer.on('click', onVolumeContainerInteract);
      // VOLUME slider on INPUT CHANGE
      s.$volTrack.on('mousedown', onVolumeSliderMouseDown)
      .on('mousemove', onVolumeSliderMouseMove)
      .on('mouseup', onVolumeSliderMouseUp);
      // MUTE button on MOUSEOVER
      s.$muteToggleBtn.on('mouseover', onMuteToggleHover);
      // MUTE button on MOUSELEAVE
      s.$allControlsWrapper.on('mouseleave', onControlsBlur);
      // FACEBOOK share button on CLICK
      s.$facebookShareBtn.on('click', onFacebookShareClick);
      // TWITTER share button on CLICK
      s.$twitterShareBtn.on('click', onTwitterShareClick);
    }

    /*******************************************************************************
    * Youtube Event Handlers
    ******************************************************************************/

    // YouTube player ready
    function onPlayerReady(event){

      // Get player volume
      var _volume = ytp.getVolume();

      // Bind custom events
      bindCustomEvents();

      // Get current video duration
      totalDuration = ytp.getDuration();

      // Set up volume slider
      s.$volSlider.css('width', _volume+'%');

      // Set YouTube player to default quality state for appropriate playback quality
      event.target.setPlaybackQuality('default');

      // Fade the player up
      s.$playerWrapper.fadeIn(3000);

      console.log('nightingalePlayer event: Ready');
    }

    function onPlayerStateChange (event){

      var _activeClass = 'active';

      console.log('nightingalePlayer state: CHANGED');

      // YouTube Player States
      if(event.data == YT.PlayerState.BUFFERING){
        console.log('nightingalePlayer state: BUFFERING');
      }

      if (event.data == YT.PlayerState.PLAYING) {
        onPlayerStatePlaying();
        console.log('nightingalePlayer state: PLAYING');
        // Toggle play / pause
        s.$playPauseBtn.addClass(_activeClass);
      } else {
        // Stops the seek bar if not playing
        clearTimeout(updateTimer);
      }

      if(event.data == YT.PlayerState.PAUSED){
        // Toggle play / pause
        s.$playPauseBtn.removeClass(_activeClass);
        console.log('nightingalePlayer state: PAUSED');
      }

      if(event.data == YT.PlayerState.ENDED){
        onPlayerStateEnded();
        console.log('nightingalePlayer state: ENDED');
        // Toggle play / pause
        s.$playPauseBtn.removeClass(_activeClass);
      }

    }

    /*******************************************************************************
    * nightingalePlayer Event Handlers
    ******************************************************************************/

    // On FULLSCREEN change
    function onFullscreenChange(){
      s.$fsToggleBtn.toggleClass('active');
    }

    // On STANDARD player control CLICK
    function onStandardPlayerControlsClick(){

      var _id = $(this).attr('id');

      console.log('nightingalePlayer event: Standard control click (' + _id + ')');

      switch(_id){

        case 'controls__standard--play-pause':
          if (ytp.getPlayerState() == YT.PlayerState.PLAYING) {
              ytp.pauseVideo();
          } else {
              ytp.playVideo();
          }
        break;

        case 'controls__standard--toggle-mute':
          if (!ytp.isMuted()) {
              ytp.mute();
              s.$volSlider.val(0);
          } else {
              ytp.unMute();
              s.$volSlider.val(50);
              ytp.setVolume(50);
          }
          $(this).toggleClass('active');
        break;

        case 'controls__standard--fs':
          requestFullScreen($(this).hasClass('active'));
        break;
      }
    }

    // On FACEBOOK button CLICK
    function onFacebookShareClick(){
      // Facebook sharing functionality
    }

    function onTwitterShareClick(){
      // Twitter sharing functionality
    }

    // On SEEK slider MOUSE DOWN
    function onSeekMouseDown(e) {
      // pause video and listen for input events (value changes) from dragging
      ytp.pauseVideo();
      s.thumbDragging = true;
      updatePlayedBar(e.pageX);
    }

    // On SEEK slider MOUSE UP
    function onSeekMouseUp(e) {
      if(s.thumbDragging){

        s.thumbDragging = false;
        updatePlayedBar(e.pageX);
        ytp.playVideo();
      }
    }

    // On SEEK mouse MOVE
    function onSeekMouseMove(e){
      if(s.thumbDragging) {
        clearTimeout(updateTimer);
        updatePlayedBar(e.pageX);
      }
    }

    // On REPLAY button mouse CLICK
    function onReplayBtnClick(){
      s.$playerEndframe.fadeOut({duration : 800, complete: onEndframeFadeOutComplete});
    }

    // On POSTER fade out COMPLETE
    function onEndframeFadeOutComplete(){
      s.$playerWrapper.fadeIn(3000);
      ytp.playVideo();
    }

    // On VOLUME container CLICK
    function onVolumeContainerInteract(e) {
      // Prevent accidental closes while dragging volume slider
      e.stopPropagation();
    }
    // get value of volume slider and translate into ytp volume
    function onVolumeSliderMouseDown(e) {

      s.thumbDragging = true;
      updateVolumeBar(e.pageX);

    }

    function onVolumeSliderMouseMove(e){
      if(s.thumbDragging) {
        updateVolumeBar(e.pageX);
      }
    }

    function onVolumeSliderMouseUp(e){
      if(s.thumbDragging){
        s.thumbDragging = false;
        updateVolumeBar(e.pageX);
      }
    }

    function onMuteToggleHover() {
      s.$volContainer.addClass('active');
      s.$volContainer.animate({
        width: '120px'
      }, 150, 'easeInOutQuad');
    }

    function onControlsBlur() {
      s.$volContainer.animate({
        width: '0'
      }, 200, 'easeInOutQuad', function() {
        s.$volContainer.removeClass('active');
      });

      if(s.thumbDragging){
        s.thumbDragging = false;
      }
    }

    /*******************************************************************************
    * player STATES
    ******************************************************************************/

    function onPlayerStatePlaying(){

      // Set up interval timer to move silder thumb along the track
      updateTimer = setInterval(function() {

        var currentTime = ytp.getCurrentTime();

        var percentage = 100 * currentTime / totalDuration;
        s.$playedBar.css('width', percentage+'%');

      }, 400);

      // Hide the endframe if it is visible and the video starts playing
      if (s.$playerEndframe.is(':visible')) {
        s.$playerEndframe.hide();
        s.$playerWrapper.show();
      }
    }

    function onPlayerStateEnded(){
      // show the end frame, hide player behind it.
      s.$playerEndframe.show();
      s.$playerWrapper.hide();
    }

    /*******************************************************************************
    * nightingalePlayer Functions
    ******************************************************************************/

    // Update played bar (coloured bar behind the thumb slider) on updateTimer tick & seek bar change event
    function updatePlayedBar(x) {

      var _position = x - s.$playerSeekSlider.offset().left, // Click position
          _percentage = 100 * _position / s.$playerSeekSlider.width(),
          _seekValue = totalDuration * _percentage / 100;

      // Check within range
      if(_percentage > 100) {
          _percentage = 100;
      }
      if(_percentage < 0) {
          _percentage = 0;
      }

      // Update played bar
      s.$playedBar.css('width', _percentage+'%');

      // Seek to new current position
      ytp.seekTo(_seekValue);
    }

    function updateVolumeBar(x){

      var _position = x - s.$volTrack.offset().left,
          _percentage = 100 * _position / s.$volTrack.width(),
          _volume = Math.round(_percentage);

      // Check within range
      if(_percentage > 100) {
          _percentage = 100;
      }
      if(_percentage < 0) {
          _percentage = 0;
      }

      if (_volume !== 0) {
        ytp.unMute();
        ytp.setVolume(_volume);
        s.$muteToggleBtn.addClass('active');
      } else if (_volume === 0) {
        ytp.mute();
        s.$muteToggleBtn.removeClass('active');
      }

      s.$volSlider.css('width', _percentage+'%');
    }

    // Fullscreen handler
    function requestFullScreen(isFullscreen){

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
    }

    return {
      init: init
    };

})($);
