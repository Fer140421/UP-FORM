import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RequisitoPuestoRepository } from '../../../core/repositories/requisito-puesto.repository';
import { InstitucionRepository } from '../../../core/repositories/institucion.repository';
import { RequisitoPuesto, Institucion } from '../../../core/models';
import { RequisitoFormComponent } from './requisito-form/requisito-form.component';
import { forkJoin } from 'rxjs';

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
    MatTooltipModule
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

  requisitos = signal<any[]>([]);
  instituciones = signal<Institucion[]>([]);
  
  displayedColumns: string[] = ['institucion', 'cargo', 'unidad', 'estado', 'acciones'];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
      requisitos: this.repository.getAll(),
      instituciones: this.instRepository.getAll()
    }).subscribe(({ requisitos, instituciones }) => {
      this.instituciones.set(instituciones);
      const mapped = requisitos.map(r => ({
        ...r,
        institucionNombre: instituciones.find(i => i.id === r.institucionId)?.nombre || 'Desconocida'
      }));
      this.requisitos.set(mapped);
    });
  }

  openForm(requisito?: RequisitoPuesto) {
    const dialogRef = this.dialog.open(RequisitoFormComponent, {
      width: '600px',
      data: { requisito, instituciones: this.instituciones() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  delete(id: string) {
    if (confirm('¿Está seguro de eliminar este requisito?')) {
      this.repository.delete(id).subscribe(() => {
        this.snackBar.open('Requisito eliminado', 'Cerrar', { duration: 3000 });
        this.loadData();
      });
    }
  }
}
