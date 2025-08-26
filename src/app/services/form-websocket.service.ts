import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FormWebSocketService {
    private ws: WebSocket | null = null;
    private wsUrl = 'ws://127.0.0.1:8000/ws/form';

    // Observable pour les formulaires reçus
    private formSubject = new Subject<any>();
    form$ = this.formSubject.asObservable();

    constructor() { }

    connect() {
        if (this.ws) {
            return; // Déjà connecté
        }

        try {
            this.ws = new WebSocket(this.wsUrl);

            this.ws.onopen = () => {
                console.log('✅ WebSocket Form connecté');
            };

            this.ws.onmessage = (event) => {
                console.log('📋 Message WebSocket Form reçu (brut):', event.data);

                try {
                    const data = JSON.parse(event.data);
                    console.log('📋 Données Form parsées:', data);

                    // Vérifier si c'est bien un formulaire
                    if (data.form) {
                        console.log('🎯 Formulaire détecté:', data.form);

                        // Extraire les données du formulaire
                        const formConfig = {
                            title: data.form.title,
                            fields: data.form.fields,
                            submitText: data.form.submitText || 'Valider',
                            showCloseButton: data.form.showCloseButton || true,
                            onSubmit: (formData: any) => {
                                console.log('📝 Données du formulaire soumises:', formData);
                                // Ici on peut traiter les données ou les envoyer au serveur
                            }
                        };

                        this.formSubject.next(formConfig);
                    }
                } catch (error) {
                    console.error('❌ Erreur parsing WebSocket Form:', error);
                }
            };

            this.ws.onclose = () => {
                console.log('🔴 WebSocket Form fermé');
                this.ws = null;
                // Reconnexion automatique après 3 secondes
                setTimeout(() => this.connect(), 3000);
            };

            this.ws.onerror = (error) => {
                console.error('❌ Erreur WebSocket Form:', error);
            };

        } catch (error) {
            console.error('❌ Erreur connexion WebSocket Form:', error);
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}
