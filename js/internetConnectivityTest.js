/* Internet Connectivity Test Code Start */
var internetConnectivityTest = {
	name: "Internet Connection",
	run: function(doneCallback) {
		checkInternet(doneCallback);
	}
};

function checkInternet(doneCallback) {
	if (iceServers.length < 1) {
		console.error("Please add TURN/STUN urls in config to continue tests.");
		doneCallback(true); //Abort Tests
	}
	var config = { iceServers: iceServers };
	var pc;
	pc = new RTCPeerConnection(config);

	// In our candidate callback, stop if we get a candidate that passes
	// |isNotHostCandidate|.
	pc.onicegatheringstatechange = function(e) {
		var connection = e.target;
		switch (connection.iceGatheringState) {
			case "gathering":
				console.log("Gathering ICE Candidates Started");
				break;
			case "complete":
				console.log("Finished Gathering ICE Candidates");
				endCall(pc);
				console.error("No Internet Connectivity. Aborting Tests.");
				doneCallback(true); //Abort Tests
				break;
		}
	};
	pc.addEventListener("icecandidate", function(e) {
		if (e.candidate) {
			var parsed = parseCandidate(e.candidate.candidate);
			if (isNotHostCandidate(parsed)) {
				endCall(pc);
				console.info("Internet Available.");
				doneCallback(false);
			}
		}
	});
	createAudioOnlyReceiveOffer(pc);
}

function createAudioOnlyReceiveOffer(pc) {
	var createOfferParams = { offerToReceiveAudio: 1 };
	pc.createOffer(createOfferParams).then(function(offer) {
		pc.setLocalDescription(offer).then(emptyFunction, emptyFunction);
	}, emptyFunction);

	// Empty function for callbacks requiring a function.
	function emptyFunction() {}
}
/* Internet Connectivity Test Code End */
