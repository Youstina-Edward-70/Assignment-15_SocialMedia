import { Component, computed, inject, input, output, signal } from '@angular/core';
import { AuthService } from '../../../../../../../../core/auth/services/auth.service';
import { CommentsService } from '../../../../services/comments.service';
import { TimeCreatedPipe } from '../../../../../../../../shared/pipes/time-created-pipe';
import { ImageModalComponent } from '../../../image-modal/image-modal.component';
import { DeleteModalComponent } from '../../../delete-modal/delete-modal.component';
import { Comment } from '../../../../models/comment.interface';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-single-comment',
  imports: [TimeCreatedPipe, ImageModalComponent, DeleteModalComponent, ReactiveFormsModule],
  templateUrl: './single-comment.component.html',
  styleUrl: './single-comment.component.css',
})
export class SingleCommentComponent {
  private readonly commentsService = inject(CommentsService);
  private readonly authService = inject(AuthService);

  comment = input.required<Comment>();
  postId = input.required<string>();
  deleted = output<void>();
  likesChanged = output<[number, boolean, string]>();

  isDeletingComment = signal<boolean>(false);
  isUpdatingComment = signal<boolean>(false);
  isLikingComment = signal<boolean>(false);

  isDropdownOpen = signal<boolean>(false);
  isImageOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  isUpdateMode = signal<boolean>(false);

  editbody = new FormControl('', Validators.required);

  imgToPreview: string = '';

  isMyComment = computed(() => {
    return this.comment().commentCreator._id === this.authService.currentUser()?._id;
  });

  isCommentLikedByMe = computed(() => {
    return this.comment().likes.find(like => like === this.authService.currentUser()!._id);
  });

  toggleDropdown() {
    this.isDropdownOpen.update(v => !v);
  }

  openDeleteModal() {
    this.isDeleteModalOpen.set(true);
    this.isDropdownOpen.set(false);
  }

  openImage(imgUrl: string) {
    this.imgToPreview = imgUrl;
    this.isImageOpen.set(true);
  }

  closeImage() {
    this.imgToPreview = '';
    this.isImageOpen.set(false);
  }

  openUpdateMode(): void {
    this.editbody.setValue(this.comment().content);
    this.isUpdateMode.set(true);
    this.isDropdownOpen.set(false);
  }

  closeUpdateMode(): void {
    this.isUpdateMode.set(false);
    this.editbody.reset();
  }

  onConfirmDeleteComment() {
    this.isDeletingComment.set(true);

    this.commentsService.deleteComment(this.postId(), this.comment()._id).subscribe({
      next: () => {
        this.isDeletingComment.set(false);
        this.isDeleteModalOpen.set(false);
        this.deleted.emit();
      },
      error: (err) => {
        this.isDeletingComment.set(false);
        console.error(err);
      }
    });
  }

  saveUpdate() {
    if (this.editbody.invalid) return;
    this.isUpdatingComment.set(true);
    const data = {
      content: this.editbody.value,
    };

    this.commentsService.UpdateComment(this.postId(), this.comment()._id, data).subscribe({
      next: (res) => {
        this.isUpdatingComment.set(false);
        this.isUpdateMode.set(false);
        this.comment().content = res.data.comment.content;
      },
      error: () => {
        this.isUpdatingComment.set(false);
      },
    });
  }

  toggleLikeComment() {
    this.isLikingComment.set(true);
    this.commentsService.likeUnlikeComment(this.postId(), this.comment()._id).subscribe({
      next: (res) => {
        this.isLikingComment.set(false);
        this.likesChanged.emit([res.data.likesCount, res.data.liked, this.authService.currentUser()!._id]);
      },
      error: () => {
        this.isLikingComment.set(false);
      },
    });
  }
}
