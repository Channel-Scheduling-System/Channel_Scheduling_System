import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServicesPageComponent } from './pages/services/services.component';

const routes: Routes = [
  { path: '', component: ServicesPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicesRoutingModule { }
