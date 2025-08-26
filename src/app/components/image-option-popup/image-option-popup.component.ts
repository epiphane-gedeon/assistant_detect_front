import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-option-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="popup-overlay" (click)="onCancel()">
      <div class="popup-content" (click)="$event.stopPropagation()">
        <div class="popup-header">
          <h3>Ajouter une image</h3>
          <button class="close-btn" (click)="onCancel()">×</button>
        </div>

        <div class="popup-body">
          <p>Comment souhaitez-vous ajouter une image ?</p>

          <div class="option-buttons">
            <button class="option-btn capture-btn" (click)="onScreenCapture()">
              <div class="icon">📸</div>
              <div class="text">
                <div class="title">Capture d'écran</div>
                <div class="subtitle">Capturer une zone de l'écran</div>
              </div>
            </button>

            <button class="option-btn upload-btn" (click)="onFileUpload()">
              <div class="icon">📁</div>
              <div class="text">
                <div class="title">Fichier</div>
                <div class="subtitle">Sélectionner un fichier image</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }

    .popup-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      overflow: hidden;
    }

    .popup-header {
      background: #146C53;
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .popup-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .popup-body {
      padding: 20px;
    }

    .popup-body p {
      margin: 0 0 20px 0;
      color: #666;
      text-align: center;
    }

    .option-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .option-btn {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
      width: 100%;
    }

    .option-btn:hover {
      border-color: #146C53;
      background: #f8fffe;
    }

    .option-btn .icon {
      font-size: 24px;
      min-width: 40px;
      text-align: center;
    }

    .option-btn .text {
      flex: 1;
    }

    .option-btn .title {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .option-btn .subtitle {
      font-size: 14px;
      color: #666;
    }

    .capture-btn:hover {
      border-color: #2196f3;
      background: #f3f8ff;
    }

    .upload-btn:hover {
      border-color: #146C53;
      background: #f8fffe;
    }

    @media (max-width: 600px) {
      .popup-content {
        width: 95%;
        margin: 20px;
      }

      .popup-header {
        padding: 15px;
      }

      .popup-body {
        padding: 15px;
      }
    }
  `]
})
export class ImageOptionPopupComponent {
  @Output() screenCapture = new EventEmitter<void>();
  @Output() fileUpload = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onScreenCapture() {
    this.screenCapture.emit();
  }

  onFileUpload() {
    this.fileUpload.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
