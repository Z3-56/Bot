import asyncio
import aiohttp
import psutil
import json
import os
import time
from datetime import datetime

class LoadTester:
    def __init__(self):
        self.results_dir = 'research_paper_assets/performance_data'
        os.makedirs(self.results_dir, exist_ok=True)
        
    async def load_test(self, concurrent_users, duration_seconds):
        """Run load test with specified number of concurrent users"""
        start_time = time.time()
        results = {
            'response_times': [],
            'cpu_usage': [],
            'memory_usage': [],
            'success_count': 0,
            'error_count': 0,
            'concurrent_users': concurrent_users,
            'duration_seconds': duration_seconds
        }
        
        async def single_user_test():
            async with aiohttp.ClientSession() as session:
                while time.time() - start_time < duration_seconds:
                    try:
                        req_start = time.time()
                        async with session.post('http://localhost:5000/api/chat', 
                            json={'message': 'Tell me about IIT Bombay'}) as response:
                            await response.json()
                            results['response_times'].append((time.time() - req_start) * 1000)
                            results['success_count'] += 1
                    except Exception as e:
                        results['error_count'] += 1
                        print(f"Error in user test: {str(e)}")
                    
                    results['cpu_usage'].append(psutil.cpu_percent())
                    results['memory_usage'].append(psutil.Process().memory_info().rss / 1024 / 1024)
                    await asyncio.sleep(1)
        
        print(f"Starting load test with {concurrent_users} concurrent users for {duration_seconds} seconds...")
        users = [single_user_test() for _ in range(concurrent_users)]
        await asyncio.gather(*users)
        
        # Calculate summary statistics
        results['summary'] = {
            'avg_response_time': sum(results['response_times']) / len(results['response_times']) if results['response_times'] else 0,
            'avg_cpu_usage': sum(results['cpu_usage']) / len(results['cpu_usage']) if results['cpu_usage'] else 0,
            'avg_memory_usage': sum(results['memory_usage']) / len(results['memory_usage']) if results['memory_usage'] else 0,
            'success_rate': results['success_count'] / (results['success_count'] + results['error_count']) if (results['success_count'] + results['error_count']) > 0 else 0
        }
        
        return results
    
    async def run_load_tests(self):
        """Run load tests with different numbers of concurrent users"""
        load_levels = [100, 500, 1000, 2500, 5000]
        all_results = {}
        
        for users in load_levels:
            print(f"\nTesting with {users} concurrent users...")
            results = await self.load_test(users, duration_seconds=300)
            all_results[users] = results
            
            # Save intermediate results
            self.save_results(all_results)
            
            # Brief cooldown between tests
            await asyncio.sleep(30)
        
        return all_results
    
    def save_results(self, results):
        """Save load test results to file"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'{self.results_dir}/load_test_results_{timestamp}.json'
        
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"Results saved to {filename}")
        return filename

async def main():
    tester = LoadTester()
    await tester.run_load_tests()

if __name__ == '__main__':
    asyncio.run(main()) 