import {
  Component,
  OnInit,
  ViewContainerRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FetchGqlService } from '../services/fetch-gql.service';
import { Router } from '@angular/router';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  selector: 'app-received-questions',
  templateUrl: './received-questions.component.html',
  styleUrls: ['./received-questions.component.sass'],
})
export class ReceivedQuestionsComponent implements OnInit {
  questions;
  file;
  boxIsOpen = false;
  currentBox;
  options = {
    headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
  }

  gqlUrl = 'http://localhost:3000/graphql';
  get uploadsUrl() {
    return 'http://localhost:3000/uploads/';
  }

  get currentFile() {
    return this.file;
  }

  formControl = new FormControl('', [Validators.required]);
  matcher = new MyErrorStateMatcher();

  @ViewChild('dynamic', {
    read: ViewContainerRef,
  })
  viewContainerRef: ViewContainerRef;
  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;

  constructor(
    private api: FetchGqlService,
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.questions = [];
    this.getQs();
  }

  private async getQs() {
    // TODO: Change id to logged in user
    const query = {
      query: `
      query{
        questionsForUser(id: "5ea572a26354f617884901bd"){
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
              AnsweredQuestionCount
            }
          } 
          Text
          DateTime {
            date
            time
          } 
        }
      }
      `,
    };

    this.questions = await this.api.fetchGraphql(query);
    this.questions = this.questions.questionsForUser;
    console.log(this.questions);
  }

  redirectToUser(event) {
    this.router.navigate([`./user/${event.target.id}`]);
  }

  async sendAnswer(event) {
    const answer = event.target.question.value;
    const qIndex = event.path[1].dataset.index;
    const qID = this.questions[qIndex].id;

    if (this.file != undefined) {
      this.sendWithImage(answer, qID, qIndex);
    } else {
      // TODO: REPLACE SENDER WITH LOGGED IN USER
      const query = {
        query: `
      mutation{
        addAnswer(
          QuestionID: "${qID}", 
          Text: "${answer}")
        { 
          id
          Text
          Image
          DateTime {
            date
            time
          } 
        }
      }
      `,
      };

      if (this.formControl.valid) {
        this.formControl.reset();
        this.formControl.markAsPristine();
        this.formControl.markAsUntouched();
        this.formControl.updateValueAndValidity();

        const qInfo = await this.api.fetchGraphql(query);
        console.log(qInfo)
        if (qInfo.addAnswer != null) {
          let snackBarRef = this.snackBar.open('Answer Sent!', 'Close', {
            duration: 3000,
          });
          this.questions.splice(qIndex, 1);
        }
      }
    }
  }

  sendWithImage(answer, qID, qIndex) {
    // Adds an answer with image
    const operations = {
      query: `mutation($file: upload) {
        addAnswer(
          QuestionID: "${qID}"
          Text: "${answer}"
          Image: $file
        ) {
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
     `,
      variables: {
        file: null,
      },
    };

    const _map = {
      file: ['variables.file'],
    };

    const fd = new FormData();
    fd.append('operations', JSON.stringify(operations));
    fd.append('map', JSON.stringify(_map));
    fd.append('file', this.file, this.file.name);
    fd.append('token', localStorage.getItem('token'))


    const res = this.http.post(this.gqlUrl, fd, this.options).subscribe();

    if (res != undefined) {
      let snackBarRef = this.snackBar.open('Answer Sent!', 'Close', {
        duration: 3000,
      });
    }
    this.questions.splice(qIndex, 1);
  }

  addFile(event) {
    this.file = event.target.files[0];
  }

  chooseFile() {
    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.click();
  }

  openBox(id) {
    const li = document.querySelector(`li[data-index="${id}"]`);
    const form = li.querySelector('form');
    const butt = li.querySelector(`.centerButton`);
    console.log(li.querySelector('#expandMore'));

    // Check if another box is open and close it
    if (this.boxIsOpen == true && this.currentBox != id) {
      this.file = undefined;
      this.boxIsOpen = true;
      const li = document.querySelector(`li[data-index="${this.currentBox}"]`);
      const form = li.querySelector('form');
      form.style.display = 'none';
      this.chevronToggle(li);
    }

    // Box toggle
    if (form.style.display == 'flex') {
      form.style.display = 'none';
      this.boxIsOpen = false;
      this.chevronToggle(li);
    } else {
      form.style.display = 'flex';
      this.boxIsOpen = true;
      this.currentBox = id;
      this.chevronToggle(li);
    }
  }

  chevronToggle(li) {
    const expandMore = li.querySelector('#expandMore');
    const expandLess = li.querySelector('#expandLess');

    if (expandMore.style.display == 'flex') {
      expandMore.style.display = 'none';
      expandLess.style.display = 'flex';
    } else {
      expandMore.style.display = 'flex';
      expandLess.style.display = 'none';
    }
  }

  async deleteQuestion(i) {
    console.log(this.questions, i)

    const query = {
      query: 
      `
      mutation{
        deleteQuestion(id: "${this.questions[i].id}"){
          id
          Text
          Favourites
        }
      }
      `
    }

    const res = await this.api.fetchGraphql(query)
    if (res != undefined) {
      this.questions.splice(i, 1)
    }

  }
}
