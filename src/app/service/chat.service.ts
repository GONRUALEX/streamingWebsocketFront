import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import { Message, WebSocketChat } from '../models/message-text';

export const WS_ENDPOINT = environment.wsEndpoint;
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket$: WebSocketSubject<any>;
  websocketMessage: WebSocketChat[] = [];
  private messagesSubject = new Subject<Message>();
  public messages$ = this.messagesSubject.asObservable();
  webSocket: WebSocket;
  /**
   * Creates a new WebSocket subject and send it to the messages subject
   * @param cfg if true the observable will be retried.
   */
  public connect(): void {
    console.log('se crea el webSocketSubject ');
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket();
      this.socket$.subscribe(
        // Called whenever there is a message from the server
        (msg) => {
          console.log(
            'Llegada de mensaje del tipo, se reenvia a la vez con el messsageSubject.next: ' +
              msg.type
          );
          this.messagesSubject.next(msg);
        }
      );
    }
  }

  sendMessage(msg: Message): void {
    console.log('sending message: ' + msg.type);
    this.socket$.next(msg);
  }


  /**
   * Return a custom WebSocket subject which reconnects after failure
   *
   * en el caso de que el servidor sea node se debe poner en la configuración
   * deserializer:({data})=>{
        const UTF8 = new TextDecoder('utf-8');
        const msg=JSON.parse(UTF8.decode(data));
        return msg;
      },
      binaryTYpe:'arraybuffer'
   */
  private getNewWebSocket(): WebSocketSubject<any> {
    console.log('se añade la configuración del websocket');
    return webSocket({
      url: WS_ENDPOINT,
      binaryType: 'blob',
      openObserver: {
        next: () => {
          console.log('[DataService]: connection ok');
        },
      },
      closeObserver: {
        next: () => {
          console.log('[DataService]: connection closed');
          this.socket$ = undefined;
          this.connect();
        },
      },
    });
  }

  sendWebSocketMessage(chatMsg: WebSocketChat) {
    this.webSocket.send(JSON.stringify(chatMsg));
  }

  closeWebsocketConnection() {
    this.webSocket.close();
  }
}
