import { Component, inject, signal, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { InstitucionRepository } from '../../../core/repositories/institucion.repository';
import { Institucion } from '../../../core/models';
import { InstitucionFormComponent } from './institucion-form/institucion-form.component';
import { ConfirmDialogComponent } from '../../dashboard/pages/home/confirm-dialog.component';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-institucion-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './institucion-list.component.html',
  styleUrl: './institucion-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstitucionListComponent implements OnInit {
  private repository = inject(InstitucionRepository);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  displayedColumns: string[] = ['id', 'nombre', 'sigla', 'estadoRegistro', 'acciones'];
  dataSource = new MatTableDataSource<Institucion>([]);
  private textFilter = '';
  stateFilter: 'todos' | 'activos' | 'inactivos' = 'activos';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.setupFilters();
    this.loadData();
  }

  setupFilters() {
    this.dataSource.filterPredicate = (data: Institucion, filterStr: string) => {
      const filter = JSON.parse(filterStr || '{}');
      const isActive = this.isActive(data);
      const matchesState =
        filter.state === 'todos' ||
        (filter.state === 'activos' && isActive) ||
        (filter.state === 'inactivos' && !isActive);
      const normalized = `${data.id || ''} ${data.nombre || ''} ${data.sigla || ''}`.toLowerCase();
      return matchesState && (!filter.text || normalized.includes(filter.text));
    };
    this.refreshFilter();
  }

  loadData() {
    this.loading.set(true);
    this.repository.getAll()
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: data => {
          this.dataSource.data = data;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        error: err => {
          console.error('ERROR LOADING INSTITUCIONES =>', err);
        }
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

  isActive(institucion: Institucion): boolean {
    return institucion.activo !== false;
  }

  openForm(institucion?: Institucion) {
    const dialogRef = this.dialog.open(InstitucionFormComponent, {
      width: '400px',
      data: institucion
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
        title: 'Eliminar Institución',
        message: '¿Está seguro de eliminar esta institución? Esta acción no se puede deshacer.'
      }
    });

    confirmRef.afterClosed().subscribe(result => {
      if (result) {
        this.repository.delete(id).subscribe(() => {
          this.snackBar.open('Institución eliminada', 'Cerrar', { duration: 3000 });
          this.loadData();
        });
      }
    });
  }

  activate(id: string) {
    this.repository.activate(id).subscribe(() => {
      this.snackBar.open('InstituciÃ³n reactivada', 'Cerrar', { duration: 3000 });
      this.loadData();
    });
  }
}
