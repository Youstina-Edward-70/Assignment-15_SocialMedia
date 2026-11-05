import {
  Component,
  computed,
  HostListener,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { PostsService } from '../../services/posts.service';
import { CommentsService } from '../../services/comments.service';

@Component({
  selector: 'app-delete-modal',
  imports: [],
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.css',
})
export class DeleteModalComponent {
  private readonly postsService = inject(PostsService);
  private readonly commentsService = inject(CommentsService);

  title = input<string>('Confirm action');
  heading = input<string>('Delete this Item?');
  message = input<string>(
    'This item will be permanently removed.'
  );
  confirmText = input<string>('Delete');
  loadingText = input<string>('Deleting...');

  isDeleting = input<boolean | undefined>(undefined);
  isOpen = model<boolean>(true);

  closeModal = output<void>();
  confirm = output<void>();

  confirmDelete(): void {
    if (this.isDeleting()) return;

    this.confirm.emit();
  }

  close(): void {
    this.isOpen.set(false);
    this.closeModal.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }
}

