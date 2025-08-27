export interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  authorUsername: string;
  authorEmail: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
  status: string;
}

export interface CreatePostRequest {
  content: string;
  imageUrl?: string;
}

export interface Comment {
  id: number;
  content: string;
  postId: number;
  authorId: number;
  authorUsername: string;
  authorEmail: string;
  parentCommentId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: number;
}

export interface PostsResponse {
  content: Post[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface CommentsResponse {
  content: Comment[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
