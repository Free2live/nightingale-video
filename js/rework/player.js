var s,
    ytp,

Player = {

    settings:{

      playerWidth: '100%',
      playerHeight: '100%',
      videoKey: 'H6SsB3JYqQg',
      autoPlay: 1,
      enableYouTubeApi: 1,
      enableControls: 0,
      showPlayerInfo: 0,
      showRelatedContent: 0,
      enableModestBranding: 1,
      container: $('#ytwrapper'),
      fullScreenTarget: document.body,
      standardPlayerControls: $('.controls__control'),
      exapandingPlayerControls: $('.controls__quality-container__display'),
      controlsContainer: $('#controls__video_quality--centre'),
      controlsList: controlsContainer.find('ul'),
      playPauseBtn: $('#controls__play_pause'),
      toggleMuteBtn: $('#controls__toggle_mute'),
      toggleFullScreen: $('#controls__toggle_fs'),
      qualitySelectBtn: $('#controls__quality-container__icon'),
      playerSeekSlider: $('#seekslider'),
      currentQualityHighlightColor: '#f44c02'
    },

    init: function(){
      s = this.settings;
      this.bindEvents();
    },

    bindEvents: function(){
      s.playerSeekSlider.on('change', this.videoSeek);
      s.standardPlayerControls.on('click', this.onStandardPlayerControlsClick);
      s.exapandingPlayerControls.on('click', this.onExapandingPlayerControlsClick);
    },

    onYouTubePlayerAPIReady: function(){
      ytp = new YT.Player('ytplayer', {
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
    },

    onPlayerReady: function(event){

    },

    onPlayerStateChange: function(event){

    },

    onPlaybackQualityChange: function(event){

    },

    onStandardPlayerControlsClick: function(){

    },

    onExapandingPlayerControlsClick: function(){

    },

    updateQualityDisplay: function(){

    },

    requestFullScreen: function(){

    },

    videoSeek: function(){

    }
};
