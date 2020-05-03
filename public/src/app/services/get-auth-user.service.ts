import { Injectable} from '@angular/core';
import { FetchGqlService } from './fetch-gql.service';

@Injectable({
  providedIn: 'root'
})
export class GetAuthUserService {
  loggedInUser
  constructor(private api: FetchGqlService) { }

  async getLoggedInUser() {
    const query = {
      query: `
      query{
        userCheck{
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
    this.loggedInUser = await this.api.fetchGraphql(query);
    this.loggedInUser = this.loggedInUser.userCheck
    return this.loggedInUser
  }
}
