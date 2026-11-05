import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { CommentsService } from '../../services/comments.service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../../../core/auth/services/auth.service';
import { Comment } from '../../models/comment.interface';
import { SingleCommentComponent } from './components/single-comment/single-comment.component';

@Component({
  selector: 'app-comments',
  imports: [ReactiveFormsModule, SingleCommentComponent],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css',
})
export class CommentsComponent implements OnInit {
  private readonly commentsService = inject(CommentsService);
  private readonly authService = inject(AuthService);

  currentUser = this.authService.currentUser();
  postId = input.required<string>();
  comments = signal<Comment[]>([]);
  commentsChanged = output<void>();

  currentPageComments = signal(1);
  hasNextPageComments = signal(true);
  isLoadingComments = signal(false);

  isCommenting = signal<boolean>(false);

  imgSrc = signal<string>('');
  imgFile = signal<File | null>(null);
  commentContent = new FormControl('');

  ngOnInit() {
    if (this.comments.length === 0) {
      this.getComments(true);
    }
  }

  getComments(reset: boolean = false): void {
    if (reset) {
      this.currentPageComments.set(1);
      this.hasNextPageComments.set(true);
      this.isLoadingComments.set(false);
    }

    if (this.isLoadingComments() || !this.hasNextPageComments()) return;
    this.isLoadingComments.set(true);

    this.commentsService.getPostComments(this.postId(), this.currentPageComments()).subscribe({
      next: (res) => {
        const newComments = res.data.comments;
        const pagination = res.meta.pagination;

        if (newComments.length === 0) {
          this.isLoadingComments.set(false);
          this.hasNextPageComments.set(false);
          this.comments.set([]);
          return;
        }

        if (reset) {
          this.comments.set(newComments);
        } else {
          this.comments.update(current => [...current, ...newComments]);
        }

        this.isLoadingComments.set(false);

        if (pagination.nextPage && pagination.nextPage <= pagination.numberOfPages) {
          this.currentPageComments.set(pagination.nextPage);
        } else {
          this.hasNextPageComments.set(false);
        }
        // console.log(res);
      },
      error: (err) => {
        this.isLoadingComments.set(false);
        // console.log(err);
      }
    });
  }

  changeFiles(e: Event) {
    const inp = e.target as HTMLInputElement;
    if (inp.files) {
      this.imgFile.set(inp.files[0]);
      this.imgSrc.set(URL.createObjectURL(inp.files[0]));
    }
  }

  isFormValid(): boolean {
    return (this.commentContent.value?.trim() || '').length > 0 || this.imgFile() !== null;
  }

  createComment(e: SubmitEvent): void {
    e.preventDefault();
    if (!this.isFormValid()) return;
    this.isCommenting.set(true);

    const formData = new FormData();
    if (this.commentContent.value?.trim()) {
      formData.append('content', this.commentContent.value.trim());
    }
    if (this.imgFile()) {
      formData.append('image', this.imgFile() as File);
    }

    this.commentsService.createComments(this.postId(), formData).subscribe({
      next: (res) => {
        // console.log(res);
        this.getComments(true);
      },
      complete: () => {
        this.imgFile.set(null);
        this.imgSrc.set('');
        (e.target as HTMLFormElement).reset();
        this.isCommenting.set(false);
        this.commentsChanged.emit();
      },
      error: (err) => {
        // console.log(err);
        this.isCommenting.set(false);
      }
    });
  }

  onLikesUpdated(commentId: string, newLikeState: [number, boolean, string]) {
    const newLikesCount: number = newLikeState[0];
    const isLiked: boolean = newLikeState[1];
    const userId: string = newLikeState[2];

    this.comments.update(commentsList =>
      commentsList.map(c => {
        if (c._id === commentId) {
          const updatedLikes = isLiked
            ? [...c.likes, userId]
            : c.likes.filter((id: string) => id !== userId);

          return {
            ...c,
            likesCount: newLikesCount,
            likes: updatedLikes
          };
        }
        return c;
      })
    );
  }
}
