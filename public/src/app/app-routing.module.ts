import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { UserComponent } from './user/user.component';
import { ReceivedQuestionsComponent } from './received-questions/received-questions.component';
import { SettingsComponent } from './settings/settings.component';
import { FavouritesComponent } from './favourites/favourites.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'user/:username', component: UserComponent },
  { path: 'questions', component: ReceivedQuestionsComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'favourites/:username', component: FavouritesComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
