import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostsService } from '../feed/components/posts/services/posts.service';
import { Post } from '../feed/components/posts/models/post.interface';
import { Location } from '@angular/common';
import { SinglePostComponent } from '../feed/components/posts/components/single-post/single-post.component';

@Component({
  selector: 'app-post-details',
  imports: [SinglePostComponent],
  templateUrl: './post-details.component.html',
  styleUrl: './post-details.component.css',
})
export class PostDetailsComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly postsService = inject(PostsService);

  post = signal<Post>({} as Post);

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((param) => {
      this.getPostData(param.get('id')!);
    })
  }

  getPostData(id: string) {
    this.postsService.getSinglePost(id).subscribe({
      next: (res) => {
        console.log(res);
        this.post.set(res.data.post);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}
