import { Component, inject, OnInit, signal, viewChild, ElementRef, computed, effect, untracked } from '@angular/core';
import { PostsService } from './services/posts.service';
import { AuthService } from './../../../../core/auth/services/auth.service';
import { Post } from './models/post.interface';
import { SinglePostComponent } from './components/single-post/single-post.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-posts',
  imports: [SinglePostComponent, ReactiveFormsModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css',
})
export class PostsComponent implements OnInit {
  private readonly postsService = inject(PostsService);
  private readonly authService = inject(AuthService);

  allPosts = signal<Post[]>([]);
  currentUser = this.authService.currentUser();

  isPosting = signal<boolean>(false);
  imgSrc = signal<string>('');
  imgFile = signal<File | null>(null);
  content = new FormControl('');
  privacy = new FormControl('only_me'); // change to: public

  currentPagePosts = signal(1);
  hasNextPagePosts = signal(true);
  isLoadingPosts = signal(false);

  sentinel = viewChild<ElementRef>('sentinel');

  constructor() {
    effect(() => {
      this.postsService.activeTab();
      untracked(() => {
        this.getPostsData(true);
      });
    })
  }

  ngOnInit(): void {
    this.initIntersectionObserver();
  }

  getPostsData(reset: boolean = false): void {
    if (reset) {
      this.currentPagePosts.set(1);
      this.hasNextPagePosts.set(true);
      this.isLoadingPosts.set(false);
    }

    if (this.isLoadingPosts() || !this.hasNextPagePosts()) return;
    this.isLoadingPosts.set(true);

    this.postsService.getAllPosts(this.currentPagePosts()).subscribe({
      next: (res) => {
        const newPosts = res.data.posts || res.data.bookmarks;
        const pagination = res.meta.pagination;

        if (newPosts.length === 0) {
          this.isLoadingPosts.set(false);
          this.hasNextPagePosts.set(false);
          this.allPosts.set([]);
          return;
        }

        if (reset) {
          this.allPosts.set(newPosts);
        } else {
          this.allPosts.update(current => [...current, ...newPosts]);
        }

        this.isLoadingPosts.set(false);

        if (pagination.nextPage && pagination.nextPage <= pagination.numberOfPages) {
          this.currentPagePosts.set(pagination.nextPage);
        } else {
          this.hasNextPagePosts.set(false);
        }
        // console.log(this.allPosts());
      },
      error: (err) => {
        // console.log(err);
        this.isLoadingPosts.set(false);
      },
    });
  }

  initIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !this.isLoadingPosts() && this.hasNextPagePosts()) {
        this.getPostsData(false);
      }
    }, {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    });

    setTimeout(() => {
      const sentinelElement = this.sentinel()?.nativeElement;
      if (sentinelElement) {
        observer.observe(sentinelElement);
      }
    }, 400);
  }

  changeFiles(e: Event) {
    const inp = e.target as HTMLInputElement;
    if (inp.files) {
      this.imgFile.set(inp.files[0]);
      this.imgSrc.set(URL.createObjectURL(inp.files[0]));
    }
  }

  onBookmarkUpdated(postId: string, newBookmarkedState: boolean) {
    this.allPosts.update(postsList =>
      postsList.map(p => p._id === postId ? { ...p, bookmarked: newBookmarkedState } : p)
    );
  }

  onLikesUpdated(postId: string, newLikeState: [number, boolean, string]) {
    const newLikesCount: number = newLikeState[0];
    const isLiked: boolean = newLikeState[1];
    const userId: string = newLikeState[2];

    this.allPosts.update(postsList =>
      postsList.map(p => {
        if (p._id === postId) {
          const updatedLikes = isLiked
            ? [...p.likes, userId]
            : p.likes.filter((id: string) => id !== userId);

          return {
            ...p,
            likesCount: newLikesCount,
            likes: updatedLikes
          };
        }
        return p;
      })
    );
  }

  isFormValid(): boolean {
    return (this.content.value?.trim() || '').length > 0 || this.imgFile() !== null;
  }

  submitPost(e: SubmitEvent): void {
    e.preventDefault();
    if (!this.isFormValid()) return;
    this.isPosting.set(true);

    const formData = new FormData();
    if (this.content.value?.trim()) {
      formData.append('body', this.content.value.trim());
    }
    if (this.privacy.value) {
      formData.append('privacy', this.privacy.value);
    }
    if (this.imgFile()) {
      formData.append('image', this.imgFile() as File);
    }

    this.postsService.createPost(formData).subscribe({
      next: (res) => {
        // console.log(res);
        this.getPostsData(true);
      },
      error: (err) => {
        // console.log(err.error);
        this.isPosting.set(false);
      },
      complete: () => {
        this.imgFile.set(null);
        this.imgSrc.set('');
        (e.target as HTMLFormElement).reset();
        this.isPosting.set(false);
      }
    });
  }
}
