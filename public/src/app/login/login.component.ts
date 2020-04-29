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
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });
  loginResult;
  submitted = false;
  loginError = false;

  constructor(private api: FetchGqlService) {}

  ngOnInit() {}

  // Gets login form's controls
  get f_login() {
    return this.loginForm.controls;
  }

  // Checks if the login input fields are valid and if they are, tries to login
  onSubmit() {
    this.loginError = false;
    this.submitted = true;
    if (
      this.loginForm.controls.username.status == 'INVALID' ||
      this.loginForm.controls.password.status == 'INVALID'
    ) {
      console.log('INVALID');
    } else {
      this.submitted = false;
      this.login();
    }
  }

  // function to handle logging in
  // If successfull, stores token into localstorage and redirects to main page
  // If not successful, gives an error
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
      if (this.loginResult.login == null) {
        console.log('wrong username / password');
        this.loginError = true;
      } else {
        localStorage.setItem('token', this.loginResult.login.token);
        // TODO: REDIRECT
      }
    } catch (e) {
      console.log('error', e.message);
    }
  }
}
