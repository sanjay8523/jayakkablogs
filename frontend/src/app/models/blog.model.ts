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
