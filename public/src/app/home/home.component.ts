import { Component, OnInit } from '@angular/core';
import { FetchGqlService } from '../services/fetch-gql.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {

  questions

  private query = {
    query: `{
      questions {
        Sender
        Receiver
        Text
        DateTime {
          date
          time
        }
        Answer
      }
    }`
  }

  constructor(private api: FetchGqlService) { }

  ngOnInit(): void {
    this.getQs()
  }

  private async getQs(){
    this.questions = await this.api.fetchGraphql(this.query)
    this.questions = this.questions.questions
    console.log(this.questions)
  }

}
