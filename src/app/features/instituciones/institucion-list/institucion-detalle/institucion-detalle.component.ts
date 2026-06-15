import { Component, inject, signal, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Institucion, RequisitoPuesto, Asignacion, Postulante } from '../../../../core/models';
import { RequisitoPuestoRepository } from '../../../../core/repositories/requisito-puesto.repository';
import { AsignacionRepository } from '../../../../core/repositories/asignacion.repository';
import { PostulanteRepository } from '../../../../core/repositories/postulante.repository';
import { PostulanteAsignarComponent } from '../postulante-asignar/postulante-asignar.component';
import { PostulanteDetalleComponent } from '../postulante-detalle/postulante-detalle.component';
import { ConfirmDialogComponent } from '../../../dashboard/pages/home/confirm-dialog.component';
import { finalize, take, switchMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-institucion-detalle',
  standalone: true,
  imports: [
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule
  ],
  template: `
    <h2 mat-dialog-title>Cargos Requeridos: {{ data.nombre }}</h2>
    <mat-dialog-content>
      <div class="search-container">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Buscar cargo</mat-label>
          <input matInput (keyup)="applyFilter($event)" placeholder="Ej. Abogado" #input>
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate" style="margin-bottom: 15px;"></mat-progress-bar>
      }

      <div class="table-container">
        <table mat-table [dataSource]="dataSource" matSort class="modern-table">
          <ng-container matColumnDef="cargo">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Denominación </th>
            <td mat-cell *matCellDef="let element" class="font-semibold"> {{element.denominacionCargo}} </td>
          </ng-container>

          <ng-container matColumnDef="unidad">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Unidad </th>
            <td mat-cell *matCellDef="let element"> {{element.unidadPuesto}} </td>
          </ng-container>

          <ng-container matColumnDef="formacion">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Formación </th>
            <td mat-cell *matCellDef="let element"> {{element.formacion}} </td>
          </ng-container>

          <ng-container matColumnDef="experiencia">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Experiencia </th>
            <td mat-cell *matCellDef="let element"> {{element.experienciaLaboral}} </td>
          </ng-container>

          <ng-container matColumnDef="estado">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Estado </th>
            <td mat-cell *matCellDef="let element">
              <span class="badge-status" [class.active]="element.estado === 'Activo'" [class.inactive]="element.estado === 'Inactivo'">
                {{ element.estado === 'Activo' ? 'Disponible' : 'Asignado' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef class="text-right"> Acciones </th>
            <td mat-cell *matCellDef="let element" class="text-right">
              <div class="action-buttons">
                @if (element.asignacion) {
                  <button mat-icon-button color="primary" (click)="verAsignado(element.asignacion)" matTooltip="Ver Persona Asignada">
                    <mat-icon>person</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="limpiarAsignacion(element.asignacion, element.id)" matTooltip="Limpiar Puesto">
                    <mat-icon>person_remove</mat-icon>
                  </button>
                } @else {
                  <button mat-stroked-button color="accent" (click)="asignarPuesto(element)" matTooltip="Asignar Postulante">
                    <mat-icon>person_add</mat-icon> Asignar
                  </button>
                }
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell empty-cell" [attr.colspan]="displayedColumns.length">
              @if (!loading()) {
                <div class="empty-state">
                  <mat-icon>rule</mat-icon>
                  <p>No se encontraron resultados para "{{input.value}}"</p>
                </div>
              }
            </td>
          </tr>
        </table>
      </div>
      <mat-paginator [pageSizeOptions]="[5, 10, 20]" aria-label="Seleccionar página"></mat-paginator>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>

    <style>
      .search-container { margin-bottom: 16px; }
      .search-field { width: 100%; }
      .table-container { min-height: 200px; }
      .modern-table { width: 100%; }
      .font-semibold { font-weight: 600; color: #333; }
      .badge-status {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        background: #f0f0f0;
        color: #666;
      }
      .badge-status.active {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .badge-status.inactive {
        background: #fff3e0;
        color: #ef6c00;
      }
      .action-buttons { display: flex; gap: 8px; justify-content: flex-end; align-items: center; }
      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #888;
      }
      .empty-state mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 10px;
        opacity: 0.5;
      }
      .empty-cell { border-bottom: none; }
    </style>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstitucionDetalleComponent implements OnInit {
  public data = inject<Institucion>(MAT_DIALOG_DATA);
  private reqRepository = inject(RequisitoPuestoRepository);
  private asigRepository = inject(AsignacionRepository);
  private postRepository = inject(PostulanteRepository);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  displayedColumns: string[] = ['cargo', 'unidad', 'formacion', 'experiencia', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    forkJoin({
      reqs: this.reqRepository.getByProperty('institucionId', this.data.id).pipe(take(1)),
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
    const dialogRef = this.dialog.open(PostulanteAsignarComponent, {
      width: '90%',
      maxWidth: '1200px',
      data: requisito
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
        // 1. Borrar asignacion, 2. Actualizar estado a Activo
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
