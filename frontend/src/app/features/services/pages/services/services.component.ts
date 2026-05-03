import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, HostListener } from '@angular/core';
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
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { ServiceFormModalData } from '../../../auth/interfaces/modal-data.interface';
import { UpdateServiceRequest } from '../../models/requests/update-service-request.model';
import { UpdateServiceResponse } from '../../models/responses/update-service-response.model';
import { CreateServiceResponse } from '../../models/responses/create-service-response.model';
import { DeleteServiceResponse } from '../../models/responses/delete-service-response.model';
import { ScrollService } from '../../../../core/services/scroll.service';
import { FabService } from '../../../../core/services/fab.services';
import { TemplatePortal } from '@angular/cdk/portal';
import { ErrorResponse } from '../../../../shared/models/api/error-response.schema';
import { SetStateServiceRequest } from '../../models/requests/set-state-service-request.model';
import { STATE_OPTIONS } from '../../constants/service-filter-options.constants';
import { PaginationComponent } from '../../../../core/components/pagination/pagination.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, MatProgressSpinnerModule, PaginationComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
})
export class ServicesPageComponent implements OnInit, OnDestroy {
  @ViewChild('fabTemplate') fabTemplate!: TemplateRef<any>;
  private services: Service[] = [];
  private filteredServices: Service[] = [];
  private readonly pageSize = 8;
  private restoreScrollAfterLoad = false;
  
  protected isLoading = false;
  protected searchTerm = '';
  protected selectedState: boolean | undefined = true;
  protected stateDropdownOpen = false;
  protected readonly stateOptions = STATE_OPTIONS
  protected currentPage = 1;

  protected loadingStates = new Set<number>();

  

  constructor(
    private fabService: FabService,
    private viewContainerRef: ViewContainerRef,
    private dialog: MatDialog,
    private servicesService: ServicesService,
    private sessionService: SessionService,
    private messageService: MessageService,
    private overlay: Overlay,
    private scrollService: ScrollService

  ) { }

  @HostListener('document:click')
  public onDocumentClick(): void {
    this.stateDropdownOpen = false;
  }

  public ngOnDestroy(): void {
    this.fabService.clear();
  }

  public ngAfterViewInit(): void {
    this.fabService.set(new TemplatePortal(this.fabTemplate, this.viewContainerRef));
  }

  public ngOnInit(): void {
    this.loadServices();
  }

  protected get selectedStateLabel(): string {
    return this.stateOptions.find(o => o.value === this.selectedState)?.label ?? 'Todos los estados';
  }

  private loadServices(): void {
    const workerId = this.sessionService.getSession()?.id || 2;
    if (!workerId) {
      this.messageService.showMessage('No se pudo obtener la información del trabajador', AlertType.ERROR);
      return;
    }
    this.isLoading = true;

    this.servicesService.getServices({ workerId: workerId, isActive: this.selectedState }).subscribe({
      next: (response) => this.handleServicesSuccess(response),
      error: (error) => this.handleServicesError(error)
    });
  }

  private handleServicesSuccess(response: ServicesListResponse): void {
    this.services = response.data;
    this.filterServices();
    this.isLoading = false;
    this.applyPostLoadScroll();
  }

  private applyPostLoadScroll(): void {
    if (this.restoreScrollAfterLoad) {
      this.restoreScrollAfterLoad = false;
      this.scrollService.restorePosition();
    }
  }

  private handleServicesError(error: any): void {
    this.isLoading = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }

  protected onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
    this.filterServices();
    this.currentPage = 1;
  }

  private filterServices(): void {
    this.filteredServices = this.services.filter(
      (s) => s.name.toLowerCase().includes(this.searchTerm) ||
        s.description?.toLowerCase().includes(this.searchTerm)
    );
  }

  protected createService(): void {
    const dialogData: ServiceFormModalData = { isEdit: false };
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

    dialogData.onSubmit = (result: CreateServiceRequest) => this.onModalSave(result, dialogRef);
  }

  protected updateService(service: Service): void {
    const dialogData: ServiceFormModalData = { isEdit: true, service };
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

    dialogData.onSubmit = (result: UpdateServiceRequest) => this.onModalUpdate(result, service.id, dialogRef);
  }

  private onModalSave(data: CreateServiceRequest, dialogRef: MatDialogRef<ServiceFormModalComponent>): void {
    const workerId = this.sessionService.getSession()?.id;
    if (!workerId) return;
    const request: CreateServiceRequest = { ...data, workerId };

    this.servicesService.createService(request).subscribe({
      next: (response) => this.handleActionServiceSuccess(response, dialogRef),
      error: (error) => this.handleActionServiceError(error, dialogRef)
    });
  }

  private onModalUpdate(data: UpdateServiceRequest, id: number, dialogRef: MatDialogRef<ServiceFormModalComponent>): void {
    this.scrollService.savePosition();
    this.servicesService.updateService(data, id).subscribe({
      next: (response) => this.handleActionServiceSuccess(response, dialogRef),
      error: (error) => this.handleActionServiceError(error, dialogRef)
    });
  }

  protected toggleServiceState(service: Service): void {
    this.loadingStates.add(service.id);
    this.scrollService.savePosition();
    this.restoreScrollAfterLoad = true;
    const request: SetStateServiceRequest = { isActive: !service.isActive };
    this.servicesService.setServiceState(service.id, request).subscribe({
      next: (response) => {
        this.loadingStates.delete(service.id);
        return this.handleActionServiceSuccess(response)},
      error: (error) => {
        this.loadingStates.delete(service.id);
        return this.handleActionServiceError(error)}
    });
  }

  private handleActionServiceSuccess(
    response: CreateServiceResponse | UpdateServiceResponse | DeleteServiceResponse,
    dialog?: MatDialogRef<ServiceFormModalComponent>
  ): void {
    if (dialog) {
      this.handleAfterAction(dialog);
    }
    this.messageService.showMessage(response.message, AlertType.SUCCESS);
    this.loadServices();
  }

  private handleAfterAction(dialog: MatDialogRef<ServiceFormModalComponent>): void {
    dialog.componentInstance.setSubmitting(false);
    if (!dialog.componentInstance.isEditMode) {
      dialog.componentInstance.reset();
      this.currentPage = 1;
      this.selectedState = true;
      this.scrollService.requestScrollToTop();
    } else {
      this.restoreScrollAfterLoad = true;
    }
  }

  private handleActionServiceError(error: ErrorResponse, dialog?: MatDialogRef<ServiceFormModalComponent>): void {
    if (dialog) dialog.componentInstance.isSubmitting = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.scrollService.requestScrollToTop();
  }

  protected getTotalCount(): number { return this.filteredServices.length; }
  protected getDisplayedCount(): number { return this.pagedServices.length; }

  protected get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredServices.length / this.pageSize));
  }

  protected get pagedServices(): Service[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredServices.slice(start, start + this.pageSize);
  }

  protected toggleStateDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.stateDropdownOpen = !this.stateDropdownOpen;
  }

  protected selectState(value: boolean | undefined, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedState = value;
    this.stateDropdownOpen = false;
    this.currentPage = 1;
    this.loadServices();
  }

}