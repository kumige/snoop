import { Component, OnInit } from '@angular/core';
import { FetchGqlService } from '../services/fetch-gql.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.sass']
})
export class ProfileCardComponent implements OnInit {
  user

  get userData() {
    return this.user
  }

  get uploadsUrl() {
    return 'http://localhost:3000/uploads/';
  }

  constructor(private api: FetchGqlService, private router: Router) { }

  ngOnInit(): void {
    this.getProfileInfo()
  }

  async getProfileInfo() { // TODO: Change query to logged in user
    const query = {
      query: 
      `
      query{
        userByUsername(username: "mikko"){
          id
          Username
          Displayname
          ProfileInfo {
            id
            Bio
            ProfilePicture
            Following
            Followers
            Favourites
            AnsweredQuestionCount
          } 
        }
      }
      `
    }
    this.user = await this.api.fetchGraphql(query);
    this.user = this.user.userByUsername;
    console.log(this.user);
  }

  redirectToUser(event) {
    console.log(event)
    this.router.navigate([`../user/${event.target.id}`]);
  }

}
