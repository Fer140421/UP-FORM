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
  displayedColumns: string[] = ['id', 'name', 'acciones'];
  dataSource = new MatTableDataSource<Profesional>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.loadData();
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
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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
}
