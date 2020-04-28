import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FetchGqlService } from '../services/fetch-gql.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
})
export class LoginComponent implements OnInit {
  loginForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
  });
  loginResult;

  constructor(private api: FetchGqlService) {}

  ngOnInit() {}

  onSubmit() {
    this.login();
    console.log(this.loginForm.controls.password.value);
  }

  private async login() {
    const query = {
      query: `query {login(username:"${this.loginForm.controls.username.value}", password:"${this.loginForm.controls.password.value}"){
        Username,
        token
      }}
      `,
    };

    try {
      this.loginResult = await this.api.fetchGraphql(query);
      console.log(this.loginResult);
      localStorage.setItem('token', this.loginResult.login.token);
    } catch (e) {
      console.log('error', e.message);
    }
  }
}
