import { Component, computed, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { RequisitoPuestoRepository } from '../../../../core/repositories/requisito-puesto.repository';
import { ProfesionalRepository } from '../../../../core/repositories/profesional.repository';
import { RequisitoPuesto, Institucion, Profesional } from '../../../../core/models';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-requisito-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
  ],
  templateUrl: './requisito-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequisitoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private repository = inject(RequisitoPuestoRepository);
  private profesionalRepository = inject(ProfesionalRepository);
  private dialogRef = inject(MatDialogRef<RequisitoFormComponent>);
  public data = inject<{ requisito?: RequisitoPuesto; instituciones: Institucion[] }>(
    MAT_DIALOG_DATA,
  );

  loading = signal(false);
  profesionales = signal<Profesional[]>([]);
  formacionesSeleccionadas = signal<string[]>(this.parseFormaciones(this.data.requisito?.formacion));
  formacionColumns: string[] = ['profesion', 'acciones'];
  profesionalesDisponibles = computed(() => {
    const seleccionadas = new Set(this.formacionesSeleccionadas());
    return this.profesionales().filter(prof => !seleccionadas.has(prof.name));
  });

  form = this.fb.group({
    institucionId: [this.data.requisito?.institucionId || '', Validators.required],
    denominacionCargo: [this.data.requisito?.denominacionCargo || '', Validators.required],
    unidadPuesto: [this.data.requisito?.unidadPuesto || '', Validators.required],
    formacionAcademica: [''],
    experienciaLaboral: [
      this.data.requisito?.experienciaLaboral !== undefined && this.data.requisito?.experienciaLaboral !== null
        ? Number(this.data.requisito.experienciaLaboral)
        : 0,
      [Validators.required, Validators.min(0)]
    ],
    experienciaEspecifica: [
      this.data.requisito?.experienciaEspecifica !== undefined && this.data.requisito?.experienciaEspecifica !== null
        ? Number(this.data.requisito.experienciaEspecifica)
        : 0.0,
      [Validators.required, Validators.min(0)]
    ],
    idiomaNativo: [this.data.requisito?.idiomaNativo ?? null, Validators.required],
    estado: [this.data.requisito?.estado || 'Activo', Validators.required],
  });

  ngOnInit() {
    this.loadProfesionales();
  }

  loadProfesionales() {
    this.profesionalRepository.getAll()
      .pipe(take(1))
      .subscribe({
        next: (list) => {
          this.profesionales.set(list);
        },
        error: (err) => {
          console.error('Error al cargar profesionales:', err);
        }
    });
  }

  addFormacion(profesion: string) {
    if (!profesion || this.formacionesSeleccionadas().includes(profesion)) return;

    this.formacionesSeleccionadas.update(formaciones => [...formaciones, profesion]);
    this.form.get('formacionAcademica')?.reset('');
  }

  removeFormacion(profesion: string) {
    this.formacionesSeleccionadas.update(formaciones => formaciones.filter(item => item !== profesion));
  }

  incrementLaboral() {
    const current = Number(this.form.get('experienciaLaboral')?.value) || 0;
    this.form.get('experienciaLaboral')?.setValue(current + 1);
  }

  decrementLaboral() {
    const current = Number(this.form.get('experienciaLaboral')?.value) || 0;
    if (current > 0) {
      this.form.get('experienciaLaboral')?.setValue(current - 1);
    }
  }

  incrementEspecifica() {
    const current = Number(this.form.get('experienciaEspecifica')?.value) || 0;
    const val = Math.round((current + 0.1) * 10) / 10;
    this.form.get('experienciaEspecifica')?.setValue(val);
  }

  decrementEspecifica() {
    const current = Number(this.form.get('experienciaEspecifica')?.value) || 0;
    if (current > 0) {
      const val = Math.round((current - 0.1) * 10) / 10;
      this.form.get('experienciaEspecifica')?.setValue(val);
    }
  }

  save() {
    if (this.form.valid && this.formacionesSeleccionadas().length > 0 && !this.loading()) {
      this.loading.set(true);
      const { formacionAcademica, ...value } = this.form.value;
      const payload: RequisitoPuesto = {
        ...this.data.requisito,
        ...value,
        formacion: this.formacionesSeleccionadas().join(', '),
        experienciaLaboral: value.experienciaLaboral !== undefined && value.experienciaLaboral !== null
          ? String(value.experienciaLaboral)
          : '0',
        experienciaEspecifica: value.experienciaEspecifica !== undefined && value.experienciaEspecifica !== null
          ? String(value.experienciaEspecifica)
          : '0',
      } as RequisitoPuesto;

      const obs = this.data.requisito?.id
        ? this.repository.update(this.data.requisito.id, payload)
        : this.repository.create(payload);

      obs.pipe(finalize(() => this.loading.set(false))).subscribe(() => this.dialogRef.close(true));
    }
  }

  private parseFormaciones(formacion?: string): string[] {
    return formacion
      ? formacion.split(',').map(item => item.trim()).filter(Boolean)
      : [];
  }
}
