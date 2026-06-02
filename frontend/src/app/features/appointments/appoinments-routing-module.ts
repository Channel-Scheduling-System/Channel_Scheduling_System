import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentsPageComponent } from './pages/appointments/appointments.component';
import { CreateAppointmentPageComponent } from './pages/create-appointment/appointment-create.component';

const routes: Routes = [
  { path: '', component: AppointmentsPageComponent },
  { path: 'create', component: CreateAppointmentPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentsRoutingModule { }
