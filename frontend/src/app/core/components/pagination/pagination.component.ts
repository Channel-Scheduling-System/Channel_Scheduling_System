import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage = 1;
  @Input() totalPages  = 1;
  @Input() totalItems  = 0;
  @Input() displayedItems = 0;
  @Input() itemLabel   = 'elemento';
  @Input() itemLabelPlural = 'elementos';
  @Input() showFiltered = false;

  @Output() pageChange = new EventEmitter<number>();

  paginationItems: (number | '...')[] = [];

  ngOnChanges(): void {
    this.paginationItems = this.buildPaginationItems();
  }

  private buildPaginationItems(): (number | '...')[] {
    const total   = this.totalPages;
    const current = this.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const items: (number | '...')[] = [1];
    if (current > 3) items.push('...');
    const start = Math.max(2, current - 1);
    const end   = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) items.push(i);
    if (current < total - 2) items.push('...');
    items.push(total);
    return items;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageChange.emit(page);
  }
}