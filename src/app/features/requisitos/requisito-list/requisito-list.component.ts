import { Component, inject, signal, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { RequisitoPuestoRepository } from '../../../core/repositories/requisito-puesto.repository';
import { InstitucionRepository } from '../../../core/repositories/institucion.repository';
import { RequisitoPuesto, Institucion } from '../../../core/models';
import { RequisitoFormComponent } from './requisito-form/requisito-form.component';
import { ConfirmDialogComponent } from '../../dashboard/pages/home/confirm-dialog.component';
import { forkJoin } from 'rxjs';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-requisito-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './requisito-list.component.html',
  styleUrl: './requisito-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequisitoListComponent implements OnInit {
  private repository = inject(RequisitoPuestoRepository);
  private instRepository = inject(InstitucionRepository);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  instituciones = signal<Institucion[]>([]);
  loading = signal(false);
  
  displayedColumns: string[] = ['institucion', 'cargo', 'unidad', 'idiomaNativo', 'estado', 'estadoRegistro', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  private textFilter = '';
  stateFilter: 'todos' | 'activos' | 'inactivos' = 'activos';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.setupFilters();
    this.loadData();
  }

  setupFilters() {
    this.dataSource.filterPredicate = (data: any, filterStr: string) => {
      const filter = JSON.parse(filterStr || '{}');
      const isActive = this.isActive(data);
      const matchesState =
        filter.state === 'todos' ||
        (filter.state === 'activos' && isActive) ||
        (filter.state === 'inactivos' && !isActive);
      const normalized = [
        data.institucionNombre,
        data.denominacionCargo,
        data.unidadPuesto,
        data.formacion,
        data.estado
      ].join(' ').toLowerCase();
      return matchesState && (!filter.text || normalized.includes(filter.text));
    };
    this.refreshFilter();
  }

  loadData() {
    this.loading.set(true);
    forkJoin({
      requisitos: this.repository.getAll().pipe(take(1)),
      instituciones: this.instRepository.getAll().pipe(take(1))
    })
    .pipe(finalize(() => this.loading.set(false)))
    .subscribe(({ requisitos, instituciones }) => {
      this.instituciones.set(instituciones.filter(i => i.activo !== false));
      const mapped = requisitos.map(r => ({
        ...r,
        institucionNombre: instituciones.find(i => i.id === r.institucionId)?.nombre || 'Desconocida'
      }));
      this.dataSource.data = mapped;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    this.textFilter = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.refreshFilter();
  }

  applyStateFilter(value: 'todos' | 'activos' | 'inactivos') {
    this.stateFilter = value;
    this.refreshFilter();
  }

  private refreshFilter() {
    this.dataSource.filter = JSON.stringify({ text: this.textFilter, state: this.stateFilter });
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  isActive(requisito: RequisitoPuesto): boolean {
    return requisito.activo !== false;
  }

  openForm(requisito?: RequisitoPuesto) {
    const dialogRef = this.dialog.open(RequisitoFormComponent, {
      width: '700px',
      data: { requisito, instituciones: this.instituciones() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  delete(id: string) {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Requisito',
        message: '¿Está seguro de eliminar este requisito de puesto?'
      }
    });

    confirmRef.afterClosed().subscribe(result => {
      if (result) {
        this.repository.delete(id).subscribe(() => {
          this.snackBar.open('Requisito eliminado', 'Cerrar', { duration: 3000 });
          this.loadData();
        });
      }
    });
  }

  activate(id: string) {
    this.repository.activate(id).subscribe(() => {
      this.snackBar.open('Requisito reactivado', 'Cerrar', { duration: 3000 });
      this.loadData();
    });
  }
}
