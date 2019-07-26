/* THROUGHPUT Test Code Start */
var throughputTest = {
	name: "THROUGHPUT",
	run: function(doneCallback) {
		ThroughputTest(doneCallback);
	}
};

function ThroughputTest(doneCallback) {
	var config = { iceServers: iceServers };
	var startTime = null;
	var sentPayloadBytes = 0;
	var receivedPayloadBytes = 0;
	var stopSending = false;
	var samplePacket = "";
	for (var i = 0; i !== 1024; ++i) {
		samplePacket += "h";
	}

	var maxNumberOfPacketsToSend = 100;
	var bytesToKeepBuffered = 1024 * maxNumberOfPacketsToSend;
	var lastBitrateMeasureTime;
	var lastReceivedPayloadBytes = 0;

	var pc1 = new RTCPeerConnection(config);
	var pc2 = new RTCPeerConnection(config);
	pc1.addEventListener("icecandidate", onIceCandidate_.bind(this, pc2));
	pc2.addEventListener("icecandidate", onIceCandidate_.bind(this, pc1));
	var senderChannel = pc1.createDataChannel(null);
	var receiveChannel = null;

	var connStartTime = Date.now();
	var timeout = setTimeout(function() {
		senderChannel.removeEventListener("open", sendingStep);
		console.error(
			"Could not establish a connection to " +
				turnIpAddr +
				" within 5 seconds"
		);
		endCall(pc1, pc2);
		doneCallback(false);
	}, 5000);

	senderChannel.addEventListener("open", sendingStep);
	pc2.addEventListener("datachannel", onReceiverChannel);
	establishConnection(pc1, pc2);

	function onReceiverChannel(event) {
		receiveChannel = event.channel;
		receiveChannel.addEventListener("message", onMessageReceived);
	}

	function sendingStep() {
		var now = new Date();
		if (!startTime) {
			var elapsed = Date.now() - connStartTime;
			clearTimeout(timeout);
			console.log(
				"Successfully established a connection to " +
					turnIpAddr +
					" in " +
					elapsed +
					"ms"
			);

			startTime = now;
			lastBitrateMeasureTime = now;
		}
		for (var j = 0; j !== maxNumberOfPacketsToSend; ++j) {
			if (senderChannel.bufferedAmount >= bytesToKeepBuffered) {
				break;
			}
			sentPayloadBytes += samplePacket.length;
			senderChannel.send(samplePacket);
		}
		if (now - startTime >= THROUGHPUT_TEST_DURATION_MS) {
			stopSending = true;
		} else {
			setTimeout(sendingStep, 1);
		}
	}

	function onMessageReceived(event) {
		receivedPayloadBytes += event.data.length;
		var now = new Date();
		if (now - lastBitrateMeasureTime >= 1000) {
			var bitrate =
				(receivedPayloadBytes - lastReceivedPayloadBytes) /
				(now - lastBitrateMeasureTime);
			bitrate = Math.round(bitrate * 1000 * 8) / 1000;
			console.log("Transmitting at " + bitrate + " kbps.");
			lastReceivedPayloadBytes = receivedPayloadBytes;
			lastBitrateMeasureTime = now;
		}
		if (stopSending && sentPayloadBytes === receivedPayloadBytes) {
			endCall(pc1, pc2);
			var elapsedTime = Math.round((now - startTime) * 10) / 10000.0;
			var receivedKBits = (receivedPayloadBytes * 8) / 1000;
			console.log(
				"Total transmitted: " +
					receivedKBits +
					" kBits in " +
					elapsedTime +
					" seconds."
			);
			var bandwidth = receivedKBits / elapsedTime;
			console.info(
				"Average bandwidth: " + bandwidth.toFixed(2) + " kBits/sec."
			);
			doneCallback(false);
		}
	}
}
/* THROUGHPUT Test Code End */
