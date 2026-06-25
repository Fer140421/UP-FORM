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
import { RequisitoPuestoRepository } from '../../../core/repositories/requisito-puesto.repository';
import { InstitucionRepository } from '../../../core/repositories/institucion.repository';
import { ProfesionalRepository } from '../../../core/repositories/profesional.repository';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap, catchError, map, take, finalize } from 'rxjs/operators';
import { Postulante, RequisitoPuesto, Profesional } from '../../../core/models';
import { NormalizeInputDirective } from '../../../core/directives/normalize-input.directive';

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
    MatChipsModule,
    NormalizeInputDirective
],
  templateUrl: './postulante-wizard.component.html',
  styleUrl: './postulante-wizard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostulanteWizardComponent {
  private fb = inject(FormBuilder);
  private repository = inject(PostulanteRepository);
  private reqRepository = inject(RequisitoPuestoRepository);
  private instRepository = inject(InstitucionRepository);
  private profesionalRepository = inject(ProfesionalRepository);
  private cloudinaryService = inject(CloudinaryService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLinear = true;
  loading = signal(false);
  editId = signal<string | null>(null);
  profesionales = signal<Profesional[]>([]);
  experienciasValue = signal<any[]>([]);

  totalTiempoServicio = computed(() => {
    const list = this.experienciasValue();
    let totalMonths = 0;
    
    list.forEach(exp => {
      const start = exp.fechaInicio as DateTime | null;
      const end = exp.fechaFin as DateTime | null;
      
      if (start && end && (start as any)?.isValid && (end as any)?.isValid) {
        const diff = end.diff(start, ['years', 'months']).toObject();
        const months = (diff.years || 0) * 12 + (diff.months || 0);
        if (months > 0) {
          totalMonths += months;
        }
      }
    });
    
    if (totalMonths === 0) {
      return '0 meses';
    }
    
    const years = Math.floor(totalMonths / 12);
    const remainingMonths = Math.round(totalMonths % 12);
    
    let result = '';
    if (years > 0) {
      result += `${years} ${years === 1 ? 'año' : 'años'}`;
    }
    if (remainingMonths > 0) {
      if (result) result += ' y ';
      result += `${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
    }
    
    return result || '0 meses';
  });

  // Map to store files to upload later
  private filesToUpload: Map<string, File> = new Map();

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

  areasCapacitacion: string[] = [
    'ADMINISTRACIÓN DE EMPRESAS',
    'ADMINISTRACIÓN FINANCIERA',
    'ADUANAS',
    'AUDITORÍA GENERAL',
    'AUDITORÍA INTERNA',
    'AUTOMOTRIZ',
    'BIBLIOTECOLOGIA-DOCUMENTACIÓN',
    'CAPACITACION EMPRESARIAL',
    'CIENCIAS MATERIALES',
    'COMERCIALIZACIÓN',
    'COMERCIO EXTERIOR',
    'COMPUTACIÓN',
    'CONTABILIDAD',
    'DERECHO',
    'DERECHO INMUEBLE',
    'DESARROLLO DE SISTEMAS',
    'ECONOMÍA',
    'EDUCACIÓN SUPERIOR',
    'ELECTRICIDAD',
    'ELECTROMECÁNICA',
    'EXPLORACIÓN',
    'EXPLOTACIÓN',
    'FINANZAS',
    'FLUIDOS DE PERFORACION',
    'GESTIÓN DE DOCUMENTOS',
    'GESTIÓN DE RIESGOS',
    'HABILIDADES SECRETARIALES',
    'HIDROCARBUROS',
    'HISTORIA',
    'IDIOMAS',
    'INDUSTRIALIZACIÓN DE HIDROCARBUROS',
    'INFORMÁTICA',
    'INGENIERÍA AGRONÓMICA',
    'INGENIERÍA AMBIENTAL',
    'INGENIERÍA FORESTAL',
    'INGENIERÍA GEOGRÁFICA',
    'INSTALACIONES DE GAS',
    'INSTRUMENTACIÓN Y CONTROL',
    'LEGAL',
    'LOGÍSTICA',
    'MANEJO DEFENSIVO',
    'MANTENIMIENTO INDUSTRIAL',
    'MARKETING',
    'MECÁNICA',
    'MEDICINA',
    'MOTORES A GASOLINA',
    'NORMAS DE CALIDAD',
    'OBRAS CIVILES',
    'OTROS',
    'PEDAGOGÍA',
    'PENAL O CONSTITUCIONAL',
    'PERFORACION DE POZOS',
    'PERFORACIÓN',
    'PLANIFICACIÓN',
    'PRIMEROS AUXILIOS',
    'PROCESOS',
    'PRODUCCIÓN',
    'PROYECTOS',
    'RECURSOS HUMANOS',
    'RELACIONES INTERNACIONALES',
    'RESERVORIOS',
    'SALUD OCUPACIONAL',
    'SEGURIDAD INDUSTRIAL',
    'SEGURIDAD INFORMÁTICA',
    'SISTEMAS DE INFORMACION Y GESTION',
    'SISTEMAS LEY 1178 SAFCO',
    'TRANSPORTE',
    'TRIBUTACIÓN E IMPUESTOS'
  ];

  personalDataForm = this.fb.group({
    carnet: ['', Validators.required],
    expedido: ['', Validators.required], // Nuevo campo
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
    documentoIdentidad: ['documento_defecto.pdf', Validators.required] // Por defecto para evitar invalidez si se oculta
  });

  nativeLanguageForm = this.fb.group({
    certificadoLenguaOriginaria: ['certificado_defecto.pdf', Validators.required], // Por defecto
    idiomasOriginarios: this.fb.array([]) // Nuevo FormArray
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
    puestoId: ['', Validators.required]
  });

  militaryServiceForm = this.fb.group({
    poseeLibreta: ['', Validators.required],
    archivo: ['']
  });

  electoralForm = this.fb.group({
    participacionElectoral: [[] as string[]] // Nuevo FormGroup para participación electoral
  });

  relocationForm = this.fb.group({
    disponibilidadTraslado: ['', Validators.required]
  });

  puestosDisponibles = signal<(RequisitoPuesto & { institucionNombre: string })[]>([]);
  searchTerm = signal('');

  filteredPuestos = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.puestosDisponibles().filter(p => 
      p.denominacionCargo.toLowerCase().includes(term) || 
      p.institucionNombre.toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.loadPuestos();
    this.loadProfesionales();
    this.checkEditMode();

    this.personalDataForm.get('genero')?.valueChanges.subscribe(() => {
      this.onGenderChange();
    });

    this.experienceForm.valueChanges.subscribe(() => {
      this.experienciasValue.set(this.experiencias.value);
    });
  }

  loadProfesionales() {
    this.profesionalRepository.getAll()
      .pipe(take(1))
      .subscribe({
        next: (list) => this.profesionales.set(list.filter(prof => prof.activo !== false)),
        error: (err) => console.error('Error al cargar profesionales:', err)
      });
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      this.loading.set(true);
      this.repository.getById(id)
        .pipe(
          take(1),
          finalize(() => this.loading.set(false))
        )
        .subscribe(data => {
          if (data) this.patchData(data);
        });
    }
  }

  patchData(data: Postulante) {
    this.personalDataForm.patchValue({
      ...data,
      fechaNacimiento: data.fechaNacimiento ? DateTime.fromISO(data.fechaNacimiento) : null
    } as any);

    this.identityDocForm.patchValue({ documentoIdentidad: data.documentoIdentidad || 'documento_defecto.pdf' });
    this.nativeLanguageForm.patchValue({ certificadoLenguaOriginaria: data.certificadoLenguaOriginaria || 'certificado_defecto.pdf' });
    this.funcionesForm.patchValue({ puestoId: data.puestoId });
    this.militaryServiceForm.patchValue({ poseeLibreta: data.poseeLibreta, archivo: data.archivo });
    this.electoralForm.patchValue({ participacionElectoral: data.participacionElectoral || [] });
    this.relocationForm.patchValue({ disponibilidadTraslado: data.disponibilidadTraslado || '' });

    // Clear arrays first
    while (this.certificados.length !== 0) this.certificados.removeAt(0);
    while (this.formaciones.length !== 0) this.formaciones.removeAt(0);
    while (this.experiencias.length !== 0) this.experiencias.removeAt(0);
    while (this.idiomasOriginarios.length !== 0) this.idiomasOriginarios.removeAt(0);

    // Patch arrays
    data.certificados?.forEach(c => {
      const group = this.fb.group({
        nombre: [c.nombre, Validators.required],
        descripcion: [c.descripcion, Validators.required],
        fecha: [c.fecha ? DateTime.fromISO(c.fecha) : null, Validators.required],
        archivo: [c.archivo || 'archivo_defecto.pdf', Validators.required],
        areaCapacitacion: [c.areaCapacitacion || c.nombre || '', Validators.required],
        nombreCurso: [c.nombreCurso || '', Validators.required],
        institucion: [c.institucion || c.descripcion || '', Validators.required]
      });
      group.get('areaCapacitacion')?.valueChanges.subscribe(val => {
        group.get('nombre')?.setValue(val || '', { emitEvent: false });
      });
      group.get('institucion')?.valueChanges.subscribe(val => {
        group.get('descripcion')?.setValue(val || '', { emitEvent: false });
      });
      this.certificados.push(group);
    });

    data.formacionesAcademicas?.forEach(f => {
      const group = this.fb.group({
        grado: [f.grado, Validators.required],
        institucion: [f.institucion, Validators.required],
        tituloObtenido: [f.tituloObtenido, Validators.required],
        fecha: [f.fecha ? DateTime.fromISO(f.fecha) : null, Validators.required],
        archivo: [f.archivo || 'archivo_defecto.pdf', Validators.required],
        profesion: [f.profesion || '', Validators.required]
      });
      this.formaciones.push(group);
    });

    data.experienciasLaborales?.forEach(e => {
      const group = this.fb.group({
        institucion: [e.institucion, Validators.required],
        area: [e.area, Validators.required],
        cargo: [e.cargo, Validators.required],
        fechaInicio: [e.fechaInicio ? DateTime.fromISO(e.fechaInicio) : null, Validators.required],
        fechaFin: [e.fechaFin ? DateTime.fromISO(e.fechaFin) : null, Validators.required],
        tiempoTrabajado: [e.tiempoTrabajado],
        archivo: [e.archivo || 'archivo_defecto.pdf', Validators.required]
      });

      group.get('fechaInicio')?.valueChanges.subscribe(() => this.calculateTime(group));
      group.get('fechaFin')?.valueChanges.subscribe(() => this.calculateTime(group));

      this.experiencias.push(group);
    });

    data.idiomasOriginarios?.forEach(i => {
      const group = this.fb.group({
        idioma: [i.idioma, Validators.required],
        otroIdioma: [i.otroIdioma || ''],
        institucion: [i.institucion, Validators.required],
        fecha: [i.fecha ? DateTime.fromISO(i.fecha) : null, Validators.required]
      });
      if (i.idioma === 'Otro') {
        group.get('otroIdioma')?.setValidators(Validators.required);
      }
      group.get('idioma')?.valueChanges.subscribe(val => {
        const otroCtrl = group.get('otroIdioma');
        if (val === 'Otro') {
          otroCtrl?.setValidators(Validators.required);
        } else {
          otroCtrl?.clearValidators();
          otroCtrl?.setValue('');
        }
        otroCtrl?.updateValueAndValidity();
      });
      this.idiomasOriginarios.push(group);
    });

    this.onGenderChange();
    this.experienciasValue.set(this.experiencias.value);
  }

  loadPuestos() {
    forkJoin({
      reqs: this.reqRepository.getAll().pipe(take(1)),
      insts: this.instRepository.getAll().pipe(take(1))
    }).subscribe(({ reqs, insts }) => {
      const activeInstitucionIds = new Set(insts.filter(i => i.activo !== false).map(i => i.id));
      const currentPuestoId = this.funcionesForm.get('puestoId')?.value;
      const activeReqs = reqs.filter(r =>
        r.activo !== false &&
        activeInstitucionIds.has(r.institucionId) &&
        (r.estado === 'Activo' || r.id === currentPuestoId)
      );
      const mapped = activeReqs.map(r => ({
        ...r,
        institucionNombre: insts.find(i => i.id === r.institucionId)?.nombre || 'Desconocida'
      }));
      this.puestosDisponibles.set(mapped);

      // Select first active puesto automatically for new postulant since step 5 is hidden
      if (!this.editId() && !this.funcionesForm.get('puestoId')?.value) {
        if (activeReqs.length > 0) {
          this.funcionesForm.get('puestoId')?.setValue(activeReqs[0].id);
        } else {
          this.funcionesForm.get('puestoId')?.setValue('puesto_defecto');
        }
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

  get idiomasOriginarios() {
    return this.nativeLanguageForm.get('idiomasOriginarios') as FormArray;
  }

  // Dynamic Item Methods
  addCertificado() {
    const group = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      fecha: [null as DateTime | null, Validators.required],
      archivo: ['archivo_defecto.pdf', Validators.required],
      areaCapacitacion: ['', Validators.required],
      nombreCurso: ['', Validators.required],
      institucion: ['', Validators.required]
    });
    group.get('areaCapacitacion')?.valueChanges.subscribe(val => {
      group.get('nombre')?.setValue(val || '', { emitEvent: false });
    });
    group.get('institucion')?.valueChanges.subscribe(val => {
      group.get('descripcion')?.setValue(val || '', { emitEvent: false });
    });
    this.certificados.push(group);
  }

  removeCertificado(index: number) {
    const key = `certificados.${index}.archivo`;
    this.filesToUpload.delete(key);
    this.certificados.removeAt(index);
  }

  addFormacion() {
    const group = this.fb.group({
      grado: ['', Validators.required],
      institucion: ['', Validators.required],
      tituloObtenido: ['', Validators.required],
      fecha: [null as DateTime | null, Validators.required],
      archivo: ['archivo_defecto.pdf', Validators.required],
      profesion: ['', Validators.required]
    });
    this.formaciones.push(group);
  }

  removeFormacion(index: number) {
    const key = `formaciones.${index}.archivo`;
    this.filesToUpload.delete(key);
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
      archivo: ['archivo_defecto.pdf', Validators.required]
    });

    // Watch for date changes to calculate time
    group.get('fechaInicio')?.valueChanges.subscribe(() => this.calculateTime(group));
    group.get('fechaFin')?.valueChanges.subscribe(() => this.calculateTime(group));

    this.experiencias.push(group);
    this.experienciasValue.set(this.experiencias.value);
  }

  removeExperiencia(index: number) {
    const key = `experiencias.${index}.archivo`;
    this.filesToUpload.delete(key);
    this.experiencias.removeAt(index);
    this.experienciasValue.set(this.experiencias.value);
  }

  addIdiomaOriginario() {
    const group = this.fb.group({
      idioma: ['', Validators.required],
      otroIdioma: [''],
      institucion: ['', Validators.required],
      fecha: [null as DateTime | null, Validators.required]
    });
    group.get('idioma')?.valueChanges.subscribe(val => {
      const otroCtrl = group.get('otroIdioma');
      if (val === 'Otro') {
        otroCtrl?.setValidators(Validators.required);
      } else {
        otroCtrl?.clearValidators();
        otroCtrl?.setValue('');
      }
      otroCtrl?.updateValueAndValidity();
    });
    this.idiomasOriginarios.push(group);
  }

  removeIdiomaOriginario(index: number) {
    this.idiomasOriginarios.removeAt(index);
  }

  private calculateTime(group: FormGroup) {
    const start = group.get('fechaInicio')?.value as DateTime;
    const end = group.get('fechaFin')?.value as DateTime;

    if (start && end && (start as any)?.isValid && (end as any)?.isValid) {
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

    // 1. Validar tipo
    if (!this.cloudinaryService.isValidFileType(file)) {
      this.snackBar.open('Tipo de archivo no permitido. Solo JPG, PNG, WEBP o PDF.', 'Cerrar', { duration: 4000 });
      event.target.value = '';
      return;
    }

    // 2. Validar tamaño (Máx 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      this.snackBar.open('El archivo excede el límite de 5MB', 'Cerrar', { 
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      event.target.value = ''; 
      return;
    }

    try {
      // Store the file to upload later
      let key = formControlName;
      if (index !== undefined) {
        // Find out which array it is
        let arrayName = 'array';
        if (formGroup === this.certificados) arrayName = 'certificados';
        if (formGroup === this.formaciones) arrayName = 'formaciones';
        if (formGroup === this.experiencias) arrayName = 'experiencias';
        key = `${arrayName}.${index}.${formControlName}`;
      }
      this.filesToUpload.set(key, file);

      // Set filename to form to pass validation
      const value = file.name;

      if (index !== undefined && formGroup instanceof FormArray) {
        formGroup.at(index).get(formControlName)?.setValue(value);
      } else if (formGroup instanceof FormGroup) {
        formGroup.get(formControlName)?.setValue(value);
      }
    } catch (error) {
      this.snackBar.open('Error al procesar el archivo', 'Cerrar', { duration: 3000 });
    }
  }

  onGenderChange() {
    const genero = this.personalDataForm.get('genero')?.value;
    const poseeLibreta = this.militaryServiceForm.get('poseeLibreta');
    const archivo = this.militaryServiceForm.get('archivo');

    if (genero === 'Masculino') {
      poseeLibreta?.setValidators(Validators.required);
      if (poseeLibreta?.value === 'Si') {
        archivo?.setValidators(Validators.required);
      } else {
        archivo?.clearValidators();
      }
    } else {
      poseeLibreta?.clearValidators();
      archivo?.clearValidators();
      // Auto-populate for female applicants to pass form step control validations
      poseeLibreta?.setValue('No', { emitEvent: false });
      archivo?.setValue('', { emitEvent: false });
    }
    poseeLibreta?.updateValueAndValidity({ emitEvent: false });
    archivo?.updateValueAndValidity({ emitEvent: false });
  }

  submit() {
    if (this.loading()) return;
    this.loading.set(true);

    // 1. Upload all files first
    const uploadTasks: Observable<{ key: string, url: string }>[] = [];
    this.filesToUpload.forEach((file, key) => {
      uploadTasks.push(
        this.cloudinaryService.uploadFile(file).pipe(
          map(url => ({ key, url }))
        )
      );
    });

    if (uploadTasks.length === 0) {
      this.savePostulante({});
      return;
    }

    forkJoin(uploadTasks).subscribe({
      next: (results) => {
        const fileUrls: { [key: string]: string } = {};
        results.forEach(res => fileUrls[res.key] = res.url);
        this.savePostulante(fileUrls);
      },
      error: (err) => {
        console.error('Upload error:', err);
        this.snackBar.open('Error al subir archivos a Cloudinary', 'Cerrar', { duration: 4000 });
        this.loading.set(false);
      }
    });
  }

  private savePostulante(fileUrls: { [key: string]: string }) {
    const rawData = {
      ...this.personalDataForm.value,
      ...this.identityDocForm.value,
      ...this.nativeLanguageForm.value,
      ...this.certificatesForm.value,
      ...this.funcionesForm.value,
      ...this.educationForm.value,
      ...this.experienceForm.value,
      ...this.militaryServiceForm.value,
      ...this.electoralForm.value,
      ...this.relocationForm.value
    };

    // Replace filenames with Cloudinary URLs
    const processedData = this.applyFileUrls(rawData, fileUrls);
    const formattedData = this.formatDates(processedData);

    const operation = this.editId() 
      ? this.repository.update(this.editId()!, formattedData)
      : this.repository.create(formattedData);

    operation.subscribe({
      next: () => {
        const msg = this.editId() ? 'Postulación actualizada' : 'Postulación guardada';
        this.snackBar.open(`${msg} exitosamente`, 'Cerrar', { duration: 3000 });
        this.router.navigate(['/dashboard/postulantes']);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Firestore error:', err);
        this.snackBar.open('Error al guardar la postulación', 'Cerrar', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  private applyFileUrls(data: any, fileUrls: { [key: string]: string }): any {
    const processed = { ...data };
    
    // Direct fields
    if (fileUrls['foto']) processed.foto = fileUrls['foto'];
    if (fileUrls['documentoIdentidad']) processed.documentoIdentidad = fileUrls['documentoIdentidad'];
    if (fileUrls['certificadoLenguaOriginaria']) processed.certificadoLenguaOriginaria = fileUrls['certificadoLenguaOriginaria'];
    if (fileUrls['archivo']) processed.archivo = fileUrls['archivo']; // military service

    // Arrays
    if (processed.certificados) {
      processed.certificados = processed.certificados.map((c: any, i: number) => ({
        ...c,
        archivo: fileUrls[`certificados.${i}.archivo`] || c.archivo
      }));
    }

    if (processed.formacionesAcademicas) {
      processed.formacionesAcademicas = processed.formacionesAcademicas.map((f: any, i: number) => ({
        ...f,
        archivo: fileUrls[`formaciones.${i}.archivo`] || f.archivo
      }));
    }

    if (processed.experienciasLaborales) {
      processed.experienciasLaborales = processed.experienciasLaborales.map((e: any, i: number) => ({
        ...e,
        archivo: fileUrls[`experiencias.${i}.archivo`] || e.archivo
      }));
    }

    return processed;
  }

  private formatDates(data: any): any {
    const formatted = { ...data };
    if (formatted.fechaNacimiento && formatted.fechaNacimiento.toISODate) {
      formatted.fechaNacimiento = formatted.fechaNacimiento.toISODate();
    }
    
    formatted.certificados = formatted.certificados?.map((c: any) => ({
      ...c,
      fecha: c.fecha?.toISODate ? c.fecha.toISODate() : c.fecha
    }));

    formatted.formacionesAcademicas = formatted.formacionesAcademicas?.map((f: any) => ({
      ...f,
      fecha: f.fecha?.toISODate ? f.fecha.toISODate() : f.fecha
    }));

    formatted.experienciasLaborales = formatted.experienciasLaborales?.map((e: any) => ({
      ...e,
      fechaInicio: e.fechaInicio?.toISODate ? e.fechaInicio.toISODate() : e.fechaInicio,
      fechaFin: e.fechaFin?.toISODate ? e.fechaFin.toISODate() : e.fechaFin
    }));

    formatted.idiomasOriginarios = formatted.idiomasOriginarios?.map((i: any) => ({
      ...i,
      fecha: i.fecha?.toISODate ? i.fecha.toISODate() : i.fecha
    }));

    return formatted;
  }

  get funcionesSeleccionadas(): string[] {
    return this.funcionesForm.get('funcionesPostular')?.value ?? [];
  }

  getSelectedPuestoName(): string {
    const id = this.funcionesForm.get('puestoId')?.value;
    const puesto = this.puestosDisponibles().find(p => p.id === id);
    return puesto ? `${puesto.denominacionCargo} (${puesto.institucionNombre})` : 'No seleccionado';
  }

  isElectoralSelected(option: string): boolean {
    const current = this.electoralForm.get('participacionElectoral')?.value || [];
    return current.includes(option);
  }

  toggleElectoralSelection(option: string) {
    const control = this.electoralForm.get('participacionElectoral');
    const current = [...(control?.value || [])];
    const index = current.indexOf(option);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(option);
    }
    control?.setValue(current);
    control?.updateValueAndValidity();
  }

  getStepNumber(step: 'personal' | 'nativeLanguage' | 'certificates' | 'education' | 'experience' | 'military' | 'electoral' | 'relocation' | 'summary'): number {
    const steps = ['personal', 'nativeLanguage', 'certificates', 'education', 'experience'];

    if (this.isMilitaryStepVisible()) {
      steps.push('military');
    }

    steps.push('electoral', 'relocation', 'summary');
    return steps.indexOf(step) + 1;
  }

  isMilitaryStepVisible(): boolean {
    return this.personalDataForm.get('genero')?.value === 'Masculino';
  }

  formatSummaryDate(value: unknown): string {
    if (!value) return 'No registrado';

    if ((value as DateTime)?.toFormat) {
      return (value as DateTime).toFormat('dd/MM/yyyy');
    }

    return String(value);
  }

  getArchivoResumen(value: unknown): string {
    const fileName = String(value || '');
    if (!fileName || fileName.includes('_defecto.pdf')) return 'No adjunto';
    return fileName;
  }

  getFotoPreviewUrl(): string {
    const file = this.filesToUpload.get('foto');
    if (file) {
      if (!(this as any)._fotoPreviewUrl || (this as any)._fotoPreviewFile !== file) {
        (this as any)._fotoPreviewUrl = URL.createObjectURL(file);
        (this as any)._fotoPreviewFile = file;
      }
      return (this as any)._fotoPreviewUrl;
    }
    return this.personalDataForm.get('foto')?.value || 'assets/placeholder-user.png';
  }

  getProfesorProfesiones(): string {
    const list = this.formaciones.value || [];
    return list.map((f: any) => f.profesion).filter(Boolean).join(', ') || 'Ninguna';
  }

  getParticipacionElectoralResumen(): string {
    const list = this.electoralForm.get('participacionElectoral')?.value || [];
    return list.join(', ') || 'Ninguna';
  }

  getDisponibilidadTrasladoResumen(): string {
    return this.relocationForm.get('disponibilidadTraslado')?.value || 'No registrada';
  }
}
