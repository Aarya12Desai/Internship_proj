import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';

interface ChatMessage {
  id: number;
  message: string;
  senderId: number;
  senderCompanyName: string;
  createdAt: string;
  edited: boolean;
  editedAt?: string;
}

@Component({
  selector: 'app-community-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="community-chat-container">
      <div class="chat-header">
        <h2>Community Chat</h2>
        <div class="chat-stats">
          <span>{{ chatStats().totalMessages || 0 }} total messages</span>
          <span>{{ chatStats().recentMessages || 0 }} in last 24h</span>
        </div>
      </div>

      <div class="chat-messages" #messagesContainer>
        @if (messages().length === 0) {
          <div class="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        }
        @for (message of messages(); track message.id) {
          <div class="message" [class.own-message]="isOwnMessage(message)">
            <div class="message-header">
              <span class="company-name">{{ message.senderCompanyName }}</span>
              <span class="timestamp">{{ formatDate(message.createdAt) }}</span>
              @if (message.edited) {
                <span class="edited-indicator">(edited)</span>
              }
            </div>
            <div class="message-content">
              @if (editingMessageId() === message.id) {
                <div class="edit-form">
                  <textarea 
                    [(ngModel)]="editMessageText" 
                    class="edit-textarea"
                    (keydown)="onEditKeydown($event, message.id)">
                  </textarea>
                  <div class="edit-buttons">
                    <button (click)="saveEdit(message.id)" class="save-btn">Save</button>
                    <button (click)="cancelEdit()" class="cancel-btn">Cancel</button>
                  </div>
                </div>
              } @else {
                <p>{{ message.message }}</p>
                @if (isOwnMessage(message)) {
                  <div class="message-actions">
                    <button (click)="startEdit(message)" class="edit-btn">Edit</button>
                    <button (click)="deleteMessage(message.id)" class="delete-btn">Delete</button>
                  </div>
                }
              }
            </div>
          </div>
        }
      </div>

      <div class="chat-input">
        <form (ngSubmit)="sendMessage()" class="message-form">
          <textarea 
            [(ngModel)]="newMessage" 
            name="message"
            placeholder="Type your message here..."
            class="message-textarea"
            (keydown.enter)="onEnterPress($event)"
            rows="3">
          </textarea>
          <button type="submit" [disabled]="!newMessage.trim() || loading()" class="send-btn">
            {{ loading() ? 'Sending...' : 'Send' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .community-chat-container {
      display: flex;
      flex-direction: column;
      height: 80vh;
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }

    .chat-header {
      background: #2c3e50;
      color: white;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chat-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    .chat-stats {
      display: flex;
      gap: 1rem;
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      background: #f8f9fa;
    }

    .no-messages {
      text-align: center;
      color: #666;
      padding: 2rem;
    }

    .message {
      margin-bottom: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .message.own-message {
      background: #e3f2fd;
      margin-left: 2rem;
    }

    .message-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .company-name {
      font-weight: bold;
      color: #2c3e50;
    }

    .timestamp {
      color: #666;
    }

    .edited-indicator {
      color: #999;
      font-style: italic;
      font-size: 0.8rem;
    }

    .message-content p {
      margin: 0;
      line-height: 1.5;
      white-space: pre-wrap;
    }

    .message-actions {
      margin-top: 0.5rem;
      display: flex;
      gap: 0.5rem;
    }

    .edit-btn, .delete-btn {
      padding: 0.25rem 0.5rem;
      border: none;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
    }

    .edit-btn {
      background: #4CAF50;
      color: white;
    }

    .delete-btn {
      background: #f44336;
      color: white;
    }

    .edit-form {
      margin-top: 0.5rem;
    }

    .edit-textarea {
      width: 100%;
      min-height: 60px;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: vertical;
    }

    .edit-buttons {
      margin-top: 0.5rem;
      display: flex;
      gap: 0.5rem;
    }

    .save-btn, .cancel-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .save-btn {
      background: #4CAF50;
      color: white;
    }

    .cancel-btn {
      background: #666;
      color: white;
    }

    .chat-input {
      border-top: 1px solid #ddd;
      padding: 1rem;
      background: white;
    }

    .message-form {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
    }

    .message-textarea {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: vertical;
      font-family: inherit;
    }

    .send-btn {
      padding: 0.75rem 1.5rem;
      background: #2c3e50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      white-space: nowrap;
    }

    .send-btn:hover:not(:disabled) {
      background: #34495e;
    }

    .send-btn:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }
  `]
})
export class CommunityChatComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  
  messages = signal<ChatMessage[]>([]);
  chatStats = signal<any>({});
  loading = signal(false);
  editingMessageId = signal<number | null>(null);
  
  newMessage = '';
  editMessageText = '';
  currentUserId: number | null = null;
  
  private refreshSubscription?: Subscription;

  ngOnInit() {
    this.loadMessages();
    this.loadChatStats();
    this.getCurrentUser();
    
    // Auto-refresh messages every 10 seconds
    this.refreshSubscription = interval(10000).subscribe(() => {
      this.loadMessages();
    });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.currentUserId = userData.id;
    }
  }

  loadMessages() {
    this.http.get<ChatMessage[]>('/api/community-chat/messages').subscribe({
      next: (data) => {
        this.messages.set(data.reverse()); // Show oldest first
      },
      error: (error) => {
        console.error('Error loading messages:', error);
      }
    });
  }

  loadChatStats() {
    this.http.get<any>('/api/community-chat/stats').subscribe({
      next: (data) => {
        this.chatStats.set(data);
      },
      error: (error) => {
        console.error('Error loading chat stats:', error);
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.loading()) return;

    this.loading.set(true);
    
    this.http.post<ChatMessage>('/api/community-chat/send', { 
      message: this.newMessage 
    }).subscribe({
      next: (message) => {
        this.messages.update(messages => [...messages, message]);
        this.newMessage = '';
        this.loading.set(false);
        this.loadChatStats();
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.loading.set(false);
      }
    });
  }

  startEdit(message: ChatMessage) {
    this.editingMessageId.set(message.id);
    this.editMessageText = message.message;
  }

  saveEdit(messageId: number) {
    if (!this.editMessageText.trim()) return;

    this.http.put<ChatMessage>(`/api/community-chat/edit/${messageId}`, {
      message: this.editMessageText
    }).subscribe({
      next: (updatedMessage) => {
        this.messages.update(messages => 
          messages.map(m => m.id === messageId ? updatedMessage : m)
        );
        this.cancelEdit();
      },
      error: (error) => {
        console.error('Error editing message:', error);
      }
    });
  }

  cancelEdit() {
    this.editingMessageId.set(null);
    this.editMessageText = '';
  }

  deleteMessage(messageId: number) {
    if (!confirm('Are you sure you want to delete this message?')) return;

    this.http.delete(`/api/community-chat/delete/${messageId}`).subscribe({
      next: () => {
        this.messages.update(messages => 
          messages.filter(m => m.id !== messageId)
        );
        this.loadChatStats();
      },
      error: (error) => {
        console.error('Error deleting message:', error);
      }
    });
  }

  isOwnMessage(message: ChatMessage): boolean {
    return this.currentUserId === message.senderId;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  }

  onEnterPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onEditKeydown(event: KeyboardEvent, messageId: number) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.saveEdit(messageId);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEdit();
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.chat-messages');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}
