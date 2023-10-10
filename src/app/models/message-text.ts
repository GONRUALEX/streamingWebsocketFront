export class WebSocketChat{
  user: string;
  message: string;

  constructor(user:string, message:string){
    this.user = user;
    this.message = message;
  }
}

export interface Message {
  type: string;
  from: number;
  fromUserName: string;
  message: any;
  data:any;
}
