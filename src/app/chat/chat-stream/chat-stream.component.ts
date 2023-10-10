import { Component, Output, Input, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { Message } from 'src/app/models/message-text';
import { AppDataService } from 'src/app/service/app-data.service';
import { WebsocketService } from 'src/app/service/websocket.service';

@Component({
  selector: 'app-chat-stream',
  templateUrl: './chat-stream.component.html',
  styleUrls: ['./chat-stream.component.scss']
})
export class ChatStreamComponent implements OnChanges{
  @Input()
  inputMessage = ''

  @Output()
  outputMessage = new EventEmitter<string>();

  messageText: string = '';
  publishedMessage: Message[] = new Array();
  showTypingIndicator: boolean = false;
  typingUser: string = '';
  loggedinUserId: number;

  constructor(private appDataService: AppDataService,
              private websocketService: WebsocketService) {
    this.loggedinUserId = Number(this.appDataService.getData("userId"));
  }

  sendTypeIndicator() {
    let msg = this.messageText;
    let message: Message = {
      type: 'TYPING',
      from: Number(this.appDataService.getData("userId")),
      fromUserName: this.appDataService.getData("userName")!,
      message: msg,
      data:null
    }
    this.outputMessage.emit(JSON.stringify(message));
  }

  sendMessage() {
    let msg = this.messageText;
    if (msg == '' || msg == undefined) return;

    let message: Message= {
      type: 'MESSAGE',
      from: Number(this.appDataService.getData("userId")),
      fromUserName: this.appDataService.getData("userName")!,
      message: msg,
      data: null,
    }
    this.outputMessage.emit(JSON.stringify(message));
    this.messageText = '';
  }

  showUserTypingIndicator(userName: string) {
    this.typingUser = userName;
    this.showTypingIndicator = true;
    setTimeout(() => {
      this.hideUserTypingIndicator();
    }, 1000);
  }

  hideUserTypingIndicator() {
    if (this.showTypingIndicator) {
      this.showTypingIndicator = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("changes", changes)
      const chng = changes['inputMessage'];
      console.log(chng.currentValue, "kdkk")
      let message: Message = JSON.parse(chng.currentValue==""?"{}":chng.currentValue);
      if (message.type == 'MESSAGE') {
        this.publishedMessage.push(message);
      } else if (message.type == 'TYPING') {
        if (message.from != this.loggedinUserId) {
          this.showUserTypingIndicator(message.fromUserName);
        }
      }
  }

  ngOnInit(): void {
  }
}
