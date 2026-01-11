import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BlogService } from '../../services/blog';
import { AuthService } from '../../services/auth.service';
import { Blog } from '../../models/blog.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  blogs: Blog[] = [];
  isLoading = true;
  errorMessage = '';
  userName = 'User';
  private authSubscription?: Subscription;

  constructor(
    private blogService: BlogService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. Subscribe to the currentUser to fix "undefined" errors on refresh
    this.authSubscription = this.authService.currentUser.subscribe((user) => {
      if (user) {
        this.userName = user.name;
      }
    });

    this.loadMyBlogs();
  }

  // Cleanup to prevent memory leaks
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadMyBlogs(): void {
    this.isLoading = true;
    this.blogService.getMyBlogs().subscribe({
      next: (response) => {
        if (response.success && response.blogs) {
          this.blogs = response.blogs;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard blogs:', error);
        this.errorMessage = 'Failed to load your personal blogs.';
        this.isLoading = false;
      },
    });
  }

  deleteBlog(id: string): void {
    if (!confirm('Are you sure you want to permanently delete this blog?')) return;

    this.blogService.deleteBlog(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.blogs = this.blogs.filter((blog) => blog.id !== id);
        }
      },
      error: () => alert('Failed to delete blog. Please try again.'),
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
