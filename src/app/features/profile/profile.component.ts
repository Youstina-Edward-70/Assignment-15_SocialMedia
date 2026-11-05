import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { UserService } from './services/user.service';
import { AuthService } from '../../core/auth/services/auth.service';
import { User } from './models/user.interface';
import { Post } from '../feed/components/posts/models/post.interface';
import { RouterLink } from '@angular/router';
import { TimeCreatedPipe } from '../../shared/pipes/time-created-pipe';
import { ImageModalComponent } from '../feed/components/posts/components/image-modal/image-modal.component';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, ImageModalComponent, TimeCreatedPipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private readonly userService = inject(UserService);
  // private readonly authService = inject(AuthService);

  userData = signal<User>({} as User);
  myPosts = signal<Post[]>([]);
  myBookmarks = signal<Post[]>([]);

  activeTab = signal<'posts' | 'saved'>('posts');
  currentPosts = computed(() => {
    return this.activeTab() === 'posts' ? this.myPosts() : this.myBookmarks();
  });

  isImageOpen = signal<boolean>(false);
  imgToPreview: string = '';

  ngOnInit(): void {
    this.getMyProfileData();
    this.getMyPosts();
    this.getMyBookmarks();
  }

  openImage(imgUrl: string): void {
    this.imgToPreview = imgUrl;
    this.isImageOpen.set(true);
  }

  closeImage(): void {
    this.imgToPreview = '';
    this.isImageOpen.set(false);
  }

  getMyProfileData() {
    this.userService.getMyProfile().subscribe({
      next: (res) => {
        console.log(res);
        this.userData.set(res.data.user);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  getMyPosts() {
    this.userService.getMyPosts().subscribe({
      next: (res) => {
        console.log(res);
        this.myPosts.set(res.data.posts);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  getMyBookmarks() {
    this.userService.getBookmarks().subscribe({
      next: (res) => {
        console.log(res);
        this.myBookmarks.set(res.data.bookmarks);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
}
