import matplotlib.pyplot as plt
import seaborn as sns
import json
import os
import glob
import pandas as pd
import numpy as np

class GraphGenerator:
    def __init__(self):
        self.data_dir = 'research_paper_assets/performance_data'
        self.graphs_dir = 'research_paper_assets/graphs'
        os.makedirs(self.graphs_dir, exist_ok=True)
        plt.style.use('seaborn')
        
    def load_latest_results(self):
        """Load the most recent load test results"""
        files = glob.glob(f'{self.data_dir}/load_test_results_*.json')
        if not files:
            raise FileNotFoundError("No load test results found")
            
        latest_file = max(files, key=os.path.getctime)
        with open(latest_file, 'r') as f:
            return json.load(f)
            
    def generate_response_time_distribution(self):
        """Generate response time distribution graph"""
        results = self.load_latest_results()
        
        plt.figure(figsize=(12, 6))
        for users, data in results.items():
            if isinstance(data, dict) and 'response_times' in data:
                sns.kdeplot(data=data['response_times'], 
                          label=f'{users} Users')
        
        plt.title('Response Time Distribution by Concurrent Users')
        plt.xlabel('Response Time (ms)')
        plt.ylabel('Density')
        plt.legend()
        plt.grid(True)
        
        filename = f'{self.graphs_dir}/response_time_distribution.png'
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        plt.close()
        
    def generate_load_test_summary(self):
        """Generate load test summary graphs"""
        results = self.load_latest_results()
        
        users = []
        avg_response_times = []
        success_rates = []
        cpu_usage = []
        memory_usage = []
        
        for user_count, data in results.items():
            if isinstance(data, dict) and 'summary' in data:
                users.append(int(user_count))
                summary = data['summary']
                avg_response_times.append(summary['avg_response_time'])
                success_rates.append(summary['success_rate'] * 100)
                cpu_usage.append(summary['avg_cpu_usage'])
                memory_usage.append(summary['avg_memory_usage'])
        
        # Create a 2x2 subplot
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
        
        # Response Time vs Users
        ax1.plot(users, avg_response_times, 'o-', linewidth=2)
        ax1.set_title('Average Response Time vs Concurrent Users')
        ax1.set_xlabel('Concurrent Users')
        ax1.set_ylabel('Response Time (ms)')
        ax1.grid(True)
        
        # Success Rate vs Users
        ax2.plot(users, success_rates, 'o-', linewidth=2, color='green')
        ax2.set_title('Success Rate vs Concurrent Users')
        ax2.set_xlabel('Concurrent Users')
        ax2.set_ylabel('Success Rate (%)')
        ax2.grid(True)
        
        # CPU Usage vs Users
        ax3.plot(users, cpu_usage, 'o-', linewidth=2, color='orange')
        ax3.set_title('CPU Usage vs Concurrent Users')
        ax3.set_xlabel('Concurrent Users')
        ax3.set_ylabel('CPU Usage (%)')
        ax3.grid(True)
        
        # Memory Usage vs Users
        ax4.plot(users, memory_usage, 'o-', linewidth=2, color='red')
        ax4.set_title('Memory Usage vs Concurrent Users')
        ax4.set_xlabel('Concurrent Users')
        ax4.set_ylabel('Memory Usage (MB)')
        ax4.grid(True)
        
        plt.tight_layout()
        filename = f'{self.graphs_dir}/load_test_summary.png'
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        plt.close()
        
    def generate_all_graphs(self):
        """Generate all performance graphs"""
        print("Generating response time distribution graph...")
        self.generate_response_time_distribution()
        
        print("Generating load test summary graphs...")
        self.generate_load_test_summary()
        
        print("All graphs generated successfully!")

if __name__ == '__main__':
    generator = GraphGenerator()
    generator.generate_all_graphs() 