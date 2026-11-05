import { Component, HostListener, input, model, output } from '@angular/core';

@Component({
  selector: 'app-image-modal',
  imports: [],
  templateUrl: './image-modal.component.html',
  styleUrl: './image-modal.component.css',
})
export class ImageModalComponent {
  imageUrl = input<string | null | undefined>('');
  altText = input<string>('Enlarged preview');
  isOpen = model<boolean>(true);

  closeModal = output<void>();

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

