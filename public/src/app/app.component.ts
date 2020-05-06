import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FetchGqlService } from './services/fetch-gql.service';
import { Router, NavigationStart } from '@angular/router';
import { GetAuthUserService } from './services/get-auth-user.service';

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
  loggedInUser;
  // Boolean to check if user is logged in
  isLoggedIn = false;

  constructor(
    private api: FetchGqlService,
    private router: Router,
    private auth: GetAuthUserService
  ) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isUserLoggedIn();
      }
    });

    this.filteredOptions = this.searchControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  isUserLoggedIn() {
    this.auth.getLoggedInUser().then((user) => {
      this.loggedInUser = user;

      // Check if the user is logged in
      if (this.loggedInUser != null) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    });
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
    const bar = document.getElementById('searchBar') as HTMLInputElement;
    bar.value = '';
    bar.blur();
    this.options = [];
  }

  logout() {
    localStorage.removeItem('token');
    this.isUserLoggedIn();
    this.router.navigate([`./home`]);
  }
}
