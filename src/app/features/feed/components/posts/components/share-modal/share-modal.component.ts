import { Component, HostListener, inject, input, model, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Post } from '../../models/post.interface';
import { PostsService } from '../../services/posts.service';

@Component({
  selector: 'app-share-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './share-modal.component.html',
  styleUrl: './share-modal.component.css',
})
export class ShareModalComponent {
  private readonly postsService = inject(PostsService);

  post = input.required<Post>();
  isOpen = model<boolean>(true);

  closeModal = output<void>();
  shareSuccess = output<void>();

  sharebody = new FormControl('');
  isSharing = signal<boolean>(false);

  confirmShare(): void {
    if (this.isSharing()) return;

    const data = {
      body: this.sharebody.value || '',
    };

    this.isSharing.set(true);
    this.postsService.sharePost(this.post()._id, data).subscribe({
      next: () => {
        this.isSharing.set(false);
        this.close();
        this.shareSuccess.emit();
      },
      error: (err) => {
        this.isSharing.set(false);
        console.error('Failed to share post', err);
      },
    });
  }

  close(): void {
    this.isOpen.set(false);
    this.sharebody.reset();
    this.closeModal.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }
}

