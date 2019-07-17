const UDP = "udp";
const TCP = "tcp";
const TLS = "tls";

/* TURN UDP-TCP-TLS Connectivity Test Code Start */
var udpConnectivityTest = {
	name: "TURN UDP Connectivity",
	run: function(doneCallback) {
		NetworkTest(UDP, doneCallback);
	}
};

var tcpConnectivityTest = {
	name: "TURN TCP Connectivity",
	run: function(doneCallback) {
		NetworkTest(TCP, doneCallback);
	}
};

var tlsConnectivityTest = {
	name: "TURN TLS Connectivity",
	run: function(doneCallback) {
		NetworkTest(TLS, doneCallback);
	}
};

var turnIpAddr;
function NetworkTest(protocol, doneCallback) {
	switch (protocol) {
		case UDP:
		case TCP:
			var newIceServers = filterConfig(iceServers, protocol);
			break;
		case TLS:
			var newIceServers = filterTLSConfig(iceServers, protocol);
			break;
	}

	if (newIceServers.length > 0) {
		var config = { iceServers: newIceServers };
		var startTime = Date.now();
		var pc1 = new RTCPeerConnection(config);
		var pc2 = new RTCPeerConnection(config);
		pc1.addEventListener("icecandidate", onIceCandidate_.bind(this, pc2));
		pc2.addEventListener("icecandidate", onIceCandidate_.bind(this, pc1));

		var dataChannel = pc1.createDataChannel(null);
		var timeout = void 0;

		function success() {
			var elapsed = Date.now() - startTime;
			clearTimeout(timeout);
			console.info(
				"Successfully established a " +
					protocol +
					" connection to " +
					turnIpAddr +
					" in " +
					elapsed +
					"ms"
			);
			endCall(pc1, pc2);
			doneCallback(false);
		}

		timeout = setTimeout(function() {
			dataChannel.removeEventListener("open", success);
			console.error(
				"Could not establish a " +
					protocol +
					" connection to " +
					turnIpAddr +
					" within 5 seconds"
			);
			endCall(pc1, pc2);
			doneCallback(false);
		}, 5000);

		dataChannel.addEventListener("open", success);
		establishConnection(pc1, pc2);
	} else {
		doneCallback(false);
	}
}

function filterConfig(iceServers, protocol) {
	var transport = "transport=" + protocol;
	var newIceServers = [];
	for (var i = 0; i < iceServers.length; ++i) {
		var iceServer = Object.assign({}, iceServers[i]);
		var newUrls = [];
		for (var j = 0; j < iceServer.urls.length; ++j) {
			var uri = iceServer.urls[j];
			if (uri.indexOf(transport) !== -1) {
				newUrls.push(uri);
			} else if (
				uri.indexOf("?transport=") === -1 &&
				uri.startsWith("turn")
			) {
				newUrls.push(uri + "?" + transport);
			}
		}
		if (newUrls.length !== 0) {
			iceServer.urls = newUrls;
			newIceServers.push(iceServer);
		}
	}
	return newIceServers;
}

function filterTLSConfig(iceServers) {
	var newIceServers = [];
	for (var i = 0; i < iceServers.length; ++i) {
		var iceServer = Object.assign({}, iceServers[i]);
		iceServer.urls = iceServer.urls.filter(function(url) {
			return /443/.test(url);
		});
		iceServer.urls = iceServer.urls.map(function(url) {
			return url.replace("turn:", "turns:");
		});
		if (iceServer.urls.length > 0) {
			newIceServers.push(iceServer);
		}
	}
	if (newIceServers.length === 0) {
		console.error("No TLS TURN urls specified. TLS Not Supported");
	}
	return newIceServers;
}

/* TURN UDP-TCP-TLS Connectivity Test Code End */
