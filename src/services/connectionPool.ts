import { EventEmitter } from 'events';

export interface PoolConfig {
  min: number;
  max: number;
  acquireTimeout: number;
  idleTimeout: number;
  createTimeout: number;
}

export interface Connection {
  id: string;
  lastUsed: number;
  isIdle: boolean;
  client: any; // Generic client type
}

export class ConnectionPool extends EventEmitter {
  private connections: Connection[];
  private waiting: Array<{
    resolve: (connection: Connection) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>;
  private config: Required<PoolConfig>;
  private maintenanceInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<PoolConfig> = {}) {
    super();
    this.connections = [];
    this.waiting = [];
    this.config = {
      min: config.min || 2,
      max: config.max || 10,
      acquireTimeout: config.acquireTimeout || 30000,
      idleTimeout: config.idleTimeout || 30000,
      createTimeout: config.createTimeout || 5000
    };
  }

  async initialize(): Promise<void> {
    // Create minimum connections
    const initialConnections = Array(this.config.min)
      .fill(0)
      .map(() => this.createConnection());

    await Promise.all(initialConnections);

    // Start maintenance interval
    this.maintenanceInterval = setInterval(() => this.maintenance(), 5000) as unknown as NodeJS.Timeout;
  }

  private async createConnection(): Promise<Connection> {
    const id = Math.random().toString(36).substring(7);
    
    // Simulated connection creation - replace with actual DB client
    const client = {
      connect: async () => {
        // Implement actual connection logic
      },
      query: async (sql: string, params: any[]) => {
        // Implement actual query logic
      },
      disconnect: async () => {
        // Implement actual disconnect logic
      }
    };

    const connection: Connection = {
      id,
      lastUsed: Date.now(),
      isIdle: true,
      client
    };

    this.connections.push(connection);
    this.emit('connection:created', { id });

    return connection;
  }

  async acquire(): Promise<Connection> {
    // Check for available connection
    const connection = this.connections.find(c => c.isIdle);
    if (connection) {
      connection.isIdle = false;
      connection.lastUsed = Date.now();
      return connection;
    }

    // Create new connection if possible
    if (this.connections.length < this.config.max) {
      const newConnection = await this.createConnection();
      newConnection.isIdle = false;
      return newConnection;
    }

    // Wait for available connection
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.waiting.findIndex(w => w.timeout === timeout);
        if (index !== -1) {
          this.waiting.splice(index, 1);
          reject(new Error('Connection acquisition timeout'));
        }
      }, this.config.acquireTimeout);

      this.waiting.push({ resolve, reject, timeout });
    });
  }

  release(connection: Connection): void {
    const index = this.connections.findIndex(c => c.id === connection.id);
    if (index === -1) return;

    connection.isIdle = true;
    connection.lastUsed = Date.now();

    // Check waiting queue
    if (this.waiting.length > 0) {
      const { resolve, timeout } = this.waiting.shift()!;
      clearTimeout(timeout);
      connection.isIdle = false;
      resolve(connection);
    }
  }

  private async maintenance(): Promise<void> {
    const now = Date.now();

    // Remove idle connections above minimum
    const idleConnections = this.connections.filter(
      c => c.isIdle && now - c.lastUsed > this.config.idleTimeout
    );

    if (this.connections.length - idleConnections.length >= this.config.min) {
      for (const connection of idleConnections) {
        await this.removeConnection(connection);
      }
    }
  }

  private async removeConnection(connection: Connection): Promise<void> {
    const index = this.connections.findIndex(c => c.id === connection.id);
    if (index === -1) return;

    try {
      await connection.client.disconnect();
      this.connections.splice(index, 1);
      this.emit('connection:removed', { id: connection.id });
    } catch (error) {
      this.emit('error', error);
    }
  }

  async shutdown(): Promise<void> {
    // Clear maintenance interval
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
      this.maintenanceInterval = null;
    }

    // Close all connections
    await Promise.all(
      this.connections.map(connection => this.removeConnection(connection))
    );

    // Reject any waiting requests
    for (const { reject, timeout } of this.waiting) {
      clearTimeout(timeout);
      reject(new Error('Pool is shutting down'));
    }
    this.waiting.length = 0;
  }

  getStats(): {
    total: number;
    active: number;
    idle: number;
    waiting: number;
  } {
    return {
      total: this.connections.length,
      active: this.connections.filter(c => !c.isIdle).length,
      idle: this.connections.filter(c => c.isIdle).length,
      waiting: this.waiting.length
    };
  }
} 