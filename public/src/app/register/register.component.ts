import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import { FetchGqlService } from '../services/fetch-gql.service';

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
    ]),
    displayName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
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

  constructor(private api: FetchGqlService) {}

  ngOnInit(): void {}

  get f_register() {
    return this.registerForm.controls;
  }

  onSubmit() {
    console.log('Submitting registering ' + this.registerForm.valid);
    console.log(this.registerForm.controls);

    if (this.registerForm.valid) {
      this.register();
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
    } catch (e) {
      console.log('Error', e.message);
    }
  }
}
