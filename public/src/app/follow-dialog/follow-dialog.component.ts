import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { FetchGqlService } from '../services/fetch-gql.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-follow-dialog',
  templateUrl: './follow-dialog.component.html',
  styleUrls: ['./follow-dialog.component.sass'],
})
export class FollowDialogComponent implements OnInit {
  users;
  loggedInUser;

  get uploadsUrl() {
    return environment.uploadUrl;
  }

  constructor(
    public dialogRef: MatDialogRef<FollowDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: FetchGqlService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log(this.data);
    this.loggedInUser = this.data.loggedInUser;
    this.getFollows(this.data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  async getFollows(data) {
    // data.queryName should be either 'following' or 'followers'
    const query = {
      query: `
      query{
        ${data.queryName}(id: "${data.user.id}"){
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
      }
      `,
    };
    const res = await this.api.fetchGraphql(query);
    if(data.queryName == "following") {
      this.users = res.following;

    } else if(data.queryName == "followers") {
      this.users = res.followers;
    }

    if (this.loggedInUser != null) {
      this.users.forEach((user) => {

        if (user.ProfileInfo.Followers.includes(this.loggedInUser.id)) {
          this.loadInitialFollows(user.ProfileInfo.UserID);
        }
      });
    }
  }

  async followUser(user) {
    const query = {
      query: `
      mutation{
        followUser(UserToFollow: "${user.id}"){
          id
          UserID
        }
      }
      `,
    };
    this.tFollowButton(user.ProfileInfo.UserID);

    const res = await this.api.fetchGraphql(query);
    console.log(res);
  }

  async unfollowUser(user) {
    const query = {
      query: `
      mutation{
        unfollowUser(UserToUnfollow: "${user.id}"){
          id
          UserID
        }
      }
      `,
    };
    this.tFollowButton(user.ProfileInfo.UserID);

    const res = await this.api.fetchGraphql(query);
  }

  redirectToUser(username) {
    this.dialogRef.close();
    this.router.navigate([`./user/${username}`]);
  }

  loadInitialFollows(followID) {
    this.waitForElementToAppear(followID).subscribe(() => {
      const followingButton = document.getElementById(`following${followID}`);
      const followButton = document.getElementById(`follow${followID}`);

      if (followButton != null) {
        if (followButton.style.display == 'flex') {
          followButton.style.display = 'flex';
          followingButton.style.display = 'none';
        } else {
          followButton.style.display = 'none';
          followingButton.style.display = 'flex';
        }
      }
    });
  }

  tFollowButton(followID) {
    this.waitForElementToAppear(followID).subscribe(() => {
      const followingButton = document.getElementById(`following${followID}`);
      const followButton = document.getElementById(`follow${followID}`);

      if (followButton != null) {
        if (followButton.style.display == 'flex') {
          followButton.style.display = 'none';
          followingButton.style.display = 'flex';
        } else if (followButton.style.display == '') {
          followButton.style.display = 'none';
          followingButton.style.display = 'flex';
        } else {
          followButton.style.display = 'flex';
          followingButton.style.display = 'none';
        }
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
