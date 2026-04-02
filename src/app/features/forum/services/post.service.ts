import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ForumPost, PostCategory } from '../models/post.model';
import { throttleTime, tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import{Comment} from'./../models/post.model'
import { BackendPost } from './forum.service';
@Injectable({ providedIn: 'root' })
export class PostService {
  constructor(private http: HttpClient) {};

  private readonly API_URL = 'http://localhost:3001';

  _post:ForumPost | null = null;
  _isLoading = false;
  comments: any[] = [];
 _createdComment: Comment| null = null;

 loadPostById(postId: number, userId: number) {
  this._isLoading = true;

  return this.http.get<BackendPost>(`${this.API_URL}/posts/${postId}/${userId}`).pipe(
    map(post => this.mapBackendPost(post)),
    tap(post => {
      post.createdAt = new Date(post.createdAt);
      this._post = post;
      this._isLoading = false;
    }),
    tap({ finalize: () => (this._isLoading = false) })
  );
}

 // -------------------------
  // Load comments by post ID
  // -------------------------
  loadCommentsByPostId(postId: number): Observable<BackendComment[]> {
    this._isLoading = true;

    return this.http.get<BackendComment[]>(`${this.API_URL}/comments/post/${postId}`).pipe(
      tap(comments => {
        // Convert dates if needed
        comments.forEach(c => {
          c.createdAt = new Date(c.createdAt).toISOString(); // keep backend structure but convert date
        });
        this.comments = comments;
        this._isLoading = false;
      }),
      tap({ finalize: () => (this._isLoading = false) })
    );
  }


createComment(payload: {
  content: string;
  userId: number;
  postId: number;
  parentCommentId?: number;
}): Observable<Comment> {
  this._isLoading = true;

  return this.http.post<any>(`${this.API_URL}/comments`, payload).pipe(
    map((backendComment:BackendComment) => {
      // Map backend comment to frontend interface
      const comment: Comment = {
        id: backendComment.id,
        content: backendComment.content,
        author: {
          id: backendComment.author.id,
          name: backendComment.author.nom,
          avatarUrl:"https://tse2.mm.bing.net/th/id/OIP.93Wp8WfWslensg04FkjK0gHaFn?w=922&h=700&rs=1&pid=ImgDetMain&o=7&rm=3",
          
          // add other ForumUser fields if needed
        },
        postId: backendComment.post.id,
        parentCommentId: backendComment.parentComment?.id ?? undefined,
        createdAt: new Date(backendComment.createdAt),
        likes: backendComment.likes ?? 0,
        isSolution: backendComment.isSolution,
        replies: [] // initialize empty for threaded replies
      };
      this._createdComment = comment; // store last created comment
      return comment;
    })
  );
}
markCommentAsSolution(commentId: number) {
  return this.http.post<void>(
    `${this.API_URL}/comments/solution`,
    { commentId }
  );
}

  addReaction(postId: number, userId: number, type: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/reactions`, {
      postId,
      userId,
      type
    });
  }
deleteReaction(reactionId: number): Observable<void> {
  return this.http.delete<void>(`${this.API_URL}/reactions`, {
    body: { postId: reactionId } // ou reactionId selon l'API
  });
}
mapBackendPost(post: BackendPost): ForumPost {
    return {
      id: post.id,
      title: post.title,
      content: post.content,

      author: {
        name:post.author.nom,
        id:post.author.id,
        avatarUrl:"https://tse2.mm.bing.net/th/id/OIP.93Wp8WfWslensg04FkjK0gHaFn?w=922&h=700&rs=1&pid=ImgDetMain&o=7&rm=3"
      }, // compatible with ForumUser

      category: post.category as PostCategory,
      tags: post.tags,

      likes: post.likes,
      shares: post.shares,
      pins: post.pins,

      isPinned: post.isPinned,
      isLiked: post.isLiked,
      isShared: post.isShared,

      comments: 0, // calculated on frontend

      createdAt: new Date(post.createdAt),
      updatedAt: new Date(post.updatedAt),
      lastActivityAt: new Date(post.updatedAt)
    };
  }


}
interface BackendComment {
  id: number;
  content: string;
  author: {
    id: number;
    nom: string;
    
    // other author fields if needed
  };
  post: {
    id: number;
    // other post fields if needed
  };
  parentComment?: {
    id: number;
    content: string;
    // other parent comment fields if needed
  } | null;
  createdAt: string;
  likes?: number;
  isSolution: boolean;
}