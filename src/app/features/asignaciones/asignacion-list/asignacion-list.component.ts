import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { InstitucionRepository } from '../../../core/repositories/institucion.repository';
import { RequisitoPuestoRepository } from '../../../core/repositories/requisito-puesto.repository';
import { Institucion, RequisitoPuesto } from '../../../core/models';
import { AsignacionModalComponent } from './asignacion-modal/asignacion-modal.modal';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-asignacion-list',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatCardModule],
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
  displayedColumns: string[] = ['nombre', 'acciones'];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
      insts: this.instRepository.getAll(),
      reqs: this.reqRepository.getAll()
    }).subscribe(({ insts, reqs }) => {
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
