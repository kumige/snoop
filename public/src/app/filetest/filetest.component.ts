import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UploadService } from '../upload.service';

@Component({
  selector: 'app-filetest',
  templateUrl: './filetest.component.html',
  styleUrls: ['./filetest.component.sass'],
})
export class FiletestComponent implements OnInit {
  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;
  files = [];
  constructor(private uploadService: UploadService) {}

  ngOnInit(): void {}

  uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file.data);
    file.inProgress = true;
    this.uploadService
      .upload(formData)
      .pipe(
        map((event) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              file.progress = Math.round((event.loaded * 100) / event.total);
              break;
            case HttpEventType.Response:
              return event;
          }
        }),
        catchError((error: HttpErrorResponse) => {
          file.inProgress = false;
          return of(`${file.data.name} upload failed.`);
        })
      )
      .subscribe((event: any) => {
        if (typeof event === 'object') {
          console.log(event.body);
        }
      });
  }

  private uploadFiles() {
    this.fileUpload.nativeElement.value = '';
    this.files.forEach((file) => {
      this.uploadFile(file);
    });
  }

  onClick() {
    const fileUpload = this.fileUpload.nativeElement;
    console.log(fileUpload.files)
    fileUpload.onchange = () => {
      /*
      fileUpload.files.forEach(file => {
        this.files.push({ data: file, inProgress: false, progress: 0 });
      });
      */
      
      for (let index = 0; index < fileUpload.files.length; index++) {
        const file = fileUpload.files[index];
        this.files.push({ data: file, name: file.name, inProgress: false, progress: 0 });
      }
      
      this.uploadFiles();
    };
    fileUpload.click();
  }
}
