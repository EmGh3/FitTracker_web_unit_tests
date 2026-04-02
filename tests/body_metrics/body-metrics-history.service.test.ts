import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BodyMetricsHistoryService, BodyMetricsHistoryItem } from '../../src/app/features/body_metrics/services/body-metrics-history.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { DateTime } from 'luxon';

describe('BodyMetricsHistoryService', () => {
  let service: BodyMetricsHistoryService;
  let mockHttpClient: any;

  beforeEach(() => {
    // Create a mock HttpClient
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };
    
    // Create service instance with mock HttpClient
    service = new BodyMetricsHistoryService(mockHttpClient as HttpClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: getUserHistory makes correct API call
  it('should fetch user history from the correct API endpoint', () => {
    const userId = 1;
    const mockResponse: BodyMetricsHistoryItem[] = [
      {
        user_id: 1,
        recordedAt: DateTime.now(),
        bmi: 22.5,
        bodyFat: 18.5,
        systolic: 120,
        diastolic: 80,
        pulseRate: 72
      }
    ];
    
    mockHttpClient.get.mockReturnValue(of(mockResponse));
    
    service.getUserHistory(userId).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(response.length).toBe(1);
      expect(response[0].user_id).toBe(userId);
    });
    
    expect(mockHttpClient.get).toHaveBeenCalledWith('http://localhost:3001/users/1/metrics');
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
  });

  // Test 2: extractSeries filters out null values correctly
  it('should extract series data and filter out null values', () => {
    const mockItems: BodyMetricsHistoryItem[] = [
      {
        user_id: 1,
        recordedAt: DateTime.fromISO('2024-01-01'),
        bmi: 22.5,
        bodyFat: 18.5,
        systolic: 120,
        diastolic: 80,
        pulseRate: 72
      },
      {
        user_id: 1,
        recordedAt: DateTime.fromISO('2024-02-01'),
        bmi: 23.0,
        bodyFat: null, // This should be filtered out
        systolic: 125,
        diastolic: 82,
        pulseRate: 75
      },
      {
        user_id: 1,
        recordedAt: DateTime.fromISO('2024-03-01'),
        bmi: 22.8,
        bodyFat: 19.0,
        systolic: null, // This should be filtered out
        diastolic: 81,
        pulseRate: 74
      }
    ];

    // Extract bodyFat series (has one null value)
    const bodyFatSeries = service.extractSeries(mockItems, m => m.bodyFat);
    
    expect(bodyFatSeries).toHaveLength(2); // Only the non-null values
    expect(bodyFatSeries[0]).toEqual({
      x: DateTime.fromISO('2024-01-01'),
      y: 18.5
    });
    expect(bodyFatSeries[1]).toEqual({
      x: DateTime.fromISO('2024-03-01'),
      y: 19.0
    });

    // Extract systolic series (has one null value)
    const systolicSeries = service.extractSeries(mockItems, m => m.systolic);
    
    expect(systolicSeries).toHaveLength(2);
    expect(systolicSeries[0].y).toBe(120);
    expect(systolicSeries[1].y).toBe(125);
  });

  // Test 3: extractSeries returns empty array when all values are null
  it('should return empty array when all values are null for the selector', () => {
    const mockItems: BodyMetricsHistoryItem[] = [
      {
        user_id: 1,
        recordedAt: DateTime.fromISO('2024-01-01'),
        bmi: 22.5,
        bodyFat: null,
        systolic: null,
        diastolic: null,
        pulseRate: null
      },
      {
        user_id: 1,
        recordedAt: DateTime.fromISO('2024-02-01'),
        bmi: 23.0,
        bodyFat: null,
        systolic: null,
        diastolic: null,
        pulseRate: null
      }
    ];

    const bodyFatSeries = service.extractSeries(mockItems, m => m.bodyFat);
    const systolicSeries = service.extractSeries(mockItems, m => m.systolic);
    const pulseSeries = service.extractSeries(mockItems, m => m.pulseRate);

    expect(bodyFatSeries).toHaveLength(0);
    expect(systolicSeries).toHaveLength(0);
    expect(pulseSeries).toHaveLength(0);
    expect(bodyFatSeries).toEqual([]);
  });
});