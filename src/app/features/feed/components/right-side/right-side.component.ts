import { Component, inject, OnInit, signal } from '@angular/core';
import { PostsService } from '../posts/services/posts.service';
import { Suggestion } from '../posts/models/suggestion.interface';
import { UserService } from '../../../profile/services/user.service';

@Component({
  selector: 'app-right-side',
  imports: [],
  templateUrl: './right-side.component.html',
  styleUrl: './right-side.component.css',
})
export class RightSideComponent implements OnInit {
  private readonly userService = inject(UserService);

  suggestions = signal<Suggestion[]>([]);
  ngOnInit(): void {
    this.getSuggestions();
  }

  getSuggestions(): void {
    this.userService.getSuggestions().subscribe({
      next: (res) => {
        this.suggestions.set(res.data.suggestions);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
