import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guards';
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
        path: 'home',
        component: MainLayoutComponent,
        canActivate: [AuthGuard],
        loadChildren: () => import('./features/home/home-module').then(m => m.HomeModule)
    },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { 
                path: 'services', 
                loadChildren: () => import('./features/services/services-module').then(m => m.ServicesModule),
                canActivate: [RoleGuard],
                data: { roles: [WORKER] }
            },
            { path: '', redirectTo: 'services', pathMatch: 'full' }
        ]
    }
];
