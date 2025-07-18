import { Routes } from '@angular/router';

export const routes: Routes = [
  // Redirection par défaut vers le dashboard
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },

  // Dashboard
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },

  // Processus d'apurement
  {
    path: 'processus',
    loadComponent: () =>
      import(
        './features/processus/processus-list/processus-list.component'
      ).then((m) => m.ProcessusListComponent),
  },
  {
    path: 'processus/nouveau',
    loadComponent: () =>
      import(
        './features/processus/processus-form/processus-form.component'
      ).then((m) => m.ProcessusFormComponent),
  },
  {
    path: 'processus/modifier/:id',
    loadComponent: () =>
      import(
        './features/processus/processus-form/processus-form.component'
      ).then((m) => m.ProcessusFormComponent),
  },

  // Import de données
  {
    path: 'import',
    loadComponent: () =>
      import('./features/import/import-excel/import-excel.component').then(
        (m) => m.ImportExcelComponent
      ),
  },

  // Configuration des notifications
  {
    path: 'configuration',
    children: [
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/configuration/notification-config/notification-config.component').then(
            (m) => m.NotificationConfigComponent
          ),
      },
      {
        path: '',
        redirectTo: 'notifications',
        pathMatch: 'full'
      }
    ]
  },

  // Notifications (si vous voulez une page dédiée)
  {
    path: 'notifications',
    loadComponent: () =>
      import(
        './shared/components/notification-center/notification-center.component'
      ).then((m) => m.NotificationCenterComponent),
  },

  // Route de fallback pour les pages non trouvées
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
