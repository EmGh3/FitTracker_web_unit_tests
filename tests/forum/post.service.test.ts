import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PostService } from '../../src/app/features/forum/services/post.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

describe('PostService', () => {
  let service: PostService;
  let mockHttpClient: any;

  const mockBackendPost = {
    id: 1,
    title: 'Test Post',
    content: 'This is test content',
    category: 'general',
    tags: ['fitness', 'health'],
    likes: 10,
    shares: 5,
    pins: 2,
    isPinned: true,
    isLiked: false,
    isShared: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    author: {
      id: 101,
      nom: 'Doe',
      prenom: 'John',
      email: 'john@example.com'
    }
  };

  beforeEach(() => {
    // Create mock HttpClient with all methods
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };
    
    // Create service with mock
    service = new PostService(mockHttpClient as unknown as HttpClient);
    
    // Verify the service was created correctly
    expect(service).toBeDefined();
    expect((service as any).http).toBeDefined();
    expect((service as any).http.get).toBeDefined();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: loadPostById fetches and maps post correctly
  it('should load post by ID and map backend data to ForumPost', () => {
    const postId = 1;
    const userId = 101;
    
    // Setup mock to return the data
    mockHttpClient.get.mockReturnValue(of(mockBackendPost));
    
    service.loadPostById(postId, userId).subscribe(post => {
      expect(post.id).toBe(1);
      expect(post.title).toBe('Test Post');
      expect(post.content).toBe('This is test content');
      expect(post.category).toBe('general');
      expect(post.author.name).toBe('Doe');
      expect(post.author.id).toBe(101);
      expect(post.createdAt).toBeInstanceOf(Date);
      expect(post.likes).toBe(10);
    });
    
    expect(mockHttpClient.get).toHaveBeenCalledWith(
      'http://localhost:3001/posts/1/101'
    );
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(service._post).toBeTruthy();
    expect(service._post?.id).toBe(1);
  });

  // Test 2: createComment sends correct payload and maps response
  it('should create a comment and map backend response to frontend Comment', () => {
    const mockBackendComment = {
      id: 1,
      content: 'Great post!',
      author: {
        id: 102,
        nom: 'Jane',
        prenom: 'Smith',
        email: 'jane@example.com'
      },
      post: {
        id: 1
      },
      parentComment: null,
      createdAt: '2024-01-15T14:00:00Z',
      likes: 5,
      isSolution: false
    };

    const commentPayload = {
      content: 'Great post!',
      userId: 102,
      postId: 1,
      parentCommentId: undefined
    };
    
    mockHttpClient.post.mockReturnValue(of(mockBackendComment));
    
    service.createComment(commentPayload).subscribe(comment => {
      expect(comment.id).toBe(1);
      expect(comment.content).toBe('Great post!');
      expect(comment.author.id).toBe(102);
      expect(comment.author.name).toBe('Jane');
      expect(comment.postId).toBe(1);
      expect(comment.likes).toBe(5);
      expect(comment.isSolution).toBe(false);
      expect(comment.createdAt).toBeInstanceOf(Date);
      expect(comment.replies).toEqual([]);
    });
    
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      'http://localhost:3001/comments',
      commentPayload
    );
    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(service._createdComment).toBeTruthy();
    expect(service._createdComment?.id).toBe(1);
  });

  // Test 3: mapBackendPost correctly transforms backend post to ForumPost
  it('should map backend post to ForumPost with all required fields', () => {
    const mappedPost = service.mapBackendPost(mockBackendPost);

    expect(mappedPost.id).toBe(1);
    expect(mappedPost.title).toBe('Test Post');
    expect(mappedPost.content).toBe('This is test content');
    expect(mappedPost.category).toBe('general');
    expect(mappedPost.tags).toEqual(['fitness', 'health']);
    
    expect(mappedPost.author).toEqual({
      name: 'Doe',
      id: 101,
      avatarUrl: 'https://tse2.mm.bing.net/th/id/OIP.93Wp8WfWslensg04FkjK0gHaFn?w=922&h=700&rs=1&pid=ImgDetMain&o=7&rm=3'
    });
    
    expect(mappedPost.likes).toBe(10);
    expect(mappedPost.shares).toBe(5);
    expect(mappedPost.pins).toBe(2);
    expect(mappedPost.isPinned).toBe(true);
    expect(mappedPost.isLiked).toBe(false);
    expect(mappedPost.isShared).toBe(false);
    
    expect(mappedPost.createdAt).toBeInstanceOf(Date);
    expect(mappedPost.updatedAt).toBeInstanceOf(Date);
    expect(mappedPost.lastActivityAt).toBeInstanceOf(Date);
    expect(mappedPost.createdAt.toISOString()).toBe('2024-01-15T10:00:00.000Z');
    
    expect(mappedPost.comments).toBe(0);
  });
});