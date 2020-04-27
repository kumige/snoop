import { Component, OnInit } from '@angular/core';
import { FetchGqlService } from '../services/fetch-gql.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
})
export class HomeComponent implements OnInit {
  questions;

  get uploadsUrl() {
    return "http://localhost:3000/uploads/"
  }

  private query = {
    query: `
    query {
      qWithA(limit: 10, start: 0) {
        id
        Question {
          id
          Sender {
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
          Receiver {
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
          Text
          Favourites
          DateTime {
            date
            time
          }
        }
        Text
        Image
        Giphy
        DateTime {
          date
          time
        }
      }
    }
    `,
  };

  constructor(private api: FetchGqlService) {}

  ngOnInit(): void {
    this.getQs();
  }

  private async getQs() {
    this.questions = await this.api.fetchGraphql(this.query);
    this.questions = this.questions.qWithA;
    console.log(this.questions);

  }
}
