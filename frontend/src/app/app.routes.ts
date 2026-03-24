import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { ServicesPageComponent } from './features/services/pages/services/services.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guards';

export const routes: Routes = [
    { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule)
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
                data: { roles: ['WORKER'] }
            },
            { path: '', redirectTo: 'services', pathMatch: 'full' }
        ]
    }
];
