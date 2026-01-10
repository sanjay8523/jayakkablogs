import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { BlogListComponent } from './components/blog-list/blog-list';
import { BlogDetailComponent } from './components/blog-detail/blog-detail';
import { BlogFormComponent } from './components/blog-form/blog-form';
import { DashboardComponent } from './components/dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'blogs', component: BlogListComponent },
  { path: 'blogs/:id', component: BlogDetailComponent },
  { path: 'create-blog', component: BlogFormComponent },
  { path: 'edit-blog/:id', component: BlogFormComponent },
  { path: 'dashboard', component: DashboardComponent },
];
