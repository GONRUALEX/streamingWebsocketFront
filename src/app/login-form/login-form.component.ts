import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../service/app.service';
import { AppDataService } from '../service/app-data.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  loginForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    id: ['', Validators.required]
  });

  constructor(private fb: FormBuilder,
    private router: Router,
    private appService: AppService,
    private appDataService: AppDataService) { }

  onSubmit(): void {
    console.log('Thanks! ' + this.loginForm.controls['name'].value);
   /*this.appService.userLogin({name: this.loginForm.controls['name'].value})
        .subscribe(response => {
          this.appDataService.saveData("userId",response.id);
          this.appDataService.saveData("userName", response.userName);
          this.router.navigate(['/chat']);
        });
  */
  this.appDataService.saveData("userId",this.loginForm.controls['id'].value);
  this.appDataService.saveData("userName", this.loginForm.controls['name'].value);
  this.router.navigate(['/chat']);
}
}
