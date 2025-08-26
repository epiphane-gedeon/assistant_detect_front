import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupService, PopupConfig } from '../../services/popup.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-popup',
  imports: [CommonModule],
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit, OnDestroy {
  popupConfig: PopupConfig | null = null;
  private subscription?: Subscription;

  constructor(private popupService: PopupService) { }

  ngOnInit() {
    this.subscription = this.popupService.popup$.subscribe(config => {
      this.popupConfig = config;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  closePopup() {
    this.popupService.closePopup();
  }

  executeAction(action: () => void) {
    action();
  }
}
