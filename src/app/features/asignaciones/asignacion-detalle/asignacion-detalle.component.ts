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
import { Asignacion, Institucion, RequisitoPuesto } from '../../../core/models';
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
  displayedColumns: string[] = ['cargo', 'unidad', 'formacion', 'experiencia', 'idiomaNativo', 'estado', 'acciones'];
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
        const mapped = reqs.map(r => ({
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
}
