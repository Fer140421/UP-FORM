import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { Postulante } from '../../../../core/models';

@Component({
  selector: 'app-postulante-detalle',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule
  ],
  template: `
    <h2 mat-dialog-title>Detalle del Postulante</h2>
    <mat-dialog-content class="detalle-container">
      <div class="header-perfil">
        <img [src]="data.foto" alt="Foto perfil" class="foto-perfil">
        <div class="info-basica">
          <h3>{{ data.nombres }} {{ data.apellidoPaterno }} {{ data.apellidoMaterno }}</h3>
          <p><mat-icon>badge</mat-icon> CI: {{ data.carnet }} ({{ data.expedido || 'Sin expedido' }})</p>
          <p><mat-icon>phone</mat-icon> {{ data.celular }}</p>
          <p><mat-icon>email</mat-icon> {{ data.correo || 'No registrado' }}</p>
          <p><mat-icon>location_on</mat-icon> {{ data.localidad }}, {{ data.departamento }}</p>
        </div>
      </div>

      <section class="electoral-highlight">
        <div class="electoral-title">
          <mat-icon>how_to_vote</mat-icon>
          <div>
            <h4>Participacion Electoral</h4>
            <p>Dato prioritario para revision.</p>
          </div>
        </div>
        <mat-chip-set>
          @for (p of data.participacionElectoral; track p) {
            <mat-chip highlighted color="primary">{{ p }}</mat-chip>
          } @empty {
            <span class="empty-text">Ninguna registrada</span>
          }
        </mat-chip-set>
      </section>

      <mat-divider></mat-divider>

      <section>
        <h4><mat-icon>person</mat-icon> Datos Personales</h4>
        <div class="grid-datos">
          <div><strong>Fecha nacimiento:</strong> {{ data.fechaNacimiento || 'No registrado' }}</div>
          <div><strong>Genero:</strong> {{ data.genero || 'No registrado' }}</div>
          <div><strong>Direccion:</strong> {{ data.direccion || 'No registrado' }}</div>
          <div><strong>Libreta militar:</strong> {{ data.poseeLibreta || 'No aplica' }}</div>
        </div>
      </section>

      <mat-divider></mat-divider>

      <section>
        <h4><mat-icon>school</mat-icon> Formacion Academica</h4>
        <mat-list>
          @for (f of data.formacionesAcademicas; track $index) {
            <mat-list-item>
              <span matListItemTitle>{{ f.grado }}: {{ f.tituloObtenido }}</span>
              <span matListItemLine>Profesion: {{ f.profesion || 'No registrada' }}</span>
              <span matListItemLine>{{ f.institucion }} ({{ f.fecha }})</span>
            </mat-list-item>
          } @empty {
            <p class="empty-text">No registro formacion academica.</p>
          }
        </mat-list>
      </section>

      <mat-divider></mat-divider>

      <section>
        <h4><mat-icon>work</mat-icon> Experiencia Laboral</h4>
        <mat-list>
          @for (e of data.experienciasLaborales; track $index) {
            <mat-list-item>
              <span matListItemTitle>{{ e.cargo }} - {{ e.institucion }}</span>
              <span matListItemLine>{{ e.area }} | {{ e.tiempoTrabajado || 'Sin calculo' }}</span>
              <span matListItemLine>{{ e.fechaInicio }} a {{ e.fechaFin }}</span>
            </mat-list-item>
          } @empty {
            <p class="empty-text">No registro experiencia laboral.</p>
          }
        </mat-list>
      </section>

      <mat-divider></mat-divider>

      <section>
        <h4><mat-icon>card_membership</mat-icon> Capacitaciones</h4>
        <mat-list>
          @for (c of data.certificados; track $index) {
            <mat-list-item>
              <span matListItemTitle>{{ c.areaCapacitacion || c.nombre }}</span>
              @if (c.nombreCurso) {
                <span matListItemLine>Curso: {{ c.nombreCurso }}</span>
              }
              <span matListItemLine>{{ c.institucion || c.descripcion }} ({{ c.fecha }})</span>
            </mat-list-item>
          } @empty {
            <p class="empty-text">No registro capacitaciones.</p>
          }
        </mat-list>
      </section>

      <mat-divider></mat-divider>

      <section>
        <h4><mat-icon>translate</mat-icon> Idiomas Originarios</h4>
        <mat-list>
          @for (i of data.idiomasOriginarios; track $index) {
            <mat-list-item>
              <span matListItemTitle>{{ i.idioma === 'Otro' ? i.otroIdioma : i.idioma }}</span>
              <span matListItemLine>{{ i.institucion }} ({{ i.fecha }})</span>
            </mat-list-item>
          } @empty {
            <p class="empty-text">No registro idiomas originarios.</p>
          }
        </mat-list>
      </section>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>

    <style>
      .detalle-container { min-width: 640px; max-width: 900px; padding: 20px; }
      .header-perfil { display: flex; gap: 20px; margin-bottom: 20px; align-items: center; }
      .foto-perfil { width: 120px; height: 120px; border-radius: 10px; object-fit: cover; border: 3px solid #eee; }
      .info-basica h3 { margin: 0 0 10px 0; color: #1976d2; }
      .info-basica p { margin: 4px 0; display: flex; align-items: center; gap: 8px; color: #666; }
      .info-basica mat-icon { font-size: 18px; width: 18px; height: 18px; }
      section { padding: 15px 0; }
      h4 { margin: 0 0 10px 0; display: flex; align-items: center; gap: 10px; color: #444; }
      .grid-datos { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px; }
      .empty-text { color: #666; padding-left: 16px; }
      .electoral-highlight {
        padding: 18px;
        margin-bottom: 8px;
        border-radius: 12px;
        border: 2px solid #1976d2;
        background: #e3f2fd;
      }
      .electoral-title {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        color: #0d47a1;
      }
      .electoral-title mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
      }
      .electoral-title h4 {
        margin: 0;
        color: #0d47a1;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .electoral-title p {
        margin: 2px 0 0;
        color: #1565c0;
        font-size: 0.85rem;
      }
    </style>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostulanteDetalleComponent {
  public data = inject<Postulante>(MAT_DIALOG_DATA);
}
