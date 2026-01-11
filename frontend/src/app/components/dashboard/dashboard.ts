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
  totalViews = 0;
  totalLikes = 0;
  private authSubscription?: Subscription;

  constructor(
    private blogService: BlogService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.authSubscription = this.authService.currentUser.subscribe((user) => {
      if (user) {
        this.userName = user.name;
      } else {
        this.router.navigate(['/login']);
      }
    });

    this.loadMyBlogs();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadMyBlogs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.blogService.getMyBlogs().subscribe({
      next: (response) => {
        if (response.success && response.blogs) {
          this.blogs = response.blogs;
          // Use REAL stats from backend
          this.totalViews = response.totalViews || 0;
          this.totalLikes = response.totalLikes || 0;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard blogs:', error);

        if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
          setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage =
            error.error?.message ||
            'Failed to load your blogs. Please check if the backend is running.';
        }

        this.isLoading = false;
      },
    });
  }

  deleteBlog(id: string): void {
    if (!confirm('Are you sure you want to permanently delete this blog?')) return;

    this.blogService.deleteBlog(id).subscribe({
      next: (response) => {
        if (response.success) {
          // Remove from local array
          const deletedBlog = this.blogs.find((b) => b.id === id);
          this.blogs = this.blogs.filter((blog) => blog.id !== id);

          // Update stats
          if (deletedBlog) {
            this.totalViews -= deletedBlog.views || 0;
            this.totalLikes -= deletedBlog.likes || 0;
          }
        }
      },
      error: (error) => {
        alert(error.error?.message || 'Failed to delete blog. Please try again.');
      },
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
