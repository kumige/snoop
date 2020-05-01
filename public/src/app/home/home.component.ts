import {
  Component,
  Inject,
  ViewChild,
  ViewContainerRef,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { FetchGqlService } from '../services/fetch-gql.service';
import { Router } from '@angular/router';
import { DynamicLoaderService } from '../services/dynamic-loader.service';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from '../image-dialog/image-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  questions;
  loaderService;

  get uploadsUrl() {
    return 'http://localhost:3000/uploads/';
  }

  @ViewChild('dynamic', {
    read: ViewContainerRef,
  })
  viewContainerRef: ViewContainerRef;

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

  constructor(
    private api: FetchGqlService,
    private router: Router,
    @Inject(DynamicLoaderService) service,
    public dialog: MatDialog
  ) {
    this.loaderService = service;
  }

  ngOnInit(): void {
    this.getQs();
  }

  // Load side profile card
  ngAfterViewInit(): void {
    this.loaderService.setRootViewContainerRef(this.viewContainerRef);
    this.loaderService.addDynamicComponent();
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
    this.questions = await this.api.fetchGraphql(this.query);
    this.questions = this.questions.qWithA;
    console.log(this.questions)
  }
}
