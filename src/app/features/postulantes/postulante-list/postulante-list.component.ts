import { Component, inject, signal, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select'; // Nuevo
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'; // Nuevo
import { PostulanteRepository } from '../../../core/repositories/postulante.repository';
import { AsignacionRepository } from '../../../core/repositories/asignacion.repository';
import { RequisitoPuestoRepository } from '../../../core/repositories/requisito-puesto.repository';
import { ProfesionalRepository } from '../../../core/repositories/profesional.repository'; // Nuevo
import { Postulante, Profesional } from '../../../core/models';
import { ConfirmDialogComponent } from '../../dashboard/pages/home/confirm-dialog.component';
import { PostulanteDetalleComponent } from '../../instituciones/institucion-list/postulante-detalle/postulante-detalle.component';
import { finalize, take, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-postulante-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSelectModule, // Nuevo
    ReactiveFormsModule // Nuevo
  ],
  template: `
    <div class="page-container">
      <mat-card class="list-card">
        <mat-card-header>
          <mat-card-title>Listado de Postulantes</mat-card-title>
          <mat-card-subtitle>Gestiona los profesionales registrados en el sistema</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Filtros Combinables Reactivos -->
          <div [formGroup]="filterForm" class="filters-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; background: #fdfdfd; padding: 20px; border-radius: 12px; border: 1px solid #e0e0e0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <mat-form-field appearance="outline">
              <mat-label>Buscar por Carnet</mat-label>
              <input matInput formControlName="carnet" placeholder="Ej. 1234567">
              <mat-icon matSuffix>badge</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Buscar por Nombre</mat-label>
              <input matInput formControlName="nombreCompleto" placeholder="Ej. Juan Perez">
              <mat-icon matSuffix>person</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Profesión</mat-label>
              <mat-select formControlName="profesion">
                <mat-option value="">Todas</mat-option>
                @for (prof of profesionales(); track prof.id) {
                  <mat-option [value]="prof.name">{{prof.name}}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Participación Electoral</mat-label>
              <mat-select formControlName="participacionElectoral" multiple>
                <mat-option value="Primera vuelta elecciones nacionales">1ra Vuelta Nacionales</mat-option>
                <mat-option value="Segunda vuelta elecciones nacionales">2da Vuelta Nacionales</mat-option>
                <mat-option value="Elecciones subnacionales">Subnacionales</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="actions-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 16px;">
            <!-- Buscador antiguo comentado únicamente -->
            <!--
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar por nombre o carnet</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Ej. Juan Perez" #input>
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            -->
            <div style="flex-grow: 1;"></div>

            <button mat-flat-button color="primary" (click)="nuevoPostulante()">
              <mat-icon>add</mat-icon> NUEVO POSTULANTE
            </button>
          </div>

          @if (loading()) {
            <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          }

          <div class="table-container mat-elevation-z2">
            <table mat-table [dataSource]="dataSource" matSort>

              <ng-container matColumnDef="foto">
                <th mat-header-cell *matHeaderCellDef> Perfil </th>
                <td mat-cell *matCellDef="let row">
                  <img [src]="row.foto" class="profile-img" alt="Foto">
                </td>
              </ng-container>

              <ng-container matColumnDef="carnet">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Carnet </th>
                <td mat-cell *matCellDef="let row"> {{row.carnet}} </td>
              </ng-container>

              <ng-container matColumnDef="nombres">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Nombre Completo </th>
                <td mat-cell *matCellDef="let row"> {{row.nombres}} {{row.apellidoPaterno}} {{row.apellidoMaterno}} </td>
              </ng-container>

              <ng-container matColumnDef="celular">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Celular </th>
                <td mat-cell *matCellDef="let row"> {{row.celular}} </td>
              </ng-container>

              <ng-container matColumnDef="localidad">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Localidad </th>
                <td mat-cell *matCellDef="let row"> {{row.localidad}} </td>
              </ng-container>

              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef> Acciones </th>
                <td mat-cell *matCellDef="let row">
                  <div class="action-buttons">
                    <button mat-icon-button color="primary" matTooltip="Ver Detalle" (click)="verDetalle(row)">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button color="accent" matTooltip="Editar" (click)="editar(row)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" matTooltip="Eliminar" (click)="eliminar(row)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" colspan="6" style="text-align: center; padding: 20px;">
                  No hay datos que coincidan con los filtros aplicados.
                </td>
              </tr>
            </table>

            <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Seleccionar página"></mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <style>
      .page-container { padding: 24px; }
      .list-card { border-radius: 12px; }
      .actions-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 16px; }
      .table-container { border-radius: 8px; overflow: hidden; }
      table { width: 100%; }
      .profile-img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin: 4px 0; border: 1px solid #ddd; }
      .action-buttons { display: flex; gap: 4px; }
      .mat-column-foto { width: 60px; }
      .mat-column-acciones { width: 150px; }
    </style>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostulanteListComponent implements OnInit {
  private repository = inject(PostulanteRepository);
  private asigRepository = inject(AsignacionRepository);
  private reqRepository = inject(RequisitoPuestoRepository);
  private profesionalRepository = inject(ProfesionalRepository); // Nuevo
  private fb = inject(FormBuilder); // Nuevo
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  loading = signal(false);
  profesionales = signal<Profesional[]>([]); // Nuevo
  displayedColumns: string[] = ['foto', 'carnet', 'nombres', 'celular', 'localidad', 'acciones'];
  dataSource = new MatTableDataSource<Postulante>([]);

  // Formulario reactivo para filtros combinables
  filterForm = this.fb.group({
    carnet: [''],
    nombreCompleto: [''],
    profesion: [''],
    participacionElectoral: [[] as string[]]
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.loadData();
    this.loadProfesionales();
    this.setupFilters();
  }

  loadData() {
    this.loading.set(true);
    this.repository.getAll()
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe(data => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }

  loadProfesionales() {
    this.profesionalRepository.getAll()
      .pipe(take(1))
      .subscribe(list => {
        this.profesionales.set(list);
      });
  }

  setupFilters() {
    this.dataSource.filterPredicate = (data: Postulante, filterStr: string) => {
      const filterObj = JSON.parse(filterStr);

      if (filterObj.carnet && !data.carnet?.toLowerCase().includes(filterObj.carnet.toLowerCase())) {
        return false;
      }

      const fullname = `${data.nombres} ${data.apellidoPaterno} ${data.apellidoMaterno}`.toLowerCase();
      if (filterObj.nombreCompleto && !fullname.includes(filterObj.nombreCompleto.toLowerCase())) {
        return false;
      }

      if (filterObj.profesion) {
        const hasProfesion = data.formacionesAcademicas?.some(f => f.profesion === filterObj.profesion);
        if (!hasProfesion) {
          return false;
        }
      }

      if (filterObj.participacionElectoral && filterObj.participacionElectoral.length > 0) {
        const matchesAny = filterObj.participacionElectoral.some((opt: string) => 
          data.participacionElectoral?.includes(opt)
        );
        if (!matchesAny) {
          return false;
        }
      }

      return true;
    };

    this.filterForm.valueChanges.subscribe(val => {
      const filterObj = {
        carnet: val.carnet || '',
        nombreCompleto: val.nombreCompleto || '',
        profesion: val.profesion || '',
        participacionElectoral: val.participacionElectoral || []
      };
      this.dataSource.filter = JSON.stringify(filterObj);
    });
  }

  // Método original applyFilter comentado únicamente
  /*
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  */

  nuevoPostulante() {
    this.router.navigate(['/dashboard/postulantes/nuevo']);
  }

  verDetalle(postulante: Postulante) {
    this.dialog.open(PostulanteDetalleComponent, {
      width: '800px',
      data: postulante
    });
  }

  editar(postulante: Postulante) {
    this.router.navigate(['/dashboard/postulantes/editar', postulante.id]);
  }

  eliminar(postulante: Postulante) {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Postulante',
        message: `¿Está seguro de eliminar a ${postulante.nombres} ${postulante.apellidoPaterno}? Esta acción no se puede deshacer y liberará cualquier cargo asignado.`
      }
    });

    confirmRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading.set(true);

        // Eliminación en cascada: 1. Asignaciones -> 2. Liberar Puesto -> 3. Postulante
        this.asigRepository.getByProperty('postulanteId', postulante.id).pipe(
          take(1),
          switchMap(asignaciones => {
            if (asignaciones.length === 0) return of(null);

            const cleanupTasks = asignaciones.map(asig => 
              forkJoin({
                liberarPuesto: this.reqRepository.update(asig.requisitoId, { estado: 'Activo' } as any),
                borrarAsig: this.asigRepository.delete(asig.id)
              })
            );
            return forkJoin(cleanupTasks);
          }),
          switchMap(() => this.repository.delete(postulante.id)),
          finalize(() => this.loading.set(false))
        ).subscribe({
          next: () => {
            this.snackBar.open('Postulante y sus asignaciones eliminadas correctamente', 'Cerrar', { duration: 3000 });
            this.loadData();
          },
          error: (err) => {
            console.error('Error al eliminar postulante:', err);
            this.snackBar.open('Error al realizar la eliminación en cascada', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }
}
