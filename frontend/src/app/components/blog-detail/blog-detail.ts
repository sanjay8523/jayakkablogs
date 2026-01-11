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
  styleUrls: ['./blog-detail.css'],
})
export class BlogDetailComponent implements OnInit {
  blog: Blog | null = null;
  isLoading = true;
  errorMessage = '';
  isOwner = false;
  hasLiked = false;
  isLiking = false;

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
          this.checkLikeStatus();
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load blog.';
        this.isLoading = false;
      },
    });
  }

  checkOwnership(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && this.blog) {
      this.isOwner = currentUser.id === this.blog.authorId;
    }
  }

  checkLikeStatus(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && this.blog) {
      this.hasLiked = this.blog.likedBy.includes(currentUser.id);
    }
  }

  toggleLike(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.blog || this.isLiking) return;

    this.isLiking = true;
    this.blogService.toggleLike(this.blog.id).subscribe({
      next: (response) => {
        if (this.blog) {
          this.blog.likes = response.likes;
          this.hasLiked = response.liked;

          const currentUser = this.authService.currentUserValue;
          if (currentUser) {
            if (response.liked) {
              this.blog.likedBy.push(currentUser.id);
            } else {
              this.blog.likedBy = this.blog.likedBy.filter((id) => id !== currentUser.id);
            }
          }
        }
        this.isLiking = false;
      },
      error: (error) => {
        console.error('Failed to toggle like:', error);
        this.isLiking = false;
      },
    });
  }

  deleteBlog(): void {
    if (
      !this.blog ||
      !confirm('Are you sure you want to delete this blog? This action cannot be undone.')
    ) {
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

  getReadingTime(): number {
    if (!this.blog) return 0;
    const wordsPerMinute = 200;
    const words = this.blog.content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }
}
