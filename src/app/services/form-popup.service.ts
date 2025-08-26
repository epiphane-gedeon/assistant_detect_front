import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  validators?: any[];
  options?: { value: any; label: string }[]; // Pour select et radio
  rows?: number; // Pour textarea
  group?: string; // Pour regrouper les champs
  value?: any; // Valeur par défaut pour pré-remplir le champ
}

export interface FieldGroup {
  name: string;
  label: string;
  fields: FormField[];
}

export interface FormPopupConfig {
  title: string;
  fields?: FormField[];
  groups?: FieldGroup[];
  submitText?: string;
  cancelText?: string;
  onSubmit: (formData: any) => void;
  onCancel?: () => void;
  showCloseButton?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FormPopupService {
  private formPopupSubject = new BehaviorSubject<FormPopupConfig | null>(null);

  formPopup$ = this.formPopupSubject.asObservable();

  constructor(private formBuilder: FormBuilder) { }

  showFormPopup(config: FormPopupConfig) {
    this.formPopupSubject.next(config);
  }

  closeFormPopup() {
    this.formPopupSubject.next(null);
  }

  // Méthode helper pour créer un formulaire de signalement
  showReportForm(onSubmit: (data: any) => void) {
    this.showFormPopup({
      title: 'Veuillez compléter les informations de signalement',
      fields: [
        {
          key: 'nom',
          label: 'Nom',
          type: 'text',
          placeholder: 'Nom',
          required: true,
          group: 'identity'
        },
        {
          key: 'prenom',
          label: 'Prénom',
          type: 'text',
          placeholder: '',
          required: true,
          group: 'identity'
        },
        {
          key: 'contact',
          label: 'Contact',
          type: 'text',
          placeholder: '',
          required: true
        },
        {
          key: 'description',
          label: 'Description',
          type: 'textarea',
          placeholder: '',
          required: true,
          rows: 6
        }
      ],
      submitText: 'Envoyer',
      onSubmit,
      showCloseButton: true
    });
  }

  // Méthode helper pour créer un formulaire personnalisé
  showCustomForm(
    title: string,
    fields: FormField[],
    onSubmit: (data: any) => void,
    options?: Partial<FormPopupConfig>
  ) {
    this.showFormPopup({
      title,
      fields,
      submitText: 'Valider',
      cancelText: 'Annuler',
      onSubmit,
      showCloseButton: true,
      ...options
    });
  }

  // Créer un FormGroup Angular à partir des champs
  createFormGroup(fields: FormField[]): FormGroup {
    const group: { [key: string]: AbstractControl } = {};

    fields.forEach(field => {
      const validators = [];

      if (field.required) {
        validators.push(Validators.required);
      }

      if (field.type === 'email') {
        validators.push(Validators.email);
      }

      if (field.validators) {
        validators.push(...field.validators);
      }

      // Utiliser la valeur par défaut si elle existe, sinon chaîne vide
      const defaultValue = field.value !== undefined ? field.value : '';
      group[field.key] = this.formBuilder.control(defaultValue, validators);
    });

    return this.formBuilder.group(group);
  }
}
