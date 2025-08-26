import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PopupButton {
  text: string;
  action: () => void;
  primary?: boolean; // Pour distinguer le bouton principal
}

export interface PopupConfig {
  message: string;
  buttons: PopupButton[];
  showCloseButton?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private popupSubject = new BehaviorSubject<PopupConfig | null>(null);

  popup$ = this.popupSubject.asObservable();

  showPopup(config: PopupConfig) {
    this.popupSubject.next(config);
  }

  closePopup() {
    this.popupSubject.next(null);
  }

  // Méthodes helper pour des cas communs
  showConfirmation(
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) {
    this.showPopup({
      message,
      buttons: [
        {
          text: 'Oui',
          action: () => {
            onConfirm();
            this.closePopup();
          },
          primary: true
        },
        {
          text: 'Non',
          action: () => {
            if (onCancel) onCancel();
            this.closePopup();
          }
        }
      ],
      showCloseButton: true
    });
  }

  showAlert(message: string, onOk?: () => void) {
    this.showPopup({
      message,
      buttons: [
        {
          text: 'OK',
          action: () => {
            if (onOk) onOk();
            this.closePopup();
          },
          primary: true
        }
      ],
      showCloseButton: true
    });
  }

  showError(message: string = 'Une erreur a été détectée ! Voulez vous la traiter ?') {
    this.showConfirmation(
      message,
      () => console.log('Erreur traitée'),
      () => console.log('Erreur ignorée')
    );
  }
}
