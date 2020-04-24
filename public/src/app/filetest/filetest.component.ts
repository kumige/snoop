import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  HttpEventType,
  HttpErrorResponse,
  HttpClient,
} from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UploadService } from '../services/upload.service';
import { FetchGqlService } from '../services/fetch-gql.service';

@Component({
  selector: 'app-filetest',
  templateUrl: './filetest.component.html',
  styleUrls: ['./filetest.component.sass'],
})
export class FiletestComponent implements OnInit {
  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;

  files = [];
  gqlUrl = 'http://localhost:3000/graphql';
  constructor(
    private uploadService: UploadService,
    private api: FetchGqlService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {}

  async upload($event) {

    // Adds an answer with image
    const operations = {
      query: `mutation($file: upload) {
        addAnswer(
          QuestionID: "5ea1506e78f10542809f20e1"
          Text: "img test"
          Image: $file
        ) {
          id
          QuestionID
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

    const file = $event.target.files[0];

    const fd = new FormData();
    fd.append('operations', JSON.stringify(operations));
    fd.append('map', JSON.stringify(_map));
    fd.append('file', file, file.name);

    this.http.post(this.gqlUrl, fd).subscribe();
  }

  onClick() {
    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.click();
  }
}
