import { Component, OnInit } from '@angular/core';
import { FetchGqlService } from '../services/fetch-gql.service';
import { Router } from '@angular/router';
import { GetAuthUserService } from '../services/get-auth-user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.sass'],
})
export class ProfileCardComponent implements OnInit {
  user;
  loggedInUser;

  get userData() {
    return this.user;
  }

  get uploadsUrl() {
    return environment.uploadUrl;
  }

  constructor(
    private api: FetchGqlService,
    private router: Router,
    private auth: GetAuthUserService
  ) {
  }

  ngOnInit(): void {
    this.auth.getLoggedInUser().then(userData => {
      this.loggedInUser = userData
      if(this.loggedInUser != null) {
      this.getProfileInfo();

      }

    })
  }

  async getProfileInfo() {
    const query = {
      query: `
      query{
        userById(id: "${this.loggedInUser.id}"){
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
    this.user = await this.api.fetchGraphql(query);
    this.user = this.user.userById;
  }

  redirectToUser(event) {
    this.router.navigate([`../user/${event.target.id}`]);
  }
}
