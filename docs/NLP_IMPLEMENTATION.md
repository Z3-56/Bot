# Natural Language Processing Implementation

This document details the Natural Language Processing (NLP) implementation in the Educational Assistant Chatbot project. The implementation uses Compromise.js for low-dependency NLP capabilities with custom extensions for educational domain processing.

## Table of Contents
- [Overview](#overview)
- [Core Components](#core-components)
- [NLP Features](#nlp-features)
- [Performance Optimizations](#performance-optimizations)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)

## Overview

The NLP system is designed to process educational queries and conversations with:
- Multi-layer caching for performance
- Custom education domain vocabulary
- Entity recognition
- Sentiment analysis
- Topic extraction
- Context awareness

### Key Files
- `src/services/nlpProcessor.ts`: Main NLP implementation
- `src/services/cacheManager.ts`: Caching system
- `src/services/performanceMonitor.ts`: Performance tracking

## Theory of Operation

### 1. Natural Language Understanding Pipeline

The NLP system processes text through multiple sequential stages:

1. **Tokenization**
   - Splits text into individual tokens (words, punctuation)
   - Handles contractions and special characters
   - Preserves meaningful whitespace
   ```typescript
   // Example of tokenization
   "I'm studying calculus" → ["I", "'m", "studying", "calculus"]
   ```

2. **Part-of-Speech (POS) Tagging**
   - Assigns grammatical parts of speech to each token
   - Uses context-aware tagging for ambiguous words
   - Educational domain-specific tags
   ```typescript
   {
     "studying": "Verb",
     "calculus": "Noun",
     "homework": "Noun",
     "due": ["Adjective", "Verb"] // Context-dependent
   }
   ```

3. **Lexical Analysis**
   - Identifies word roots and lemmas
   - Handles educational terminology
   - Processes domain-specific abbreviations
   ```typescript
   "studying" → study (root)
   "calc" → calculus (expansion)
   "AI" → "Artificial Intelligence" (domain abbreviation)
   ```

### 2. Semantic Processing

The semantic layer builds understanding through:

1. **Entity Recognition System**
   - Pattern-based recognition
   - Statistical analysis
   - Context-aware disambiguation
   ```typescript
   const entityPatterns = {
     course: /\b(?:MATH|CS|PHYS)\s*\d{3}\b/,
     deadline: /\b(?:due|deadline)\s+(?:by|on|at)?\s+([A-Za-z0-9\s,]+)\b/
   };
   ```

2. **Intent Classification**
   - Rule-based patterns
   - Keyword analysis
   - Context consideration
   ```typescript
   const intentMap = {
     question: ["what", "how", "why", "when"],
     request: ["can", "could", "would"],
     command: ["show", "tell", "find", "explain"]
   };
   ```

3. **Sentiment Analysis Algorithm**
   ```typescript
   function calculateSentiment(tokens: string[]): number {
     return tokens.reduce((score, token) => {
       return score + (
         positiveWords.has(token) ? 1 :
         negativeWords.has(token) ? -1 :
         neutralWords.has(token) ? 0.1 :
         0
       );
     }, 0) / tokens.length;
   }
   ```

### 3. Context Management System

1. **Short-term Memory**
   - Maintains recent conversation state
   - Tracks active topics and entities
   - Resolution of pronouns and references
   ```typescript
   interface ConversationMemory {
     recentTopics: string[];
     activeEntities: Set<string>;
     lastIntent: string;
     timeContext: Date;
   }
   ```

2. **Long-term Memory**
   - Persistent user preferences
   - Learning patterns
   - Historical context
   ```typescript
   interface UserProfile {
     preferredSubjects: string[];
     commonQueries: Map<string, number>;
     learningStyle: string;
     difficultyLevel: number;
   }
   ```

### 4. Response Generation

1. **Template-based Responses**
   ```typescript
   const responseTemplates = {
     clarification: "Could you please clarify what you mean by {entity}?",
     confirmation: "I understand you want to {intent} about {topic}.",
     error: "I'm not sure about {topic}, but I can help with {alternatives}."
   };
   ```

2. **Dynamic Response Assembly**
   - Context-aware response selection
   - Personalization based on user profile
   - Educational level adaptation
   ```typescript
   function assembleResponse(
     intent: string,
     entities: string[],
     context: ConversationContext
   ): string {
     const template = selectTemplate(intent);
     const personalizedContent = adaptToUser(template, context.userProfile);
     return formatResponse(personalizedContent, entities);
   }
   ```

### 5. Performance Optimization Theory

1. **Caching Strategy**
   - Frequency-based caching
   - Temporal locality optimization
   - Cache invalidation patterns
   ```typescript
   interface CacheStrategy {
     frequency: Map<string, number>;
     recency: LRUCache<string, any>;
     ttl: Map<string, number>;
   }
   ```

2. **Processing Optimization**
   - Lazy evaluation of complex operations
   - Parallel processing where applicable
   - Memory-efficient data structures
   ```typescript
   interface ProcessingOptimization {
     batchSize: number;
     parallelThreads: number;
     memoryThreshold: number;
   }
   ```

## Core Components

### 1. NLP Processor Class
```typescript
export class NLPProcessor {
  private cache: SmartCache<NLPResult>;
  private customPatterns: { [key: string]: RegExp };
  
  // Methods for text processing
  async process(text: string): Promise<NLPResult>;
  private extractTopics(text: string): string[];
  private calculateSentiment(doc: any): number;
  private extractKeywords(doc: any): string[];
  private generateSummary(doc: any): string;
}
```

### 2. Plugin Extensions
```typescript
// Base extensions
nlp.extend(sentences);
nlp.extend(dates);

// Custom education vocabulary
nlp.extend({
  words: {
    course: 'Noun',
    semester: 'Noun',
    lecture: 'Noun',
    assignment: 'Noun',
    quiz: 'Noun',
    exam: 'Noun'
  }
});
```

## NLP Features

### 1. Entity Recognition
- **People**: Identifies names and personal references
- **Places**: Detects location mentions
- **Organizations**: Recognizes institutional names
- **Dates**: Processes temporal references
- **Educational Terms**: Custom recognition of domain-specific terms

```typescript
const entities = {
  names: doc.match('#Person').out('array'),
  places: doc.match('#Place').out('array'),
  organizations: doc.match('#Organization').out('array'),
  dates: doc.match('#Date').out('array'),
  topics: this.extractTopics(text)
};
```

### 2. Sentiment Analysis
Calculates sentiment scores based on:
- Positive terms
- Negative terms
- Normalized scoring (-1 to 1)

```typescript
private calculateSentiment(doc: any): number {
  const positive = doc.match('(good|great|excellent|amazing|wonderful|fantastic|helpful)').length;
  const negative = doc.match('(bad|poor|terrible|awful|unhelpful|confusing)').length;
  return (positive - negative) / (positive + negative) || 0;
}
```

### 3. Topic Extraction
Uses multiple strategies:
- Custom pattern matching
- Noun phrase identification
- Education-specific term detection

```typescript
private customPatterns = {
  course: /\b(?:course|class|subject)\s+(?:on|in|about)?\s+([A-Za-z\s]+)\b/i,
  grade: /\b(?:grade|level|year)\s+(\d+|[A-Za-z]+)\b/i,
  topic: /\b(?:topic|concept|subject)\s+(?:of|on|about)?\s+([A-Za-z\s]+)\b/i
};
```

### 4. Intent Detection
Identifies common educational intents:
- Task creation
- Reminder setting
- Advice seeking
- General queries

```typescript
if (doc.has('(create|add|make) #Noun')) intent = 'create_task';
if (doc.has('(remind|remember) me')) intent = 'set_reminder';
if (doc.has('(how|what) #Adverb? (do|about)')) intent = 'seek_advice';
```

### 5. Context Management
Maintains conversation context through:
- Topic tracking
- Entity memory
- Conversation history
- Temporal reference

```typescript
export interface ConversationContext {
  lastTopic?: string;
  mentionedEntities: string[];
  history: string[];
}
```

## Performance Optimizations

### 1. Multi-layer Caching
- **L1**: In-memory cache (5 minutes TTL)
- **L2**: Redis cache (1 hour TTL)
- **L3**: Disk cache (24 hours TTL)

### 2. Processing Optimizations
- Efficient pattern matching
- Set-based deduplication
- Lazy loading of plugins

## Usage Examples

### Basic Text Processing
```typescript
const processor = new NLPProcessor();
const result = await processor.process("What's the homework for tomorrow's math class?");
```

### Context-Aware Processing
```typescript
const context: ConversationContext = {
  lastTopic: "mathematics",
  mentionedEntities: ["calculus", "homework"],
  history: ["Can you explain derivatives?"]
};

const analysis = processInput("What's next?", context);
```

### Sentiment Analysis
```typescript
const result = await processor.process("This course is really helpful and well-structured!");
console.log(result.sentiment); // Outputs: 0.75 (positive)
```

## API Reference

### NLPResult Interface
```typescript
export interface NLPResult {
  entities: {
    names: string[];
    places: string[];
    organizations: string[];
    dates: string[];
    topics: string[];
  };
  sentiment: number;
  keywords: string[];
  summary: string;
}
```

### SemanticAnalysis Interface
```typescript
export interface SemanticAnalysis {
  intent: string;
  urgency: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  entities: string[];
  temporalReference?: 'past' | 'present' | 'future';
}
```

## Best Practices

1. **Cache Management**
   - Regularly clean expired cache entries
   - Monitor cache hit rates
   - Adjust TTLs based on usage patterns

2. **Error Handling**
   - Graceful fallback for plugin failures
   - Proper error logging
   - Cache error recovery

3. **Performance Monitoring**
   - Track processing times
   - Monitor memory usage
   - Log cache performance

## Contributing

When extending the NLP capabilities:
1. Add new patterns to `customPatterns` for domain-specific terms
2. Extend the vocabulary in the education plugin
3. Update type definitions for new features
4. Add tests for new functionality

## Future Improvements

1. **Enhanced Entity Recognition**
   - Add more educational entity types
   - Improve accuracy of existing recognition

2. **Advanced Context Management**
   - Long-term context storage
   - Cross-session context preservation

3. **Performance Optimizations**
   - WebAssembly integration
   - Worker thread processing
   - Enhanced caching strategies 