// Performance monitoring
export const performance = {
    marks: {},
    measures: {},

    startMeasure: (name) => {
        if (window.performance && window.performance.mark) {
            window.performance.mark(`${name}-start`);
            performance.marks[name] = Date.now();
        }
    },

    endMeasure: (name) => {
        if (window.performance && window.performance.mark) {
            window.performance.mark(`${name}-end`);
            window.performance.measure(name, `${name}-start`, `${name}-end`);
            const duration = Date.now() - performance.marks[name];
            performance.measures[name] = duration;
            return duration;
        }
        return 0;
    },

    getMeasures: () => {
        return performance.measures;
    }
};

// Image optimization
export const imageOptimization = {
    lazyLoad: (element) => {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        observer.unobserve(img);
                    }
                });
            });

            observer.observe(element);
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            element.src = element.dataset.src;
        }
    }
};

// Cache management
export const cache = {
    set: (key, value, ttl = 3600) => {
        const item = {
            value,
            expiry: Date.now() + (ttl * 1000)
        };
        localStorage.setItem(key, JSON.stringify(item));
    },

    get: (key) => {
        const item = localStorage.getItem(key);
        if (!item) return null;

        const parsedItem = JSON.parse(item);
        if (Date.now() > parsedItem.expiry) {
            localStorage.removeItem(key);
            return null;
        }

        return parsedItem.value;
    },

    remove: (key) => {
        localStorage.removeItem(key);
    },

    clear: () => {
        localStorage.clear();
    }
};

// API request caching
export const apiCache = {
    cache: new Map(),
    ttl: 5 * 60 * 1000, // 5 minutes

    set: (key, data) => {
        apiCache.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    },

    get: (key) => {
        const item = apiCache.cache.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > apiCache.ttl) {
            apiCache.cache.delete(key);
            return null;
        }

        return item.data;
    },

    clear: () => {
        apiCache.cache.clear();
    }
};

// Resource preloading
export const preload = {
    image: (src) => {
        const img = new Image();
        img.src = src;
    },

    script: (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    stylesheet: (href) => {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }
};

// Debounce utility
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle utility
export const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}; 