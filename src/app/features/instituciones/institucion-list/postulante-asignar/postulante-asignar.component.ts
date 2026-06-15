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
    <h2 mat-dialog-title class="dialog-title">Candidatos para: {{ data.denominacionCargo }}</h2>
    <mat-dialog-content>
      @if (loading()) {
        <mat-progress-bar mode="indeterminate" class="loading-bar"></mat-progress-bar>
      }

      <div class="candidatos-grid">
        @for (post of postulantes(); track post.id) {
          <mat-card class="candidato-card">
            <div class="card-accent"></div>
            <mat-card-header>
              <img mat-card-avatar [src]="post.foto" alt="Foto">
              <mat-card-title>{{ post.nombres }} {{ post.apellidoPaterno }}</mat-card-title>
              <mat-card-subtitle>{{ post.carnet }} | {{ post.celular }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="info-row">
                <mat-icon color="primary">work</mat-icon>
                <span><strong>Última experiencia:</strong> {{ post.experienciasLaborales[0]?.cargo || 'N/A' }}</span>
              </div>
              <div class="info-row">
                <mat-icon color="primary">school</mat-icon>
                <span><strong>Formación:</strong> {{ post.formacionesAcademicas[0]?.grado || 'N/A' }}</span>
              </div>
            </mat-card-content>
            <mat-divider></mat-divider>
            <mat-card-actions class="actions-container">
              <button mat-stroked-button color="primary" class="btn-detail" (click)="verDetalle(post)">
                <mat-icon>visibility</mat-icon> VER MÁS
              </button>
              <button mat-flat-button color="accent" class="btn-assign" (click)="confirmarAsignacion(post)" [disabled]="assigning()">
                <mat-icon>check_circle</mat-icon> ASIGNAR
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
    <mat-dialog-actions align="end" class="dialog-footer">
      <button mat-button mat-dialog-close>Cancelar</button>
    </mat-dialog-actions>

    <style>
      .dialog-title { color: #3f51b5; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 16px; }
      .loading-bar { margin-bottom: 20px; }
      .candidatos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 24px;
        padding: 16px 4px;
      }
      .candidato-card { 
        transition: all 0.3s ease;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #e0e0e0;
        display: flex;
        flex-direction: column;
      }
      .candidato-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.15) !important;
      }
      .card-accent { height: 6px; background: linear-gradient(90deg, #3f51b5, #ffd740); }
      mat-card-header { padding: 16px; background-color: #fafafa; }
      mat-card-header img { border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      mat-card-content { padding: 20px 16px; flex-grow: 1; }
      .info-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-size: 0.95rem; color: #444; }
      .info-row mat-icon { font-size: 20px; width: 20px; height: 20px; }
      .actions-container { 
        padding: 12px 16px; 
        display: flex; 
        justify-content: space-between; 
        gap: 12px;
        background-color: #fafafa;
      }
      .btn-detail, .btn-assign { flex: 1; border-radius: 8px; font-weight: 500; }
      .btn-assign mat-icon, .btn-detail mat-icon { margin-right: 4px; }
      .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 80px 0;
        color: #888;
      }
      .empty-state mat-icon { font-size: 80px; width: 80px; height: 80px; opacity: 0.2; margin-bottom: 16px; }
      .dialog-footer { border-top: 1px solid #eee; padding-top: 8px; }
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
