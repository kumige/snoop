import { Component, OnInit } from '@angular/core';
import { FetchGqlService } from '../services/fetch-gql.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass'],
})
export class SettingsComponent implements OnInit {
  user;

  constructor(private api: FetchGqlService) {}

  private query = {
    query: `{
      userCheck {
        id,Username,Displayname,Email,ProfileInfo{Bio}
      }
    }`,
  };

  ngOnInit(): void {
    this.getUser();
  }

  private async getUser() {
    this.user = await this.api.fetchGraphql(this.query);
    console.log(this.user.token);
    console.log(this.user);
  }
}
