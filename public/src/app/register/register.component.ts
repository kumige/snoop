import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FetchGqlService } from '../services/fetch-gql.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.sass'],
})
export class RegisterComponent implements OnInit {
  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    displayName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    rePassword: new FormControl('', [Validators.required]),
  });
  submitted = false;
  registerResult;

  constructor(private api: FetchGqlService) {}

  ngOnInit(): void {}

  get f_register() {
    return this.registerForm.controls;
  }

  onSubmit() {
    console.log('Submitting registering');
    console.log(this.registerForm.controls);
    this.register();
  }

  private async register() {
    const query = {
      query: `mutation {
        registerUser(Username: "${this.registerForm.controls.username.value}", Displayname: "${this.registerForm.controls.displayName.value}", Email: "${this.registerForm.controls.email.value}", Password: "${this.registerForm.controls.password.value}") {
          id
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
