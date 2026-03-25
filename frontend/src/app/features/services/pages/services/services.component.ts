import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ServicesService } from '../../services/services.service';
import { SessionService } from '../../../../core/services/session.service';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { Service } from '../../../../shared/models/entities/service.schema';
import { ServicesListResponse } from '../../models/responses/services-list-response.model';
import { CreateServiceRequest } from '../../models/requests/create-service-request';
import { ServiceFormModalComponent } from '../../components/modal/service-form-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, MatProgressSpinnerModule, ServiceFormModalComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
})
export class ServicesPageComponent implements OnInit {
  services: Service[] = [];
  filteredServices: Service[] = [];
  isLoading = false;
  searchTerm = '';
  isModalOpen = false;

  readonly pageSize = 8;
  currentPage = 1;

  constructor(
    private dialog: MatDialog,
    private servicesService: ServicesService,
    private sessionService: SessionService,
    private messageService: MessageService,
    private overlay: Overlay
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    const workerId = this.sessionService.getSession()?.id || 2;
    if (!workerId) {
      this.messageService.showMessage('No se pudo obtener la información del trabajador', AlertType.ERROR);
      return;
    }
    this.isLoading = true;
    this.servicesService.getServicesByWorker(workerId).subscribe({
      next: (response) => this.handleServicesSuccess(response),
      error: (error)   => this.handleServicesError(error)
    });
  }

  private handleServicesSuccess(response: ServicesListResponse): void {
    this.services = response.data;
    this.filteredServices = response.data;
    this.currentPage = 1;
    this.isLoading = false;
  }

  private handleServicesError(error: any): void {
    this.isLoading = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
    this.filteredServices = this.services.filter(
      (s) => s.name.toLowerCase().includes(this.searchTerm) ||
             s.description.toLowerCase().includes(this.searchTerm)
    );
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredServices.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedServices(): Service[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredServices.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  getTotalCount(): number { return this.filteredServices.length; }
  getDisplayedCount(): number { return this.pagedServices.length; }

  openCreateModal(): void {
    const dialogRef = this.dialog.open(ServiceFormModalComponent, {
      width: 'auto',
      maxWidth: '90vw',
      panelClass: 'service-dialog-panel',
      backdropClass: 'service-dialog-backdrop',
      disableClose: false,
      autoFocus: true,
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    dialogRef.componentInstance.save.subscribe((data: CreateServiceRequest) => {
      this.onModalSave(data);
      dialogRef.close();
    });

    dialogRef.componentInstance.close.subscribe(() => {
      dialogRef.close();
    });

    dialogRef.afterClosed().subscribe(() => {
      document.body.classList.remove('modal-open');
    });
  }

  onModalClose(): void {
    this.isModalOpen = false;
  }

  onModalSave(data: CreateServiceRequest): void {
    const workerId = this.sessionService.getSession()?.id;
    if (!workerId) return;

    const request: CreateServiceRequest = { ...data, workerId };

    this.servicesService.createService(request).subscribe({
      next: (response) => {
        this.messageService.showMessage(response.message, AlertType.SUCCESS);
        this.loadServices();
      },
      error: (error) => {
        this.messageService.showMessage(error.message, AlertType.ERROR);
      }
    });
  }

  editService(service: Service): void {
    console.log('Editar servicio:', service);
  }

  deleteService(service: Service): void {
    console.log('Eliminar servicio:', service);
  }
}