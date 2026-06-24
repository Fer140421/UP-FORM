import { Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'home', component: HomeComponent },
      {
        path: 'postulantes',
        children: [
          { 
            path: '', 
            loadComponent: () => import('../postulantes/postulante-list/postulante-list.component').then(m => m.PostulanteListComponent) 
          },
          { 
            path: 'nuevo', 
            loadComponent: () => import('../postulantes/postulante-wizard/postulante-wizard.component').then(m => m.PostulanteWizardComponent) 
          },
          { 
            path: 'editar/:id', 
            loadComponent: () => import('../postulantes/postulante-wizard/postulante-wizard.component').then(m => m.PostulanteWizardComponent) 
          }
        ]
      },
      {
        path: 'instituciones',
        loadComponent: () => import('../instituciones/institucion-list/institucion-list.component').then(m => m.InstitucionListComponent)
      },
      {
        path: 'profesionales',
        loadComponent: () => import('../profesionales/profesional-list/profesional-list.component').then(m => m.ProfesionalListComponent)
      },
      {
        path: 'requisitos',
        loadComponent: () => import('../requisitos/requisito-list/requisito-list.component').then(m => m.RequisitoListComponent)
      },
      {
        path: 'asignaciones',
        children: [
          {
            path: '',
            loadComponent: () => import('../asignaciones/asignacion-list/asignacion-list.component').then(m => m.AsignacionListComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('../asignaciones/asignacion-detalle/asignacion-detalle.component').then(m => m.AsignacionDetalleComponent)
          }
        ]
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  }
];
