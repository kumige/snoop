import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FetchGqlService {
  private apiURL = 'http://localhost:3000/graphql'

  constructor() {}

  fetchGraphql = async (query) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        //Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify(query),
    };
    try {
      //console.log(options.body)
      const response = await fetch(this.apiURL, options);
      const json = await response.json();
      return json.data;
    } catch (e) {
      console.log(e);
      return false;
    }
  };
}
