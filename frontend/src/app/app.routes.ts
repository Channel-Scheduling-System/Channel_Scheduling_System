import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { ROLES } from './core/constants/roles.constants';
import { noAuthGuard } from './core/guards/no-auth.guard';

const [ADMIN, WORKER, CLIENT] = ROLES;

export const routes: Routes = [
    { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
    {
        path: 'auth',
        canActivate: [noAuthGuard],
        loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule)
    },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { 
                path: 'home', 
                loadChildren: () => import('./features/home/home-module').then(m => m.HomeModule)
            },
            { 
                path: 'profile', 
                loadChildren: () => import('./features/profile/profile-module').then(m => m.ProfileModule)
            },
            {
                path: 'calendar',
                loadChildren: () => import('./features/calendar/calendar-module').then(m => m.CalendarModule),
                canActivate: [RoleGuard],
                data: { roles: [WORKER] }
            },
            {
                path: 'appointments',
                loadChildren: () => import('./features/appointments/appointments-module').then(m => m.AppointmentsModule),
                canActivate: [RoleGuard],
                data: { roles: [CLIENT, WORKER] }
            },
            { 
                path: 'services', 
                loadChildren: () => import('./features/services/services-module').then(m => m.ServicesModule),
                canActivate: [RoleGuard],
                data: { roles: [WORKER] }
            },
            {
                path: 'users',
                loadChildren: () => import('./features/users/users-module').then(m => m.UsersModule),
                canActivate: [RoleGuard],
                data: { roles: [ADMIN, WORKER] }
            },
            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    }
];
