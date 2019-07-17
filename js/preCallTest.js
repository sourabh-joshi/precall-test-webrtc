
//Will be used to run tests synchronously 
function runTest(test) {
	try {
		console.debug('Test "' + test.name + '" started...');
		test.run(function done(abortTests) {
			console.debug('Test "' + test.name + '" ended');
			if (!abortTests) {
				nextInQueue();
			} else {
				console.error("Tests Aborted!");
				reInitialize();
			}
		});
	} catch (e) {
		console.error('Could not run test "' + test.name + ": " + e);
	}
}

function nextInQueue() {
	if (queue.length) {
		runTest(queue.shift());
		return;
	}
	reInitialize();
	console.info("Finished running all tests!");
}
var queue = [
	webRTCSupportTest,
	internetConnectivityTest,
	udpConnectivityTest,
	tcpConnectivityTest,
	tlsConnectivityTest,
	throughputTest,
	videoBitrateTest
];

var btnStart = document.getElementById("startTest");
btnStart.addEventListener("click", function() {
    btnStart.disabled = true;
    ConsoleLogHTML.connect(
        document.getElementById("myULContainer"),
        {},
        true,
        true,
        false
    );
    //connect(target, options, includeTimestamp, logToConsole, appendAtBottom
	console.clear();
	nextInQueue();
});

function reInitialize() {
	btnStart.innerHTML = "Restart Test";
	btnStart.disabled = false;
	queue = [
		webRTCSupportTest,
		internetConnectivityTest,
		udpConnectivityTest,
		tcpConnectivityTest,
		tlsConnectivityTest,
		throughputTest,
		videoBitrateTest
    ];
    ConsoleLogHTML.disconnect();
}
