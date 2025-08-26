import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormPopupService, FormPopupConfig, FormField } from '../../services/form-popup.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-form-popup',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-popup.component.html',
  styleUrls: ['./form-popup.component.css']
})
export class FormPopupComponent implements OnInit, OnDestroy {
  formConfig: FormPopupConfig | null = null;
  formGroup: FormGroup | null = null;
  fieldGroups: { groupName: string; fields: FormField[] }[] = [];
  private subscription?: Subscription;

  constructor(private formPopupService: FormPopupService) { }

  ngOnInit() {
    this.subscription = this.formPopupService.formPopup$.subscribe(config => {
      this.formConfig = config;
      if (config) {
        this.createForm();
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  createForm() {
    if (!this.formConfig) return;

    const allFields = this.getAllFields();
    this.formGroup = this.formPopupService.createFormGroup(allFields);

    // Calculer les groupes une seule fois
    this.fieldGroups = this.calculateFieldGroups();
  }

  calculateFieldGroups(): { groupName: string; fields: FormField[] }[] {
    if (!this.formConfig?.fields) return [];

    const result: { groupName: string; fields: FormField[] }[] = [];
    const processedGroups = new Set<string>();

    this.formConfig.fields.forEach(field => {
      const groupKey = field.group || 'default';

      if (groupKey === 'default') {
        // Champs sans groupe : créer un groupe séparé pour chaque champ
        result.push({
          groupName: 'default',
          fields: [field]
        });
      } else if (!processedGroups.has(groupKey)) {
        // Premier champ de ce groupe : collecter tous les champs du même groupe
        const groupFields = this.formConfig!.fields!.filter(f => f.group === groupKey);
        result.push({
          groupName: groupKey,
          fields: groupFields
        });
        processedGroups.add(groupKey);
      }
    });

    return result;
  }

  getAllFields(): FormField[] {
    if (!this.formConfig) return [];

    const fields: FormField[] = [];

    // Ajouter les champs directs
    if (this.formConfig.fields) {
      fields.push(...this.formConfig.fields);
    }

    // Ajouter les champs des groupes
    if (this.formConfig.groups) {
      this.formConfig.groups.forEach(group => {
        fields.push(...group.fields);
      });
    }

    return fields;
  }

  closeFormPopup() {
    this.formPopupService.closeFormPopup();
  }

  onSubmit() {
    if (!this.formGroup || !this.formConfig) return;

    if (this.formGroup.valid) {
      this.formConfig.onSubmit(this.formGroup.value);
      this.closeFormPopup();
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.formGroup.markAllAsTouched();
    }
  }

  onCancel() {
    if (this.formConfig?.onCancel) {
      this.formConfig.onCancel();
    }
    this.closeFormPopup();
  }

  getFieldError(fieldKey: string): string | null {
    if (!this.formGroup) return null;

    const field = this.formGroup.get(fieldKey);
    if (!field || !field.touched || !field.errors) return null;

    if (field.errors['required']) return 'Ce champ est requis';
    if (field.errors['email']) return 'Email invalide';

    return 'Champ invalide';
  }

}
