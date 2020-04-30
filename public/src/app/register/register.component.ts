import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import { FetchGqlService } from '../services/fetch-gql.service';
import { checkCharacters } from './customValidators';

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
      checkCharacters.illegalCharacters,
    ]),
    displayName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      checkCharacters.illegalCharacters,
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    rePassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });
  submitted = false;
  registerResult;
  unexpectedError = false;

  constructor(private api: FetchGqlService) {}

  ngOnInit(): void {}

  get f_register() {
    return this.registerForm.controls;
  }

  // prettier-ignore
  onSubmit() {
    this.submitted = true;
    console.log('Submitting registering ' + this.registerForm.valid);
    console.log(this.registerForm.controls);
    if (this.registerForm.controls.password.value === this.registerForm.controls.rePassword.value) {
      if (this.registerForm.valid) {
        this.register();
      }
    } else {
      console.log('Different passwords');
    }
  }

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
}
