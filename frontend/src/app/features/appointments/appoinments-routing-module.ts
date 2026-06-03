import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentsPageComponent } from './pages/appointments/appointments.component';
import { CreateAppointmentPageComponent } from './pages/create-appointment/appointment-create.component';
import { ManageAppointmentRequestsPageComponent } from './pages/manage-appointment-requests/manage-appointment-requests.component';
import { AppointmentsHistoryPageComponent } from './pages/appointments-history/appointments-history.component';

const routes: Routes = [
  { path: '', component: AppointmentsPageComponent },
  { path: 'create', component: CreateAppointmentPageComponent },
  { path: 'manage-requests', component: ManageAppointmentRequestsPageComponent},
  { path: ':id/history', component: AppointmentsHistoryPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentsRoutingModule { }
