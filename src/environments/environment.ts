export const environment = {
  production: false,
  wsEndpoint: 'ws://http://localhost:8080/socket',
  RTCPeerConfiguration: {
    iceServers: [
      {
        urls: 'stun:stun1.l.google.com:19302'
      }
    ]
  },
  pathUser: 'http:http://localhost:8080//'
};
//wss://09f8-62-83-101-175.ngrok.io/socket
