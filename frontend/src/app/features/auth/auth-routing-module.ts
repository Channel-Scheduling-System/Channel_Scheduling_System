import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login/login.component';
import { RegisterPageComponent } from './pages/register/register.component';
import { AdminRegisterPageComponent } from './pages/admin-register/admin-register.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginPageComponent
  },
  {
    path: 'register',
    component: RegisterPageComponent
  },
  {
    path: 'admin-register',
    component: AdminRegisterPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
