import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideLuxonDateAdapter } from '@angular/material-luxon-adapter';
import { DateTime } from 'luxon';
import { PostulanteRepository } from '../../../core/repositories/postulante.repository';
import { Router } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-postulante-wizard',
  standalone: true,
  providers: [provideLuxonDateAdapter()],
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatTableModule,
    MatRadioModule,
    MatDividerModule,
    MatSnackBarModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatListModule,
    MatCheckboxModule,
    MatChipsModule 
],
  templateUrl: './postulante-wizard.component.html',
  styleUrl: './postulante-wizard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostulanteWizardComponent {
  private fb = inject(FormBuilder);
  private repository = inject(PostulanteRepository);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  isLinear = true;
  loading = signal(false);

  departamentos: string[] = [
    'La Paz',
    'Santa Cruz',
    'Cochabamba',
    'Oruro',
    'Potosí',
    'Chuquisaca',
    'Tarija',
    'Beni',
    'Pando'
  ];

  personalDataForm = this.fb.group({
    carnet: ['', Validators.required],
    foto: ['', Validators.required],
    nombres: ['', Validators.required],
    apellidoPaterno: ['', Validators.required],
    apellidoMaterno: ['', Validators.required],
    fechaNacimiento: [null as DateTime | null, Validators.required],
    genero: ['', Validators.required],
    celular: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    correo: ['', [Validators.email]],
    departamento: ['', Validators.required],
    localidad: ['', Validators.required],
    direccion: ['', Validators.required]
  });

  identityDocForm = this.fb.group({
    documentoIdentidad: ['', Validators.required]
  });

  nativeLanguageForm = this.fb.group({
    certificadoLenguaOriginaria: ['', Validators.required]
  });

  certificatesForm = this.fb.group({
    certificados: this.fb.array([])
  });

  educationForm = this.fb.group({
    formacionesAcademicas: this.fb.array([])
  });

  experienceForm = this.fb.group({
    experienciasLaborales: this.fb.array([])
  });

  funcionesForm = this.fb.group({
    funcionesPostular: [[], Validators.required]
  });

  militaryServiceForm = this.fb.group({
    poseeLibreta: ['', Validators.required],
    archivo: ['']
  });

  availableFunctions = signal<string[]>([
    'Administrativo',
    'Técnico en Sistemas',
    'Contador',
    'Secretaria',
    'Chofer',
    'Auxiliar de Servicios',
    'Asesor Legal',
    'Recursos Humanos',
    'Comunicación Social'
  ]);

  ngOnInit() {
    this.loadFunciones();
  }

  loadFunciones() {
    this.repository.getCustom('funciones').subscribe((funcs: any) => {
      if (funcs && funcs.length > 0) {
        this.availableFunctions.set(funcs);
      }
    });
  }

  // Getters for FormArrays
  get certificados() {
    return this.certificatesForm.get('certificados') as FormArray;
  }

  get formaciones() {
    return this.educationForm.get('formacionesAcademicas') as FormArray;
  }

  get experiencias() {
    return this.experienceForm.get('experienciasLaborales') as FormArray;
  }

  // Dynamic Item Methods
  addCertificado() {
    const group = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      fecha: [null as DateTime | null, Validators.required],
      archivo: ['', Validators.required]
    });
    this.certificados.push(group);
  }

  removeCertificado(index: number) {
    this.certificados.removeAt(index);
  }

  addFormacion() {
    const group = this.fb.group({
      grado: ['', Validators.required],
      institucion: ['', Validators.required],
      tituloObtenido: ['', Validators.required],
      fecha: [null as DateTime | null, Validators.required],
      archivo: ['', Validators.required]
    });
    this.formaciones.push(group);
  }

  removeFormacion(index: number) {
    this.formaciones.removeAt(index);
  }

  addExperiencia() {
    const group = this.fb.group({
      institucion: ['', Validators.required],
      area: ['', Validators.required],
      cargo: ['', Validators.required],
      fechaInicio: [null as DateTime | null, Validators.required],
      fechaFin: [null as DateTime | null, Validators.required],
      tiempoTrabajado: [''],
      archivo: ['', Validators.required]
    });

    // Watch for date changes to calculate time
    group.get('fechaInicio')?.valueChanges.subscribe(() => this.calculateTime(group));
    group.get('fechaFin')?.valueChanges.subscribe(() => this.calculateTime(group));

    this.experiencias.push(group);
  }

  removeExperiencia(index: number) {
    this.experiencias.removeAt(index);
  }

  private calculateTime(group: FormGroup) {
    const start = group.get('fechaInicio')?.value as DateTime;
    const end = group.get('fechaFin')?.value as DateTime;

    if (start && end) {
      const diff = end.diff(start, ['years', 'months']).toObject();
      const totalMonths = (diff.years || 0) * 12 + (diff.months || 0);
      
      let result = '';
      if (totalMonths < 12) {
        result = `${Math.floor(totalMonths)} meses`;
      } else {
        const years = (totalMonths / 12).toFixed(1);
        result = `${years} años`;
      }
      group.get('tiempoTrabajado')?.setValue(result);
    }
  }

  async onFileChange(event: any, formControlName: string, formGroup: FormGroup | FormArray, index?: number) {
    const file = event.target.files[0] as File;
    if (!file) return;

    // 1. Validar tamaño (Máx 2MB)
    const maxSizeInBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      this.snackBar.open('El archivo excede el límite de 2MB', 'Cerrar', { 
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      event.target.value = ''; // Reset input
      return;
    }

    try {
      let result: string;

      // 2. Comprimir si es imagen (Foto de perfil)
      if (file.type.startsWith('image/')) {
        result = await this.compressImage(file);
      } else {
        // 3. Convertir a Base64 para PDF
        result = await this.fileToBase64(file);
      }

      // 4. Asignar al formulario
      if (index !== undefined && formGroup instanceof FormArray) {
        formGroup.at(index).get(formControlName)?.setValue(result);
      } else if (formGroup instanceof FormGroup) {
        formGroup.get(formControlName)?.setValue(result);
      }
    } catch (error) {
      this.snackBar.open('Error al procesar el archivo', 'Cerrar', { duration: 3000 });
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  private compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Max dimensions
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Quality 0.7
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  }

  onGenderChange() {
    const genero = this.personalDataForm.get('genero')?.value;
    const poseeLibreta = this.militaryServiceForm.get('poseeLibreta');
    const archivo = this.militaryServiceForm.get('archivo');

    if (genero === 'Masculino') {
      poseeLibreta?.setValidators(Validators.required);
    } else {
      poseeLibreta?.clearValidators();
    }
    poseeLibreta?.updateValueAndValidity();
  }

  submit() {
    if (this.loading()) return;

    this.loading.set(true);
    
    const rawData = {
      ...this.personalDataForm.value,
      ...this.identityDocForm.value,
      ...this.nativeLanguageForm.value,
      ...this.certificatesForm.value,
      ...this.funcionesForm.value,
      ...this.educationForm.value,
      ...this.experienceForm.value,
      ...this.militaryServiceForm.value
    };

    // Format dates before saving
    const formattedData = this.formatDates(rawData);

    this.repository.create(formattedData).subscribe({
      next: () => {
        this.snackBar.open('Postulación guardada exitosamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/dashboard/home']);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Error al guardar la postulación', 'Cerrar', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  private formatDates(data: any): any {
    const formatted = { ...data };
    if (formatted.fechaNacimiento) formatted.fechaNacimiento = formatted.fechaNacimiento.toISODate();
    
    formatted.certificados = formatted.certificados?.map((c: any) => ({
      ...c,
      fecha: c.fecha?.toISODate()
    }));

    formatted.formacionesAcademicas = formatted.formacionesAcademicas?.map((f: any) => ({
      ...f,
      fecha: f.fecha?.toISODate()
    }));

    formatted.experienciasLaborales = formatted.experienciasLaborales?.map((e: any) => ({
      ...e,
      fechaInicio: e.fechaInicio?.toISODate(),
      fechaFin: e.fechaFin?.toISODate()
    }));

    return formatted;
  }

  get funcionesSeleccionadas(): string[] {
    return this.funcionesForm.get('funcionesPostular')?.value ?? [];
  }
}
