import {
  Component,
  computed,
  effect,
  HostListener,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { User } from '../../models/post.interface';
import { PostsService } from '../../services/posts.service';

@Component({
  selector: 'app-likes-modal',
  imports: [],
  templateUrl: './likes-modal.component.html',
  styleUrl: './likes-modal.component.css',
})
export class LikesModalComponent {
  private readonly postsService = inject(PostsService);

  postId = input<string>('');
  likesCount = input<number>(0);
  title = input<string>('People who reacted');
  users = input<User[] | undefined>(undefined);
  isOpen = model<boolean>(true);

  closeModal = output<void>();

  reactUsers = signal<User[]>([]);
  isLoadingLikes = signal<boolean>(false);
  currentPageLikes = signal<number>(1);
  hasNextPageLikes = signal<boolean>(true);

  displayUsers = computed(() => this.users() ?? this.reactUsers());

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const pid = this.postId();
      const customUsers = this.users();

      if (open && pid && !customUsers) {
        untracked(() => {
          this.getReactedUsers(true);
        });
      }
    });
  }

  getReactedUsers(reset: boolean = false): void {
    const pid = this.postId();
    if (!pid || this.isLoadingLikes()) return;

    if (reset) {
      this.currentPageLikes.set(1);
      this.hasNextPageLikes.set(true);
      this.reactUsers.set([]);
      this.isLoadingLikes.set(true);
    }

    if (!this.hasNextPageLikes()) return;

    this.postsService.getPostLikes(pid, this.currentPageLikes()).subscribe({
      next: (res) => {
        const newLikes: User[] = res?.data?.likes ?? [];
        const pagination = res?.meta?.pagination;

        if (newLikes.length === 0 && reset) {
          this.isLoadingLikes.set(false);
          this.hasNextPageLikes.set(false);
          this.reactUsers.set([]);
          return;
        }

        if (reset) {
          this.reactUsers.set(newLikes);
        } else {
          this.reactUsers.update((current) => [...current, ...newLikes]);
        }

        this.isLoadingLikes.set(false);

        if (pagination && pagination.nextPage) {
          this.currentPageLikes.set(pagination.nextPage);
        } else {
          this.hasNextPageLikes.set(false);
        }
      },
      error: (err) => {
        this.isLoadingLikes.set(false);
        console.error('Failed to load reacted users', err);
      },
    });
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

