(function($) {

    "use strict"; // Start of use strict

    // Load the IFrame Player API code asynchronously.
	var tag = document.createElement('script')
	,   firstScriptTag = document.getElementsByTagName('script')[0];

	tag.src = "https://www.youtube.com/player_api";
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

})(jQuery);