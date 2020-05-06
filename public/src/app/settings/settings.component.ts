import { Component, OnInit } from '@angular/core';
import { FetchGqlService } from '../services/fetch-gql.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { customValidator } from '../register/customValidators';
import { HttpClient } from '@angular/common/http';

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

  pfpForm = new FormGroup({
    file: new FormControl('', [Validators.required]),
    fileSource: new FormControl('', [Validators.required]),
  });

  // Current user
  user;
  // Boolean to check if the user is logged in
  loggedIn = false;
  //Toggles
  changeDisplayNToggle = false;
  changeBioToggle = false;
  changePasswordToggle = false;
  changePfpToggle = false;
  showBlockedToggle = false;
  //Results
  displayNameResult;
  bioResult;
  passwordResult;
  pfpResult;
  //True if display name is taken
  takenDisplayname = false;
  // Blocked users
  blockedUsers;

  gqlUrl = 'http://localhost:3000/graphql';
  options = {
    headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
  };

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
  get f_pfp() {
    return this.pfpForm.controls;
  }

  constructor(private api: FetchGqlService, private http: HttpClient) {}

  ngOnInit(): void {
    this.getUser();
    this.getBlockedUsers();
  }

  // Gets current users data if user is logged in
  private async getUser() {
    const query = {
      query: `{
        userCheck {
          Username,Displayname,Email,ProfileInfo{Bio, ProfilePicture},BlockedUsers
        }
      }`,
    };

    this.user = await this.api.fetchGraphql(query);
    this.user = this.user.userCheck;
    if (this.user == null) {
      this.loggedIn = false;
    } else {
      this.loggedIn = true;
    }
  }

  //------------------------PROFILE PICTURE------------------------

  // Submits pfp
  async onSubmitPfp() {
    if (this.pfpForm.controls.fileSource.value) {
      await this.changePfp();
    }
  }

  // As file changes, sets the file on fileSource
  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.pfpForm.patchValue({
        fileSource: file,
      });
    }
  }

  // Handles pfp changing
  private async changePfp() {
    const operations = {
      query: `mutation($file: upload) {
        modifyProfilePic(ProfilePicture:$file) {
          ProfilePicture
        }
      }
      `,
      variables: {
        file: null,
      },
    };

    const _map = {
      file: ['variables.file'],
    };

    const fd = new FormData();
    fd.append('operations', JSON.stringify(operations));
    fd.append('map', JSON.stringify(_map));
    fd.append(
      'file',
      this.pfpForm.controls.fileSource.value,
      this.pfpForm.controls.fileSource.value.name
    );
    // Posts the pfp change request, sets data into pfpResult and calls for closePfpChange() function
    this.http.post(this.gqlUrl, fd, this.options).subscribe((data) => {
      this.pfpResult = data;
      this.closePfpChange();
    });
  }

  // Function that runs when pfp has changed. Gets updated user info, closes pfp change window and resets pfp change form
  async closePfpChange() {
    await this.getUser();
    this.changePfpToggle = false;
    this.pfpForm.reset();
  }

  //------------------------DISPLAY NAME------------------------

  // Submits display name
  async onSubmitDN() {
    if (this.displayNameForm.valid && this.loggedIn) {
      // prettier-ignore
      // Checks if display name has been changed, if not, closes edit window
      if (this.displayNameForm.controls.displayName.value === this.user.Displayname) {
        this.changeDisplayNToggle = false;
      } else {

        await this.displaynameCheck();

        if(this.takenDisplayname == false){
          console.log('is display name taken: ' + this.takenDisplayname);
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
    if (this.bioForm.valid && this.loggedIn) {
      if (this.bioForm.controls.bio.value !== this.user.ProfileInfo.Bio) {
        await this.changeBio();
        this.getUser();
        this.changeBioToggle = false;
      } else {
        this.changeBioToggle = false;
      }
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
    if (this.passwordForm.valid && this.loggedIn) {
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
          Username
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

  // ------------------------BLOCKED USERS------------------------

  private async getBlockedUsers() {
    const query = {
      query: `{getBlockedUsers{id,Displayname,ProfileInfo{ProfilePicture}}}
      `,
    };

    try {
      this.blockedUsers = await this.api.fetchGraphql(query);
      this.blockedUsers = this.blockedUsers.getBlockedUsers;
      console.log(this.blockedUsers);
    } catch (e) {
      console.log('error', e.message);
    }
  }

  async removeBlock(index) {
    console.log(this.blockedUsers[index].id);
    await this.deleteBlock(this.blockedUsers[index].id);
    this.getBlockedUsers();
  }

  private async deleteBlock(toRemove) {
    const query = {
      query: `mutation {
        removeBlock(BlockedUsers:"${toRemove}"){
          Displayname
        }
      }
      `,
    };

    try {
      const result = await this.api.fetchGraphql(query);
      console.log(result);
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
    this.pfpForm.reset();
  }

  toggleBlocked() {
    this.showBlockedToggle = !this.showBlockedToggle;
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
