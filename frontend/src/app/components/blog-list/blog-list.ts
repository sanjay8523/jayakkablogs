import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BlogService } from '../../services/blog';
import { Blog } from '../../models/blog.model';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './blog-list.html',
  styleUrls: ['./blog-list.css'],
})
export class BlogListComponent implements OnInit {
  blogs: Blog[] = [];
  filteredBlogs: Blog[] = [];
  searchTerm: string = '';
  sortBy: string = 'latest';
  isLoading = true;
  errorMessage = '';

  private emojis = ['📚', '✨', '🎨', '🚀', '💡', '🌟', '🎯', '🔥', '💫', '🌈'];

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.blogService.getAllBlogs().subscribe({
      next: (response) => {
        if (response.success && response.blogs) {
          this.blogs = response.blogs;
          this.applyFilters();
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load blogs. Please try again later.';
        this.isLoading = false;
        console.error('Error loading blogs:', error);
      },
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  setSortBy(sortType: string): void {
    this.sortBy = sortType;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.blogs];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (blog) =>
          blog.title.toLowerCase().includes(term) ||
          blog.content.toLowerCase().includes(term) ||
          blog.authorName.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    switch (this.sortBy) {
      case 'latest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'trending':
        result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
    }

    this.filteredBlogs = result;
  }

  getExcerpt(content: string): string {
    const maxLength = 150;
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }

    return 'Just now';
  }

  getReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute) || 1;
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  getTotalViews(): string {
    const total = this.blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
    return this.formatNumber(total);
  }

  getTotalLikes(): string {
    const total = this.blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0);
    return this.formatNumber(total);
  }

  getRandomEmoji(): string {
    return this.emojis[Math.floor(Math.random() * this.emojis.length)];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
