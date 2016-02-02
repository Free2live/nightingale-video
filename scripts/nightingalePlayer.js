/***************************************************
  Browser sniffage

  Since we cannot target browsers for any '360 video enabled' feature,
  and a youtube 360 api is non existent at the moment, user agent sniffing is only answer
  for this case. Below we are looking for Chromium browsers, FF or Opera (360 supported).

***************************************************/
var isMobile = {

    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

// If not mobile
if (!isMobile.any()) {
  // Check for 360 supported browser
  if (browserCanLoadVideo()) {
    // Set player YT Deferred
    var nightingaleYTDeferred = $.Deferred();
    window.onYouTubeIframeAPIReady = function() {
      nightingaleYTDeferred.resolve(window.YT);
    };
    // YouTube API ajax call
    $.getScript( "https://www.youtube.com/iframe_api")
      .done(function(script, textStatus) {
    });
  } else {
    // Set up and display overlay if 360 not supported.
    var _disabledOuter = $('#disabled-overlay'),
        _disabledInner =   $('#disabled-overlay__inner'),
        _message = _disabledInner.find('#disabled-overlay__inner__message'),
        _modal = $('#disabled-overlay__modal');

    // Show the overlay
    _disabledOuter.css('display', 'table');
    // Bind events
    _disabledInner.find('a').on('click', function(){
      _modal.toggleClass('active');
      _message.toggleClass('active');
      return false;
    });
    _modal.find('span').on('click', function(){
      _modal.toggleClass('active');
      _message.toggleClass('active');
    });
  }
}else{
  // If mobile, display the mobile overlay
  $('#mobile-overlay').css('display', 'table');
  // Set overflow-y to visible for mobile scrolling
  $('html').css('overflow', 'visible').find('body').css('overflow', 'visible');
}

function browserCanLoadVideo() {
  // chrome / opera
  var isChromium = !!window.chrome;
  // ff *
  var isFF = !!window.sidebar;
  // opera *
  var isOpera = !!window.opera || /opera|opr/i.test(navigator.userAgent);
  // sfari *
  var isSafari = /constructor/i.test(window.HTMLElement);
  // ie >= 10
  var isIE = window.navigator.msPointerEnabled;
  // ie 6-10
  var isOldIE = !!window.ActiveXObject;

  if ((isChromium) || (isFF) || (isOpera)) {
    return true;
  }
  if (isSafari || isIE || isOldIE) {
    return false;
  }
  return false;
}

// nightingalePlayer constructor
var nightingalePlayer = (function() {
  // Player vars
  var $d = $(document),
      updateTimer,
      totalDuration,
      playerVolumeLevel,
      ytp,
      s,
      // Player settings
      settings = {
        // Define player elements
        $playerOverlays: $('.player-overlay'),
        $endFrameWrapper: $('#endframe-overlay-wrapper'),
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
        $playerSeekSliderThumb: $('.seekslider__thumb'),
        $playedBar: $('.seekslider__played'),
        thumbDragging: false,
        $volContainer: $('.volume'),
        // Define player colour theme;
        colorTheme:{
          primary: '#ffffff',
          secondary: '#f44c02'
        },
        // Overridable default settings
        defaults: {
          videoKey: 'Mnf15KwPV-Q'
        },
        // YouTube Api params
        playerElem: 'nightingalePlayer',
        playerWidth: '100%',
        playerHeight: '100%',
        autoPlay: 1,
        enableYouTubeApi: 1,
        enableControls: 0,
        showPlayerInfo: 0,
        showRelatedContent: 0,
        enableModestBranding: 1,
        // Sharing info
        shareMethod: 'feed',
        shareName: 'Nightingale 360',
        shareLink: 'http://www.nightingale360.com',
        shareDesc: 'Description',
        shareImage: 'http://static01.nyt.com/images/2015/02/19/arts/international/19iht-btnumbers19A/19iht-btnumbers19A-facebookJumbo-v2.jpg',

        initSettingsChildren: function() {
          // Settings that need sibling reference
          this.$playerElem =  $('#'+this.playerElem);
          this.$replayVideoBtn = this.$playerEndframe.find('button');
          this.$controlsList = this.$controlsContainer.find('ul');
          this.$volTrack = this.$volContainer.find('.volume__track');
          this.$volSlider = this.$volContainer.find('.volume__track__slider');
          this.$volSliderThumb = this.$volContainer.find('.volume__track__thumb');

          delete this.initSettingsChildren;
          return this;
        }
    };

    function init(options){

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
        ytp = new YT.Player(s.playerElem, {
            width: s.playerWidth,
            height: s.playerHeight,
            // videoId: (browserCanLoadVideo()) ? s.defaults.videoKey : s.defaults.disabledBrowsersKey,
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

        // Fade up the player overlays
        s.$playerOverlays.fadeIn();

      }else{
        // Throw an error if no target div found.
        console.error('nightingalePlayer Error: Cannot initialise, no target div found. Please add a div with id "nightingalePlayer" to the page.');
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

      // Set current video duration
      totalDuration = ytp.getDuration();
      // Get the current volume
      var _currentVolume = ytp.getVolume();
      // Set up volume slider
      s.$volSlider.css('width', _currentVolume+'%');
      // Update the current volume level in the volume slider
      playerVolumeLevel = s.$volSlider.css('width');
      // Set YouTube player to default quality state for appropriate playback quality
      event.target.setPlaybackQuality('default');
      // Bind custom events
      bindCustomEvents();
    }

    function onPlayerStateChange (event){

      var _activeClass = 'active';

      // YouTube Player States
      if (event.data == YT.PlayerState.PLAYING) {

        onPlayerStatePlaying();
        // Toggle play / pause
        s.$playPauseBtn.addClass(_activeClass);

      } else {
        // Stops the seek bar if not playing
        clearTimeout(updateTimer);
      }
      if(event.data == YT.PlayerState.PAUSED){
        // Toggle play / pause
        s.$playPauseBtn.removeClass(_activeClass);
      }
      if(event.data == YT.PlayerState.ENDED){
        onPlayerStateEnded();
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
              s.$volSlider.css('width', '0%');
          } else {
              ytp.unMute();
              s.$volSlider.css('width', playerVolumeLevel);
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
      FB.ui({
          method: s.shareMethod,
          link: s.shareLink,
          picture: s.shareImage,
          name: s.shareName,
          description: s.shareDesc
        }
      );
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
      s.$volContainer.stop().animate({
        width: '120px'
      }, 150, 'easeInOutQuad')
      .css('overflow', 'visible');
    }

    function onControlsBlur() {
      s.$volContainer.stop().animate({
        width: '0'
      }, 200, 'easeInOutQuad', function() {
        s.$volContainer.removeClass('active');
      }).css('overflow', 'visible');

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

        var currentTime = ytp.getCurrentTime(),
            percentage = 100 * currentTime / totalDuration;

        s.$playedBar.css('width', percentage+'%');

      }, 400);

      // Hide the endframe if it is visible and the video starts playing
      if (s.$endFrameWrapper.is(':visible')) {
        s.$endFrameWrapper.hide();
      }
    }

    function onPlayerStateEnded(){
      // show the end frame, hide player behind it.
      s.$endFrameWrapper.show();
      s.$playerEndframe.fadeIn(1000);

      // Set played bar to end position
      s.$playedBar.css('width', '100%');
    }

    /*******************************************************************************
    * nightingalePlayer Functions
    ******************************************************************************/

    // Update played bar width and seek to on mouse move
    function updatePlayedBar(pageX) {

      // Calulate new slider percentage and volume level
      var _percentage = calculateSliderPercentage(pageX, s.$playerSeekSlider),
      _seekValue = totalDuration * _percentage / 100;

      // Update played bar
      s.$playedBar.css('width', _percentage+'%');

      // Seek to new current position
      ytp.seekTo(_seekValue);
    }

    // Update volume bar on mouse move
    function updateVolumeBar(pageX){

      // Calulate new slider percentage and volume level
      var _percentage = calculateSliderPercentage(pageX, s.$volTrack),
          _volumeValue = Math.round(_percentage);

      if (_volumeValue !== 0) {
        ytp.unMute();
        ytp.setVolume(_volumeValue);
        s.$muteToggleBtn.addClass('active');
      } else if (_volumeValue === 0) {
        ytp.mute();
        s.$muteToggleBtn.removeClass('active');
      }

      playerVolumeLevel = ytp.getVolume()+'%';
      s.$volSlider.css('width', _percentage+'%');
    }

    // Calulate slider percentage
    function calculateSliderPercentage(pageX, sliderTrack){

      // Get the click position
      var _position = pageX - sliderTrack.offset().left,
          // Calulate the percentage
          _percentage = 100 * _position / sliderTrack.width();

      // Check within range
      if(_percentage > 100) {
          _percentage = 100;
      }
      if(_percentage < 0) {
          _percentage = 0;
      }

      return _percentage;
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

    // Return public
    return {
      init: init
    };

})($);
