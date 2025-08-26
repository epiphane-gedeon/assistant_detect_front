import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationWebSocketService {
  private ws: WebSocket | null = null;
  private formWs: WebSocket | null = null;
  private wsUrl = 'ws://127.0.0.1:8000/ws/popup';
  private formWsUrl = 'ws://127.0.0.1:8000/ws/form';

  // Observable pour les popups reçus
  private notificationSubject = new Subject<any>();
  notification$ = this.notificationSubject.asObservable();

  // Observable pour les formulaires reçus
  private formSubject = new Subject<any>();
  form$ = this.formSubject.asObservable();

  constructor() { }

  // Getter pour vérifier l'état de la connexion popup
  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // Getter pour vérifier l'état de la connexion formulaire
  get isFormConnected(): boolean {
    return this.formWs !== null && this.formWs.readyState === WebSocket.OPEN;
  }

  // Getter pour l'état du WebSocket popup
  get connectionState(): number | null {
    return this.ws?.readyState || null;
  }

  // Getter pour l'état du WebSocket formulaire
  get formConnectionState(): number | null {
    return this.formWs?.readyState || null;
  }

  connect() {
    this.connectPopupWebSocket();
    this.connectFormWebSocket();
  }

  private connectPopupWebSocket() {
    if (this.ws) {
      return; // Déjà connecté
    }

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket popup connecté');
      };

      this.ws.onmessage = (event) => {
        console.log('📩 Message WebSocket popup reçu (brut):', event.data);

        try {
          const rawData = JSON.parse(event.data);
          console.log('📩 Données popup parsées:', rawData);

          // Extraire les vraies données depuis rawData.data
          const messageData = rawData.data;
          console.log('📩 Données de notification extraites:', messageData);

          // Envoyer les données de la notification
          this.notificationSubject.next(messageData);
        } catch (error) {
          console.error('❌ Erreur parsing popup:', error);
          console.error('❌ Données brutes popup qui ont causé l\'erreur:', event.data);
        }
      };

      this.ws.onclose = () => {
        console.log('� WebSocket popup fermé');
        this.ws = null;
      };

      this.ws.onerror = (error) => {
        console.error('❌ Erreur WebSocket popup:', error);
      };

    } catch (error) {
      console.error('❌ Erreur connexion popup:', error);
    }
  }

  private connectFormWebSocket() {
    if (this.formWs) {
      return; // Déjà connecté
    }

    try {
      this.formWs = new WebSocket(this.formWsUrl);

      this.formWs.onopen = () => {
        console.log('✅ WebSocket formulaires connecté');
      };

      this.formWs.onmessage = (event) => {
        console.log('� Message WebSocket formulaire reçu (brut):', event.data);

        try {
          const rawData = JSON.parse(event.data);
          console.log('📋 Données formulaire parsées:', rawData);

          // Pour les formulaires, on attend la structure directe ou dans data
          const formData = rawData.data || rawData;
          console.log('📋 Données de formulaire extraites:', formData);

          // Vérifier si c'est bien un formulaire (présence de champs fields)
          if (formData && formData.fields && Array.isArray(formData.fields)) {
            console.log('📋 Formulaire valide détecté');
            this.formSubject.next(formData);
          } else {
            console.warn('⚠️ Structure de formulaire invalide:', formData);
          }
        } catch (error) {
          console.error('❌ Erreur parsing formulaire:', error);
          console.error('❌ Données brutes formulaire qui ont causé l\'erreur:', event.data);
        }
      };

      this.formWs.onclose = () => {
        console.log('🔌 WebSocket formulaires fermé');
        this.formWs = null;
      };

      this.formWs.onerror = (error) => {
        console.error('❌ Erreur WebSocket formulaires:', error);
      };

    } catch (error) {
      console.error('❌ Erreur connexion formulaires:', error);
    }
  }

  // Méthode pour envoyer des messages au serveur popup
  sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const messageToSend = JSON.stringify(message);
      console.log('📤 Envoi du message via WebSocket popup:', messageToSend);
      this.ws.send(messageToSend);
    } else {
      console.error('❌ WebSocket popup non connecté, impossible d\'envoyer le message');
    }
  }

  // Méthode pour envoyer des réponses de formulaires
  sendFormResponse(message: any) {
    if (this.formWs && this.formWs.readyState === WebSocket.OPEN) {
      const messageToSend = JSON.stringify(message);
      console.log('📤 Envoi de la réponse formulaire via WebSocket form:', messageToSend);
      this.formWs.send(messageToSend);
    } else {
      console.error('❌ WebSocket formulaires non connecté, impossible d\'envoyer la réponse');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.formWs) {
      this.formWs.close();
      this.formWs = null;
    }
  }
}
