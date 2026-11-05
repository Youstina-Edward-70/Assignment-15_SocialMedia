import { AuthService } from './../../../../../../core/auth/services/auth.service';
import { Component, input, inject, computed, signal, effect, output } from '@angular/core';
import { Post } from '../../models/post.interface';
import { RouterLink } from '@angular/router';
import { PostsService } from '../../services/posts.service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommentsComponent } from '../comments/comments.component';
import { ImageModalComponent } from '../image-modal/image-modal.component';
import { DeleteModalComponent } from '../delete-modal/delete-modal.component';
import { LikesModalComponent } from '../likes-modal/likes-modal.component';
import { ShareModalComponent } from '../share-modal/share-modal.component';
import { TimeCreatedPipe } from '../../../../../../shared/pipes/time-created-pipe';

@Component({
  selector: 'app-single-post',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    TimeCreatedPipe,
    CommentsComponent,
    ImageModalComponent,
    LikesModalComponent,
    ShareModalComponent,
    DeleteModalComponent,
  ],
  templateUrl: './single-post.component.html',
  styleUrl: './single-post.component.css',
})
export class SinglePostComponent {
  private readonly postsService = inject(PostsService);
  private readonly authService = inject(AuthService);

  post = input.required<Post>();

  isMyPost = computed(() => {
    return this.post().user._id === this.authService.currentUser()?._id;
  });

  privacyOptions = [
    { label: 'Public', icon: 'fa-earth-americas', value: 'public' },
    { label: 'Followers', icon: 'fa-user-group', value: 'following' },
    { label: 'Only me', icon: 'fa-lock', value: 'only_me' },
  ];

  selectedPrivacy = signal<string>(this.privacyOptions[0].value);
  selectedIcon = signal<string>(this.privacyOptions[0].icon);

  constructor() {
    effect(() => {
      const currentPost = this.post();
      if (currentPost.privacy) {
        const matched = this.privacyOptions.find(
          (opt) => opt.value.toLowerCase() === currentPost.privacy.toLowerCase()
        );
        if (matched) {
          this.selectedPrivacy.set(matched.label);
          this.selectedIcon.set(matched.icon);
        }
      }
    });
  }

  isDropdownOpen = signal<boolean>(false);
  isOptionsDropdownOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  isUpdateMode = signal<boolean>(false);
  isImageOpen = signal<boolean>(false);
  isLikesOpen = signal<boolean>(false);
  isShareModalOpen = signal<boolean>(false);
  hasOpenedComments = signal<boolean>(false);
  isCommentsSectionOpen = signal<boolean>(false);

  changeDetected = output<void>();
  bookmarkChanged = output<boolean>();
  likesChanged = output<[number, boolean, string]>();
  isBookmarking = signal<boolean>(false);
  isDeleting = signal<boolean>(false);
  isLiking = signal<boolean>(false);
  isUpdating = signal<boolean>(false);

  isLikedByMe = computed(() => {
    return this.post().likes.find(
      (like) => like === this.authService.currentUser()?._id
    );
  });

  editbody = new FormControl('', Validators.required);

  imgToPreview: string = '';

  setPrivacy(idx: number) {
    if (!this.isMyPost()) return;
    const selected = this.privacyOptions[idx];
    this.selectedPrivacy.set(selected.label);
    this.selectedIcon.set(selected.icon);
    this.isDropdownOpen.set(false);

    const data = {
      privacy: selected.value,
    };

    // calling backend
    this.postsService.updatePost(this.post()._id, data).subscribe();
  }

  toggleDropdown() {
    if (!this.isMyPost()) return;
    this.isDropdownOpen.update(v => !v);
  }

  toggleOptionsDropdown() {
    this.isOptionsDropdownOpen.update(v => !v);
  }

  openDeleteModal(): void {
    this.isDeleteModalOpen.set(true);
    this.isOptionsDropdownOpen.set(false);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
  }

  openUpdateMode(): void {
    this.editbody.setValue(this.post().body);
    this.isUpdateMode.set(true);
    this.isOptionsDropdownOpen.set(false);
  }

  closeUpdateMode(): void {
    this.isUpdateMode.set(false);
    this.editbody.reset();
  }

  openImage(imgUrl: string): void {
    this.imgToPreview = imgUrl;
    this.isImageOpen.set(true);
  }

  closeImage(): void {
    this.imgToPreview = '';
    this.isImageOpen.set(false);
  }

  openLikes(): void {
    if (!this.post().likesCount) return;
    this.isLikesOpen.set(true);
  }

  closeLikes(): void {
    this.isLikesOpen.set(false);
  }

  openShareModal(): void {
    this.isShareModalOpen.set(true);
  }

  closeShareModal(): void {
    this.isShareModalOpen.set(false);
  }

  toggleBookmarkPost(): void {
    this.isBookmarking.set(true);
    this.isOptionsDropdownOpen.set(false);
    this.postsService.bookmarkUnbookmarkPost(this.post()._id).subscribe({
      next: (res) => {
        this.isBookmarking.set(false);
        this.bookmarkChanged.emit(res.data.bookmarked);
      },
      error: () => {
        this.isBookmarking.set(false);
      },
    });
  }

  onConfirmDeletePost() {
    this.isDeleting.set(true);
    this.postsService.deletePost(this.post()._id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.isDeleteModalOpen.set(false);
        this.changeDetected.emit();
      },
      error: (err) => {
        this.isDeleting.set(false);
        console.error(err);
      }
    });
  }

  toggleLikePost(): void {
    this.isLiking.set(true);
    this.isOptionsDropdownOpen.set(false);
    this.postsService.LikeUnlikePost(this.post()._id).subscribe({
      next: (res) => {
        this.isLiking.set(false);
        this.likesChanged.emit([res.data.likesCount, res.data.liked, this.authService.currentUser()!._id]);
      },
      error: () => {
        this.isLiking.set(false);
      },
    });
  }

  saveUpdate() {
    if (this.editbody.invalid) return;
    this.isUpdating.set(true);
    const data = {
      body: this.editbody.value,
    };

    this.postsService.updatePost(this.post()._id, data).subscribe({
      next: (res) => {
        this.isUpdating.set(false);
        this.isUpdateMode.set(false);
        this.post().body = res.data.post.body;
      },
      error: () => {
        this.isUpdating.set(false);
      },
    });
  }

  toggleCommentsSection() {
    this.isCommentsSectionOpen.update(v => !v);

    if (this.isCommentsSectionOpen() && !this.hasOpenedComments()) {
      this.hasOpenedComments.set(true);
    }
  }
}
