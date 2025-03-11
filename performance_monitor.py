import time
import statistics
import json
import os
from datetime import datetime

class PerformanceMonitor:
    def __init__(self):
        self.response_times = []
        self.translation_times = []
        self.voice_processing_times = []
        self.metrics_dir = 'research_paper_assets/performance_data'
        os.makedirs(self.metrics_dir, exist_ok=True)
        
    def record_response_time(self, operation, start_time):
        """Record response time for different operations"""
        duration = time.time() - start_time
        if operation == 'text_query':
            self.response_times.append(duration * 1000)  # Convert to ms
        elif operation == 'translation':
            self.translation_times.append(duration * 1000)
        elif operation == 'voice':
            self.voice_processing_times.append(duration * 1000)
            
    def get_metrics(self):
        """Calculate performance metrics"""
        metrics = {}
        for name, data in [
            ('text_query', self.response_times),
            ('translation', self.translation_times),
            ('voice', self.voice_processing_times)
        ]:
            if data:  # Only calculate if we have data
                metrics[name] = {
                    'avg': statistics.mean(data),
                    'p95': statistics.quantiles(data, n=20)[18] if len(data) >= 20 else max(data),
                    'max': max(data),
                    'std_dev': statistics.stdev(data) if len(data) > 1 else 0
                }
        return metrics
    
    def save_metrics(self):
        """Save metrics to file"""
        metrics = self.get_metrics()
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'{self.metrics_dir}/metrics_{timestamp}.json'
        
        with open(filename, 'w') as f:
            json.dump(metrics, f, indent=2)
        
        return filename

# Initialize global performance monitor
performance_monitor = PerformanceMonitor() 