import json
import os
import numpy as np
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
from nltk.translate.meteor_score import meteor_score
import nltk

class TranslationEvaluator:
    def __init__(self):
        self.results_dir = 'research_paper_assets/performance_data'
        os.makedirs(self.results_dir, exist_ok=True)
        
        # Download required NLTK data
        try:
            nltk.download('wordnet')
            nltk.download('omw-1.4')
        except Exception as e:
            print(f"Warning: Could not download NLTK data: {str(e)}")
    
    def evaluate_translations(self, translations):
        """
        Evaluate translation quality using BLEU and METEOR scores
        translations: list of tuples (source, translation, reference)
        """
        results = {
            'bleu_scores': [],
            'meteor_scores': [],
            'examples': []
        }
        
        smooth = SmoothingFunction().method1
        
        for source, translation, reference in translations:
            # Calculate BLEU score
            reference_tokens = [reference.split()]
            translation_tokens = translation.split()
            bleu = sentence_bleu(reference_tokens, translation_tokens, 
                               smoothing_function=smooth)
            
            # Calculate METEOR score
            meteor = meteor_score([reference.split()], translation.split())
            
            results['bleu_scores'].append(bleu)
            results['meteor_scores'].append(meteor)
            results['examples'].append({
                'source': source,
                'translation': translation,
                'reference': reference,
                'bleu': bleu,
                'meteor': meteor
            })
        
        # Calculate summary statistics
        results['summary'] = {
            'avg_bleu': np.mean(results['bleu_scores']),
            'avg_meteor': np.mean(results['meteor_scores']),
            'std_bleu': np.std(results['bleu_scores']),
            'std_meteor': np.std(results['meteor_scores'])
        }
        
        return results
    
    def save_results(self, results):
        """Save translation evaluation results"""
        filename = f'{self.results_dir}/translation_quality.json'
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
            
        print(f"Results saved to {filename}")
        return filename

def main():
    # Example translations for testing
    test_translations = [
        ("How are you?", "कैसे हो आप?", "आप कैसे हैं?"),
        ("What is your name?", "आपका नाम क्या है?", "तुम्हारा नाम क्या है?"),
        ("Good morning", "सुप्रभात", "शुभ प्रभात"),
        ("Thank you very much", "बहुत बहुत धन्यवाद", "बहुत धन्यवाद"),
        ("Please help me", "कृपया मेरी मदद करें", "कृपया मेरी सहायता करें")
    ]
    
    evaluator = TranslationEvaluator()
    results = evaluator.evaluate_translations(test_translations)
    evaluator.save_results(results)
    
    print("\nTranslation Quality Summary:")
    print(f"Average BLEU Score: {results['summary']['avg_bleu']:.4f}")
    print(f"Average METEOR Score: {results['summary']['avg_meteor']:.4f}")

if __name__ == '__main__':
    main() 