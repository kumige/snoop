import { Component, OnInit } from '@angular/core';
import { FetchGqlService } from '../services/fetch-gql.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { customValidator } from '../register/customValidators';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass'],
})
export class SettingsComponent implements OnInit {
  displayNameForm = new FormGroup({
    displayName: new FormControl('', [
      Validators.minLength(3),
      Validators.maxLength(20),
      customValidator.illegalCharacters,
      customValidator.checkForSpaces,
    ]),
  });
  user;
  changeDisplayNToggle = false;
  displayNameResult;

  get userData() {
    return this.user;
  }

  get f_displayName() {
    return this.displayNameForm.controls;
  }

  constructor(private api: FetchGqlService) {}

  ngOnInit(): void {
    this.getUser();
  }

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
  }

  async onSubmitDN() {
    if (this.displayNameForm.valid) {
      await this.changeDisplayName();
      this.getUser();
      this.changeDisplayNToggle = false;
    }
  }

  toggleDisplayName() {
    this.changeDisplayNToggle = !this.changeDisplayNToggle;
  }

  private async changeDisplayName() {
    const query = {
      query: `mutation {
        modifyDisplayName(Displayname:"${this.displayNameForm.controls.displayName.value}") {
          Displayname,id
        }
      }
      `,
    };

    try {
      this.displayNameResult = await this.api.fetchGraphql(query);
      console.log(this.displayNameResult);
    } catch (e) {
      console.log('error', e.message);
    }
  }
}
