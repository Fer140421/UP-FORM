import { Component, inject, signal, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Router } from '@angular/router';
import { InstitucionRepository } from '../../../core/repositories/institucion.repository';
import { Institucion } from '../../../core/models';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-asignacion-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
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
  private router = inject(Router);

  loading = signal(false);
  displayedColumns: string[] = ['nombre', 'sigla', 'acciones'];
  dataSource = new MatTableDataSource<Institucion>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.instRepository.getAll()
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe(insts => {
        this.dataSource.data = insts.filter(inst => inst.activo !== false);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
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
    this.router.navigate(['/dashboard/asignaciones', institucion.id]);
  }
}
