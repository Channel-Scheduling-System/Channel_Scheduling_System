import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ServicesService } from '../../services/services.service';
import { SessionService } from '../../../../core/services/session.service';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { Service } from '../../../../shared/models/entities/service.schema';
import { ServicesListResponse } from '../../models/responses/services-list-response.model';
import { CreateServiceRequest } from '../../models/requests/create-service-request.model';
import { ServiceFormModalComponent } from '../../components/modal/service-form-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { ServiceFormModalData } from '../../../auth/interfaces/modal-data.interface';
import { UpdateServiceRequest } from '../../models/requests/update-service-request.model';
import { UpdateServiceResponse } from '../../models/responses/update-service-response.model';
import { CreateServiceResponse } from '../../models/responses/create-service-response.model';
import { DeleteServiceResponse } from '../../models/responses/delete-service-response.model';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, MatProgressSpinnerModule],
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

  createService(): void {
    const dialogData: ServiceFormModalData = {
      isEdit: false
    };
    const dialogRef = this.dialog.open(ServiceFormModalComponent, {
      width: 'auto',
      maxWidth: '90vw',
      panelClass: 'service-dialog-panel',
      backdropClass: 'service-dialog-backdrop',
      disableClose: false,
      autoFocus: true,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result) => {
      document.body.classList.remove('modal-open');
      if (result) {
        this.onModalSave(result);
      }
    });
  }

  updateService(service: Service): void {
    const dialogData: ServiceFormModalData = {
      service: service,
      isEdit: true
    };

    const dialogRef = this.dialog.open(ServiceFormModalComponent, {
      width: 'auto',
      maxWidth: '90vw',
      panelClass: 'service-dialog-panel',
      backdropClass: 'service-dialog-backdrop',
      disableClose: false,
      autoFocus: true,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result) => {
      document.body.classList.remove('modal-open');
      if (result) {
        this.onModalUpdate(result);
      }
    });

  }

  onModalSave(data: CreateServiceRequest): void {
    const workerId = this.sessionService.getSession()?.id;
    if (!workerId) return;

    const request: CreateServiceRequest = { ...data, workerId };

    this.servicesService.createService(request).subscribe({
      next: (response) => this.handleActionServiceSuccess(response),
      error: (error) => this.handleActionServiceError(error)
    });
  }

  onModalUpdate(data: UpdateServiceRequest): void {
    this.servicesService.updateService(data).subscribe({
      next: (response) => this.handleActionServiceSuccess(response),
      error: (error) => this.handleActionServiceError(error)
    });
  }

  deleteService(service: Service): void {
    this.servicesService.deleteService(service.id).subscribe({
      next: (response) => this.handleActionServiceSuccess(response),
      error: (error) => this.handleActionServiceError(error)
    });
  }

  private handleActionServiceSuccess(
    response: CreateServiceResponse | UpdateServiceResponse | DeleteServiceResponse
  ): void {
    this.messageService.showMessage(response.message, AlertType.SUCCESS);
    this.loadServices();
  }

  private handleActionServiceError(error: any): void {
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }
  
  onModalClose(): void {
    this.isModalOpen = false;
  }

  getTotalCount(): number { return this.filteredServices.length; }
  getDisplayedCount(): number { return this.pagedServices.length; }

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

}