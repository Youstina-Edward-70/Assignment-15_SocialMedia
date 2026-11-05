import { Component, inject, signal } from '@angular/core';
import { PostsService } from '../posts/services/posts.service';

@Component({
  selector: 'app-left-side',
  imports: [],
  templateUrl: './left-side.component.html',
  styleUrl: './left-side.component.css',
})
export class LeftSideComponent {
  postService = inject(PostsService);

  onTabChange(tabName: string) {
    this.postService.activeTab.set(tabName);

    switch (tabName) {
      case 'feed':
        this.postService.only.set('following');
        break;
      case 'my-posts':
        this.postService.only.set('me');
        break;
      case 'community':
        this.postService.only.set('all');
        break;
    }
  }
}
