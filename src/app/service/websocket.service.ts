import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const WEBSOCKET_URL = 'ws://localhost:8080/socket';
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  websocket!: WebSocket;
  constructor() { }

  createNew(): WebSocket {
    this.websocket = new WebSocket(environment.wsEndpoint);
    return this.websocket;
  }
}
