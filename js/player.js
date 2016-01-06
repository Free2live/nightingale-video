//Player JS

var player;

function onYouTubePlayerAPIReady() {
  
  player = new YT.Player('ytplayer', {
  	width: '100%',
  	height: '100%',
    videoId: 'H6SsB3JYqQg',
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

}

function onPlayerReady(){}

function onPlayerStateChange(){}