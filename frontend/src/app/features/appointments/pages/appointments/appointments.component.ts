import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
	selector: 'app-appointments',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './appointments.component.html',
	styleUrl: './appointments.component.scss',
})
export class AppointmentsPageComponent {}
