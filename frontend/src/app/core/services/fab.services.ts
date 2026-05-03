import { Injectable, signal } from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';

@Injectable({ providedIn: 'root' })
export class FabService {
  private fabPortal = signal<TemplatePortal | null>(null);
  readonly portal = this.fabPortal.asReadonly();

  set(portal: TemplatePortal) { this.fabPortal.set(portal); }
  clear() { this.fabPortal.set(null); }
}