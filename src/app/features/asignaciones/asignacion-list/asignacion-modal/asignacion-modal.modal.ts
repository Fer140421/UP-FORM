import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Institucion, RequisitoPuesto, Postulante } from '../../../../core/models';
import { PostulanteRepository } from '../../../../core/repositories/postulante.repository';
import { AsignacionRepository } from '../../../../core/repositories/asignacion.repository';
import { RequisitoPuestoRepository } from '../../../../core/repositories/requisito-puesto.repository';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-asignacion-modal',
  standalone: true,
  imports: [MatDialogModule, MatTableModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './asignacion-modal.modal.html',
  styles: [`
    .table-container { width: 100%; overflow-x: auto; margin-bottom: 20px; }
    table { width: 100%; min-width: 800px; }
    .postulantes-section { margin-top: 30px; border-top: 2px solid #eee; padding-top: 20px; }
    mat-spinner { vertical-align: middle; }
    .badge-status {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      background-color: #fee2e2;
      color: #ef4444;
    }
    .badge-status.active {
      background-color: #d1fae5;
      color: #10b981;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsignacionModalComponent implements OnInit {
  public data = inject<{ institucion: Institucion, requisitos: RequisitoPuesto[] }>(MAT_DIALOG_DATA);
  private postRepository = inject(PostulanteRepository);
  private asigRepository = inject(AsignacionRepository);
  private reqRepository = inject(RequisitoPuestoRepository);
  private snackBar = inject(MatSnackBar);

  postulantes = signal<Postulante[]>([]);
  selectedRequisito = signal<RequisitoPuesto | null>(null);
  loading = signal(false);

  reqColumns = ['cargo', 'unidad', 'formacion', 'experiencia', 'estado', 'acciones'];
  postColumns = ['carnet', 'nombre', 'celular', 'formacion', 'acciones'];

  ngOnInit() {
    this.postRepository.getAll().subscribe(data => this.postulantes.set(data));
  }

  selectCargo(req: RequisitoPuesto) {
    this.selectedRequisito.set(req);
  }

  asignar(postulante: Postulante) {
    if (!this.selectedRequisito() || this.loading()) return;

    this.loading.set(true);
    const cargoId = this.selectedRequisito()!.id;
    const denominacion = this.selectedRequisito()?.denominacionCargo;

    const nuevaAsignacion = {
      postulanteId: postulante.id,
      requisitoId: cargoId,
      fechaAsignacion: new Date().toISOString()
    };

    // 1. Crear asignación, 2. Marcar cargo como Inactivo
    this.asigRepository.create(nuevaAsignacion as any)
      .pipe(
        switchMap(() => this.reqRepository.update(cargoId, { estado: 'Inactivo' } as any)),
        finalize(() => this.loading.set(false))
      )
      .subscribe(() => {
        this.snackBar.open(`Postulante ${postulante.nombres} asignado al cargo ${denominacion}`, 'Cerrar', { duration: 4000 });
        this.selectedRequisito.set(null);
      });
  }
}
