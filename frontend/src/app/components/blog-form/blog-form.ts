import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BlogService } from '../../services/blog';
import { CreateBlogRequest, UpdateBlogRequest } from '../../models/blog.model';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
templateUrl: './blog-form.html',
styleUrls: ['./blog-form.css']
})
export class BlogFormComponent implements OnInit {
  blogData = {
    title: '',
    content: ''
  };
  isEditMode = false;
  blogId: string | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService
  ) {}

  ngOnInit(): void {
    this.blogId = this.route.snapshot.paramMap.get('id');
    if (this.blogId) {
      this.isEditMode = true;
      this.loadBlog(this.blogId);
    }
  }

  loadBlog(id: string): void {
    this.blogService.getBlogById(id).subscribe({
      next: (response) => {
        if (response.success && response.blog) {
          this.blogData.title = response.blog.title;
          this.blogData.content = response.blog.content;
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load blog.';
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.isLoading = true;

    if (this.isEditMode && this.blogId) {
      this.updateBlog();
    } else {
      this.createBlog();
    }
  }

  createBlog(): void {
    this.blogService.createBlog(this.blogData).subscribe({
      next: (response) => {
        if (response.success && response.blog) {
          this.router.navigate(['/blogs', response.blog.id]);
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to create blog.';
        this.isLoading = false;
      }
    });
  }

  updateBlog(): void {
    if (!this.blogId) return;

    this.blogService.updateBlog(this.blogId, this.blogData).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/blogs', this.blogId]);
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update blog.';
        this.isLoading = false;
      }
    });
  }
}