import type { SemanticAnalysis } from './nlpProcessor';
import { fetchCollegeData } from './collegeData';
import { scrapeWebsite } from './webScraper';

type EntityNode = {
  id: string;
  type: 'person' | 'place' | 'event';
  relationships: string[];
};

export interface ExternalResource {
  source: 'college_api' | 'geeksforgeeks' | 'college_website';
  data: any;
  lastUpdated: Date;
}

export class KnowledgeGraph {
  private nodes: Map<string, EntityNode>;
  private contextWeights: Map<string, number>;
  private externalResources: Map<string, ExternalResource>;

  constructor() {
    this.nodes = new Map();
    this.contextWeights = new Map();
    this.externalResources = new Map();
  }

  updateWithAnalysis(analysis: SemanticAnalysis): void {
    analysis.entities.forEach((entity: string) => {
      this.contextWeights.set(entity, (this.contextWeights.get(entity) || 0) + 1);
    });
  }

  getRelevantContext(): string[] {
    return Array.from(this.contextWeights.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([entity]) => entity);
  }

  // Add node management (optional)
  addNode(node: EntityNode): void {
    this.nodes.set(node.id, node);
  }

  async updateExternalData(entity: string) {
    const apiData = await fetchCollegeData(entity);
    this.externalResources.set(`${entity}_api`, {
      source: 'college_api',
      data: apiData,
      lastUpdated: new Date()
    });
    
    const gfData = await scrapeWebsite(`https://www.geeksforgeeks.org/search/?q=${entity}`);
    this.externalResources.set(`${entity}_gf`, {
      source: 'geeksforgeeks',
      data: gfData,
      lastUpdated: new Date()
    });
  }

  getExternalResources(entity: string): ExternalResource[] {
    return Array.from(this.externalResources.entries())
      .filter(([key]) => key.startsWith(`${entity}_`))
      .map(([, resource]) => resource);
  }
} 