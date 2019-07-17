const iceServers = [];
/* 
    Add URLs in below format
    {
		username: "abcd",
		credential: "password",
		urls: ["turn:abcd.com:80", "turns:abcd.com:443"]
    }
*/

var PACKET_LOSS_THRESHOLD = 4; //In %
var AVERAGE_BITRATE_THRESHOLD = 1000; //In kbps
var RTT_THRESHOLD = 300; // In milliseconds

var VIDEO_TEST_DURATION_MS = 10000;
var THROUGHPUT_TEST_DURATION_MS = 5000;
