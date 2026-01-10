import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BlogService } from '../../services/blog';
import { AuthService } from '../../services/auth.service';
import { Blog } from '../../models/blog.model';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
templateUrl: './blog-detail.html',
styleUrls: ['./blog-detail.css']
})
export class BlogDetailComponent implements OnInit {
  blog: Blog | null = null;
  isLoading = true;
  errorMessage = '';
  isOwner = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBlog(id);
    }
  }

  loadBlog(id: string): void {
    this.blogService.getBlogById(id).subscribe({
      next: (response) => {
        if (response.success && response.blog) {
          this.blog = response.blog;
          this.checkOwnership();
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load blog.';
        this.isLoading = false;
      }
    });
  }

  checkOwnership(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && this.blog) {
      this.isOwner = currentUser.id === this.blog.authorId;
    }
  }

  deleteBlog(): void {
    if (!this.blog || !confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    this.blogService.deleteBlog(this.blog.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        alert('Failed to delete blog.');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}