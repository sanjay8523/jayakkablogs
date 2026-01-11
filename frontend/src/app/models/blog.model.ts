export interface Blog {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  media?: {
    url: string;
    publicId: string;
    format: string;
    resourceType: string;
    width: number;
    height: number;
  } | null;
  views: number;
  likes: number;
  likedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogResponse {
  success: boolean;
  message?: string;
  blog?: Blog;
  blogs?: Blog[];
  count?: number;
  totalViews?: number;
  totalLikes?: number;
}

export interface CreateBlogRequest {
  title: string;
  content: string;
  media?: File;
}

export interface UpdateBlogRequest {
  title?: string;
  content?: string;
  media?: File;
  removeMedia?: boolean;
}
