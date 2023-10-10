import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { LoginFormComponent } from './login-form/login-form.component';

const routes: Routes =
  [
    {path: '', redirectTo: '/login', pathMatch: 'full'},
    {path: 'login', component: LoginFormComponent},
    {path: 'chat', component: ChatComponent}
  ];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
