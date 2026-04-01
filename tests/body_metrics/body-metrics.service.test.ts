import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BodyMetricsService } from '../../src/app/features/body_metrics/services/body-metrics.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

describe('BodyMetricsService', () => {
  let service: BodyMetricsService;
  let mockHttpClient: any;

  beforeEach(() => {
    // Create a mock HttpClient with proper typing
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };
    
    // Create service instance with mock HttpClient
    service = new BodyMetricsService(mockHttpClient as HttpClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: BMI Calculation and Status
  it('should calculate BMI and return correct status', () => {
    const bmi = service.calculateBMI(175, 70);
    expect(bmi).toBe(22.9);
    expect(service.bmiStatus(bmi)).toBe('Healthy');
    
    // Test underweight
    const underweightBmi = service.calculateBMI(175, 50);
    expect(service.bmiStatus(underweightBmi)).toBe('Underweight');
    
    // Test overweight
    const overweightBmi = service.calculateBMI(175, 85);
    expect(service.bmiStatus(overweightBmi)).toBe('Overweight');
    
    // Test obese
    const obeseBmi = service.calculateBMI(175, 110);
    expect(service.bmiStatus(obeseBmi)).toBe('Obese');
  });

  // Test 2: Save Metrics API Call (with mocked HTTP)
  it('should save metrics for a user', () => {
    const userId = 1;
    const mockMetrics = {
      heightCm: 175,
      weightKg: 70,
      bmi: 22.9,
      recordedAt: new Date()
    };
    const mockResponse = { success: true, id: 123 };
    
    mockHttpClient.post.mockReturnValue(of(mockResponse));
    
    service.saveMetrics(userId, mockMetrics).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      'http://localhost:3001/users/1/metrics',
      mockMetrics
    );
    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
  });

  // Test 3: Body Fat Calculation with Edge Cases
  it('should calculate body fat for male and return null for missing data', () => {
    // Test with valid male data
    const maleData = {
      gender: 'male' as const,
      waist: 80,
      neck: 38,
      height_cm: 175,
      weight_kg: 70,
      recorded_at: new Date()
    };
    const maleBodyFat = service.calculateBodyFat(maleData as any);
    expect(maleBodyFat).toBeCloseTo(19.3, 1);

    // Test with missing required data (should return null)
    const incompleteData = {
      gender: 'male' as const,
      waist: 80,
      height_cm: 175
    };
    expect(service.calculateBodyFat(incompleteData as any)).toBeNull();
    
    // Test with female data missing hip measurement
    const femaleIncompleteData = {
      gender: 'female' as const,
      waist: 70,
      neck: 35,
      height_cm: 165
    };
    expect(service.calculateBodyFat(femaleIncompleteData as any)).toBeNull();
  });
});