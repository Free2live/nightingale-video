if (!mobileCheck()) {
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
    });
    _modal.find('span').on('click', function(){
      _modal.toggleClass('active');
      _message.toggleClass('active');
    });
  }
}
/***************************************************
  Browser sniffage

  Since we cannot target browsers for any '360 video enabled' feature,
  and a youtube 360 api is non existent at the moment, user agent sniffing is only answer
  for this case. Below we are looking for Chromium browsers, FF or Opera (360 supported).

***************************************************/
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

// Detect mobile browser
function mobileCheck() {
  var check = false;
  (function(a,b){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))window.location=b;})(navigator.userAgent||navigator.vendor||window.opera, 'http://www.example.com');
  return check;
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

    return {
      init: init
    };

})($);
