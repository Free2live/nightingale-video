var YTdeferred = jQuery.Deferred();

window.onYouTubeIframeAPIReady = function() {
	YTdeferred.resolve(window.YT);
};

var nightingalePlayer = (function() {

	$.getScript( "https://www.youtube.com/player_api")
		.done(function( script, textStatus ) {
	});

  YTdeferred.done(function(YT) {
    init();
  });

  var s,
			d = $(document),
      ytp,
      availableQuality,
      previousQualityState,
      totalDuration,
      updateTimer,
      settings = {

        playerWrapper: $('#nightingalePlayer'),
        playerElem: $('#nightingalePlayer__player'),
        playerPoster: $('#poster-overlay'),
        playerWidth: '100%',
        playerHeight: '100%',
        videoKey: 'Mnf15KwPV-Q',
        autoPlay: 1,
        enableYouTubeApi: 1,
        enableControls: 0,
        showPlayerInfo: 0,
        showRelatedContent: 0,
        enableModestBranding: 1,
        allControlsWrapper: $('.controls'),
        standardPlayerControls: $('.controls__standard'),
        expandingPlayerControls: $('.controls__expanding'),
        expandingPlayerControlIcon: $('.controls__expanding__icon'),
        controlsContainer: $('#controls__expanding_centre'),
        playPauseBtn: $('#controls__standard--play-pause'),
        muteToggleBtn: $('#controls__standard--toggle-mute'),
				fsToggleBtn: $('#controls__standard--fs'),
        playerSeekSlider: $('#seekslider'),
        playedBar: $('#seekslider__thumb-trail'),
        thumbDragging: false,
        volContainer: $('.volume'),
        colorTheme:{
          primary: '#ffffff',
          secondary: '#f44c02'
        },
        // Any settings that need object self reference can be defined here (free country) (git blame bfwsharp@gmail.com)
        initSettingsChildren: function() {

          this.replayVideoBtn = this.playerPoster.find('button');
          this.controlsList = this.controlsContainer.find('ul');
          this.volSlider = this.volContainer.find('input');

          delete this.initSettingsChildren;
          return this;
        }
    };

    function init(){

      s = settings;
      s.initSettingsChildren();

      // check to see if target div exists before initialising
      if(s.playerElem.length){

        ytp = new YT.Player(s.playerElem.attr('id'), {
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
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onPlaybackQualityChange': onPlaybackQualityChange
          }
        });

      }else{
        // Throw and error if no target div.
        console.error('nightingalePlayer Error: Cannot initialise, no target div found. Please add a div with id "nightingalePlayer__player" to the page.');
      }

    }

    function bindCustomEvents(){
			d.on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', onFullscreenChange);
      s.playerSeekSlider.on('mousedown', onSeekMouseDown)
      .on('mouseup', onSeekMouseUp)
      .on('change', onPlayerSeekSlider);
      s.standardPlayerControls.on('click', onStandardPlayerControlsClick);
      s.expandingPlayerControlIcon.on('click', onExpandingPlayerControlsClick);
			s.replayVideoBtn.on('click', onReplayBtnClick);
      s.volContainer.on('click', onVolumeContainerInteract);
      s.volSlider.on('input change', onVolumeSliderInteract);
      s.muteToggleBtn.on('mouseover', onMuteToggleHover);
      s.allControlsWrapper.on('mouseleave', onControlsBlur);
    }

    /*
    ██    ██ ████████     ███████ ██    ██ ███████ ███    ██ ████████ ███████
     ██  ██     ██        ██      ██    ██ ██      ████   ██    ██    ██
      ████      ██        █████   ██    ██ █████   ██ ██  ██    ██    ███████
       ██       ██        ██       ██  ██  ██      ██  ██ ██    ██         ██
       ██       ██        ███████   ████   ███████ ██   ████    ██    ███████
    */

    function onPlayerReady(event){
      bindCustomEvents();
      event.target.setPlaybackQuality('default');
      ytp.mute(); // remove from Production
      toggleWrapperFade();
      console.log('nightingalePlayer event: Ready');
    }

    function onPlayerStateChange (event){

      // Request available qualities and load into controls display
      // getAvailableQualityLevels is only available on playerStateChange (this function and not onPlayerReady), so it's wrapped in an undefined check to run once only
      if(typeof availableQuality === 'undefined'){
        //Get available qualities
        availableQuality = ytp.getAvailableQualityLevels();
        setAvailablePlaybackQualities(availableQuality);
      }

      if(event.data == YT.PlayerState.BUFFERING){
        onPlayerStateBuffering();
        console.log('nightingalePlayer state: BUFFERING');
      }

      // If video playing...
      if (event.data == YT.PlayerState.PLAYING) {
        onPlayerStatePlaying();
        console.log('nightingalePlayer state: PLAYING');
      // If not playing, kill the interval timer
      } else {
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
      s.playPauseBtn.toggleClass('active');
    }

    function onPlaybackQualityChange(event){
      updateQualityDisplay(previousQualityState, ytp.getPlaybackQuality());
      console.log('nightingalePlayer event: Quality change');
    }

    /*
    ██████  ██       █████  ██    ██ ███████ ██████      ███████ ██    ██ ███████ ███    ██ ████████ ███████
    ██   ██ ██      ██   ██  ██  ██  ██      ██   ██     ██      ██    ██ ██      ████   ██    ██    ██
    ██████  ██      ███████   ████   █████   ██████      █████   ██    ██ █████   ██ ██  ██    ██    ███████
    ██      ██      ██   ██    ██    ██      ██   ██     ██       ██  ██  ██      ██  ██ ██    ██         ██
    ██      ███████ ██   ██    ██    ███████ ██   ██     ███████   ████   ███████ ██   ████    ██    ███████
    */

		function onFullscreenChange(){
			s.fsToggleBtn.toggleClass('active');
		}

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
          if (ytp.isMuted()) {
              ytp.unMute();
          } else {
              ytp.mute();
          }
					$(this).toggleClass('active');
        break;

        case 'controls__standard--fs':
          requestFullScreen($(this).hasClass('active'));
        break;
      }
    }

    function onExpandingPlayerControlsClick(){

      var _activeElems = [s.controlsContainer, s.expandingPlayerControls];

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

      console.log('nightingalePlayer event: expanding control click');
    }

    function onSeekMouseDown() {
      // pause video and listen for input events (value changes) from dragging
      ytp.pauseVideo();
      $(this).on('input', onSeekMouseDrag); // ie8 doesn't support this, SHOCKER http://caniuse.com/#feat=input-event
      s.thumbDragging = true;
      clearInterval(updateTimer);
    }

    function onSeekMouseUp() {
      // resume playing video
      ytp.playVideo();
      s.thumbDragging = false;
    }

    function onSeekMouseDrag() {
      // update played bar width
      updatePlayedBar($(this).val());
    }

		function onReplayBtnClick(){
			TweenMax.to(s.playerPoster, 0.8, {opacity: 0, onComplete: onReplayBtnClickComplete});
		}

		function onReplayBtnClickComplete(){
			s.playerPoster.hide().css('opacity', '1');
			toggleWrapperFade();
			ytp.playVideo();
		}

    /*
     ██████ ██    ██ ███████ ████████  ██████  ███    ███
    ██      ██    ██ ██         ██    ██    ██ ████  ████
    ██      ██    ██ ███████    ██    ██    ██ ██ ████ ██
    ██      ██    ██      ██    ██    ██    ██ ██  ██  ██
     ██████  ██████  ███████    ██     ██████  ██      ██
    */

    function toggleWrapperFade(){
      var _o = s.playerWrapper.css('opacity') == 1 ? 0 : 1;
      TweenMax.to(s.playerWrapper, 1, {opacity: _o});
    }

    function setAvailablePlaybackQualities(qualityLevel){

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
          s.controlsList.append('<li id="controls__video_quality__'+ value +'" data-quality="'+ value +'">'+ outputValue +'</li>').find('li:eq('+ index +')').on('click', onQualitySelect);
      });
    }

    function onQualitySelect(event){
      // Store previous quality state for reference during update of color values onPlaybackQualityChange()
      previousQualityState = ytp.getPlaybackQuality();
    }

    function updateQualityDisplay(previousQualityState, currentQualityState){
      $('#controls__video_quality__'+previousQualityState).css('color', s.colorTheme.primary);
      $('#controls__video_quality__'+currentQualityState).css('color', s.colorTheme.secondary);
    }

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

    function onPlayerSeekSlider(){
      clearTimeout(updateTimer);
      var seekValue = ytp.getDuration() * (s.playerSeekSlider.val() / 100);
      ytp.seekTo(seekValue);
    }

    function updatePlayedBar(value) {
      var playerBarPerc = (Math.round(value * 10) / 10).toFixed(1) + '%';
      s.playedBar.width(playerBarPerc);
    }

    // prevent accidental closes while dragging volume slider
    function onVolumeContainerInteract(e) {
      e.stopPropagation();
    }
    // get value of volume slider and translate into ytp volume
    function onVolumeSliderInteract(e) {
      e.stopPropagation();
      var volume = parseInt($(this).val());
      if (volume !== 0) {
        ytp.unMute();
        ytp.setVolume(volume);
        s.muteToggleBtn.addClass('active');
      } else if (volume === 0) {
        ytp.mute();
        s.muteToggleBtn.removeClass('active');
      }
    }

    function onMuteToggleHover() {
      s.volContainer.addClass('active');
      s.volContainer.animate({
        width: '120px'
      }, 150, 'easeInOutQuad');
    }

    function onControlsBlur() {
      s.volContainer.animate({
        width: '0'
      }, 200, 'easeInOutQuad', function() {
        s.volContainer.removeClass('active');
      });
    }

    function onPlayerStatePlaying(){

      // Get current vid duration and set up interval timer to move silder thumb along the track
      totalDuration = ytp.getDuration();
      updateTimer = setInterval(function() {

        var currentTime = ytp.getCurrentTime(),
        thumbValue = currentTime * (100 / totalDuration);

        s.playerSeekSlider.val(thumbValue);

        // scrubber colored trail for played % on track
        updatePlayedBar(thumbValue);

      }, 400);
    }

    function onPlayerStateBuffering(){

    }

    function onPlayerStateEnded(){

      s.playerPoster.show();
			toggleWrapperFade();
    }

})(jQuery, TweenMax);
