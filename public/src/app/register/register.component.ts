import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import { FetchGqlService } from '../services/fetch-gql.service';
import { customValidator } from './customValidators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.sass'],
})
export class RegisterComponent implements OnInit {
  registerForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(20),
      customValidator.illegalCharacters,
      customValidator.checkForSpaces,
    ]),
    displayName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
      customValidator.illegalCharacters,
      customValidator.checkForSpaces,
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(80),
      customValidator.checkForSpaces,
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(20),
    ]),
    rePassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(20),
    ]),
  });
  // Form submitted boolean
  submitted = false;
  //Register result
  registerResult;
  // Error booleans
  unexpectedError = false;
  takenDisplayname = false;
  takenUsername = false;
  // Current user
  user;

  constructor(private api: FetchGqlService, private router: Router) {}

  ngOnInit(): void {
    this.getUser();
  }

  get f_register() {
    return this.registerForm.controls;
  }

  // prettier-ignore
  // Submits register form
  async onSubmit() {
    console.log(this.registerForm.errors)
    this.submitted = true;
    console.log('Submitting registering ' + this.registerForm.valid);
    console.log(this.registerForm.controls);
    await this.displaynameCheck()
    await this.usernameCheck()
    if (this.registerForm.controls.password.value === this.registerForm.controls.rePassword.value) {
      if (this.registerForm.valid) {
        if(this.takenDisplayname == false && this.takenUsername == false){
        console.log("really submitting")
        this.register();
        } else {
          console.log("display name or username taken")
        }
      }
    } else {
      console.log('Different passwords');
    }
  }

  // Handles registering
  private async register() {
    const query = {
      query: `mutation {
        registerUser(Username: "${this.registerForm.controls.username.value}", Displayname: "${this.registerForm.controls.displayName.value}", Email: "${this.registerForm.controls.email.value}", Password: "${this.registerForm.controls.password.value}") {
          Username
        }
      }
    `,
    };

    try {
      this.registerResult = await this.api.fetchGraphql(query);
      console.log(this.registerResult);
      if (this.registerResult.registerUser == null) {
        this.unexpectedError = true;
        console.log('Unexpected error');
      } else {
        this.unexpectedError = false;
        this.router.navigate(['./login']);
      }
    } catch (e) {
      console.log('Error', e.message);
    }
  }

  private async displaynameCheck() {
    const query = {
      query: `{
        displaynameCheck(Displayname: "${this.registerForm.controls.displayName.value}") {
          Displayname
        }
      }
      `,
    };
    const user = await this.api.fetchGraphql(query);
    console.log(user);
    if (user.displaynameCheck != null) {
      this.takenDisplayname = true;
    } else {
      this.takenDisplayname = false;
    }
  }

  hideDisplaynameError() {
    if (this.takenDisplayname == true) {
      this.takenDisplayname = false;
    }
  }

  private async usernameCheck() {
    const query = {
      query: `{
        usernameCheck(Username: "${this.registerForm.controls.username.value}") {
          Username
        }
      }
      `,
    };
    const user = await this.api.fetchGraphql(query);
    console.log(user);
    if (user.usernameCheck != null) {
      this.takenUsername = true;
    } else {
      this.takenUsername = false;
    }
  }

  hideUsernameError() {
    if (this.takenUsername == true) {
      this.takenUsername = false;
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
