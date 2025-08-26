import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FaqService, FAQ, PaginatedFaqResponse, Pagination } from '../../services/faq.service';
import { PopupService } from '../../services/popup.service';
import { FormPopupService } from '../../services/form-popup.service';

@Component({
  standalone: true,
  selector: 'app-faq',
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {
  faqs: FAQ[] = [];
  expandedItems: Set<number> = new Set();
  loading = true;
  error = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  pagination: Pagination | null = null;

  // Pour utiliser Math dans le template
  Math = Math;

  constructor(
    private faqService: FaqService,
    private popupService: PopupService,
    private formPopupService: FormPopupService,
    private router: Router,
    private http: HttpClient
  ) { }

  // Test simple pour envoyer un popup via votre backend
  testNotification() {
    console.log('🧪 Test notification...');

    const testData = {
      title: "Test Notification",
      message: "Ceci est un test depuis Angular !",
      type: "success",
      duration: 4000
    };

    this.http.post('http://127.0.0.1:8000/popup', testData).subscribe({
      next: (response) => {
        console.log('✅ Notification envoyée:', response);
      },
      error: (error) => {
        console.error('❌ Erreur:', error);
      }
    });
  } ngOnInit() {
    this.loadFaqs();
  }

  loadFaqs(page: number = 1) {
    this.loading = true;
    this.currentPage = page;

    this.faqService.getPaginatedFaqs(page, this.pageSize).subscribe({
      next: (response: PaginatedFaqResponse) => {
        this.faqs = response.items;
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des FAQs';
        this.loading = false;
        console.error('Erreur FAQ:', error);
      }
    });
  }

  // Navigation pagination
  goToPage(page: number) {
    if (page >= 1 && page <= (this.pagination?.pages || 1)) {
      this.loadFaqs(page);
    }
  }

  nextPage() {
    if (this.pagination?.has_next) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.pagination?.has_prev) {
      this.goToPage(this.currentPage - 1);
    }
  }

  // Génère un tableau des numéros de pages pour la pagination
  getPageNumbers(): number[] {
    if (!this.pagination) return [];

    const totalPages = this.pagination.pages;
    const currentPage = this.pagination.page;
    const pages: number[] = [];

    // Afficher au maximum 5 pages
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // Ajuster si on est près du début ou de la fin
    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + 4);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - 4);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  toggleExpanded(faqId: number) {
    if (this.expandedItems.has(faqId)) {
      this.expandedItems.delete(faqId);
    } else {
      this.expandedItems.add(faqId);
    }
  }

  isExpanded(faqId: number): boolean {
    return this.expandedItems.has(faqId);
  }

  trackByFaq(index: number, faq: FAQ): number {
    return faq.id;
  }

  // Méthodes de démonstration pour les popups
  showErrorPopup() {
    this.popupService.showError('Une erreur a été détectée ! Voulez vous la traiter ?');
  }

  showCustomPopup() {
    this.popupService.showPopup({
      message: 'Êtes-vous sûr de vouloir supprimer cette FAQ ?',
      buttons: [
        {
          text: 'Supprimer',
          action: () => console.log('FAQ supprimée'),
          primary: true
        },
        {
          text: 'Annuler',
          action: () => console.log('Suppression annulée')
        }
      ],
      showCloseButton: true
    });
  }

  showSuccessPopup() {
    this.popupService.showAlert('FAQ sauvegardée avec succès !', () => {
      console.log('Utilisateur a fermé l\'alerte');
    });
  }

  // Méthodes de test pour les formulaires popup
  showReportForm() {
    this.formPopupService.showReportForm((data) => {
      console.log('Données du formulaire de signalement:', data);
      this.popupService.showAlert('Signalement envoyé avec succès !');
    });
  }

  showCustomForm() {
    this.formPopupService.showCustomForm(
      'Informations de contact',
      [
        {
          key: 'civilite',
          label: 'Civilité',
          type: 'select',
          required: true,
          options: [
            { value: 'mr', label: 'Monsieur' },
            { value: 'mme', label: 'Madame' },
            { value: 'mlle', label: 'Mademoiselle' }
          ]
        },
        {
          key: 'nom',
          label: 'Nom',
          type: 'text',
          required: true,
          group: 'identity'
        },
        {
          key: 'prenom',
          label: 'Prénom',
          type: 'text',
          required: true,
          group: 'identity'
        },
        {
          key: 'telephone',
          label: 'Téléphone',
          type: 'tel',
          placeholder: '+33 1 23 45 67 89'
        },
        {
          key: 'newsletter',
          label: 'Je souhaite recevoir la newsletter',
          type: 'checkbox'
        }
      ],
      (data) => {
        console.log('Données du formulaire custom:', data);
        this.popupService.showAlert('Formulaire soumis avec succès !');
      }
    );
  }

  // Navigation vers la page d'ajout de FAQ
  navigateToAddFaq() {
    this.router.navigate(['/add-faq']);
  }

  // Supprimer une FAQ
  deleteFaq(faq: FAQ, event: Event) {
    // Empêcher l'expansion/collapse de la FAQ
    event.stopPropagation();

    // Demander confirmation
    this.popupService.showPopup({
      message: `Êtes-vous sûr de vouloir supprimer la FAQ "${faq.question}" ?`,
      buttons: [
        {
          text: 'Supprimer',
          action: () => this.confirmDelete(faq),
          primary: true
        },
        {
          text: 'Annuler',
          action: () => console.log('Suppression annulée')
        }
      ],
      showCloseButton: true
    });
  }

  // Modifier une FAQ
  editFaq(faq: FAQ, event: Event) {
    // Empêcher l'expansion/collapse de la FAQ
    event.stopPropagation();

    // Rediriger vers la page de création avec l'ID de la FAQ à modifier
    this.router.navigate(['/add-faq'], {
      queryParams: {
        id: faq.id,
        mode: 'edit'
      }
    });
  }

  private confirmDelete(faq: FAQ) {
    this.http.delete(`http://127.0.0.1:8000/faq/${faq.id}`).subscribe({
      next: () => {
        this.popupService.showAlert('FAQ supprimée avec succès !');
        // Recharger la liste des FAQs
        this.loadFaqs();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.popupService.showError('Erreur lors de la suppression de la FAQ. Veuillez réessayer.');
      }
    });
  }
}
