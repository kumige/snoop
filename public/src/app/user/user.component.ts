import { Component, OnInit } from '@angular/core';
import { FetchGqlService } from '../services/fetch-gql.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.sass'],
})
export class UserComponent implements OnInit {
  username;
  userData;
  ProfileInfo;
  answers;

  get uploadsUrl() {
    return 'http://localhost:3000/uploads/';
  }

  get user() {
    return this.userData;
  }

  get profileInfo() {
    return {
      followingCount: this.userData.ProfileInfo.Following.length,
      followerCount: this.userData.ProfileInfo.Followers.length,
      favouriteCount: this.userData.ProfileInfo.Favourites.length,
    };
  }

  formControl = new FormControl('', [Validators.required, Validators.email]);

  matcher = new MyErrorStateMatcher();

  constructor(
    private api: FetchGqlService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.username = params.username;
      this.getUserData();
    });
  }

  redirectToUser(event) {
    this.router.navigate([`./user/${event.target.id}`])
  }

  async getUserData() {
    const query = {
      query: `
    query{
      userByUsername(username: "${this.username}"){
        id
        token
        Email
        Username
        Displayname
        ProfileInfo {
          id
          UserID
          Bio
          ProfilePicture
          Following
          Followers
          Favourites
          AnsweredQuestionCount
        }
        LastLogin
      }
    }
    `,
    };
    this.userData = await this.api.fetchGraphql(query);
    this.userData = this.userData.userByUsername;
    this.loadAnswers(); // TODO: change query to work with username so it doesn't have to wait for the query above to complete
    console.log(this.userData);
  }

  async loadAnswers() {
    const query = {
      query: `
      query {
        qWithAOfUser(UserID: "${this.userData.id}") {
          id
          Sender {
            id
            Username
            Displayname
            ProfileInfo {
              id
              UserID
              Bio
              ProfilePicture
              Following
              Followers
              Favourites
              AnsweredQuestionCount
            }
          }
          Receiver {
            id
            Username
            Displayname
            ProfileInfo {
              id
              UserID
              Bio
              ProfilePicture
              Following
              Followers
              Favourites
              AnsweredQuestionCount
            }
          }
          Text
          Favourites
          DateTime {
            date
            time
          }
          Answer {
            id
            Text
            Image
            Giphy
            DateTime {
              date
              time
            }
          }
        }
      }
    `,
    };
    this.answers = await this.api.fetchGraphql(query);
    this.answers = this.answers.qWithAOfUser;
  }

  async sendQuestion(event) {
    const question = event.target.question.value;
    console.log(event.target);
    this.formControl.reset();
    this.formControl.markAsPristine();
    this.formControl.markAsUntouched();
    this.formControl.updateValueAndValidity();

    // TODO: REPLACE SENDER WITH LOGGED IN USER
    const query = {
      query: `
      mutation{
        addQuestion(Sender: "5ea53bd3b6b8370d781a4595", Receiver: "${this.userData.id}", Text: "${question}"){ 
          id
          Text
          DateTime {
            date
            time
          } 
        }
      }
      `,
    };

    const qInfo = await this.api.fetchGraphql(query);
    if (qInfo != undefined) {
      let snackBarRef = this.snackBar.open('Question Sent!', 'Close', {
        duration: 3000,
      });
    }
  }
}
