import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FiletestComponent } from './filetest/filetest.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { UserComponent } from './user/user.component';
import { ReceivedQuestionsComponent } from './received-questions/received-questions.component';

const routes: Routes = [
  { path: 'filetest', component: FiletestComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'user/:username', component: UserComponent },
  { path: 'questions', component: ReceivedQuestionsComponent },
  { path: '',   redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
