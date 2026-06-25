import { Component, inject, signal, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { finalize, switchMap, take } from 'rxjs/operators';
import { Asignacion, Institucion, Postulante, RequisitoPuesto } from '../../../core/models';
import { InstitucionRepository } from '../../../core/repositories/institucion.repository';
import { RequisitoPuestoRepository } from '../../../core/repositories/requisito-puesto.repository';
import { AsignacionRepository } from '../../../core/repositories/asignacion.repository';
import { PostulanteRepository } from '../../../core/repositories/postulante.repository';
import { PostulanteAsignarComponent } from '../../instituciones/institucion-list/postulante-asignar/postulante-asignar.component';
import { PostulanteDetalleComponent } from '../../instituciones/institucion-list/postulante-detalle/postulante-detalle.component';
import { ConfirmDialogComponent } from '../../dashboard/pages/home/confirm-dialog.component';

@Component({
  selector: 'app-asignacion-detalle',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule
  ],
  templateUrl: './asignacion-detalle.component.html',
  styleUrl: './asignacion-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsignacionDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private instRepository = inject(InstitucionRepository);
  private reqRepository = inject(RequisitoPuestoRepository);
  private asigRepository = inject(AsignacionRepository);
  private postRepository = inject(PostulanteRepository);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  institucion = signal<Institucion | null>(null);
  loading = signal(false);
  displayedColumns: string[] = ['cargo', 'unidad', 'formacion', 'experienciaLaboral', 'experienciaEspecifica', 'idiomaNativo', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    const institucionId = this.route.snapshot.paramMap.get('id');

    if (!institucionId) {
      this.volver();
      return;
    }

    this.loading.set(true);
    this.instRepository.getById(institucionId)
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe(institucion => {
        this.institucion.set(institucion);
        this.loadData();
      });
  }

  volver() {
    this.router.navigate(['/dashboard/asignaciones']);
  }

  loadData() {
    const institucion = this.institucion();
    if (!institucion?.id) return;

    this.loading.set(true);
    forkJoin({
      reqs: this.reqRepository.getByProperty('institucionId', institucion.id).pipe(take(1)),
      asigs: this.asigRepository.getAll().pipe(take(1))
    }).pipe(finalize(() => this.loading.set(false)))
      .subscribe(({ reqs, asigs }) => {
        const mapped = reqs.filter(r => r.activo !== false).map(r => ({
          ...r,
          asignacion: asigs.find(a => a.requisitoId === r.id)
        }));
        this.dataSource.data = mapped;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  asignarPuesto(requisito: RequisitoPuesto) {
    const institucionNombre = this.institucion()?.nombre;

    const dialogRef = this.dialog.open(PostulanteAsignarComponent, {
      width: '90%',
      maxWidth: '1200px',
      data: {
        ...requisito,
        institucionNombre
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  verAsignado(asignacion: Asignacion) {
    this.loading.set(true);
    this.postRepository.getById(asignacion.postulanteId)
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe(post => {
        this.dialog.open(PostulanteDetalleComponent, {
          width: '700px',
          data: post
        });
      });
  }

  limpiarAsignacion(asignacion: Asignacion, requisitoId: string) {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Retirar Asignación',
        message: '¿Está seguro de retirar la asignación de este puesto?'
      }
    });

    confirmRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading.set(true);
        this.asigRepository.delete(asignacion.id).pipe(
          switchMap(() => this.reqRepository.update(requisitoId, { estado: 'Activo' } as any)),
          finalize(() => this.loading.set(false))
        ).subscribe(() => {
          this.snackBar.open('Puesto liberado correctamente', 'Cerrar', { duration: 3000 });
          this.loadData();
        });
      }
    });
  }

  generarReporte(asignacion: Asignacion, requisito: RequisitoPuesto) {
    this.loading.set(true);
    this.postRepository.getById(asignacion.postulanteId)
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe(postulante => {
        const fileName = `reporte-asignacion-${postulante.carnet || postulante.id}.pdf`;
        const pdf = this.createAsignacionPdf(postulante, requisito, asignacion);
        const url = URL.createObjectURL(pdf);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
      });
  }

  private createAsignacionPdf(postulante: Postulante, requisito: RequisitoPuesto, asignacion: Asignacion): Blob {
    const lines = this.buildReportLines(postulante, requisito, asignacion);
    return this.renderPdf(lines);
  }

  private buildReportLines(postulante: Postulante, requisito: RequisitoPuesto, asignacion: Asignacion): string[] {
    const institucionNombre = this.institucion()?.nombre || 'No registrada';
    const fullName = `${postulante.nombres} ${postulante.apellidoPaterno} ${postulante.apellidoMaterno}`;
    const lines: string[] = [
      'REPORTE DE ASIGNACION DE POSTULANTE',
      `Fecha de reporte: ${new Date().toLocaleDateString()}`,
      '',
      'DATOS DEL PUESTO',
      `Institucion: ${institucionNombre}`,
      `Cargo: ${requisito.denominacionCargo}`,
      `Unidad: ${requisito.unidadPuesto}`,
      `Formacion requerida: ${requisito.formacion}`,
      `Experiencia general requerida: ${requisito.experienciaLaboral} anios`,
      `Experiencia especifica requerida: ${requisito.experienciaEspecifica} anios`,
      `Idioma nativo: ${requisito.idiomaNativo ? 'Requerido' : 'No requerido'}`,
      `Estado del puesto: ${requisito.estado}`,
      `Fecha de asignacion: ${this.formatReportDate(asignacion.fechaAsignacion)}`,
      '',
      'DATOS PERSONALES DEL POSTULANTE',
      `Nombre completo: ${fullName}`,
      `Carnet de identidad: ${postulante.carnet} (${postulante.expedido || 'Sin expedido'})`,
      `Fecha de nacimiento: ${postulante.fechaNacimiento || 'No registrada'}`,
      `Genero: ${postulante.genero || 'No registrado'}`,
      `Celular: ${postulante.celular || 'No registrado'}`,
      `Correo: ${postulante.correo || 'No registrado'}`,
      `Departamento: ${postulante.departamento || 'No registrado'}`,
      `Localidad: ${postulante.localidad || 'No registrada'}`,
      `Direccion: ${postulante.direccion || 'No registrada'}`,
      `Libreta militar: ${postulante.poseeLibreta || 'No aplica'}`,
      '',
      'PARTICIPACION ELECTORAL',
      ...(postulante.participacionElectoral?.length
        ? postulante.participacionElectoral.map(item => `- ${item}`)
        : ['- Ninguna registrada']),
      '',
      'FORMACION ACADEMICA',
      ...(postulante.formacionesAcademicas?.length
        ? postulante.formacionesAcademicas.flatMap((item, index) => [
            `${index + 1}. ${item.grado}: ${item.tituloObtenido}`,
            `   Profesion: ${item.profesion || 'No registrada'}`,
            `   Institucion: ${item.institucion || 'No registrada'} | Fecha: ${item.fecha || 'No registrada'}`
          ])
        : ['- No registrada']),
      '',
      'EXPERIENCIA LABORAL',
      ...(postulante.experienciasLaborales?.length
        ? postulante.experienciasLaborales.flatMap((item, index) => [
            `${index + 1}. ${item.cargo} - ${item.institucion}`,
            `   Area: ${item.area || 'No registrada'}`,
            `   Periodo: ${item.fechaInicio || 'N/A'} a ${item.fechaFin || 'N/A'} | Tiempo: ${item.tiempoTrabajado || 'Sin calculo'}`
          ])
        : ['- No registrada']),
      '',
      'CAPACITACIONES',
      ...(postulante.certificados?.length
        ? postulante.certificados.flatMap((item, index) => [
            `${index + 1}. ${item.areaCapacitacion || item.nombre}`,
            `   Curso: ${item.nombreCurso || 'No registrado'}`,
            `   Institucion: ${item.institucion || item.descripcion || 'No registrada'} | Fecha: ${item.fecha || 'No registrada'}`
          ])
        : ['- No registradas']),
      '',
      'IDIOMAS ORIGINARIOS',
      ...(postulante.idiomasOriginarios?.length
        ? postulante.idiomasOriginarios.map(item =>
            `- ${item.idioma === 'Otro' ? item.otroIdioma : item.idioma} | ${item.institucion || 'No registrada'} | ${item.fecha || 'No registrada'}`
          )
        : ['- No registrados'])
    ];

    return lines;
  }

  private renderPdf(lines: string[]): Blob {
    const encoder = new TextEncoder();
    const objects: string[] = [];
    const pageObjectIds: number[] = [];
    const lineHeight = 14;
    const maxLinesPerPage = 48;
    const chunks = this.chunkLines(lines, maxLinesPerPage);

    const addObject = (content: string): number => {
      objects.push(content);
      return objects.length;
    };

    const pagesId = 1;
    addObject('');
    const fontRegularId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    const fontBoldId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

    chunks.forEach((chunk, pageIndex) => {
      const stream = this.buildPageStream(chunk, pageIndex + 1, chunks.length, lineHeight);
      const streamId = addObject(`<< /Length ${encoder.encode(stream).length} >>\nstream\n${stream}\nendstream`);
      const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${streamId} 0 R >>`);
      pageObjectIds.push(pageId);
    });

    objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageObjectIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`;
    const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [0];

    objects.forEach((object, index) => {
      offsets.push(encoder.encode(pdf).length);
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });

    const xrefOffset = encoder.encode(pdf).length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach(offset => {
      pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return new Blob([pdf], { type: 'application/pdf' });
  }

  private buildPageStream(lines: string[], page: number, totalPages: number, lineHeight: number): string {
    const commands: string[] = [
      'BT',
      '/F2 16 Tf',
      `50 800 Td ${this.toPdfText(lines[0] || '')} Tj`,
      'ET'
    ];

    lines.slice(1).forEach((line, index) => {
      const y = 775 - index * lineHeight;
      const isSection = !!line && line.toUpperCase() === line && !line.startsWith('-') && line.length < 45;
      commands.push('BT');
      commands.push(`${isSection ? '/F2 11 Tf' : '/F1 9 Tf'}`);
      commands.push(`50 ${y} Td ${this.toPdfText(line)} Tj`);
      commands.push('ET');
    });

    commands.push('BT');
    commands.push('/F1 8 Tf');
    commands.push(`50 32 Td ${this.toPdfText(`Pagina ${page} de ${totalPages}`)} Tj`);
    commands.push('ET');

    return commands.join('\n');
  }

  private chunkLines(lines: string[], size: number): string[][] {
    const chunks: string[][] = [];
    for (let i = 0; i < lines.length; i += size) {
      chunks.push(lines.slice(i, i + size));
    }
    return chunks;
  }

  private toPdfText(value: string): string {
    const normalized = value
      .replace(/ñ/g, 'n')
      .replace(/Ñ/g, 'N')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');

    return `(${normalized})`;
  }

  private formatReportDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  }
}
