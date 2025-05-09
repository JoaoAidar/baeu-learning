import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performance, imageOptimization, cache, apiCache, preload, debounce, throttle } from '../performance';

describe('Performance Monitoring', () => {
    beforeEach(() => {
        // Reset performance marks and measures
        performance.marks = {};
        performance.measures = {};
    });

    it('tracks performance marks and measures', () => {
        performance.startMeasure('test');
        performance.endMeasure('test');
        
        expect(performance.measures['test']).toBeDefined();
        expect(typeof performance.measures['test']).toBe('number');
    });

    it('returns 0 when performance API is not available', () => {
        const originalPerformance = window.performance;
        delete window.performance;

        const duration = performance.endMeasure('test');
        expect(duration).toBe(0);

        window.performance = originalPerformance;
    });
});

describe('Image Optimization', () => {
    it('lazy loads images using IntersectionObserver', () => {
        const mockIntersectionObserver = vi.fn();
        const mockObserve = vi.fn();
        const mockUnobserve = vi.fn();

        window.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
            observe: mockObserve,
            unobserve: mockUnobserve
        }));

        const img = document.createElement('img');
        img.dataset.src = 'test.jpg';
        imageOptimization.lazyLoad(img);

        expect(mockObserve).toHaveBeenCalledWith(img);
    });

    it('falls back to direct loading when IntersectionObserver is not available', () => {
        const originalIntersectionObserver = window.IntersectionObserver;
        delete window.IntersectionObserver;

        const img = document.createElement('img');
        img.dataset.src = 'test.jpg';
        imageOptimization.lazyLoad(img);

        expect(img.src).toBe('test.jpg');

        window.IntersectionObserver = originalIntersectionObserver;
    });
});

describe('Cache Management', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('sets and gets cached items', () => {
        const testData = { test: 'data' };
        cache.set('test', testData);
        const retrieved = cache.get('test');
        expect(retrieved).toEqual(testData);
    });

    it('handles expired cache items', () => {
        const testData = { test: 'data' };
        cache.set('test', testData, 0); // Set TTL to 0
        const retrieved = cache.get('test');
        expect(retrieved).toBeNull();
    });

    it('removes cached items', () => {
        cache.set('test', 'data');
        cache.remove('test');
        expect(cache.get('test')).toBeNull();
    });

    it('clears all cached items', () => {
        cache.set('test1', 'data1');
        cache.set('test2', 'data2');
        cache.clear();
        expect(cache.get('test1')).toBeNull();
        expect(cache.get('test2')).toBeNull();
    });
});

describe('API Cache', () => {
    beforeEach(() => {
        apiCache.clear();
    });

    it('caches API responses', () => {
        const testData = { test: 'data' };
        apiCache.set('test', testData);
        const retrieved = apiCache.get('test');
        expect(retrieved).toEqual(testData);
    });

    it('handles expired cache items', () => {
        const testData = { test: 'data' };
        apiCache.set('test', testData);
        // Manually expire the cache
        apiCache.cache.get('test').timestamp = Date.now() - (apiCache.ttl + 1000);
        const retrieved = apiCache.get('test');
        expect(retrieved).toBeNull();
    });
});

describe('Resource Preloading', () => {
    it('preloads images', () => {
        const img = new Image();
        vi.spyOn(window, 'Image').mockImplementation(() => img);
        
        preload.image('test.jpg');
        expect(img.src).toBe('test.jpg');
    });

    it('preloads scripts', async () => {
        const script = document.createElement('script');
        vi.spyOn(document, 'createElement').mockImplementation(() => script);
        
        const promise = preload.script('test.js');
        script.onload();
        await expect(promise).resolves.toBeUndefined();
    });

    it('preloads stylesheets', async () => {
        const link = document.createElement('link');
        vi.spyOn(document, 'createElement').mockImplementation(() => link);
        
        const promise = preload.stylesheet('test.css');
        link.onload();
        await expect(promise).resolves.toBeUndefined();
    });
});

describe('Debounce', () => {
    it('debounces function calls', async () => {
        const func = vi.fn();
        const debouncedFunc = debounce(func, 100);

        debouncedFunc();
        debouncedFunc();
        debouncedFunc();

        expect(func).not.toHaveBeenCalled();

        await new Promise(resolve => setTimeout(resolve, 150));
        expect(func).toHaveBeenCalledTimes(1);
    });
});

describe('Throttle', () => {
    it('throttles function calls', async () => {
        const func = vi.fn();
        const throttledFunc = throttle(func, 100);

        throttledFunc();
        throttledFunc();
        throttledFunc();

        expect(func).toHaveBeenCalledTimes(1);

        await new Promise(resolve => setTimeout(resolve, 150));
        throttledFunc();
        expect(func).toHaveBeenCalledTimes(2);
    });
}); 