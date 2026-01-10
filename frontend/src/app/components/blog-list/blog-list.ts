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
  isLoading = true;
  errorMessage = '';

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs(): void {
    this.blogService.getAllBlogs().subscribe({
      next: (response) => {
        if (response.success && response.blogs) {
          this.blogs = response.blogs;
          this.filteredBlogs = response.blogs;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load blogs.';
        this.isLoading = false;
      },
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredBlogs = this.blogs;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredBlogs = this.blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(term) ||
        blog.content.toLowerCase().includes(term) ||
        blog.authorName.toLowerCase().includes(term)
    );
  }

  getExcerpt(content: string): string {
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
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
