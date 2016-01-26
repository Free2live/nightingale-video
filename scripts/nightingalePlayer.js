
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
      previousQualityState,
      availableQuality,
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
        $expandingPlayerControls: $('.controls__expanding'),
        $expandingPlayerControlIcon: $('.controls__expanding__icon'),
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
          this.$volSlider = this.$volContainer.find('input');

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
            'onStateChange': onPlayerStateChange,
            'onPlaybackQualityChange': onPlaybackQualityChange
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
      // EXPANDING player control on CLICK
      s.$expandingPlayerControlIcon.on('click', onExpandingPlayerControlsClick);
      // REPLAY video button on CLICK
      s.$replayVideoBtn.on('click', onReplayBtnClick);
      // VOLUME container on CLICK
      s.$volContainer.on('click', onVolumeContainerInteract);
      // VOLUME slider on INPUT CHANGE
      s.$volSlider.on('input change', onVolumeSliderInteract);
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

      // Bind custom events
      bindCustomEvents();

      // Get current video duration
      totalDuration = ytp.getDuration();

      // Set YouTube player to default quality state for appropriate playback quality
      event.target.setPlaybackQuality('default');

      // Fade the player up
      s.$playerWrapper.fadeIn(3000);

      console.log('nightingalePlayer event: Ready');
    }

    function onPlayerStateChange (event){

      // Request available qualities and load into controls display
      // getAvailableQualityLevels is only available on playerStateChange (this function and not onPlayerReady), so it's wrapped in an undefined check to run once only

      if(typeof availableQuality === 'undefined'){
        // Get available qualities
        availableQuality = ytp.getAvailableQualityLevels();
        // Set available qualities
        updateAvailableQualityUI(availableQuality);
      }

      // YouTube Player States
      if(event.data == YT.PlayerState.BUFFERING){
        onPlayerStateBuffering();
        console.log('nightingalePlayer state: BUFFERING');
      }

      if (event.data == YT.PlayerState.PLAYING) {
        onPlayerStatePlaying();
        console.log('nightingalePlayer state: PLAYING');
      } else {
        // Stops the seek bar if not playing
        clearTimeout(updateTimer);
      }

      if(event.data == YT.PlayerState.ENDED){
        onPlayerStateEnded();
        console.log('nightingalePlayer state: ENDED');
      }

      // Store reference to previous quality to update the UI
      previousQualityState = ytp.getPlaybackQuality();

      // Update quality display in UI
      updateQualityDisplay(previousQualityState, ytp.getPlaybackQuality());

      // Toggle play / pause
      s.$playPauseBtn.toggleClass('active');
    }

    function onPlaybackQualityChange(event){
      // Update HD player control to reflect quality change
      updateQualityDisplay(previousQualityState, ytp.getPlaybackQuality());
      console.log('nightingalePlayer event: Quality change');
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

    // On EXPANDING player control CLICK
    function onExpandingPlayerControlsClick(){

      var _activeElems = [s.$controlsContainer, s.$expandingPlayerControls];

      if(!s.$controlsContainer.hasClass('active')){
        s.$controlsContainer.css( "width", s.$controlsList.width() + 20).find('ul').delay(500).fadeIn(500);
      }else{
        s.$controlsList.fadeOut(100, function(){
          s.$controlsContainer.css( "width", '0px');
        });
      }

      $.each(_activeElems, function(index, value){
        $(this).toggleClass('active');
      });

      console.log('nightingalePlayer event: expanding control click');
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

    // On CONTROL resolution quality CLICK
    function onQualitySelect(){
      // Store previous quality state for reference during update of color values onPlaybackQualityChange()
      previousQualityState = ytp.getPlaybackQuality();
    }

    // On VOLUME container CLICK
    function onVolumeContainerInteract(e) {
      // Prevent accidental closes while dragging volume slider
      e.stopPropagation();
    }
    // get value of volume slider and translate into ytp volume
    function onVolumeSliderInteract(e) {
      e.stopPropagation();
      var volume = parseInt($(this).val());
      if (volume !== 0) {
        ytp.unMute();
        ytp.setVolume(volume);
        s.$muteToggleBtn.addClass('active');
      } else if (volume === 0) {
        ytp.mute();
        s.$muteToggleBtn.removeClass('active');
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
    }

    /*******************************************************************************
    * player STATES
    ******************************************************************************/

    function onPlayerStatePlaying(){

      // Set up interval timer to move silder thumb along the track
      updateTimer = setInterval(function() {

        var currentTime = ytp.getCurrentTime();
        //thumbValue = currentTime * (100 / totalDuration);

        // s.$playerSeekSlider.val(thumbValue);
        var percentage = 100 * currentTime / totalDuration;
        s.$playedBar.css('width', percentage+'%');

        // scrubber colored trail for played % on track
        //updatePlayedBar(thumbValue);

      }, 400);

      // Hide the endframe if it is visible and the video starts playing
      if (s.$playerEndframe.is(':visible')) {
        s.$playerEndframe.hide();
        s.$playerWrapper.show();
      }
    }

    function onPlayerStateBuffering(){

    }

    function onPlayerStateEnded(){
      // show the end frame, hide player behind it.
      s.$playerEndframe.show();
      s.$playerWrapper.hide();
    }

    /*******************************************************************************
    * nightingalePlayer Functions
    ******************************************************************************/

    // Get, format & insert available quality levels for the player control
    function updateAvailableQualityUI(qualityLevel){

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
          s.$controlsList.append('<li id="controls__video_quality__'+ value +'" data-quality="'+ value +'">'+ outputValue +'</li>').find('li:eq('+ index +')').on('click', onQualitySelect);
      });
    }

    // Update quality display in the UI
    function updateQualityDisplay(previousQualityState, currentQualityState){

      var _videoControl = '#controls__video_quality__',
      _cssProp = 'color';

      $(_videoControl+previousQualityState).css(_cssProp, s.colorTheme.primary);
      $(_videoControl+currentQualityState).css(_cssProp, s.colorTheme.secondary);
    }

    // Update played bar (coloured bar behind the thumb slider) on updateTimer tick & seek bar change event
    function updatePlayedBar(x) {

      var position = x - s.$playerSeekSlider.offset().left; // Click position
      var percentage = 100 * position / s.$playerSeekSlider.width();

      // Check within range
      if(percentage > 100) {
          percentage = 100;
      }
      if(percentage < 0) {
          percentage = 0;
      }

      // Update played bar
      s.$playedBar.css('width', percentage+'%');

      // Seek to new current position
      var seekValue = totalDuration * percentage / 100;
      ytp.seekTo(seekValue);
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
