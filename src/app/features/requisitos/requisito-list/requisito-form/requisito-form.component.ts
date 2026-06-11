import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { RequisitoPuestoRepository } from '../../../../core/repositories/requisito-puesto.repository';
import { RequisitoPuesto, Institucion } from '../../../../core/models';

@Component({
  selector: 'app-requisito-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule],
  templateUrl: './requisito-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequisitoFormComponent {
  private fb = inject(FormBuilder);
  private repository = inject(RequisitoPuestoRepository);
  private dialogRef = inject(MatDialogRef<RequisitoFormComponent>);
  public data = inject<{ requisito?: RequisitoPuesto, instituciones: Institucion[] }>(MAT_DIALOG_DATA);

  form = this.fb.group({
    institucionId: [this.data.requisito?.institucionId || '', Validators.required],
    denominacionCargo: [this.data.requisito?.denominacionCargo || '', Validators.required],
    unidadPuesto: [this.data.requisito?.unidadPuesto || '', Validators.required],
    formacion: [this.data.requisito?.formacion || '', Validators.required],
    experienciaLaboral: [this.data.requisito?.experienciaLaboral || '', Validators.required],
    experienciaEspecifica: [this.data.requisito?.experienciaEspecifica || '', Validators.required],
    idiomaNativo: [this.data.requisito?.idiomaNativo || '', Validators.required],
    estado: [this.data.requisito?.estado || 'Activo', Validators.required]
  });

  save() {
    if (this.form.valid) {
      const value = this.form.value as RequisitoPuesto;
      const obs = this.data.requisito?.id 
        ? this.repository.update(this.data.requisito.id, value)
        : this.repository.create(value);

      obs.subscribe(() => this.dialogRef.close(true));
    }
  }
}
