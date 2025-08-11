// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-chat-button',
//   standalone: true,
//   imports: [],
//   templateUrl: './chat-button.component.html',
//   styleUrl: './chat-button.component.css'
// })
// export class ChatButtonComponent {

// }

import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-button.component.html',
  styleUrls: ['./chat-button.component.css']
})
export class ChatButtonComponent {
  @Output() clicked = new EventEmitter<void>();

  handleClick() {
    this.clicked.emit();
  }
}
