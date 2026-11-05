import { inject, Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'timeCreated',
})
export class TimeCreatedPipe implements PipeTransform {
  private readonly datePipe = inject(DatePipe);

  transform(value: string | Date, format: string = 'medium'): string {
    if (!value) return '';

    const dateCreated = new Date(value);
    if (isNaN(dateCreated.getTime())) return '';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateCreated.getTime()) / 1000);

    // Less than a minute
    if (diffInSeconds < 60) {
      return 'Just now';
    }

    // Less than an hour
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    }

    // Less than a day
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h`;
    }

    // Less than a week
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d`;
    }

    // Less than a month

    return this.datePipe.transform(dateCreated, format) || '';
  }
}
