import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ForumService, BackendPost } from '../../src/app/features/forum/services/forum.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { PostCategory } from '../../src/app/features/forum/models/post.model';

describe('ForumService', () => {
  let service: ForumService;
  let mockHttpClient: any;

  const mockBackendPost: BackendPost = {
    id: 1,
    title: 'Test Post',
    content: 'This is test content',
    category: 'progress',
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
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn()
    };
    
    service = new ForumService(mockHttpClient as HttpClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: mapBackendPost correctly transforms backend data to frontend format
  it('should map backend post to frontend ForumPost correctly', () => {
    const mappedPost = service.mapBackendPost(mockBackendPost);

    // Verify basic fields
    expect(mappedPost.id).toBe(1);
    expect(mappedPost.title).toBe('Test Post');
    expect(mappedPost.content).toBe('This is test content');
    expect(mappedPost.category).toBe('progress');
    expect(mappedPost.tags).toEqual(['fitness', 'health']);
    
    // Verify author mapping
    expect(mappedPost.author).toEqual({
      name: 'Doe',
      id: 101,
      avatarUrl: 'https://tse2.mm.bing.net/th/id/OIP.93Wp8WfWslensg04FkjK0gHaFn?w=922&h=700&rs=1&pid=ImgDetMain&o=7&rm=3'
    });
    
    // Verify engagement metrics
    expect(mappedPost.likes).toBe(10);
    expect(mappedPost.shares).toBe(5);
    expect(mappedPost.pins).toBe(2);
    expect(mappedPost.isPinned).toBe(true);
    expect(mappedPost.isLiked).toBe(false);
    expect(mappedPost.isShared).toBe(false);
    
    // Verify dates are properly converted to Date objects
    expect(mappedPost.createdAt).toBeInstanceOf(Date);
    expect(mappedPost.createdAt.toISOString()).toBe('2024-01-15T10:00:00.000Z');
    expect(mappedPost.updatedAt).toBeInstanceOf(Date);
    expect(mappedPost.lastActivityAt).toBeInstanceOf(Date);
    
    // Verify comments default
    expect(mappedPost.comments).toBe(0);
  });

  // Test 2: getPostsByUser fetches and maps posts correctly
  it('should fetch posts by user ID and map them to ForumPost format', () => {
    const userId = 101;
    const mockResponse = [mockBackendPost];
    
    mockHttpClient.get.mockReturnValue(of(mockResponse));
    
    service.getPostsByUser(userId).subscribe(posts => {
      expect(posts).toHaveLength(1);
      expect(posts[0].id).toBe(1);
      expect(posts[0].title).toBe('Test Post');
      expect(posts[0].author.name).toBe('Doe');
    });
    
    expect(mockHttpClient.get).toHaveBeenCalledWith('http://localhost:3001/posts/101');
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
  });

  // Test 3: getPostsByCategory fetches and maps posts by category
  it('should fetch posts by category and map them correctly', () => {
    const category: PostCategory = 'progress';
    const mockResponse = [
      mockBackendPost,
      {
        ...mockBackendPost,
        id: 2,
        title: 'Another Post',
        category: 'progress'
      }
    ];
    
    mockHttpClient.get.mockReturnValue(of(mockResponse));
    
    service.getPostsByCategory(category).subscribe(posts => {
      expect(posts).toHaveLength(2);
      expect(posts[0].category).toBe('progress');
      expect(posts[1].category).toBe('progress');
      expect(posts[0].id).toBe(1);
      expect(posts[1].id).toBe(2);
    });
    
    expect(mockHttpClient.get).toHaveBeenCalledWith('http://localhost:3001/posts/category/progress');
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
  });
});