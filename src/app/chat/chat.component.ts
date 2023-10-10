
import { Component, AfterViewInit, ViewChild, ElementRef, SimpleChanges, Output, Input, HostListener } from '@angular/core';
import {MatGridList} from '@angular/material/grid-list';
import { ChatService } from '../service/chat.service';
import { environment } from 'src/environments/environment';
import { NgForm } from '@angular/forms';
import { Message, WebSocketChat } from '../models/message-text';
import { AppDataService } from '../service/app-data.service';
import { WebsocketService } from '../service/websocket.service';
import { ErrorState, Estates } from '../models/types/enumerates';
export const ENV_RTCPeerConfiguration = environment.RTCPeerConfiguration;
const mediaConstraints = {
  audio: true,
  video: {width: 1280, height: 720}
  // video: {width: 1280, height: 720} // 16:9
  // video: {width: 960, height: 540}  // 16:9
  // video: {width: 640, height: 480}  //  4:3
  // video: {width: 160, height: 120}  //  4:3
};

const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements AfterViewInit{
  @ViewChild('local_video') localVideo: ElementRef;
  @ViewChild('received_video') remoteVideo: ElementRef;

  private peerConnection: RTCPeerConnection;
  public message: string;
  private localStream: MediaStream;
  public messages: string[] = [];
  inCall = false;
  localVideoActive = false;



  currentMessage = ''

  loggedInUser: string | null;
  websocket: WebSocket;

  constructor(private chatService: ChatService,    private appDataService: AppDataService,
    private websocketService: WebsocketService) {

      this.loggedInUser = this.appDataService.getData("userName");
      this.websocket = this.websocketService.createNew();
      this.websocket.onopen = (event: Event) => {
        let message: Message = {
          type: Estates.JOINED,
          from: Number(this.appDataService.getData("userId")),
          fromUserName: this.appDataService.getData("userName")!,
          message: '',
          data: null
        }
        this.websocket.send(JSON.stringify(message));
      }
      this.startListening();



     }
  ngOnInit(): void {

}
ngOnDestroy(): void {
    this.chatService.closeWebsocketConnection();

}

sendmessage(wsMessageForm: NgForm) {
  const chatMsg = new WebSocketChat(wsMessageForm.value.user, wsMessageForm.value.message);
  this.chatService.sendWebSocketMessage(chatMsg);
  wsMessageForm.controls['message'].reset();
}
  /*this.createPeerConnection();: Esta línea llama a la función createPeerConnection(), que se
   encarga de crear una instancia de RTCPeerConnection para gestionar la conexión entre tu aplicación y el otro extremo.

this.localStream.getTracks().forEach(...): Esta parte del código recorre todas las pistas (tracks)
de medios de la variable localStream (la secuencia de medios locales) y las agrega a la
 conexión RTCPeerConnection utilizando this.peerConnection.addTrack(track, this.localStream).
 Esto asegura que la conexión esté configurada para enviar la transmisión de audio y video locales al otro extremo de la llamada.

const offer: RTCSessionDescriptionInit = await this.peerConnection.createOffer(offerOptions);:
Aquí, se crea una oferta (offer) utilizando this.peerConnection.createOffer(offerOptions).
Una oferta es una descripción de las capacidades de tu cliente y lo que está dispuesto a recibir
del otro extremo. La oferta se configura con las opciones definidas en offerOptions.

await this.peerConnection.setLocalDescription(offer);: La oferta se establece como la descripción
local de tu cliente utilizando this.peerConnection.setLocalDescription(offer). Esta descripción
se utiliza en la negociación de la llamada.

this.inCall = true;: La variable inCall se establece en true para indicar que la llamada está en progreso.
Esto puede ser útil para controlar la interfaz de usuario y mostrar elementos relacionados con la llamada activa.

this.chatService.sendMessage({type: 'offer', data: offer});: Finalmente, se envía la oferta al otro extremo
 de la llamada a través del servicio de chat. Esto inicia el proceso de negociación entre los clientes para establecer la conexión.
*/
  async call(): Promise<void> {
    this.createPeerConnection();

    // Add the tracks from the local stream to the RTCPeerConnection
    this.localStream.getTracks().forEach(
      track => {console.log("6. recorre todas las pistas de medios de localstream y las agrega a la conexión", track);this.peerConnection.addTrack(track, this.localStream);}
    );

    try {
      console.log("7. Crea la oferta ", offerOptions)
      const offer: RTCSessionDescriptionInit = await this.peerConnection.createOffer(offerOptions);
      // Establish the offer as the local peer's current description.
      console.log("8. la oferta la añade al descriptor local")
      await this.peerConnection.setLocalDescription(offer);

      this.inCall = true;
      console.log("9, se envía el mensaje {type: 'offer', data: offer}")
      this.chatService.sendMessage({type:Estates.OFFER, message: '', fromUserName:'', from: null, data:offer});
    } catch (err) {
      this.handleGetUserMediaError(err);
    }
  }

  /*this.chatService.sendMessage({type: 'hangup', data: ''});: Esta línea de código
  envía un mensaje al otro extremo de la comunicación a través del servicio de chat
   (chatService). El mensaje tiene un tipo 'hangup', que indica que se está solicitando
   la finalización de la llamada, y los datos están vacíos ('') en este caso. La idea es
    informar al otro usuario que deseas colgar o finalizar la llamada.

this.closeVideoCall();: Luego de enviar el mensaje de finalización de la llamada, se
llama a la función closeVideoCall(). Esta función se encarga de realizar todas las acciones
necesarias para cerrar adecuadamente la llamada de video/audio, como liberar recursos,
 detener las pistas de medios y cerrar la conexión RTCPeerConnection. En esencia,
 closeVideoCall() se encarga de realizar la limpieza y finalización de la llamada.
*/

  hangUp(): void {
    this.chatService.sendMessage({type: Estates.HANGUP, message: '', fromUserName:'', from: null , data:null});
    this.closeVideoCall();
  }

  ngAfterViewInit(): void {
   this.addIncominMessageHandler();
   this.requestMediaDevices();
  }

  /*La función addIncominMessageHandler() se encarga de establecer un manejador de mensajes
   entrantes en el contexto de una aplicación de chat de video/audio en tiempo real basada
    en WebRTC. Su objetivo es escuchar y procesar los mensajes recibidos del otro extremo
     de la comunicación a través del servicio de cha
  */
  private addIncominMessageHandler(): void {
    console.log("se comienza la conexión ")
    this.chatService.connect();

    // this.transactions$.subscribe();
    this.chatService.messages$.subscribe(
      msg => {
        // console.log('Received message: ' + msg.type);
        switch (msg.type) {
          case Estates.OFFER:
            console.log("ha llegado en el mesnaje el tipo offer")
            this.handleOfferMessage(msg.data);
            break;
          case Estates.ANSWER:
            console.log("ha llegado en el mesnaje el tipo answer")
            this.handleAnswerMessage(msg.data);
            break;
          case Estates.HANGUP:
            console.log("ha llegado en el mesnaje el tipo hangup")
            this.handleHangupMessage(msg);
            break;
          case Estates.ICECANDIDATE:
            console.log("ha llegado en el mesnaje el tipo ice-candidate")
            this.handleICECandidateMessage(msg.data);
            break;
          case Estates.MESSAGE:
            console.log("mensaje", msg.data);
            this.messages.push(msg.data);
            break;
          default:
            console.log('unknown message of type ' + msg.type);
        }
      },
      error => console.log(error)
    );
  }

  /* ########################  MESSAGE HANDLER  ################################## */
/*Esta función maneja un mensaje de oferta (offer) recibido del otro usuario.
Comienza por imprimir un mensaje en la consola para indicar que se está manejando una oferta entrante.
Verifica si ya existe una conexión RTCPeerConnection (this.peerConnection). Si no existe, se llama a this.createPeerConnection() para crear una nueva instancia.
Si aún no se ha obtenido una transmisión local de video (this.localStream), se llama a this.startLocalVideo() para activar la cámara local.
Luego, configura la descripción remota del par remoto utilizando la oferta recibida (msg) mediante
 this.peerConnection.setRemoteDescription(new RTCSessionDescription(msg)).
Agrega la transmisión de medios local (this.localStream) al elemento de video local
(this.localVideo.nativeElement.srcObject) para mostrar el video local en la interfaz de usuario.
Añade las pistas de medios locales a la conexión remota (this.peerConnection.addTrack(track, this.localStream)) para que sean transmitidas al otro usuario.
Crea una respuesta (answer) a la oferta mediante this.peerConnection.createAnswer() y la establece como la descripción local.
Envía la descripción local (respuesta) al otro usuario a través del servicio de chat
 utilizando this.chatService.sendMessage({type: 'answer', data: this.peerConnection.localDescription}).
Finalmente, establece la variable this.inCall en true para indicar que la llamada está en curso.
*/
  private handleOfferMessage(msg: RTCSessionDescriptionInit): void {
    console.log("si no existe la conexión se crea")
    if (!this.peerConnection) {
      this.createPeerConnection();
    }
    console.log("si no esta activado el video se activa")
    if (!this.localStream) {
      this.startLocalVideo();
    }
    console.log("se sete un nuevo RTCSexxionDescription con el mensaje en la conexion remota")
    this.peerConnection.setRemoteDescription(new RTCSessionDescription(msg))
      .then(() => {

        // add media stream to local video
        console.log("se añade el stream this.localStream al this.localvideo")
        this.localVideo.nativeElement.srcObject = this.localStream;

        // add media tracks to remote connection
        console.log("================================================================================================")
        console.log("se añade el tack de localstream al la conexion peerconnection")
        this.localStream.getTracks().forEach(
          track => {this.peerConnection.addTrack(track, this.localStream);}
        );
        console.log("================================================================================================")
      }).then(() => {

      // Build SDP for answer message
      console.log("se crea la respuesta con el peerConnection")
      return this.peerConnection.createAnswer();

    }).then((answer) => {

      // Set local SDP
       console.log("se añade la respuesta al descriptor local")
      return this.peerConnection.setLocalDescription(answer);

    }).then(() => {

      // Send local SDP to remote party
      console.log("se está enviando desde el servicio sendMessage el type:answer y la data con el peerConnection.localDescription que contiene la respuesta es decir el stream de video local")
      this.chatService.sendMessage({type: Estates.ANSWER, data: this.peerConnection.localDescription, fromUserName:'', from: null, message:''});

      this.inCall = true;

    }).catch(this.handleGetUserMediaError);
  }

  /*Esta función maneja un mensaje de respuesta (answer) recibido del otro usuario.
Imprime un mensaje en la consola para indicar que se está manejando una respuesta entrante.
Configura la descripción remota del par remoto utilizando la respuesta recibida (msg) mediante this.peerConnection.setRemoteDescription(msg).
*/
  private handleAnswerMessage(msg: RTCSessionDescriptionInit): void {
    console.log('aquí recibes la respuesta y lo seteas en peerConnection en el descriptor remoto');
    this.peerConnection.setRemoteDescription(msg);
  }
/*Esta función maneja un mensaje de finalización de llamada (hangup) recibido del otro usuario.
Imprime el mensaje recibido en la consola.
Llama a this.closeVideoCall() para finalizar la llamada de video/audio.
*/
  private handleHangupMessage(msg: Message): void {
    console.log("se corta la llamada, ",msg);
    this.closeVideoCall();
  }
/*Esta función maneja un mensaje de candidato ICE (ICE Candidate) recibido del otro usuario.
Crea una instancia de RTCIceCandidate a partir del mensaje (msg).
Agrega el candidato ICE a la conexión RTCPeerConnection utilizando this.peerConnection.addIceCandidate(candidate).
Si ocurre un error al agregar el candidato ICE, se maneja utilizando this.reportError.
*/
  private handleICECandidateMessage(msg: RTCIceCandidate): void {
    console.log("creaa un nuevo RTCIceCandidate a partir del mensaje que le llega, en este caso es la msg.data")
    const candidate = new RTCIceCandidate(msg);
    console.log("añade al candidato a la peerConnection", candidate)
    this.peerConnection.addIceCandidate(candidate).catch(this.reportError);
  }
/*
La función requestMediaDevices() se encarga de solicitar acceso a los dispositivos multimedia (cámara y micrófono)
del usuario mediante la API getUserMedia() en una aplicación web basada en WebRTC
*/
  public async requestMediaDevices(): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      // pause all tracks
      this.pauseLocalVideo();
    } catch (e) {
      console.error(e);
      alert(`getUserMedia() error: ${e.name}`);
    }
  }

  startLocalVideo(): void {
    console.log('starting local stream');
    this.localStream.getTracks().forEach(track => {
      track.enabled = true;
    });
    this.localVideo.nativeElement.srcObject = this.localStream;

    this.localVideoActive = true;
  }

  pauseLocalVideo(): void {
    console.log('pause local stream');
    this.localStream.getTracks().forEach(track => {
      track.enabled = false;
    });
    this.localVideo.nativeElement.srcObject = undefined;

    this.localVideoActive = false;
  }

  /*this.peerConnection = new RTCPeerConnection(ENV_RTCPeerConfiguration);: Aquí se crea
  una nueva instancia de RTCPeerConnection utilizando la configuración definida en ENV_RTCPeerConfiguration. La variable ENV_RTCPeerConfiguration
  probablemente contiene las opciones y configuraciones necesarias para la conexión, como configuraciones de ICE (Interactive Connectivity Establishment)
   y otros parámetros relacionados con la comunicación en tiempo real.

Asignación de eventos:

this.peerConnection.onicecandidate: Este evento se configura para manejar eventos relacionados con la
generación de candidatos ICE (Interactive Connectivity Establishment). Los candidatos ICE son información utilizada para establecer la conexión entre pares.
this.peerConnection.oniceconnectionstatechange: Este evento se configura para manejar cambios en el
estado de la conexión ICE. Por ejemplo, cuando la conexión se cierra, se desconecta o falla, este
 evento puede capturarlo y tomar medidas en consecuencia.
this.peerConnection.onsignalingstatechange: Este evento se configura para manejar cambios en el
estado de señalización de la conexión. La señalización es el proceso de intercambio de información
de control entre los pares para establecer y gestionar la conexión.
this.peerConnection.ontrack: Este evento se configura para manejar eventos relacionados con las
pistas de medios (audio y video) que se reciben de forma remota. Cuando se recibe una pista de medios,
 este evento se activa y permite manejar la visualización o el procesamiento de la transmisión de video/audio recibida.*/
  private createPeerConnection(): void {
    console.log('creating PeerConnection...');
    this.peerConnection = new RTCPeerConnection(ENV_RTCPeerConfiguration);

    this.peerConnection.onicecandidate = this.handleICECandidateEvent;
    this.peerConnection.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent;
    this.peerConnection.onsignalingstatechange = this.handleSignalingStateChangeEvent;
    this.peerConnection.ontrack = this.handleTrackEvent;
  }

  private closeVideoCall(): void {
    console.log('Closing call');

    if (this.peerConnection) {
      console.log('--> Closing the peer connection');

      this.peerConnection.ontrack = null;
      this.peerConnection.onicecandidate = null;
      this.peerConnection.oniceconnectionstatechange = null;
      this.peerConnection.onsignalingstatechange = null;

      // Stop all transceivers on the connection
      this.peerConnection.getTransceivers().forEach(transceiver => {
        transceiver.stop();
      });

      // Close the peer connection
      this.peerConnection.close();
      this.peerConnection = null;

      this.inCall = false;
    }
  }

  /* ########################  ERROR HANDLER  ################################## */
  private handleGetUserMediaError(e: Error): void {
    switch (e.name) {
      case ErrorState.NOTFOUNDERROR:
        alert('Unable to open your call because no camera and/or microphone were found.');
        break;
      case ErrorState.SECURITYERROR:
      case ErrorState.PERMISSIONDENIEDERROR:
        // Do nothing; this is the same as the user canceling the call.
        break;
      default:
        console.log(e);
        alert('Error opening your camera and/or microphone: ' + e.message);
        break;
    }

    this.closeVideoCall();
  }

  private reportError = (e: Error) => {
    console.log('got Error: ' + e.name);
    console.log(e);
  }

  /* ########################  EVENT HANDLER  ################################## */
  /*Esta función maneja el evento onicecandidate de la conexión RTCPeerConnection.
Cuando se genera un candidato ICE (Interactive Connectivity Establishment), se activa
este evento. Los candidatos ICE son información utilizada para establecer la conexión entre pares.
La función verifica si event.candidate contiene un candidato válido y, si es así, lo envía al otro
 extremo a través del servicio de chat. Esto es importante para que los dispositivos puedan intercambiar información necesaria para establecer la conexión.*/
  private handleICECandidateEvent = (event: RTCPeerConnectionIceEvent) => {
    console.log("1  se genera un candidato", event);
    if (event.candidate) {
      console.log("se envía el type ice-candidate con el data del tipo RTCPerrConnectionIceEvent", event.candidate )
      this.chatService.sendMessage({
        type: Estates.ICECANDIDATE,
        data: event.candidate,
        fromUserName:'',
        from: null,
        message:''
      });
    }
  }
/*Controla los cambios en el estado de la conexión ICE (Interactive Connectivity Establishment). Esto incluye estados como 'closed', 'failed' y 'disconnected'.
Cuando la conexión ICE se cierra, falla o se desconecta, se llama a this.closeVideoCall() para finalizar la llamada de video/audio.
*/
  private handleICEConnectionStateChangeEvent = (event: Event) => {
    console.log("2 está habiendo un cambio de estado ", event);
    switch (this.peerConnection.iceConnectionState) {
      case 'closed':
      case 'failed':
      case 'disconnected':
        this.closeVideoCall();
        break;
    }
  }
/*Controla los cambios en el estado de señalización de la conexión. Un estado importante es 'closed'.
Cuando la señalización se cierra, se llama a this.closeVideoCall() para finalizar la llamada.
*/
  private handleSignalingStateChangeEvent = (event: Event) => {
    console.log("3 cambios de estado en la señalización ", event);
    switch (this.peerConnection.signalingState) {
      case 'closed':
        this.closeVideoCall();
        break;
    }
  }
/*Esta función maneja el evento ontrack de la conexión RTCPeerConnection.
Se utiliza para manejar eventos relacionados con las pistas de medios (audio y video) que se reciben de forma remota.
La función asigna el flujo de medios (stream) recibido a un elemento HTML (generalmente un elemento de video) para mostrar el video
 transmitido por el otro usuario en la interfaz de usuario.
*/
  private handleTrackEvent = (event: RTCTrackEvent) => {
    console.log("5. se asigna el flujo remoto a la etiqueta video ", event);
    this.remoteVideo.nativeElement.srcObject = event.streams[0];
  }


  startListening() {
    this.websocket.onmessage = (event: MessageEvent) => {
      console.log("llega mensaje")
      this.currentMessage = event.data;
    };
  }

  sendMessage(msg: string) {
    if (msg == '' || msg == undefined) return;
    this.websocket.send(msg);
  }

  private doLogout() {

  }

  recieveMessage(message: string) {
    this.sendMessage(message)
  }

  @HostListener('window:beforeunload')
  close() {
    let message: Message = {
      type: Estates.LEFT,
      from: Number(this.appDataService.getData("userId")),
      fromUserName: this.appDataService.getData("userName")!,
      message: '',
      data:null,
    }
    this.websocket.send(JSON.stringify(message));
  }


}
