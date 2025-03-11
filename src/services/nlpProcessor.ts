import nlp from 'compromise';
import sentences from 'compromise-sentences';
import dates from 'compromise-dates';
import { SmartCache } from './cacheManager';

// Add type declaration for compromise-dates
declare module 'compromise-dates' {
  interface NlpExtension {
    dates(): any;
  }
}

// Add type declaration for compromise plugin
declare module 'compromise' {
  interface Plugin {
    words?: Record<string, string>;
  }
}

nlp.extend(sentences);
nlp.extend(dates);

export interface ConversationContext {
  lastTopic?: string;
  mentionedEntities: string[];
  history: string[];
}

export interface SemanticAnalysis {
  intent: string;
  urgency: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  entities: string[];
  temporalReference?: 'past' | 'present' | 'future';
}

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

export class NLPProcessor {
  private cache: SmartCache<NLPResult>;
  private customPatterns: { [key: string]: RegExp };

  constructor() {
    this.cache = new SmartCache<NLPResult>({
      memoryTTL: 300000, // 5 minutes
      redisTTL: 3600000, // 1 hour
      diskTTL: 86400000 // 24 hours
    });

    // Initialize custom patterns for education domain
    this.customPatterns = {
      course: /\b(?:course|class|subject)\s+(?:on|in|about)?\s+([A-Za-z\s]+)\b/i,
      grade: /\b(?:grade|level|year)\s+(\d+|[A-Za-z]+)\b/i,
      topic: /\b(?:topic|concept|subject)\s+(?:of|on|about)?\s+([A-Za-z\s]+)\b/i
    };

    // Extend Compromise with custom education-related terms
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
  }

  async process(text: string): Promise<NLPResult> {
    // Check cache first
    const cached = await this.cache.get(text);
    if (cached) return cached;

    // Process text with Compromise
    const doc = nlp(text);

    // Extract entities
    const entities = {
      names: doc.match('#Person').out('array'),
      places: doc.match('#Place').out('array'),
      organizations: doc.match('#Organization').out('array'),
      dates: doc.match('#Date').out('array'),
      topics: this.extractTopics(text)
    };

    // Calculate sentiment
    const sentiment = this.calculateSentiment(doc);

    // Extract keywords
    const keywords = this.extractKeywords(doc);

    // Generate summary
    const summary = this.generateSummary(doc);

    const result: NLPResult = {
      entities,
      sentiment,
      keywords,
      summary
    };

    // Cache the result
    await this.cache.set(text, result);

    return result;
  }

  private extractTopics(text: string): string[] {
    const topics = new Set<string>();

    // Use custom patterns
    for (const pattern of Object.values(this.customPatterns)) {
      const matches = text.match(pattern);
      if (matches && matches[1]) {
        topics.add(matches[1].trim());
      }
    }

    // Use Compromise for additional topic extraction
    const doc = nlp(text);
    const nounPhrases = doc.match('#Noun+').out('array');
    nounPhrases.forEach((phrase: string) => {
      if (phrase.length > 3) { // Filter out short phrases
        topics.add(phrase);
      }
    });

    return Array.from(topics);
  }

  private calculateSentiment(doc: any): number {
    const positive = doc.match('(good|great|excellent|amazing|wonderful|fantastic|helpful)').length;
    const negative = doc.match('(bad|poor|terrible|awful|unhelpful|confusing)').length;
    
    // Calculate normalized sentiment score between -1 and 1
    const total = positive + negative;
    if (total === 0) return 0;
    return (positive - negative) / total;
  }

  private extractKeywords(doc: any): string[] {
    const keywords = new Set<string>();

    // Extract nouns and verbs
    doc.match('#Noun').forEach((m: any) => keywords.add(m.text()));
    doc.match('#Verb').forEach((m: any) => keywords.add(m.text()));

    // Extract educational terms
    doc.match('(course|class|subject|topic|concept|assignment|exam|quiz)').forEach((m: any) => keywords.add(m.text()));

    // Filter and clean keywords
    return Array.from(keywords)
      .filter(keyword => keyword.length > 2)
      .map(keyword => keyword.toLowerCase());
  }

  private generateSummary(doc: any): string {
    // Extract main sentences
    const sentences = doc.sentences().out('array');
    if (sentences.length <= 1) return sentences[0] || '';

    // Select key sentences based on importance
    const importantSentences = sentences.filter((sentence: string) => {
      const sentenceDoc = nlp(sentence);
      return (
        sentenceDoc.match('#Noun').length > 0 && // Has nouns
        sentenceDoc.match('#Verb').length > 0 && // Has verbs
        sentence.length > 10 // Not too short
      );
    });

    // Return first 2 important sentences or original text if none found
    return importantSentences.slice(0, 2).join(' ') || sentences[0];
  }
}

export function processInput(text: string, context: ConversationContext): SemanticAnalysis {
  const doc = nlp(text);
  
  // Add context usage example
  const contextKeywords = context.history.length > 0 ? 
    ` Context keywords: ${context.mentionedEntities.join(', ')}` : '';
  
  // Entity extraction
  const entities = [
    ...doc.people().out('array'),
    ...doc.organizations().out('array'),
    ...doc.places().out('array'),
    ...(doc as any).dates().out('array')
  ];

  // Intent detection
  let intent = 'general';
  if (doc.has('(create|add|make) #Noun')) intent = 'create_task';
  if (doc.has('(remind|remember) me')) intent = 'set_reminder';
  if (doc.has('(how|what) #Adverb? (do|about)')) intent = 'seek_advice';

  // Sentiment analysis
  const sentiment = doc.sentences().json()[0].sentiment;
  const sentimentScore = sentiment.score > 0 ? 'positive' : sentiment.score < 0 ? 'negative' : 'neutral';

  // Temporal analysis
  const tense = doc.sentences().terms(0).tag('PastTense') ? 'past' :
    doc.sentences().terms(0).tag('FutureTense') ? 'future' : 'present';

  // Urgency detection
  const urgencyTerms = doc.match('#Adverb (urgent|important|critical)').length;
  const urgencyExclamation = (text.match(/!/g) || []).length;
  const urgency = Math.min(urgencyTerms + urgencyExclamation, 3);

  return {
    intent,
    urgency: urgency + (contextKeywords ? 1 : 0),
    sentiment: sentimentScore,
    entities: [...new Set(entities)],
    temporalReference: tense
  };
}

export function updateContext(context: ConversationContext, text: string, analysis: SemanticAnalysis): ConversationContext {
  return {
    lastTopic: analysis.entities[0] || context.lastTopic,
    mentionedEntities: [...new Set([...context.mentionedEntities, ...analysis.entities])],
    history: [...context.history.slice(-4), text],
  };
} 