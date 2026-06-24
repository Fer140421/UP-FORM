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
          <p><mat-icon>badge</mat-icon> CI: {{ data.carnet }} (Expedido en: {{ data.expedido || 'No registrado' }})</p>
          <p><mat-icon>phone</mat-icon> {{ data.celular }}</p>
          <p><mat-icon>email</mat-icon> {{ data.correo || 'No registrado' }}</p>
        </div>
      </div>

      <mat-divider></mat-divider>

      <section>
        <h4><mat-icon>person</mat-icon> Datos Personales</h4>
        <div class="grid-datos">
          <div><strong>Fecha Nacimiento:</strong> {{ data.fechaNacimiento }}</div>
          <div><strong>Género:</strong> {{ data.genero }}</div>
          <div><strong>Ubicación:</strong> {{ data.localidad }}, {{ data.departamento }}</div>
          <div><strong>Dirección:</strong> {{ data.direccion }}</div>
        </div>
      </section>

      <mat-divider></mat-divider>

      <section>
        <h4><mat-icon>school</mat-icon> Formación Académica</h4>
        <mat-list>
          @for (f of data.formacionesAcademicas; track $index) {
            <mat-list-item>
              <span matListItemTitle>{{ f.grado }}: {{ f.tituloObtenido }} @if (f.profesion) { ({{ f.profesion }}) }</span>
              <span matListItemLine>{{ f.institucion }} ({{ f.fecha }})</span>
              <div matListItemMeta>
                @if (f.archivo && f.archivo !== 'archivo_defecto.pdf') {
                  <button mat-icon-button color="primary" (click)="descargar(f.archivo)" matTooltip="Descargar Documento">
                    <mat-icon>download</mat-icon>
                  </button>
                }
              </div>
            </mat-list-item>
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
            <p style="padding-left: 16px; color: #666;">No registrado</p>
          }
        </mat-list>
      </section>

      <mat-divider></mat-divider>

      <section>
        <h4><mat-icon>how_to_vote</mat-icon> Participación Electoral</h4>
        <div class="docs-chips" style="padding-left: 16px;">
          <mat-chip-set>
            @for (p of data.participacionElectoral; track p) {
              <mat-chip>{{ p }}</mat-chip>
            } @empty {
              <span style="color: #666;">Ninguna registrada</span>
            }
          </mat-chip-set>
        </div>
      </section>

      <mat-divider></mat-divider>

      <section>
        <h4><mat-icon>work</mat-icon> Experiencia Laboral</h4>
        <mat-list>
          @for (e of data.experienciasLaborales; track $index) {
            <mat-list-item>
              <span matListItemTitle>{{ e.cargo }} - {{ e.institucion }}</span>
              <span matListItemLine>{{ e.area }} | {{ e.tiempoTrabajado }} ({{ e.fechaInicio }} a {{ e.fechaFin }})</span>
              <div matListItemMeta>
                @if (e.archivo && e.archivo !== 'archivo_defecto.pdf') {
                  <button mat-icon-button color="primary" (click)="descargar(e.archivo)" matTooltip="Descargar Documento">
                    <mat-icon>download</mat-icon>
                  </button>
                }
              </div>
            </mat-list-item>
          }
        </mat-list>
      </section>

      <mat-divider></mat-divider>

      <section>
        <h4><mat-icon>description</mat-icon> Documentación Adicional</h4>
        <div class="docs-chips">
          @if (data.documentoIdentidad && data.documentoIdentidad !== 'documento_defecto.pdf') {
            <button mat-stroked-button color="primary" (click)="descargar(data.documentoIdentidad)">
              <mat-icon>download</mat-icon> CI Escaneado
            </button>
          }
          @if (data.certificadoLenguaOriginaria && data.certificadoLenguaOriginaria !== 'certificado_defecto.pdf') {
            <button mat-stroked-button color="primary" (click)="descargar(data.certificadoLenguaOriginaria)">
              <mat-icon>download</mat-icon> Cert. Lengua Originaria
            </button>
          }
          @if (data.archivo && data.archivo !== 'archivo_defecto.pdf') {
            <button mat-stroked-button color="primary" (click)="descargar(data.archivo)">
              <mat-icon>download</mat-icon> Libreta Militar
            </button>
          }
        </div>
      </section>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>

    <style>
      .detalle-container { min-width: 600px; padding: 20px; }
      .header-perfil { display: flex; gap: 20px; margin-bottom: 20px; align-items: center; }
      .foto-perfil { width: 120px; height: 120px; border-radius: 10px; object-fit: cover; border: 3px solid #eee; }
      .info-basica h3 { margin: 0 0 10px 0; color: #1976d2; }
      .info-basica p { margin: 4px 0; display: flex; align-items: center; gap: 8px; color: #666; }
      .info-basica mat-icon { font-size: 18px; width: 18px; height: 18px; }
      section { padding: 15px 0; }
      h4 { margin: 0 0 10px 0; display: flex; align-items: center; gap: 10px; color: #444; }
      .grid-datos { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px; }
      .docs-chips { display: flex; gap: 15px; flex-wrap: wrap; }
    </style>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostulanteDetalleComponent {
  public data = inject<Postulante>(MAT_DIALOG_DATA);

  descargar(url: string) {
    if (!url) return;
    // Forzar descarga en Cloudinary añadiendo fl_attachment
    const downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');
    window.open(downloadUrl, '_blank');
  }
}
