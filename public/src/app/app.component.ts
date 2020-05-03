import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FetchGqlService } from './services/fetch-gql.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent implements OnInit {
  title = 'App';
  searchControl = new FormControl();
  options = [];
  filteredOptions = new Observable();
  searchTerm;
  matMenu;

  constructor(private api: FetchGqlService, private router: Router) {}

  ngOnInit() {
    this.filteredOptions = this.searchControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  async searchTermChange(value) {
    if (value != '' && typeof value === 'string') {
      const query = {
        query: `
        query{
          searchUser(searchTerm: "${value}"){
            id
            Username
            Displayname
          }
        }
        `,
      };
      const results = await this.api.fetchGraphql(query);
      this.options = results.searchUser;
    } 
  }

  redirectToUser(user) {
    this.router.navigate([`./user/${user.Username}`]);
    const bar = document.getElementById('searchBar') as HTMLInputElement
    bar.value = ""
    bar.blur()
    this.options =[]
  }
}
