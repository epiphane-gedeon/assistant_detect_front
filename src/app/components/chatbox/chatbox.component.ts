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

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { FormsModule } from '@angular/forms';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

@Component({
  standalone: true,
  selector: 'app-chatbox',
  imports: [CommonModule, FormsModule, MarkdownPipe],
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.css']
})
export class ChatboxComponent {
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();

  userInput: string = '';
  messages: { from: 'user' | 'bot', text: string }[] = [];

  constructor(private chatService: ChatService) { }

  close() {
    this.closed.emit();
  }

  send() {
    const message = this.userInput.trim();
    if (!message) return;

    this.messages.push({ from: 'user', text: message });

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
  }
}
