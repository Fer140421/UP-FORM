import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Bienvenido al Sistema UP-FORM</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Utilice el menú lateral para navegar por las diferentes opciones del sistema.</p>
      </mat-card-content>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {}
