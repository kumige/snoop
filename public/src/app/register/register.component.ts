import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import { FetchGqlService } from '../services/fetch-gql.service';
import { customValidator } from './customValidators';

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
      Validators.maxLength(30),
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

  constructor(private api: FetchGqlService) {}

  ngOnInit(): void {}

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
        if(this.takenDisplayname == false || this.takenUsername == false){
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
        //TODO redirect
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
}
