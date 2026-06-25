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
import { ProfesionalRepository } from '../../../core/repositories/profesional.repository';
import { Profesional } from '../../../core/models';
import { ProfesionalFormComponent } from './profesional-form/profesional-form.component';
import { ConfirmDialogComponent } from '../../dashboard/pages/home/confirm-dialog.component';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-profesional-list',
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
  templateUrl: './profesional-list.component.html',
  styleUrl: './profesional-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfesionalListComponent implements OnInit {
  private repository = inject(ProfesionalRepository);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  displayedColumns: string[] = ['id', 'name', 'estadoRegistro', 'acciones'];
  dataSource = new MatTableDataSource<Profesional>([]);
  private textFilter = '';
  stateFilter: 'todos' | 'activos' | 'inactivos' = 'activos';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.setupFilters();
    this.loadData();
  }

  setupFilters() {
    this.dataSource.filterPredicate = (data: Profesional, filterStr: string) => {
      const filter = JSON.parse(filterStr || '{}');
      const isActive = this.isActive(data);
      const matchesState =
        filter.state === 'todos' ||
        (filter.state === 'activos' && isActive) ||
        (filter.state === 'inactivos' && !isActive);
      const normalized = `${data.id || ''} ${data.name || ''}`.toLowerCase();
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
          console.error('ERROR LOADING PROFESIONALES =>', err);
          this.snackBar.open('Error al cargar profesionales', 'Cerrar', { duration: 3000 });
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

  isActive(profesional: Profesional): boolean {
    return profesional.activo !== false;
  }

  openForm(profesional?: Profesional) {
    const dialogRef = this.dialog.open(ProfesionalFormComponent, {
      width: '400px',
      data: profesional
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
        title: 'Eliminar Profesional',
        message: '¿Está seguro de eliminar este profesional? Esta acción no se puede deshacer.'
      }
    });

    confirmRef.afterClosed().subscribe(result => {
      if (result) {
        this.repository.delete(id).subscribe({
          next: () => {
            this.snackBar.open('Profesional eliminado con éxito', 'Cerrar', { duration: 3000 });
            this.loadData();
          },
          error: err => {
            console.error('ERROR DELETING PROFESIONAL =>', err);
            this.snackBar.open('Error al eliminar profesional', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }

  activate(id: string) {
    this.repository.activate(id).subscribe({
      next: () => {
        this.snackBar.open('Profesional reactivado con Ã©xito', 'Cerrar', { duration: 3000 });
        this.loadData();
      },
      error: err => {
        console.error('ERROR ACTIVATING PROFESIONAL =>', err);
        this.snackBar.open('Error al reactivar profesional', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
