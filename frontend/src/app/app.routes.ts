import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { Landing } from './landing/landing';
import { Home } from './home/home';
import { NotificationsComponent } from './notifications/notifications';
import { Messages } from './messages/messages';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'home', component: Home },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'messages', component: Messages },
];