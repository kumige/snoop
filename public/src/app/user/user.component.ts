import { Component, OnInit, AfterViewInit } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from '../image-dialog/image-dialog.component';
import { Observable } from 'rxjs';
import { GetAuthUserService } from '../services/get-auth-user.service';
import { environment } from 'src/environments/environment';

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
  loggedInUser;

  get uploadsUrl() {
    return environment.uploadUrl;
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
    private router: Router,
    public dialog: MatDialog,
    private auth: GetAuthUserService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.username = params.username;
      
    });
    this.auth.getLoggedInUser().then(user => {
      console.log(user)
      this.loggedInUser = user
      this.getUserData();
    })
  }

  redirectToUser(event) {
    this.router.navigate([`./user/${event.target.id}`]);
  }

  redirectToFavourites(event) {
    this.router.navigate([`./favourites/${event.target.id}`]);
  }

  async getUserData() {
    const query = {
      query: `
      query{
        userByUsername(username: "${this.username}"){
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
          LastLogin
        }
      }
    `,
    };
    this.userData = await this.api.fetchGraphql(query);
    this.userData = this.userData.userByUsername;

    this.userData.ProfileInfo.Followers.forEach((userID) => {
      if(this.loggedInUser != null) {
        if (userID == this.loggedInUser.id) {
          this.toggleFollowButton();
        }
      }
      
    });

    this.loadAnswers();
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
    this.formControl.reset();
    this.formControl.markAsPristine();
    this.formControl.markAsUntouched();
    this.formControl.updateValueAndValidity();

    const query = {
      query: `
      mutation{
        addQuestion(Receiver: "${this.userData.id}", Text: "${question}"){ 
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
    console.log(qInfo)
    if (qInfo.addQuestion != null) {
      this.snackBar.open('Question Sent!', 'Close', {
        duration: 3000,
      });
    } else {
      this.snackBar.open('Please log in to send a question.', 'Close', {
        duration: 3000,
      });
    }
  }

  openDialog(img) {
    this.dialog.open(ImageDialogComponent, {
      data: img,
    });
  }

  async deleteAnswer(i) {
    const query = {
      query: `
      mutation{
        deleteAnswer(id: "${this.answers[i].Answer.id}"){
          id
        }
      }
      `,
    };

    const res = await this.api.fetchGraphql(query);
    if (res.deleteAnswer != null) {
      this.answers.splice(i, 1);
    }
  }

  async followUser() {
    console.log(this.userData.id)
    const query = {
      query: `
      mutation{
        followUser(UserToFollow: "${this.userData.id}"){
          id
          UserID
        }
      }
      `,
    };
    this.toggleFollowButton();

    const res = await this.api.fetchGraphql(query);
    console.log(res)
    if (res != undefined) {
    }
  }

  async unfollowUser() {
    const query = {
      query: `
      mutation{
        unfollowUser(UserToUnfollow: "${this.userData.id}"){
          id
          UserID
        }
      }
      `,
    };
    this.toggleFollowButton();

    await this.api.fetchGraphql(query);
  }

  toggleFollowButton() {
    this.waitForElementToAppear('followButton').subscribe((followButton) => {
      const followingButton = document.getElementById('followingButton');

      if (followButton.style.display == 'flex') {
        followButton.style.display = 'none';
        followingButton.style.display = 'flex';
      } else {
        followButton.style.display = 'flex';
        followingButton.style.display = 'none';
      }
    });
  }

  waitForElementToAppear(elementId) {
    return Observable.create(function (observer) {
      var el_ref;
      var f = () => {
        el_ref = document.getElementById(elementId);
        if (el_ref) {
          observer.next(el_ref);
          observer.complete();
          return;
        }
        window.requestAnimationFrame(f);
      };
      f();
    });
  }
}
