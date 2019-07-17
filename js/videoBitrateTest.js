/* Video Bitrate Test Start */
var videoBitrateTest = {
	name: "Video Bitrate",
	run: function(doneCallback) {
		VideoBandwidthTest(doneCallback);
	}
};
function VideoBandwidthTest(doneCallback) {
	var statStepMs = 100;
	var startTime = null;
	var pc2Stats = []; //Capture only pc2 stats which will provide required info
	// Open the camera in 720p to get a correct measurement of ramp-up time.
	var constraints = {
		audio: false,
		video: {
			optional: [{ minWidth: 1280 }, { minHeight: 720 }]
		}
	};
	var config = { iceServers: iceServers };
	var pc1 = new RTCPeerConnection(config);
	var pc2 = new RTCPeerConnection(config);
	pc1.addEventListener("icecandidate", onIceCandidate_.bind(this, pc2));
	pc2.addEventListener("icecandidate", onIceCandidate_.bind(this, pc1));
	var localStream;
	navigator.mediaDevices
		.getUserMedia(constraints)
		.then(function(stream) {
			pc1.addStream(stream);
			establishConnection(pc1, pc2);
			startTime = new Date();
			localStream = stream;
			setTimeout(gatherStats, statStepMs);
		})
		.catch(function(error) {
			console.error(
				"Failed to get access to local media due to " +
					"error: " +
					error.name
			);
			console.error(
				"Video Bitrate test failed. Please allow access to camera and try again!"
			);
			doneCallback(false);
		});

	var progress = 0;
	function gatherStats() {
		var now = new Date();
		if (now - startTime > VIDEO_TEST_DURATION_MS) {
			endCall(pc1, pc2, localStream);
			generateStatsReport(pc2Stats);
			doneCallback(false);
			return;
		} else if (pc1.connectionState === "connected") {
			collectStats(pc2, pc2Stats);
		}
		var currentProgress =
			((now - startTime) * 100) / VIDEO_TEST_DURATION_MS;
		//Keep logging progress so that user does not get impatient
		if (currentProgress - progress > 10) {
			console.log("Progress: ", currentProgress);
			progress = currentProgress;
		}
		setTimeout(gatherStats, statStepMs);
	}

	function generateStatsReport(pc2Stats) {
		var avgBitrate = 0;
		var packetLossPercent = 0;
		if (pc2Stats.length > 2) {
			//Skip RTT if its firefox WIP to make it spec compliant
			if (adapter.browserDetails.browser !== "firefox") {
				var avgRtt = getAverageRTT(pc2Stats[pc2Stats.length - 1]);
				if (avgRtt < RTT_THRESHOLD) {
					console.info("Average RTT: " + avgRtt + " ms");
				} else {
					console.warn("Average RTT: " + avgRtt +
							" ms." + " Things don't look pretty ahead!");
				}
			}

			avgBitrate = calculateAvgBitrate(pc2Stats);
			var avgBitrateKbps = Math.round(avgBitrate / 1000);
			if (avgBitrateKbps < AVERAGE_BITRATE_THRESHOLD) {
				console.warn("Average Bitrate: ", avgBitrateKbps,
					" kbps. ", "Bumpy ride ahead!");
			} else {
				console.info("Average Bitrate: ", avgBitrateKbps, " kbps");
			}

			var lastStat = getInboundStat(pc2Stats[pc2Stats.length - 1]);
			var packetLossRatio =
				lastStat.packetsLost /
				(lastStat.packetsLost + lastStat.packetsReceived);
			packetLossPercent = packetLossRatio * 100;
			if (packetLossPercent > PACKET_LOSS_THRESHOLD) {
				console.warn("Packet Loss Percent: ", packetLossPercent.toFixed(2),
					"%. ", "Bumpy ride ahead!");
			} else {
				console.info("Packet Loss Percent: ",
					packetLossPercent.toFixed(2), "%");
			}
		} else {
			console.warn("Not enough data to calculate video quality!");
		}

		function getAverageRTT(report) {
			var averageRTT;
			report.forEach(result => {
				if (
					result.type === "candidate-pair" &&
					result.hasOwnProperty("availableOutgoingBitrate")
				) {
					averageRTT = Math.round(
						(result.totalRoundTripTime * 1000) /
							result.responsesReceived
					);
				}
			});
			return averageRTT;
		}
		function getInboundStat(report) {
			var inboundStat;
			report.forEach(element => {
				if (element.type === "inbound-rtp") {
					inboundStat = element;
				}
			});
			return inboundStat;
		}

		function calculateAvgBitrate(rtcStatsArr) {
			var statCount = 0;
			var sumBps = 0;
			for (var i = 1; i < rtcStatsArr.length; i += 1) {
				var currStat = getInboundStat(rtcStatsArr[i]);
				var prevStat = getInboundStat(rtcStatsArr[i - 1]);

				if (currStat && prevStat) {
					var bytesIncreased = currStat.bytesReceived
						? currStat.bytesReceived - prevStat.bytesReceived
						: 0;
					var bitsIncreased = bytesIncreased * 8;
					var msIncreased = currStat.timestamp - prevStat.timestamp;
					var secondsElapsed = msIncreased / 1000;
					sumBps += bitsIncreased / secondsElapsed;
					statCount++;
				}
			}
			var avgBitrate = Math.round(sumBps / statCount);
			return avgBitrate;
		}
	}

	function collectStats(pc, statsArr) {
		pc.getStats(null)
			.then(function(stat) {
				statsArr.push(stat);
			})
			.catch(function(error) {
				console.error("Could not gather stats: " + error);
			});
	}
}
/* Video Bandwidth Test End */
