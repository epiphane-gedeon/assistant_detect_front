// import { Component, EventEmitter, Input, Output } from '@angular/core';
// import { CommonModule } from '@angular/common';

// @Component({
//   standalone: true,
//   selector: 'app-chatbox',
//   imports: [CommonModule],
//   templateUrl: './chatbox.component.html',
//   styleUrls: ['./chatbox.component.css']
// })
// export class ChatboxComponent {
//   @Input() visible = false;
//   @Output() closed = new EventEmitter<void>();

//   close() {
//     this.closed.emit();
//   }
// }

import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { ScreenCaptureService } from '../../services/screen-capture.service';
import { FormsModule } from '@angular/forms';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { ImageOptionPopupComponent } from '../image-option-popup/image-option-popup.component';

// Interface pour les messages avec support d'images
interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
  image?: string; // URL de l'image en base64 ou blob URL
}

@Component({
  standalone: true,
  selector: 'app-chatbox',
  imports: [CommonModule, FormsModule, MarkdownPipe, ImageOptionPopupComponent],
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.css']
})
export class ChatboxComponent {
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();
  @Output() reopened = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  userInput: string = '';
  messages: ChatMessage[] = [];
  selectedImage: string | null = null;
  showImageOptionPopup = false;
  private wasVisibleBeforeCapture = false;
  private isCapturing = false;

  constructor(
    private chatService: ChatService,
    private screenCaptureService: ScreenCaptureService
  ) { }

  // Détecter si on est sur mobile
  private isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  // Getter pour déterminer si le chatbox doit être visible
  get isVisible(): boolean {
    return this.visible && !this.isCapturing;
  }

  close() {
    this.closed.emit();
  }

  send() {
    const message = this.userInput.trim();
    if (!message) return;

    // Créer le message utilisateur avec l'image si elle existe
    const userMessage: ChatMessage = {
      from: 'user',
      text: message,
      image: this.selectedImage || undefined
    };

    this.messages.push(userMessage);

    this.chatService.sendMessage(message).subscribe(
      (response) => {
        this.messages.push({ from: 'bot', text: response["response"] });
        console.log('Message sent:', message);
        console.log('Bot response:', response["response"]);
      },
      (error) => {
        this.messages.push({ from: 'bot', text: '❌ Erreur serveur.' });
      }
    );

    this.userInput = '';
    this.selectedImage = null; // Réinitialiser l'image après envoi
  }

  // Déclencher la sélection de fichier ou capture d'écran
  triggerImageUpload() {
    this.showImageOptionPopup = true;
  }

  // Gérer le choix de capture d'écran
  onScreenCapture() {
    this.showImageOptionPopup = false;

    // Sur mobile, fermer le chat avant la capture
    if (this.isMobile() && this.visible) {
      console.log('Mobile détecté - fermeture du chat avant capture');
      this.wasVisibleBeforeCapture = true;
      this.isCapturing = true;
      this.closed.emit(); // Émettre l'événement de fermeture vers le parent

      // Attendre un peu que l'animation de fermeture se termine
      setTimeout(() => {
        this.startScreenCapture();
      }, 300);
    } else {
      this.startScreenCapture();
    }
  }

  private startScreenCapture() {
    // Éléments à masquer pendant la capture (chatbox et popups)
    const elementsToHide = [
      '.chatbox-exclude-capture',
      'app-image-option-popup',
      '.popup-overlay',
      'app-popup'
    ];

    this.screenCaptureService.startScreenCapture(elementsToHide)
      .then((imageData) => {
        if (imageData) {
          this.selectedImage = imageData;
        }

        // Sur mobile, rouvrir le chat après la capture
        if (this.isMobile() && this.wasVisibleBeforeCapture) {
          console.log('Fin de capture - demande de réouverture du chat');
          this.isCapturing = false;
          this.wasVisibleBeforeCapture = false;
          // Utiliser setTimeout pour s'assurer que l'événement est traité
          setTimeout(() => {
            this.reopened.emit();
          }, 100);
        }
      })
      .catch((error) => {
        console.error('Erreur lors de la capture d\'écran:', error);
        alert('Erreur lors de la capture d\'écran');

        // Sur mobile, rouvrir le chat même en cas d'erreur
        if (this.isMobile() && this.wasVisibleBeforeCapture) {
          console.log('Erreur de capture - demande de réouverture du chat');
          this.isCapturing = false;
          this.wasVisibleBeforeCapture = false;
          // Utiliser setTimeout pour s'assurer que l'événement est traité
          setTimeout(() => {
            this.reopened.emit();
          }, 100);
        }
      });
  }

  // Gérer le choix de fichier
  onFileUpload() {
    this.showImageOptionPopup = false;
    this.fileInput.nativeElement.click();
  }

  // Annuler le popup
  onCancelImageOption() {
    this.showImageOptionPopup = false;
  }

  // Gérer la sélection d'image
  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Vérifier que c'est bien une image
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image.');
        return;
      }

      // Vérifier la taille (limite à 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image est trop voluminetise (max 5MB).');
        return;
      }

      // Convertir en base64 pour l'affichage
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Supprimer l'image sélectionnée
  removeImage() {
    this.selectedImage = null;
    this.fileInput.nativeElement.value = ''; // Réinitialiser le champ file
  }
}
