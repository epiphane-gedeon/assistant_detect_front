import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScreenCaptureService {
  private overlay: HTMLElement | null = null;
  private selectionBox: HTMLElement | null = null;
  private startX = 0;
  private startY = 0;
  private onCaptureComplete: ((imageData: string) => void) | null = null;
  private hiddenElements: { element: HTMLElement, originalDisplay: string }[] = [];

  constructor() {
    // Charger html2canvas depuis CDN
    this.loadHtml2Canvas();
  }

  private loadHtml2Canvas() {
    if (!(window as any).html2canvas && !document.querySelector('script[src*="html2canvas"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
      document.head.appendChild(script);
    }
  }

  startScreenCapture(hideElementsSelector: string[] = []): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.onCaptureComplete = resolve;
        // Masquer les éléments spécifiés avant la capture
        this.hideElements(hideElementsSelector);
        this.createOverlay();
      } catch (error) {
        reject(error);
      }
    });
  }

  private hideElements(selectors: string[]) {
    this.hiddenElements = [];
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const htmlElement = element as HTMLElement;
        this.hiddenElements.push({
          element: htmlElement,
          originalDisplay: htmlElement.style.display
        });
        htmlElement.style.display = 'none';
      });
    });
  }

  private showHiddenElements() {
    this.hiddenElements.forEach(({ element, originalDisplay }) => {
      element.style.display = originalDisplay;
    });
    this.hiddenElements = [];
  }

  private createOverlay() {
    // Créer l'overlay
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.1);
      z-index: 10000;
      cursor: crosshair;
      user-select: none;
      touch-action: none;
    `;

    // Créer la boîte de sélection
    this.selectionBox = document.createElement('div');
    const isMobile = window.innerWidth <= 768;
    this.selectionBox.style.cssText = `
      position: absolute;
      border: ${isMobile ? '3px' : '2px'} dashed #2196f3;
      background: rgba(33,150,243,0.2);
      pointer-events: none;
      ${isMobile ? 'box-shadow: 0 0 0 2px rgba(33,150,243,0.5);' : ''}
    `;

    this.overlay.appendChild(this.selectionBox);
    document.body.appendChild(this.overlay);

    // Ajouter les événements (souris et tactile)
    this.overlay.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.overlay.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });

    // Ajouter un message d'instruction
    this.showInstructionMessage();
  }

  private showInstructionMessage() {
    const instruction = document.createElement('div');
    instruction.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #146C53;
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 16px;
      z-index: 10001;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      max-width: 90%;
      text-align: center;
    `;

    // Message adapté selon la taille d'écran
    const isMobile = window.innerWidth <= 768;
    instruction.textContent = isMobile
      ? 'Touchez et faites glisser pour sélectionner la zone à capturer'
      : 'Cliquez et faites glisser pour sélectionner la zone à capturer';

    this.overlay?.appendChild(instruction);

    // Supprimer le message après 4 secondes sur mobile, 3 sur desktop
    setTimeout(() => {
      instruction.remove();
    }, isMobile ? 4000 : 3000);
  } private onMouseDown(e: MouseEvent) {
    this.startSelection(e.pageX, e.pageY);
    this.overlay?.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.overlay?.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  private onTouchStart(e: TouchEvent) {
    e.preventDefault(); // Empêcher le scroll sur mobile
    const touch = e.touches[0];
    this.startSelection(touch.pageX, touch.pageY);
    this.overlay?.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    this.overlay?.addEventListener('touchend', this.onTouchEnd.bind(this));
  }

  private startSelection(x: number, y: number) {
    this.startX = x;
    this.startY = y;

    if (this.selectionBox) {
      this.selectionBox.style.left = `${this.startX}px`;
      this.selectionBox.style.top = `${this.startY}px`;
      this.selectionBox.style.width = `0px`;
      this.selectionBox.style.height = `0px`;
      this.selectionBox.style.display = 'block';
    }

    // Sur mobile, montrer un petit indicateur de départ
    if (window.innerWidth <= 768) {
      this.showStartIndicator(x, y);
    }
  }

  private showStartIndicator(x: number, y: number) {
    const indicator = document.createElement('div');
    indicator.style.cssText = `
      position: absolute;
      left: ${x - 10}px;
      top: ${y - 10}px;
      width: 20px;
      height: 20px;
      border: 3px solid #2196f3;
      border-radius: 50%;
      background: rgba(33,150,243,0.3);
      pointer-events: none;
      z-index: 10002;
      animation: pulse 0.5s ease-in-out;
    `;

    // Ajouter l'animation CSS
    if (!document.querySelector('#capture-indicator-style')) {
      const style = document.createElement('style');
      style.id = 'capture-indicator-style';
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(0.5); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
      `;
      document.head.appendChild(style);
    }

    this.overlay?.appendChild(indicator);

    // Supprimer l'indicateur après l'animation
    setTimeout(() => {
      indicator.remove();
    }, 500);
  }

  private onMouseMove(e: MouseEvent) {
    this.updateSelection(e.pageX, e.pageY);
  }

  private onTouchMove(e: TouchEvent) {
    e.preventDefault(); // Empêcher le scroll sur mobile
    const touch = e.touches[0];
    this.updateSelection(touch.pageX, touch.pageY);
  }

  private updateSelection(currentX: number, currentY: number) {
    if (!this.selectionBox) return;

    const x = Math.min(currentX, this.startX);
    const y = Math.min(currentY, this.startY);
    const w = Math.abs(currentX - this.startX);
    const h = Math.abs(currentY - this.startY);

    this.selectionBox.style.left = `${x}px`;
    this.selectionBox.style.top = `${y}px`;
    this.selectionBox.style.width = `${w}px`;
    this.selectionBox.style.height = `${h}px`;
  }

  private onMouseUp() {
    this.overlay?.removeEventListener('mousemove', this.onMouseMove.bind(this));
    this.overlay?.removeEventListener('mouseup', this.onMouseUp.bind(this));
    this.finishSelection();
  }

  private onTouchEnd() {
    this.overlay?.removeEventListener('touchmove', this.onTouchMove.bind(this));
    this.overlay?.removeEventListener('touchend', this.onTouchEnd.bind(this));
    this.finishSelection();
  }

  private finishSelection() {
    if (!this.selectionBox) return;

    const rect = this.selectionBox.getBoundingClientRect();

    // Vérifier que la zone sélectionnée a une taille minimale
    if (rect.width < 10 || rect.height < 10) {
      this.cleanup();
      this.onCaptureComplete?.('');
      return;
    }

    // Capture avec html2canvas
    if ((window as any).html2canvas) {
      (window as any).html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: 1,
        ignoreElements: (element: HTMLElement) => {
          // Ignorer l'overlay de sélection
          return element === this.overlay || this.overlay?.contains(element) || false;
        }
      }).then((canvas: HTMLCanvasElement) => {
        this.cropAndReturn(canvas, rect);
      }).catch((error: any) => {
        console.error('Erreur lors de la capture:', error);
        this.cleanup();
        this.onCaptureComplete?.('');
      });
    } else {
      console.error('html2canvas non disponible');
      this.cleanup();
      this.onCaptureComplete?.('');
    }
  }

  private cropAndReturn(canvas: HTMLCanvasElement, rect: DOMRect) {
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = rect.width;
    cropCanvas.height = rect.height;

    const ctx = cropCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(
        canvas,
        rect.left, rect.top, rect.width, rect.height,
        0, 0, rect.width, rect.height
      );

      const imageData = cropCanvas.toDataURL('image/png');
      this.cleanup();
      this.onCaptureComplete?.(imageData);
    }
  }

  private cleanup() {
    // Supprimer tous les écouteurs d'événements
    if (this.overlay) {
      this.overlay.removeEventListener('mousedown', this.onMouseDown.bind(this));
      this.overlay.removeEventListener('mousemove', this.onMouseMove.bind(this));
      this.overlay.removeEventListener('mouseup', this.onMouseUp.bind(this));
      this.overlay.removeEventListener('touchstart', this.onTouchStart.bind(this));
      this.overlay.removeEventListener('touchmove', this.onTouchMove.bind(this));
      this.overlay.removeEventListener('touchend', this.onTouchEnd.bind(this));
    }

    // Restaurer les éléments masqués
    this.showHiddenElements();

    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    this.selectionBox = null;
  }

  cancelCapture() {
    this.cleanup();
    this.onCaptureComplete?.('');
  }
}
