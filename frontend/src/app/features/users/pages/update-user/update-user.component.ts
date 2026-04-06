import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../services/user.service';
import { MessageService } from '../../../../core/services/message.service';
import { AlertType } from '../../../../core/utils/enums/AlertType';
import { UserFormFieldsComponent } from '../../components/user-form-fields/user-form-fields.component';
import { UserFormHeaderComponent } from '../../components/user-form-header/user-form-header.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatProgressSpinnerModule, UserFormFieldsComponent, UserFormHeaderComponent],
  templateUrl: './update-user.component.html',
  styleUrl: './update-user.component.scss',
})
export class UpdateUserPageComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  private userId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private messageService: MessageService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.userId = +this.route.snapshot.paramMap.get('id')!;
    this.buildForm();
    this.loadUser();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      alias:     ['', Validators.required],
      firstName: ['', Validators.required],
      lastName:  ['', Validators.required],
      phone:     ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
    });
  }

  private loadUser(): void {
    this.isLoading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (response) => this.handleLoadSuccess(response),
      error: (error)   => this.handleError(error),
    });
  }

  private handleLoadSuccess(response: any): void {
    const user = response.data.user;
    this.form.patchValue({
      alias:     user.alias,
      firstName: user.firstName,
      lastName:  user.lastName,
      phone:     user.phone,
      email:     user.email,
    });
    this.isLoading = false;
  }

  private handleError(error: any): void {
    this.isLoading = false;
    this.messageService.showMessage(error.message, AlertType.ERROR);
  }

  saveChanges(): void {
    //TODO: implementar
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  deactivateUser(): void {
    // TODO: implementar
  }
}