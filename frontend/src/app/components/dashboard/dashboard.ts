import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BlogService } from '../../services/blog';
import { AuthService } from '../../services/auth.service';
import { Blog } from '../../models/blog.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  blogs: Blog[] = [];
  isLoading = true;
  errorMessage = '';
  userName = '';

  constructor(
    private blogService: BlogService,
    private authService: AuthService,
    private router: Router
  ) {
    const user = this.authService.currentUserValue;
    this.userName = user?.name || 'User';
  }

  ngOnInit(): void {
    this.loadMyBlogs();
  }

  loadMyBlogs(): void {
    this.blogService.getMyBlogs().subscribe({
      next: (response) => {
        if (response.success && response.blogs) {
          this.blogs = response.blogs;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading blogs:', error);
        this.errorMessage = 'Failed to load your blogs.';
        this.isLoading = false;
      },
    });
  }

  deleteBlog(id: string): void {
    if (!confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    this.blogService.deleteBlog(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.blogs = this.blogs.filter((blog) => blog.id !== id);
        }
      },
      error: (error) => {
        alert('Failed to delete blog.');
      },
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
