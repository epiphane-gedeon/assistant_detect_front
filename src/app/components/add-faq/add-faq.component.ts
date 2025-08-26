import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

declare var Quill: any;

@Component({
  standalone: true,
  selector: 'app-add-faq',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-faq.component.html',
  styleUrls: ['./add-faq.component.css']
})
export class AddFaqComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editor', { static: false }) editorElement!: ElementRef;

  faqForm: FormGroup;
  quillInstance: any;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Propriétés pour la modification
  isEditMode = false;
  faqId: number | null = null;
  pageTitle = 'Ajouter une solution à la FAQ';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.faqForm = this.formBuilder.group({
      question: ['', [Validators.required, Validators.minLength(5)]],
      procede: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    // Vérifier si on est en mode modification
    this.route.queryParams.subscribe(params => {
      if (params['id'] && params['mode'] === 'edit') {
        this.isEditMode = true;
        this.faqId = parseInt(params['id']);
        this.pageTitle = 'Modifier la FAQ';
        this.loadFaqForEdit();
      }
    });

    // Charger Quill.js depuis CDN
    this.loadQuillJS();
  }

  ngAfterViewInit() {
    // Initialiser Quill après que la vue soit prête
    setTimeout(() => {
      if (typeof Quill !== 'undefined') {
        this.initializeQuill();
      }
    }, 100);
  }

  ngOnDestroy() {
    // Nettoyer Quill si nécessaire
    if (this.quillInstance) {
      this.quillInstance = null;
    }
  }

  private loadQuillJS() {
    // Charger le CSS de Quill
    if (!document.querySelector('link[href*="quill.snow.css"]')) {
      const link = document.createElement('link');
      link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // Charger le script de Quill
    if (typeof Quill === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.quilljs.com/1.3.6/quill.min.js';
      // Ne pas appeler initializeQuill ici, ça sera fait dans ngAfterViewInit
      document.head.appendChild(script);
    }
  }

  private initializeQuill() {
    if (typeof Quill !== 'undefined' && this.editorElement && !this.quillInstance) {
      this.quillInstance = new Quill(this.editorElement.nativeElement, {
        theme: 'snow',
        placeholder: 'Procédé...',
        modules: {
          toolbar: [
            ['bold', 'italic'],
            [{ 'list': 'ordered' }],
            [{ 'list': 'bullet' }],
            ['clean'],
            ['link'],
            ['image'],
            ['code-block'],
            ['blockquote'],
            ['video'],
            ['formula'],
            [{ 'header': [1, 2, 3, false] }]
          ],
        }
      });

      // Écouter les changements dans l'éditeur
      this.quillInstance.on('text-change', () => {
        const content = this.quillInstance.root.innerHTML;
        this.faqForm.patchValue({ procede: content });
      });
    }
  }

  // Charger les données de la FAQ pour modification
  loadFaqForEdit() {
    if (this.faqId) {
      this.http.get(`http://127.0.0.1:8000/faq/${this.faqId}`).subscribe({
        next: (faq: any) => {
          // Pré-remplir le formulaire
          this.faqForm.patchValue({
            question: faq.question
          });

          // Pré-remplir l'éditeur Quill une fois qu'il est initialisé
          if (this.quillInstance) {
            this.quillInstance.root.innerHTML = faq.procede;
          } else {
            // Si Quill n'est pas encore initialisé, attendre
            setTimeout(() => {
              if (this.quillInstance) {
                this.quillInstance.root.innerHTML = faq.procede;
              }
            }, 500);
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement de la FAQ:', error);
          this.errorMessage = 'Erreur lors du chargement de la FAQ.';
        }
      });
    }
  }

  onSubmit() {
    if (this.faqForm.valid && this.quillInstance) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      // Récupérer le contenu de l'éditeur
      const procedeContent = this.quillInstance.root.innerHTML;

      const faqData = {
        id: this.isEditMode ? this.faqId : 0,
        question: this.faqForm.get('question')?.value,
        procede: procedeContent
      };

      if (this.isEditMode && this.faqId) {
        // Mode modification - PUT
        this.http.put(`http://127.0.0.1:8000/faq/${this.faqId}`, faqData).subscribe({
          next: (response) => {
            this.successMessage = 'FAQ modifiée avec succès !';
            this.isLoading = false;

            // Rediriger vers la liste des FAQs après 2 secondes
            setTimeout(() => {
              this.router.navigate(['/faq']);
            }, 2000);
          },
          error: (error) => {
            this.errorMessage = 'Erreur lors de la modification de la FAQ. Veuillez réessayer.';
            this.isLoading = false;
            console.error('Erreur:', error);
          }
        });
      } else {
        // Mode création - POST
        this.http.post('http://127.0.0.1:8000/faq', faqData).subscribe({
          next: (response) => {
            this.successMessage = 'FAQ ajoutée avec succès !';
            this.isLoading = false;

            // Réinitialiser le formulaire après 2 secondes
            setTimeout(() => {
              this.resetForm();
            }, 2000);
          },
          error: (error) => {
            this.errorMessage = 'Erreur lors de l\'ajout de la FAQ. Veuillez réessayer.';
            this.isLoading = false;
            console.error('Erreur:', error);
          }
        });
      }
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.faqForm.markAllAsTouched();
    }
  }

  resetForm() {
    this.faqForm.reset();
    if (this.quillInstance) {
      this.quillInstance.setContents([]);
    }
    this.successMessage = '';
    this.errorMessage = '';
  }

  getFieldError(fieldName: string): string | null {
    const field = this.faqForm.get(fieldName);
    if (!field || !field.touched || !field.errors) return null;

    if (field.errors['required']) return 'Ce champ est requis';
    if (field.errors['minlength']) {
      const requiredLength = field.errors['minlength'].requiredLength;
      return `Minimum ${requiredLength} caractères requis`;
    }

    return 'Champ invalide';
  }

  goBack() {
    this.router.navigate(['/faq']);
  }
}
