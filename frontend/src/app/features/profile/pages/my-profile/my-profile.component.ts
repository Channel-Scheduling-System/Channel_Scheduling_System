import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProfileService } from '../../services/profile.service';
import { SessionService } from '../../../../core/services/session.service';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { ProfileUser, GetProfileResponse } from '../../models/responses/get-profile/get-profile-response.model';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss',
})
export class MyProfilePageComponent implements OnInit {
  profile: ProfileUser | null = null;
  isLoading = false;

  constructor(
    private profileService: ProfileService,
    private sessionService: SessionService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const userId = this.sessionService.getUserId();
    if (!userId) {
      this.messageService.showMessage('No se pudo obtener la información del usuario', AlertType.ERROR);
      return;
    }
    this.isLoading = true;
    this.profileService.getProfile(userId).subscribe({
      next: (response) => this.handleLoadProfileSuccess(response),
      error: (error) => this.handleLoadProfileError(error)
    });
  }

  private handleLoadProfileSuccess(response: GetProfileResponse): void {
    this.profile = response.data.user;
    this.isLoading = false;
  }

  private handleLoadProfileError(error: any): void {
    this.isLoading = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }

  resetPassword(): void {
    // TODO: implementar
  }

  saveChanges(): void {
    // TODO: implementar
  }

  deactivateAccount(): void {
    // TODO: implementar
  }
}