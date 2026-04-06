import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersPageComponent } from './pages/users/users.component';
import { UpdateUserPageComponent } from './pages/update-user/update-user.component';
import { RegisterUserPageComponent } from './pages/register-user/register-user.component';

const routes: Routes = [
  {
    path: '',
    component: UsersPageComponent
  },
  {
    path: 'register',
    component: RegisterUserPageComponent
  },
  {
    path: ':id/edit',
    component: UpdateUserPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
