function parseCandidate(text) {
	var candidateStr = "candidate:";
	var pos = text.indexOf(candidateStr) + candidateStr.length;
	var fields = text.substr(pos).split(" ");
	return {
		type: fields[7],
		protocol: fields[2],
		address: fields[4]
	};
}

function isRelay(candidate) {
	return candidate.type === "relay";
}

function isNotHostCandidate(candidate) {
	return candidate.type !== "host";
}

function establishConnection(pc1, pc2) {
	var createOfferParams = { offerToReceiveAudio: 1 };
	pc1.createOffer(createOfferParams).then(function(offer) {
		pc1.setLocalDescription(offer);
		pc2.setRemoteDescription(offer);
		pc2.createAnswer().then(function(answer) {
			pc2.setLocalDescription(answer);
			pc1.setRemoteDescription(answer);
		}, emptyFunction);
	}, emptyFunction);

	// Empty function for callbacks requiring a function.
	function emptyFunction() {}
}

function onIceCandidate_(pc, e) {
	if (e.candidate) {
		var parsed = parseCandidate(e.candidate.candidate);
		if (isRelay(parsed)) {
			turnIpAddr = parsed.address;
			pc.addIceCandidate(e.candidate);
		}
	}
}

function endCall(pc1, pc2, localStream) {
	if (pc1) {
		pc1.close();
		pc1 = null;
	}
	if (pc2) {
		pc2.close();
		pc2 = null;
	}
	if (localStream) {
		localStream.getTracks().forEach(track => track.stop());
		localStream = null;
	}
}
