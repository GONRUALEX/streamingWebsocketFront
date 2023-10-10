import { Component, SimpleChanges, OnInit, Input } from '@angular/core';
import { User } from '../../models/user';
import { AppService } from 'src/app/service/app.service';
import { Message } from 'src/app/models/message-text';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  @Input()
  inputMessage = ''

  users: User[] = new Array();

  constructor(private appService: AppService) {
    this.initUserList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const chng = changes['inputMessage'];
    let message: Message = JSON.parse(chng.currentValue==""?"{}":chng.currentValue);
    if (message.type == 'JOINED') {
      this.setUserStatus(Number(message.from), true);
    } else if (message.type == 'LEFT') {
      this.setUserStatus(Number(message.from), false);
    }
  }

  initUserList() {
    this.appService.listUser().subscribe(response => {
      this.users = response as User[];
    });
  }

  setUserStatus(userId: Number, isOnline: boolean) {
    let user: User = this.users.find(u => u.id == userId)!;
    user.online = isOnline;
  }

  ngOnInit(): void {
  }


}
