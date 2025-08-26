import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'faq',
    loadComponent: () => import('./components/faq/faq.component').then(m => m.FaqComponent)
  },
  {
    path: 'add-faq',
    loadComponent: () => import('./components/add-faq/add-faq.component').then(m => m.AddFaqComponent)
  },
  {
    path: '',
    redirectTo: '/faq',
    pathMatch: 'full'
  }
];
