# WebRTC Precall Test

## Usage
Clone this repo and add iceserver urls in config.js and then simply spin it up in your favourite web server and you are all set!

## Tests In WebRTC Precall
+ Browser WebRTC Support
+ Internet Connectivity
+ UDP TCP TLS Connectivity
+ Throughput
+ Video Bitrate
+ Packet Loss Ratio
+ Average RTT


## Implementation
### Browser WebRTC Support Test
In this test we determine if the browser that the test is being run on has added support for WebRTC or even if it is a browser or not. For now check for Chrome, Safari, Edge, Firefox have been added as they support WebRTC. So the test determines this by analyzing navigator and window objects of browser and checks for the implementation of the following:
- webkitGetUserMedia, webkitRTCPeerConnection(for Chrome, Chromium, Opera) 
- mozGetUserMedia (for Firefox)
- mediaDevices, userAgent (for Edge)
- RTCPeerConnection, userAgent (for Safari)

**Note:** All further tests in the Precall are aborted if this test fails!

### Internet Connectivity Test
In this test  we try to check user’s internet connectivity by analyzing the ICE Candidates. 
To do this we first create a PeerConnection and than we generate an SDP offer for audio only connection just to start gathering candidates. So when ICE candidates are gathered we parse them to check for there type to determine if its a host, srflx or relay. As we are using a TURN server we are supposed to get srflx and relay candidates if connected to the internet before the ICE gathering state changes to complete. So if we get srflx or relay candidate before the ICE gathering state changes to complete the test is aborted and it is determined that the user is connected to Internet. If we only get host candidates than it is concluded that the user is not connected to the Internet.

**Note:** All further tests in the Precall are aborted if this test fails!



### UDP-TCP-TLS Connectivity
In this test we try to determine user’s connectivity options over UDP, TCP and TLS/TCP with the TURN server. 
For TCP/UDP connectivity we filter the ice servers config urls and add transport to query string. We than initiate a loopback call and parse ICE candidates to only use relay candidates and check for connectivity using datachannel connection.
A 5 seconds timeout is added for the connection and the test concludes it as a failure if connection is not established before timeout.

Similarly for TLS connectivity we filter out ICE server urls with 443 port and try to establish a connection and determine if the user supports TLS.

### Throughput Test
In this test we try to estimate the available throughput of network.
For this we send sample packets of 1KByte every 1 millisecond for a specified time interval using a datachannel and then wait for  receiver channel to receive all the packets and then calculate the throughput by dividing bytes received with time elapsed to receive it.

### Video Bitrate Test
In this test we try to determine video bitrate and estimate the quality of call. When doing this we also check for packet loss ratio and average round trip time.
To achieve this we place a loopback call using video only and then fetch stats of the inbound peerconnection  every 100ms for a determined test duration. After fetching the stats we parse the stats to calculate video bitrate, packet loss ratio and average RTT.

**_Average Bitrate_** is calculated by dividing the bits increased between the two subsequent stats and the time elapsed to do so and then these all bits per second are summed up and then divided by the sample of stats to get an average bitrate. 

**_Packet Loss Ratio_** is calculated by parsing the last inbound stat from the stats sample and then dividing packets lost with the sum of packets received and packets lost.
i.e.       
	                `PacketsLost/(PacketsLost+PacketsReceived)`


**_Average Round Trip Time_** is calculated by parsing the last stat’s active candidate-pair from the stats sample. Then we get totalRoundTripTime which is then divided by responsesReceived to get average rtt.
i.e. 
	                `totalRoundTripTime/responsesReceived`

**Note:** This will be only calculated on chrome as it is spec compliant and firefox’s is still working on making their get stats spec compliant.

## Production Behaviour
For this to work in production properly we need to get iceserver urls dynamically to balance the load of turn servers.


## Further Improvements
+ Add support to get TURN urls dynamically
+ Also determine the number of streams the user can support to publish and subscribe with peer to peer and as well as when  using a media server
+ Calculate MOS
