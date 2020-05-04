import {
  Component,
  Inject,
  ViewChild,
  ViewContainerRef,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { FetchGqlService } from '../services/fetch-gql.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from '../image-dialog/image-dialog.component';
import { GetAuthUserService } from '../services/get-auth-user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.sass']
})
export class FavouritesComponent implements OnInit {

  questions;
  loaderService;
  loggedInUser;
  username;

  get uploadsUrl() {
    return 'http://localhost:3000/uploads/';
  }

  @ViewChild('dynamic', {
    read: ViewContainerRef,
  })
  viewContainerRef: ViewContainerRef;

  constructor(
    private api: FetchGqlService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private auth: GetAuthUserService,
    private snackBar: MatSnackBar,
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.username = params.username;
      
    });

    this.auth.getLoggedInUser().then(user => {
      this.loggedInUser = user
      if (this.loggedInUser != null) {
        this.getQs();
      } else {
        this.snackBar.open('You must be logged in to access that page.', 'Close', {
          duration: 5000,
        });
        this.router.navigate([`./home`]);

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

  private async getQs() {
    const query = {
      query: `
      query{
        favouriteAnswers(Username: "${this.username}"){
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

    this.questions = await this.api.fetchGraphql(query);
    console.log(this.questions)

    this.questions = this.questions.favouriteAnswers;
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
    console.log(favArray)
    if(favArray.includes(this.loggedInUser.id)) {
      const i = favArray.indexOf(this.loggedInUser.id)
      favArray.splice(i, 1)
    } else {
      favArray.push(this.loggedInUser.id)
    }
  }

}
