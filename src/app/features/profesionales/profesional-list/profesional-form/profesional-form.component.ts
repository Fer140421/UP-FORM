import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfesionalRepository } from '../../../../core/repositories/profesional.repository';
import { Profesional } from '../../../../core/models';
import { NormalizeInputDirective } from '../../../../core/directives/normalize-input.directive';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-profesional-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, NormalizeInputDirective],
  templateUrl: './profesional-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfesionalFormComponent {
  private fb = inject(FormBuilder);
  private repository = inject(ProfesionalRepository);
  private dialogRef = inject(MatDialogRef<ProfesionalFormComponent>);
  private snackBar = inject(MatSnackBar);
  public data = inject<Profesional>(MAT_DIALOG_DATA);

  loading = signal(false);

  form = this.fb.group({
    name: [this.data?.name || '', Validators.required]
  });

  save() {
    if (this.form.valid && !this.loading()) {
      this.loading.set(true);
      const value = this.form.value as Profesional;
      const obs = this.data?.id 
        ? this.repository.update(this.data.id, value)
        : this.repository.create(value);

      obs.pipe(finalize(() => this.loading.set(false)))
         .subscribe({
           next: () => {
             this.snackBar.open(
               this.data?.id ? 'Profesional actualizado con éxito' : 'Profesional creado con éxito',
               'Cerrar',
               { duration: 3000 }
             );
             this.dialogRef.close(true);
           },
           error: err => {
             console.error('Error saving profesional:', err);
             this.snackBar.open('Error al guardar el profesional', 'Cerrar', { duration: 3000 });
           }
         });
    }
  }
}
