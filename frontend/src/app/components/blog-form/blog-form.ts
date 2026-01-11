import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BlogService } from '../../services/blog';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './blog-form.html',
  styleUrls: ['./blog-form.css'],
})
export class BlogFormComponent implements OnInit {
  blogData = {
    title: '',
    content: '',
  };
  selectedFile: File | null = null;
  filePreview: string | null = null;
  isEditMode = false;
  blogId: string | null = null;
  isLoading = false;
  errorMessage = '';
  existingMedia: any = null;

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
          this.existingMedia = response.blog.media;
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load blog.';
      },
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.filePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.filePreview = null;
    this.existingMedia = null;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.isLoading = true;

    const formData = new FormData();
    formData.append('title', this.blogData.title);
    formData.append('content', this.blogData.content);

    if (this.selectedFile) {
      formData.append('media', this.selectedFile);
    }

    if (this.isEditMode && !this.selectedFile && !this.existingMedia) {
      formData.append('removeMedia', 'true');
    }

    if (this.isEditMode && this.blogId) {
      this.updateBlog(formData);
    } else {
      this.createBlog(formData);
    }
  }

  createBlog(formData: FormData): void {
    this.blogService.createBlog(formData).subscribe({
      next: (response) => {
        if (response.success && response.blog) {
          this.router.navigate(['/blogs', response.blog.id]);
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to create blog.';
        this.isLoading = false;
      },
    });
  }

  updateBlog(formData: FormData): void {
    if (!this.blogId) return;

    this.blogService.updateBlog(this.blogId, formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/blogs', this.blogId]);
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update blog.';
        this.isLoading = false;
      },
    });
  }
}
