/* Browser WebRTC Support Test Code Start */
var webRTCSupportTest = {
	name: "Browser WebRTC Support",
	run: function(doneCallback) {
		var browserSupportsWebRTC = isWebRTCSupported();
		if (!browserSupportsWebRTC) {
			console.error("Browser does not support WebRTC. Try again with Firefox, Chrome, Chromium, Opera, Safari or Edge.");
			doneCallback(true);
		} else {
			console.info("Browser supports WebRTC.");
			doneCallback(false);
		}
	}
};

/**
 * Browser Support.
 */
function isWebRTCSupported() {
	var navigator = window.navigator;

	// Fail early if it's not a browser
	if (typeof window === "undefined" || !window.navigator) {
		//Not a browser.
		return false;
	}

	if (navigator.mozGetUserMedia) {
		// Firefox.
		return true;
	} else if (
		navigator.webkitGetUserMedia ||
		(window.isSecureContext === false &&
			window.webkitRTCPeerConnection &&
			!window.RTCIceGatherer)
	) {
		// Chrome, Chromium, Webview, Opera.
		// Chrome 74 removed webkitGetUserMedia on http as well so we need the
		// more complicated fallback to webkitRTCPeerConnection.
		return true;
	} else if (
		navigator.mediaDevices &&
		navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)
	) {
		// Edge.
		return true;
	} else if (
		window.RTCPeerConnection &&
		navigator.userAgent.match(/AppleWebKit\/(\d+)\./)
	) {
		// Safari.
		return true;
	} else {
		// Default fallthrough: not supported.
		return false;
	}
}

/* Browser WebRTC Support Test Code End */
