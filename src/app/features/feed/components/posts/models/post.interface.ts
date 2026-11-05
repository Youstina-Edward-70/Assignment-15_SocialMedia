import { Comment } from "./comment.interface";

export interface Post {
  _id: string;
  body: string;
  image: string;
  privacy: string;
  user: User;
  sharedPost: Post | null;
  likes: any[];
  createdAt: Date;
  commentsCount: number;
  topComment: Comment | null;
  sharesCount: number;
  likesCount: number;
  isShare: boolean;
  id: string;
  bookmarked: boolean;
}

export interface User {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

export interface GetAllPostsApiResponse {
  success: boolean;
  message: string;
  data: {
    posts: Post[];
  };
  meta: {
    pagination: {
      currentPage: number;
      numberOfPages: number;
      limit: number;
      nextPage: number | null;
      prevPage: number | null;
      total: number;
    };
  };
}
