import { Component, inject, signal, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { InstitucionRepository } from '../../../core/repositories/institucion.repository';
import { RequisitoPuestoRepository } from '../../../core/repositories/requisito-puesto.repository';
import { Institucion, RequisitoPuesto } from '../../../core/models';
import { AsignacionModalComponent } from './asignacion-modal/asignacion-modal.modal';
import { forkJoin } from 'rxjs';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-asignacion-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './asignacion-list.component.html',
  styleUrl: './asignacion-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsignacionListComponent implements OnInit {
  private instRepository = inject(InstitucionRepository);
  private reqRepository = inject(RequisitoPuestoRepository);
  private dialog = inject(MatDialog);

  requisitos = signal<RequisitoPuesto[]>([]);
  loading = signal(false);
  displayedColumns: string[] = ['nombre', 'acciones'];
  dataSource = new MatTableDataSource<Institucion>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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
      this.dataSource.data = insts;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.requisitos.set(reqs);
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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
