import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InstitucionRepository } from '../../../../core/repositories/institucion.repository';
import { Institucion } from '../../../../core/models';
import { NormalizeInputDirective } from '../../../../core/directives/normalize-input.directive';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-institucion-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, NormalizeInputDirective],
  templateUrl: './institucion-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstitucionFormComponent {
  private fb = inject(FormBuilder);
  private repository = inject(InstitucionRepository);
  private dialogRef = inject(MatDialogRef<InstitucionFormComponent>);
  public data = inject<Institucion>(MAT_DIALOG_DATA);

  loading = signal(false);

  form = this.fb.group({
    nombre: [this.data?.nombre || '', Validators.required],
    sigla: [this.data?.sigla || '']
  });

  save() {
    if (this.form.valid && !this.loading()) {
      this.loading.set(true);
      const value = this.form.value as Institucion;
      const obs = this.data?.id 
        ? this.repository.update(this.data.id, value)
        : this.repository.create(value);

      obs.pipe(finalize(() => this.loading.set(false)))
         .subscribe(() => this.dialogRef.close(true));
    }
  }
}
