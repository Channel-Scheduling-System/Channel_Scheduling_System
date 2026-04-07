import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../services/user.service';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { ListUserItem, ListUsersResponse, Meta } from '../../models/responses/list/list-users-response.model';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersPageComponent implements OnInit {
  users: ListUserItem[] = [];
  meta: Meta = { total: 0, limit: 10, page: 1, totalPages: 1 };
  isLoading = false;
  searchTerm = '';
  currentPage = 1;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute

  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers(this.currentPage, this.searchTerm).subscribe({
      next: (response) => this.handleUsersSuccess(response),
      error: (error) => this.handleUsersError(error)
    });
  }

  private handleUsersSuccess(response: ListUsersResponse): void {
    this.users = response.data.data;
    this.meta = response.data.meta;
    this.isLoading = false;
  }

  private handleUsersError(error: any): void {
    this.isLoading = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.currentPage = 1;
    this.loadUsers();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.meta.totalPages) return;
    this.currentPage = page;
    this.loadUsers();
  }

  createUser(): void {
    this.router.navigate(['register'], { relativeTo: this.route });
  }

  editUser(user: ListUserItem): void {
    this.router.navigate([user.id, 'edit'], { relativeTo: this.route });
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      ADMIN: 'Administrador',
      WORKER: 'Trabajador',
      CUSTOMER: 'Cliente'
    };
    return labels[role] ?? role;
  }

  get paginationItems(): (number | '...')[] {
    const total = this.meta.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const items: (number | '...')[] = [1];

    if (current > 3) items.push('...');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) items.push(i);

    if (current < total - 2) items.push('...');

    items.push(total);

    return items;
  }

  get displayedCount(): number {
    return this.users.length;
  }
}