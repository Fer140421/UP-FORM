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
            <h4>Participación Electoral</h4>
            <p>Dato prioritario para revisión.</p>
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
          <div><strong>Género:</strong> {{ data.genero || 'No registrado' }}</div>
          <div><strong>Dirección:</strong> {{ data.direccion || 'No registrado' }}</div>
          <div><strong>Libreta militar:</strong> {{ data.poseeLibreta || 'No aplica' }}</div>
        </div>
      </section>

      <mat-divider></mat-divider>

      <section>
        <h4><mat-icon>school</mat-icon> Formación Académica</h4>
        <mat-list>
          @for (f of data.formacionesAcademicas; track $index) {
            <mat-list-item>
              <span matListItemTitle>{{ f.grado }}: {{ f.tituloObtenido }}</span>
              <span matListItemLine>Profesión: {{ f.profesion || 'No registrada' }}</span>
              <span matListItemLine>{{ f.institucion }} ({{ f.fecha }})</span>
              <div matListItemMeta>
                @if (isDownloadable(f.archivo)) {
                  <button mat-icon-button color="primary" (click)="descargar(f.archivo)" matTooltip="Descargar documento">
                    <mat-icon>download</mat-icon>
                  </button>
                }
              </div>
            </mat-list-item>
          } @empty {
            <p class="empty-text">No registró formación académica.</p>
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
              <span matListItemLine>{{ e.area }} | {{ e.tiempoTrabajado || 'Sin cálculo' }}</span>
              <span matListItemLine>{{ e.fechaInicio }} a {{ e.fechaFin }}</span>
              <div matListItemMeta>
                @if (isDownloadable(e.archivo)) {
                  <button mat-icon-button color="primary" (click)="descargar(e.archivo)" matTooltip="Descargar documento">
                    <mat-icon>download</mat-icon>
                  </button>
                }
              </div>
            </mat-list-item>
          } @empty {
            <p class="empty-text">No registró experiencia laboral.</p>
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
              <span matListItemLine>{{ c.institucion || c.descripcion }} ({{ c.fecha }})</span>
              <div matListItemMeta>
                @if (isDownloadable(c.archivo)) {
                  <button mat-icon-button color="primary" (click)="descargar(c.archivo)" matTooltip="Descargar documento">
                    <mat-icon>download</mat-icon>
                  </button>
                }
              </div>
            </mat-list-item>
          } @empty {
            <p class="empty-text">No registró capacitaciones.</p>
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
            <p class="empty-text">No registró idiomas originarios.</p>
          }
        </mat-list>
      </section>

      <mat-divider></mat-divider>

      <section>
        <h4><mat-icon>description</mat-icon> Documentación Disponible</h4>
        <div class="docs-chips">
          @if (isDownloadable(data.documentoIdentidad)) {
            <button mat-stroked-button color="primary" (click)="descargar(data.documentoIdentidad)">
              <mat-icon>download</mat-icon> CI escaneado
            </button>
          }
          @if (isDownloadable(data.certificadoLenguaOriginaria)) {
            <button mat-stroked-button color="primary" (click)="descargar(data.certificadoLenguaOriginaria)">
              <mat-icon>download</mat-icon> Cert. lengua originaria
            </button>
          }
          @if (isDownloadable(data.archivo)) {
            <button mat-stroked-button color="primary" (click)="descargar(data.archivo!)">
              <mat-icon>download</mat-icon> Libreta militar
            </button>
          }
          @if (!hasDocumentacionDisponible()) {
            <span class="empty-text">No hay documentación adicional disponible.</span>
          }
        </div>
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
      .docs-chips { display: flex; gap: 15px; flex-wrap: wrap; align-items: center; }
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

  descargar(url: string) {
    if (!url) return;
    const downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');
    window.open(downloadUrl, '_blank');
  }

  isDownloadable(url?: string): boolean {
    return !!url && !url.includes('_defecto.pdf');
  }

  hasDocumentacionDisponible(): boolean {
    return this.isDownloadable(this.data.documentoIdentidad)
      || this.isDownloadable(this.data.certificadoLenguaOriginaria)
      || this.isDownloadable(this.data.archivo);
  }
}
