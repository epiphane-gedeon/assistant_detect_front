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

import { Component } from '@angular/core';
import { ChatboxComponent } from './components/chatbox/chatbox.component';
import { ChatButtonComponent } from './components/chat-button/chat-button.component';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ChatboxComponent, ChatButtonComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  chatVisible = true; // à tester avec true ou false
}

