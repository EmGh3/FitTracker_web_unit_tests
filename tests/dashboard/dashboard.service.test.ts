import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardService } from '../../src/app/features/dashboard/services/dashboard.service.ts';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { environment } from '../../src/environments/environment';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockHttpClient: any;

  beforeEach(() => {
    // Create a mock HttpClient
    mockHttpClient = {
      get: vi.fn()
    };
    
    // Create service instance with mock HttpClient
    service = new DashboardService(mockHttpClient as HttpClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: getDashboardStats makes correct API call and returns data
  it('should fetch dashboard stats from the correct API endpoint', () => {
    const mockStats = {
      totalWorkouts: 42,
      totalCalories: 15420,
      totalDistance: 156.8,
      totalDuration: 2140,
      weeklyGoalProgress: 75,
      monthlyGoalProgress: 68
    };
    
    mockHttpClient.get.mockReturnValue(of(mockStats));
    
    service.getDashboardStats().subscribe(stats => {
      expect(stats).toEqual(mockStats);
      expect(stats.totalWorkouts).toBe(42);
      expect(stats.weeklyGoalProgress).toBe(75);
    });
    
    expect(mockHttpClient.get).toHaveBeenCalledWith(
      `${environment.apiUrl}/dashboard/stats?userId=1`
    );
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
  });


  // Test 2: calculateTrend correctly computes percentage change
  it('should calculate trend percentage between current and previous values', () => {
    // Test positive trend (increase)
    expect(service.calculateTrend(100, 80)).toBe(25); // 25% increase
    
    // Test negative trend (decrease)
    expect(service.calculateTrend(80, 100)).toBe(-20); // 20% decrease
    
    // Test no change
    expect(service.calculateTrend(50, 50)).toBe(0);
    
    // Test when previous is zero
    expect(service.calculateTrend(50, 0)).toBe(0);
    
    // Test with decimal values
    expect(service.calculateTrend(75.5, 60.2)).toBeCloseTo(25.42, 1);
  });
});