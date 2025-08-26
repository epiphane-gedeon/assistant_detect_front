// import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
// import { ChatboxComponent } from './components/chatbox/chatbox.component';
// import { ChatButtonComponent } from './components/chat-button/chat-button.component';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [RouterOutlet, CommonModule, ChatboxComponent, ChatButtonComponent],
//   templateUrl: './app.component.html',
//   styleUrl: './app.component.css'
// })
// export class AppComponent {
//   title = 'mon-projet-angular18';
//   chatVisible = $true;
// }

import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatboxComponent } from './components/chatbox/chatbox.component';
import { ChatButtonComponent } from './components/chat-button/chat-button.component';
import { PopupComponent } from './components/popup/popup.component';
import { FormPopupComponent } from './components/form-popup/form-popup.component';
import { CommonModule } from '@angular/common';
import { NotificationWebSocketService } from './services/notification-websocket.service';
import { FormPopupService } from './services/form-popup.service';
import { PopupService } from './services/popup.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ChatboxComponent, ChatButtonComponent, PopupComponent, FormPopupComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  chatVisible = false; // à tester avec true ou false

  constructor(
    private notificationService: NotificationWebSocketService,
    private formPopupService: FormPopupService,
    private popupService: PopupService
  ) { }

  ngOnInit() {
    console.log('🚀 Démarrage de l\'application');

    // Connecter les WebSockets (popup et formulaires)
    this.notificationService.connect();

    // Écouter les notifications
    this.notificationService.notification$.subscribe(data => {
      console.log('🔔 Notification reçue dans AppComponent:', data);
      console.log('🔔 Type de la notification:', typeof data);
      console.log('🔔 Clés de la notification:', Object.keys(data || {}));
      console.log('🔔 Inspection complète:', JSON.stringify(data, null, 2));
      this.showNotification(data);
    });

    // Écouter les formulaires depuis le service de notification
    this.notificationService.form$.subscribe(formConfig => {
      console.log('📋 Formulaire reçu via WebSocket de notification:', formConfig);
      this.showFormFromWebSocket(formConfig);
    });
  }

  ngOnDestroy() {
    this.notificationService.disconnect();
  }

  showNotification(data: any) {
    console.log('🎯 DEBUT showNotification avec data:', data);

    // Vérifier si data existe
    if (!data) {
      console.warn('⚠️ Aucune donnée reçue dans showNotification');
      return;
    }

    // Extraire les données avec des valeurs par défaut
    const title = data.title || 'Notification [DEFAUT]';
    const message = data.message || 'Nouveau message [DEFAUT]';
    const type = data.type || 'info';

    console.log('🎯 Extraction:', {
      'data.title': data.title,
      'data.message': data.message,
      'title final': title,
      'message final': message,
      'type': type
    });

    // Créer un message HTML plus joli selon le type
    let messageHtml = `
      <div style="text-align: left; line-height: 1.4;">
        <div style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 8px;">
          ${title}
        </div>
        <div style="font-size: 14px; color: #666;">
          ${message}
        </div>
        <div style="font-size: 12px; color: #999; margin-top: 8px; font-family: monospace;">
          Debug: type=${type}, duration=${data.duration}
        </div>
      </div>
    `;

    console.log('🎯 Message HTML final:', messageHtml);

    this.popupService.showPopup({
      message: messageHtml,
      buttons: [
        {
          text: 'OK',
          action: () => this.popupService.closePopup(),
          primary: true
        }
      ],
      showCloseButton: true
    });

    // Auto-fermer si durée spécifiée
    if (data.duration) {
      console.log('⏰ Auto-fermeture programmée dans', data.duration, 'ms');
      setTimeout(() => {
        this.popupService.closePopup();
      }, data.duration);
    }
  }

  showFormFromWebSocket(formConfig: any) {
    console.log('📋 Affichage du formulaire reçu via WebSocket:', formConfig);

    if (formConfig && formConfig.fields && Array.isArray(formConfig.fields)) {
      // Convertir la configuration WebSocket en format FormPopupConfig
      const formPopupConfig = {
        title: formConfig.title || 'Formulaire',
        fields: formConfig.fields,
        submitText: formConfig.submitText || 'Envoyer',
        cancelText: formConfig.cancelText || 'Annuler',
        onSubmit: (formData: any) => {
          console.log('📝 Données du formulaire soumises:', formData);

          // Envoyer la réponse au processus via WebSocket
          this.sendFormResponseViaWebSocket(formData, formConfig);

          this.formPopupService.closeFormPopup();
        },
        onCancel: () => {
          console.log('❌ Formulaire annulé');

          // Envoyer une réponse d'annulation au processus
          this.sendFormCancelViaWebSocket(formConfig);

          this.formPopupService.closeFormPopup();
        },
        showCloseButton: true
      };

      this.formPopupService.showFormPopup(formPopupConfig);
    } else {
      console.error('❌ Configuration de formulaire invalide:', formConfig);
    }
  }

  // Envoyer la réponse du formulaire via WebSocket
  sendFormResponseViaWebSocket(formData: any, originalFormConfig: any) {
    const response = {
      type: 'form_response',
      form_id: originalFormConfig.form_id || null,
      target_client: originalFormConfig.target_client || null,
      process_id: originalFormConfig.process_id || null, // Pour identifier le processus
      timestamp: new Date().toISOString(),
      status: 'submitted',
      responses: formData
    };

    console.log('📤 Envoi de la réponse du formulaire via WebSocket:', response);
    console.log('🔍 État du WebSocket formulaires:', this.notificationService.formConnectionState);
    console.log('🔍 WebSocket OPEN constant:', WebSocket.OPEN);
    console.log('🔍 Est connecté formulaires:', this.notificationService.isFormConnected);

    this.notificationService.sendFormResponse(response);

    // Afficher une confirmation à l'utilisateur
    this.popupService.showPopup({
      message: 'Formulaire envoyé avec succès !',
      buttons: [
        {
          text: 'OK',
          action: () => this.popupService.closePopup(),
          primary: true
        }
      ]
    });
  }

  // Envoyer une notification d'annulation via WebSocket
  sendFormCancelViaWebSocket(originalFormConfig: any) {
    const response = {
      type: 'form_response',
      form_id: originalFormConfig.form_id || null,
      target_client: originalFormConfig.target_client || null,
      process_id: originalFormConfig.process_id || null,
      timestamp: new Date().toISOString(),
      status: 'cancelled',
      responses: null
    };

    console.log('❌ Envoi de l\'annulation du formulaire via WebSocket:', response);
    this.notificationService.sendFormResponse(response);
  }  // Méthode de test pour vérifier l'affichage du formulaire
  testFormPopup() {
    console.log('🧪 Test du form popup');

    const testFormConfig = {
      title: 'Formulaire de Test',
      fields: [
        {
          key: 'nom',
          label: 'Nom',
          type: 'text' as const,
          placeholder: 'Entrez votre nom',
          required: true
        },
        {
          key: 'email',
          label: 'Email',
          type: 'email' as const,
          placeholder: 'Entrez votre email',
          required: true
        },
        {
          key: 'message',
          label: 'Message',
          type: 'textarea' as const,
          placeholder: 'Entrez votre message',
          rows: 4
        }
      ],
      submitText: 'Envoyer',
      cancelText: 'Annuler',
      onSubmit: (formData: any) => {
        console.log('✅ Données du formulaire de test:', formData);
        alert('Formulaire soumis avec succès !');
        this.formPopupService.closeFormPopup();
      },
      onCancel: () => {
        console.log('❌ Formulaire de test annulé');
        this.formPopupService.closeFormPopup();
      },
      showCloseButton: true
    };

    this.formPopupService.showFormPopup(testFormConfig);
  }

  // Méthode pour gérer la réouverture du chat après capture d'écran
  onChatReopened() {
    console.log('Chat réouverture demandée');
    this.chatVisible = true;
  }
}

