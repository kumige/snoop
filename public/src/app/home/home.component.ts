import {
  Component,
  Inject,
  ViewChild,
  ViewContainerRef,
  OnInit,
} from '@angular/core';
import { FetchGqlService } from '../services/fetch-gql.service';
import { Router } from '@angular/router';
import { DynamicLoaderService } from '../services/dynamic-loader.service';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from '../image-dialog/image-dialog.component';
import { GetAuthUserService } from '../services/get-auth-user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
})
export class HomeComponent implements OnInit {
  questions = [];
  loaderService;
  loggedInUser;

  get uploadsUrl() {
    return environment.uploadUrl;
  }

  @ViewChild('dynamic', {
    read: ViewContainerRef,
  })
  viewContainerRef: ViewContainerRef;

  constructor(
    private api: FetchGqlService,
    private router: Router,
    @Inject(DynamicLoaderService) service,
    public dialog: MatDialog,
    private auth: GetAuthUserService,
  ) {
    this.loaderService = service;
  }

  ngOnInit(): void {
    this.auth.getLoggedInUser().then(user => {
      this.loggedInUser = user

      // Check if the user is logged in
      if (this.loggedInUser != null) {
        
        // Load side profile card
        this.loaderService.setRootViewContainerRef(this.viewContainerRef);
        this.loaderService.addDynamicComponent();

        // If user has followed people, change the home page feed to followed people posts
        if(this.loggedInUser.ProfileInfo.Following.length > 0){
          this.getFollowingQs(0);
        } else {
          this.getQs(0);
        }

      } else {
        this.getQs(0);
      }
    })
  }

  redirectToUser(event) {
    console.log(event.target);
    this.router.navigate([`./user/${event.target.id}`]);
  }

  openDialog(img) {
    this.dialog.open(ImageDialogComponent, {
      data: img
    });
  }

  private async getQs(start) {
    const query = {
      query: `
      query{
        qWithA(limit: 10, start: ${start}){
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
    const res = await this.api.fetchGraphql(query);
    res.qWithA.forEach(element => {
      this.questions.push(element)
    });
    console.log(this.questions)
  }

  private async getFollowingQs(start) {
    const query = {
      query: `
      query{
        qWithAFollowing(UserID: "${this.loggedInUser.id}", limit: 10, start: ${start}){
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

    const res = await this.api.fetchGraphql(query);
    res.qWithAFollowing.forEach(element => {
      this.questions.push(element)
    });

  }

  loadMore() {
    const answerCount = document.getElementsByClassName("qWithA").length
    if(this.loggedInUser) {
      if(this.loggedInUser.ProfileInfo.Following.length > 0){
        this.getFollowingQs(answerCount);
      } else {
        this.getQs(answerCount);
      }
    } else {
      this.getQs(answerCount);
    }
    
  }

  async addFavourite(q, index) {
    const query = {
      query: 
      `
      mutation{
        addFavourite(QuestionID: "${q.id}"){
          id
          Text
          Favourites
        }
      }
      `
    }
    const res = await this.api.fetchGraphql(query)
    console.log(res)

    if(res.addFavourite != null) {
      this.toggleStar(index)
    }
    
  }

  async removeFavourite(q, index) {
    const query = {
      query: 
      `
      mutation{
        removeFavourite(QuestionID: "${q.id}"){
          id
          Text
          Favourites
        }
      }
      `
    }
    const res = await this.api.fetchGraphql(query)
    console.log(res)

    if(res.removeFavourite != null) {
      this.toggleStar(index)
    }
  }

  toggleStar(index) {
    const favArray = this.questions[index].Favourites
    if(favArray.includes(this.loggedInUser.id)) {
      const i = favArray.indexOf(this.loggedInUser.id)
      favArray.splice(i, 1)
    } else {
      favArray.push(this.loggedInUser.id)
    }
  }
}
