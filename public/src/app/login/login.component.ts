import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FetchGqlService } from '../services/fetch-gql.service';
import { Router } from '@angular/router';

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
  // Login result
  loginResult;
  // Boolean for submitting and error for login
  submitted = false;
  loginError = false;
  // Current user
  user;

  constructor(private api: FetchGqlService, private router: Router) {}

  ngOnInit() {
    this.getUser();
  }

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
        this.router.navigate(['./home']);
      }
    } catch (e) {
      console.log('error', e.message);
    }
  }

  // Gets current users data if user is logged in
  private async getUser() {
    const query = {
      query: `{
        userCheck {
          Username,Displayname,Email,ProfileInfo{Bio}
        }
      }`,
    };

    this.user = await this.api.fetchGraphql(query);
    this.user = this.user.userCheck;
    console.log(this.user);
    if (this.user == null) {
    } else {
      this.router.navigate(['./home']);
    }
  }
}
