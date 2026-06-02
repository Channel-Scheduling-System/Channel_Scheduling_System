import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentsPageComponent } from './pages/appointments/appointments.component';
import { CreateAppointmentPageComponent } from './pages/create-appointment/appointment-create.component';
import { ManageAppointmentRequestsPageComponent } from './pages/manage-appointment-requests/manage-appointment-requests.component';

const routes: Routes = [
  { path: '', component: AppointmentsPageComponent },
  { path: 'create', component: CreateAppointmentPageComponent },
  { path: 'manage-requests', loadComponent: () => ManageAppointmentRequestsPageComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentsRoutingModule { }
