import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InstitucionRepository } from '../../../core/repositories/institucion.repository';
import { Institucion } from '../../../core/models';
import { InstitucionFormComponent } from './institucion-form/institucion-form.component';

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
    MatTooltipModule
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
  displayedColumns: string[] = ['id', 'nombre', 'acciones'];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.repository.getAll().subscribe(data => this.instituciones.set(data));
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
    if (confirm('¿Está seguro de eliminar esta institución?')) {
      this.repository.delete(id).subscribe(() => {
        this.snackBar.open('Institución eliminada', 'Cerrar', { duration: 3000 });
        this.loadData();
      });
    }
  }
}
