import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { InstitucionRepository } from '../../../core/repositories/institucion.repository';
import { Institucion } from '../../../core/models';
import { InstitucionFormComponent } from './institucion-form/institucion-form.component';
import { InstitucionDetalleComponent } from './institucion-detalle/institucion-detalle.component';
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
    MatProgressBarModule
  ],
  templateUrl: './institucion-list.component.html',
  styleUrl: './institucion-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstitucionListComponent implements OnInit {
  private repository = inject(InstitucionRepository);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  instituciones = signal<Institucion[]>([]);
  loading = signal(false);
  displayedColumns: string[] = ['id', 'nombre', 'acciones'];

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
          this.instituciones.set(data);
        },
        error: err => {
          console.error('ERROR LOADING INSTITUCIONES =>', err);
        }
      });
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

  ingresar(institucion: Institucion) {
    this.dialog.open(InstitucionDetalleComponent, {
      width: '800px',
      data: institucion
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
}
