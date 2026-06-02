import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { environment } from '../../../../../environments/environment';

type ReportKey =
    | 'revenue-per-service'
    | 'appointments-per-period'
    | 'employee-performance'
    | 'most-requested-services';

interface PowerBiReport {
    key: ReportKey;
    title: string;
    description: string;
    embedUrl: string;
    icon: string;
}

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './reports.component.html',
    styleUrl: './reports.component.scss',
})
export class ReportsPageComponent {
    protected readonly reports: PowerBiReport[] = [
        {
            key: 'revenue-per-service',
            title: 'Ingresos por servicio',
            description: 'Ingresos generados por cada servicio ofrecido.',
            embedUrl: environment.powerBi.revenuePerService,
            icon: 'payments',
        },
        {
            key: 'appointments-per-period',
            title: 'Citas por período',
            description: 'Volumen de citas por día, semana o mes.',
            embedUrl: environment.powerBi.appointmentsPerPeriod,
            icon: 'calendar_month',
        },
        {
            key: 'employee-performance',
            title: 'Rendimiento por empleado',
            description: 'Citas atendidas y desempeño por colaborador.',
            embedUrl: environment.powerBi.employeePerformance,
            icon: 'groups',
        },
        {
            key: 'most-requested-services',
            title: 'Servicios más solicitados',
            description: 'Servicios con mayor demanda por parte de los clientes.',
            embedUrl: environment.powerBi.mostRequestedServices,
            icon: 'trending_up',
        },
    ];

    protected selectedReportKey: ReportKey = this.reports[0].key;

    constructor(private sanitizer: DomSanitizer) {}

    protected get selectedReport(): PowerBiReport {
        return (
            this.reports.find((r) => r.key === this.selectedReportKey) ??
            this.reports[0]
        );
    }

    protected get selectedReportUrl(): SafeResourceUrl | null {
        const url = this.selectedReport.embedUrl.trim();
        return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
    }

    protected selectReport(key: ReportKey): void {
        this.selectedReportKey = key;
    }
}
