import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginComponent } from './features/login/login.component';
import { ForgetPasswordComponent } from './features/forget-password/forget-password.component';
import { RegisterComponent } from './features/register/register.component';
import { ProfileComponent } from './features/profile/profile.component';
import { FeedComponent } from './features/feed/feed.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { ChangePasswordComponent } from './features/change-password/change-password.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { authGuard } from './core/auth/guards/auth-guard';
import { guestGuard } from './core/auth/guards/guest-guard';
import { PostDetailsComponent } from './features/post-details/post-details.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: '', component: AuthLayoutComponent, canActivate: [guestGuard],
    children: [
      { path: 'login', component: LoginComponent, title: 'Login' },
      { path: 'register', component: RegisterComponent, title: 'Register' },
      { path: 'forget', component: ForgetPasswordComponent, title: 'Forget Password' }
    ]
  },
  {
    path: '', component: MainLayoutComponent, canActivate: [authGuard],
    children: [
      { path: 'profile', component: ProfileComponent, title: 'Profile' },
      { path: 'feed', component: FeedComponent, title: 'Feed' },
      { path: 'posts/:id', component: PostDetailsComponent, title: 'Post Details' },
      { path: 'notifications', component: NotificationsComponent, title: 'Notifications' },
      { path: 'change', component: ChangePasswordComponent, title: 'Change Password' }
    ]
  },
  { path: 'not-found', component: NotFoundComponent, title: 'Not Found' },
  { path: '**', redirectTo: 'not-found', pathMatch: 'full' }
];
