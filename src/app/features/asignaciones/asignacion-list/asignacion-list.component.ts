import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { InstitucionRepository } from '../../../core/repositories/institucion.repository';
import { RequisitoPuestoRepository } from '../../../core/repositories/requisito-puesto.repository';
import { Institucion, RequisitoPuesto } from '../../../core/models';
import { AsignacionModalComponent } from './asignacion-modal/asignacion-modal.modal';
import { forkJoin } from 'rxjs';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-asignacion-list',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatCardModule, MatProgressBarModule],
  templateUrl: './asignacion-list.component.html',
  styleUrl: './asignacion-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsignacionListComponent implements OnInit {
  private instRepository = inject(InstitucionRepository);
  private reqRepository = inject(RequisitoPuestoRepository);
  private dialog = inject(MatDialog);

  instituciones = signal<Institucion[]>([]);
  requisitos = signal<RequisitoPuesto[]>([]);
  loading = signal(false);
  displayedColumns: string[] = ['nombre', 'acciones'];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    forkJoin({
      insts: this.instRepository.getAll().pipe(take(1)),
      reqs: this.reqRepository.getAll().pipe(take(1))
    })
    .pipe(finalize(() => this.loading.set(false)))
    .subscribe(({ insts, reqs }) => {
      this.instituciones.set(insts);
      this.requisitos.set(reqs);
    });
  }

  openAsignacion(institucion: Institucion) {
    const instRequisitos = this.requisitos().filter(r => r.institucionId === institucion.id);
    
    this.dialog.open(AsignacionModalComponent, {
      width: '90%',
      maxWidth: '1200px',
      data: { institucion, requisitos: instRequisitos }
    });
  }
}
