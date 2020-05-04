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
  //Forms
  displayNameForm = new FormGroup({
    displayName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
      customValidator.illegalCharacters,
      customValidator.checkForSpaces,
    ]),
  });

  bioForm = new FormGroup({
    bio: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(250),
      customValidator.illegalCharactersBio,
    ]),
  });

  passwordForm = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(20),
    ]),
    confirmPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(20),
    ]),
  });

  // Current user
  user;
  //Toggles
  changeDisplayNToggle = false;
  changeBioToggle = false;
  changePasswordToggle = false;
  changePfpToggle = false;
  //Results
  displayNameResult;
  bioResult;
  passwordResult;
  //True if display name is taken
  takenDisplayname = false;

  get userData() {
    return this.user;
  }
  get f_displayName() {
    return this.displayNameForm.controls;
  }
  get f_bio() {
    return this.bioForm.controls;
  }
  get f_password() {
    return this.passwordForm.controls;
  }

  constructor(private api: FetchGqlService) {}

  ngOnInit(): void {
    this.getUser();
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
  }

  //------------------------PROFILE PICTURE------------------------

  //------------------------DISPLAY NAME------------------------

  // Submits display name
  async onSubmitDN() {
    if (this.displayNameForm.valid) {
      // prettier-ignore
      // Checks if display name has been changed, if not, closes edit window
      if (this.displayNameForm.controls.displayName.value === this.user.Displayname) {
        this.changeDisplayNToggle = false;
      } else {

        await this.displaynameCheck();

        if(this.takenDisplayname == false){
          console.log('is dp name taken: ' + this.takenDisplayname);
          await this.changeDisplayName();
          this.getUser();
          this.changeDisplayNToggle = false;
        }
      }
    }
  }

  // Handles display name changing
  private async changeDisplayName() {
    const query = {
      query: `mutation {
        modifyDisplayName(Displayname:"${this.displayNameForm.controls.displayName.value}") {
          Displayname
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

  hideDisplaynameError() {
    if (this.takenDisplayname == true) {
      this.takenDisplayname = false;
    }
  }

  // ------------------------BIO------------------------

  // Submits bio
  async onSubmitBio() {
    if (this.bioForm.valid) {
      await this.changeBio();
      this.getUser();
      this.changeBioToggle = false;
    }
  }

  // Handles bio changing
  private async changeBio() {
    const query = {
      query: `mutation {
        modifyBio(Bio:"${this.bioForm.controls.bio.value}") {
          Bio
        }
      }
      `,
    };

    try {
      this.bioResult = await this.api.fetchGraphql(query);
      console.log(this.bioResult);
    } catch (e) {
      console.log('error', e.message);
    }
  }

  //------------------------PASSWORD------------------------

  // Submits password
  onSubmitPassword() {
    if (this.passwordForm.valid) {
      // prettier-ignore
      if (this.passwordForm.controls.password.value === this.passwordForm.controls.confirmPassword.value) {
        this.changePassword();
        this.changePasswordToggle = false;
        this.passwordForm.reset()
      }
    }
  }

  // Handles password changing
  private async changePassword() {
    const query = {
      query: `mutation {
        modifyPassword(Password:"${this.passwordForm.controls.password.value}") {
          id
        }
      }
      `,
    };

    try {
      this.passwordResult = await this.api.fetchGraphql(query);
      console.log(this.passwordResult);
    } catch (e) {
      console.log('error', e.message);
    }
  }

  // ------------------------TOGGLES------------------------
  toggleDisplayName() {
    this.changeDisplayNToggle = !this.changeDisplayNToggle;
    this.takenDisplayname = false;
  }
  toggleBio() {
    this.changeBioToggle = !this.changeBioToggle;
  }
  togglePassword() {
    this.changePasswordToggle = !this.changePasswordToggle;
    this.passwordForm.reset();
  }
  togglePfp() {
    this.changePfpToggle = !this.changePfpToggle;
  }

  // ------------------------HELP FUNCTIONS------------------------

  private async displaynameCheck() {
    const query = {
      query: `{
        displaynameCheck(Displayname: "${this.displayNameForm.controls.displayName.value}") {
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
}
