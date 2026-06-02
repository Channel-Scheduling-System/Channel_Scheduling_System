import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { PaginationComponent } from '../../../../../../core/components/pagination/pagination.component';
import { ListUserItem } from '../../../../../users/models/responses/list-users-response.model';
import { Meta } from '../../../../../../shared/models/entities/entity-base.schema';
@Component({
  selector: 'app-worker-search',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, PaginationComponent],
  templateUrl: './worker-search.component.html',
  styleUrl: './worker-search.component.scss',
})
export class WorkerSearchComponent implements OnInit, OnDestroy {
  @Input() workers: ListUserItem[] = [];
  @Input() meta: Meta = { total: 0, limit: 10, page: 1, totalPages: 1 };
  @Input() loading = false;
  @Output() workerSelected = new EventEmitter<ListUserItem>();
  @Output() searchChanged = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();
  private readonly destroy$     = new Subject<void>();
  private readonly searchInput$ = new Subject<string>();
  protected searchTerm   = '';
  protected currentPage  = 1;
  public ngOnInit(): void {
    this.searchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(term => {
      this.searchTerm  = term;
      this.currentPage = 1;
      this.searchChanged.emit(term);
    });
  }
  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  protected onSearchInput(event: Event): void {
    this.searchInput$.next((event.target as HTMLInputElement).value);
  }
  protected onSelectWorker(worker: ListUserItem): void {
    this.workerSelected.emit(worker);
  }
  protected goToPage(page: number): void {
    if (page < 1 || page > this.meta.totalPages) return;
    this.currentPage = page;
    this.pageChange.emit(page);
  }
  protected workerInitials(w: ListUserItem): string {
    return `${w.firstName[0] ?? ''}${w.lastName[0] ?? ''}`.toUpperCase();
  }
}