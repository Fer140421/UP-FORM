import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Institucion, RequisitoPuesto, Postulante } from '../../../../core/models';
import { PostulanteRepository } from '../../../../core/repositories/postulante.repository';
import { AsignacionRepository } from '../../../../core/repositories/asignacion.repository';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-asignacion-modal',
  standalone: true,
  imports: [MatDialogModule, MatTableModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './asignacion-modal.modal.html',
  styles: [`
    table { width: 100%; margin-bottom: 20px; }
    .postulantes-section { margin-top: 30px; border-top: 2px solid #eee; padding-top: 20px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsignacionModalComponent implements OnInit {
  public data = inject<{ institucion: Institucion, requisitos: RequisitoPuesto[] }>(MAT_DIALOG_DATA);
  private postRepository = inject(PostulanteRepository);
  private asigRepository = inject(AsignacionRepository);
  private snackBar = inject(MatSnackBar);

  postulantes = signal<Postulante[]>([]);
  selectedRequisito = signal<RequisitoPuesto | null>(null);

  reqColumns = ['cargo', 'unidad', 'formacion', 'experiencia', 'estado', 'acciones'];
  postColumns = ['carnet', 'nombre', 'celular', 'formacion', 'acciones'];

  ngOnInit() {
    this.postRepository.getAll().subscribe(data => this.postulantes.set(data));
  }

  selectCargo(req: RequisitoPuesto) {
    this.selectedRequisito.set(req);
  }

  asignar(postulante: Postulante) {
    if (!this.selectedRequisito()) return;

    const nuevaAsignacion = {
      postulanteId: postulante.id,
      requisitoId: this.selectedRequisito()!.id,
      fechaAsignacion: new Date().toISOString()
    };

    this.asigRepository.create(nuevaAsignacion as any).subscribe(() => {
      this.snackBar.open(`Postulante ${postulante.nombres} asignado al cargo ${this.selectedRequisito()?.denominacionCargo}`, 'Cerrar', { duration: 4000 });
      this.selectedRequisito.set(null);
    });
  }
}
