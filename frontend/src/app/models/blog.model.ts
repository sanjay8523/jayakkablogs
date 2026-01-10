export interface Blog {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogResponse {
  success: boolean;
  blog?: Blog;
  blogs?: Blog[];
  count?: number;
  message?: string;
}

export interface CreateBlogRequest {
  title: string;
  content: string;
}

export interface UpdateBlogRequest {
  title?: string;
  content?: string;
}