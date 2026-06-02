import {
  Component,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TemplatePortal } from '@angular/cdk/portal';
import { FabService } from '../../../../core/services/fab.services';
import { SessionService } from '../../../../core/services/session.service';
import { AppointmentCreateService, TOTAL_STEPS, WORKER_ONLY_STEP, WizardRole } from '../../services/appointment-create.service';
import { ServiceSelectionComponent } from '../../components/create-appointment-stepper/service-selection/service-selection.component';
import { ClientSelectionComponent } from '../../components/create-appointment-stepper/client-selection/client-selection.component';
import { DatetimeSelectionComponent } from '../../components/create-appointment-stepper/datetime-selection/datetime-selection.component';
import { ConfirmSelectionComponent } from '../../components/create-appointment-stepper/confirm-selection/confirm-selection.component';
import { ScrollService } from '../../../../core/services/scroll.service';
interface StepMeta {
  number: number;
  label: string;
  icon: string;
}
const ALL_STEPS: StepMeta[] = [
  { number: 1, label: 'Servicios',    icon: 'content_cut'    },
  { number: 2, label: 'Cliente',      icon: 'person'         },
  { number: 3, label: 'Fecha y Hora', icon: 'calendar_month' },
  { number: 4, label: 'Confirmación', icon: 'check_circle'   },
];
@Component({
  selector: 'app-create-appointment',
  standalone: true,
  imports: [
    CommonModule,
    ServiceSelectionComponent,
    ClientSelectionComponent,
    DatetimeSelectionComponent,
    ConfirmSelectionComponent,
  ],
  providers: [AppointmentCreateService],
  templateUrl: './appointment-create.component.html',
  styleUrl: './appointment-create.component.scss',
})
export class CreateAppointmentPageComponent implements OnInit, OnDestroy {
  @ViewChild('fabTemplate')         private fabTemplate!: TemplateRef<any>;
  @ViewChild(ServiceSelectionComponent) private serviceStep?: ServiceSelectionComponent;
  @ViewChild(ClientSelectionComponent)  private clientStep?: ClientSelectionComponent;
  @ViewChild(DatetimeSelectionComponent) private datetimeStep?: DatetimeSelectionComponent;
  protected readonly totalSteps = TOTAL_STEPS;
  protected get steps(): StepMeta[] {
    const role = this.wizardState.userRole();
    return role === 'WORKER'
      ? ALL_STEPS
      : ALL_STEPS.filter(s => s.number !== WORKER_ONLY_STEP);
  }
  protected get totalVisibleSteps(): number {
    return this.wizardState.totalVisibleSteps();
  }
  constructor(
    public readonly wizardState: AppointmentCreateService,
    private sessionService: SessionService,
    private router: Router,
    private route: ActivatedRoute,
    private fabService: FabService,
    private viewContainerRef: ViewContainerRef,
    private scrollService: ScrollService,
  ) {
    effect(() => {
      const step = this.wizardState.currentStep();
      this.scrollService.requestScrollToTop();
      if (step !== 4 && this.fabTemplate) {
        this.fabService.set(new TemplatePortal(this.fabTemplate, this.viewContainerRef));
      }
    });
  }
  public ngOnInit(): void {
    const role = (this.sessionService.getRole() ?? 'CLIENT') as WizardRole;
    const userId = this.sessionService.getUserId() ?? 0;
    this.wizardState.init(role, userId);
  }
  public ngAfterViewInit(): void {
    this.fabService.set(new TemplatePortal(this.fabTemplate, this.viewContainerRef));
  }
  public ngOnDestroy(): void {
    this.fabService.clear();
  }
  protected get currentStep(): number {
    return this.wizardState.currentStep();
  }
  /** Visible position of the current step (skips step 2 for CLIENT) */
  protected get visibleStep(): number {
    return this.wizardState.visibleStep();
  }
  protected isStepCompleted(stepIndex: number): boolean {
    return stepIndex + 1 < this.visibleStep;
  }
  protected isStepActive(stepIndex: number): boolean {
    return stepIndex + 1 === this.visibleStep;
  }
  protected progressPercent(): number {
    return ((this.visibleStep - 1) / (this.totalVisibleSteps - 1)) * 100;
  }
  protected get isDatetimeVerifying(): boolean {
    return this.datetimeStep?.isVerifying ?? false;
  }
  protected goBack(): void {
    if (this.wizardState.canGoBack()) {
      this.wizardState.prevStep();
    } else {
      this.router.navigate(['..'], { relativeTo: this.route });
    }
  }
  protected goNext(): void {
    if (!this.wizardState.canGoNext()) return;
    if (this.currentStep === 1 && this.serviceStep) {
      this.serviceStep.onNext();
      return;
    }
    if (this.currentStep === 2 && this.clientStep) {
      this.clientStep.onNext();
      return;
    }
    if (this.currentStep === 3 && this.datetimeStep) {
      this.datetimeStep.onNext();
      return;
    }
    this.wizardState.nextStep();
  }
}