import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Postulante, RequisitoPuesto } from '../../../../core/models';
import { PostulanteRepository } from '../../../../core/repositories/postulante.repository';
import { AsignacionRepository } from '../../../../core/repositories/asignacion.repository';
import { RequisitoPuestoRepository } from '../../../../core/repositories/requisito-puesto.repository';
import { PostulanteDetalleComponent } from '../postulante-detalle/postulante-detalle.component';
import { ConfirmDialogComponent } from '../../../dashboard/pages/home/confirm-dialog.component';
import { finalize, take, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-postulante-asignar',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>Candidatos para: {{ data.denominacionCargo }}</h2>
    <mat-dialog-content>
      @if (loading()) {
        <mat-progress-bar mode="indeterminate" style="margin-bottom: 20px;"></mat-progress-bar>
      }

      <div class="candidatos-grid">
        @for (post of postulantes(); track post.id) {
          <mat-card class="candidato-card">
            <mat-card-header>
              <img mat-card-avatar [src]="post.foto" alt="Foto">
              <mat-card-title>{{ post.nombres }} {{ post.apellidoPaterno }}</mat-card-title>
              <mat-card-subtitle>{{ post.carnet }} | {{ post.celular }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p><strong>Última experiencia:</strong> {{ post.experienciasLaborales[0]?.cargo || 'N/A' }}</p>
              <p><strong>Formación:</strong> {{ post.formacionesAcademicas[0]?.grado || 'N/A' }}</p>
            </mat-card-content>
            <mat-card-actions align="end">
              <button mat-button (click)="verDetalle(post)">VER MÁS</button>
              <button mat-flat-button color="accent" (click)="confirmarAsignacion(post)" [disabled]="assigning()">
                ASIGNAR PUESTO
              </button>
            </mat-card-actions>
          </mat-card>
        } @empty {
          @if (!loading()) {
            <div class="empty-state">
              <mat-icon>group_off</mat-icon>
              <p>No hay postulantes registrados para este cargo específico.</p>
            </div>
          }
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
    </mat-dialog-actions>

    <style>
      .candidatos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        padding: 10px 0;
      }
      .candidato-card { border-top: 4px solid #ffd740; }
      .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 0;
        color: #888;
      }
      .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; opacity: 0.3; }
      mat-card-header img { object-fit: cover; }
    </style>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostulanteAsignarComponent implements OnInit {
  public data = inject<RequisitoPuesto>(MAT_DIALOG_DATA);
  private postRepository = inject(PostulanteRepository);
  private asigRepository = inject(AsignacionRepository);
  private reqRepository = inject(RequisitoPuestoRepository);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<PostulanteAsignarComponent>);

  postulantes = signal<Postulante[]>([]);
  loading = signal(false);
  assigning = signal(false);

  ngOnInit() {
    this.loadCandidatos();
  }

  loadCandidatos() {
    this.loading.set(true);
    this.postRepository.getByProperty('puestoId', this.data.id)
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe(data => this.postulantes.set(data));
  }

  verDetalle(postulante: Postulante) {
    this.dialog.open(PostulanteDetalleComponent, {
      width: '700px',
      data: postulante
    });
  }

  confirmarAsignacion(postulante: Postulante) {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Asignación',
        message: `¿Desea asignar a ${postulante.nombres} al cargo de ${this.data.denominacionCargo}?`
      }
    });

    confirmRef.afterClosed().subscribe(result => {
      if (result) {
        this.assigning.set(true);
        const asignacion = {
          postulanteId: postulante.id,
          requisitoId: this.data.id,
          fechaAsignacion: new Date().toISOString()
        };

        // 1. Crear asignacion, 2. Actualizar estado del puesto
        this.asigRepository.create(asignacion as any).pipe(
          switchMap(() => this.reqRepository.update(this.data.id, { estado: 'Inactivo' } as any)),
          finalize(() => this.assigning.set(false))
        ).subscribe(() => {
          this.snackBar.open('Puesto asignado correctamente', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        });
      }
    });
  }
}
