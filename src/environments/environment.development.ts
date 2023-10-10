export const environment = {
  production: true,
  wsEndpoint: 'ws://localhost:8080/socket',
  RTCPeerConfiguration: {
    iceServers: [
      {
        urls: 'turn:turnserver:3478',
        username: 'user',
        credential: 'password'
      }
    ]
  },
  pathUser: 'http://localhost:8080/'
};
//'wss://09f8-62-83-101-175.ngrok.io/socket',
