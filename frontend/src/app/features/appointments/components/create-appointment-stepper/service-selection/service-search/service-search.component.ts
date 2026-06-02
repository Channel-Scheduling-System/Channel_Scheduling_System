import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AppointmentCreateService } from '../../../../services/appointment-create.service';
import { PaginationComponent } from '../../../../../../core/components/pagination/pagination.component';
import { Service } from '../../../../../../shared/models/entities/service.schema';
import { formatDuration } from '../../../../utils/appointments-format.util';
@Component({
  selector: 'app-service-search',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, MatProgressSpinnerModule, PaginationComponent],
  templateUrl: './service-search.component.html',
  styleUrl: './service-search.component.scss',
})
export class ServiceSearchComponent implements OnInit, OnDestroy {
  @Input() services: Service[] = [];
  @Input() loading = false;
  @Input() isFiltered = false;
  @Input() hideWorkerName = false;
  @Output() serviceSelected = new EventEmitter<Service>();
  @Output() serviceDeselected = new EventEmitter<number>();
  @Output() searchChanged = new EventEmitter<string>();
  public readonly wizard = inject(AppointmentCreateService);
  private readonly destroy$     = new Subject<void>();
  private readonly searchInput$ = new Subject<string>();
  protected filteredServices: Service[] = [];
  protected pagedServices:    Service[] = [];
  protected currentPage  = 1;
  protected searchTerm   = '';
  protected readonly formatDuration = formatDuration;
  private readonly pageSize = 8;
  protected get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredServices.length / this.pageSize));
  }
  protected get totalCount(): number {
    return this.filteredServices.length;
  }
  public ngOnInit(): void {
    this.searchInput$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(term => {
      this.searchTerm  = term.toLowerCase();
      this.currentPage = 1;
      this.filterAndPage();
      this.searchChanged.emit(this.searchTerm);
    });
  }
  public ngOnChanges(): void {
    this.filterAndPage();
  }
  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private filterAndPage(): void {
    const term = this.searchTerm;
    this.filteredServices = term
      ? this.services.filter(s =>
          s.name.toLowerCase().includes(term) ||
          s.description?.toLowerCase().includes(term),
        )
      : [...this.services];
    if (this.currentPage > this.totalPages) this.currentPage = 1;
    this.updatePage();
  }
  private updatePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedServices = this.filteredServices.slice(start, start + this.pageSize);
  }
  protected onSearchInput(event: Event): void {
    this.searchInput$.next((event.target as HTMLInputElement).value);
  }
  protected onCardClick(service: Service): void {
    if (!service.isActive) return;
    if (this.wizard.isServiceSelected(service.id)) {
      this.serviceDeselected.emit(service.id);
      return;
    }
    this.serviceSelected.emit(service);
  }
  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePage();
  }
}