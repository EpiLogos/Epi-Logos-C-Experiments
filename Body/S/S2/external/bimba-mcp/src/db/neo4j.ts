/**
 * Neo4j Connection Manager
 *
 * Handles connection pooling, automatic reconnection with exponential backoff,
 * health checks, and graceful shutdown for Neo4j database access.
 */

import neo4j, {
  Driver,
  Session,
  auth as neo4jAuth,
  session as sessionConstants,
} from 'neo4j-driver';

type SessionMode = typeof sessionConstants.READ | typeof sessionConstants.WRITE;

// =============================================================================
// Configuration Types
// =============================================================================

export interface Neo4jConfig {
  uri: string;
  user: string;
  password: string;
  maxConnectionPoolSize: number;
  connectionAcquisitionTimeout: number;
  connectionTimeout: number;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  multiplier: number;
}

export interface ConnectionHealth {
  isHealthy: boolean;
  latencyMs: number | null;
  serverVersion: string | null;
  lastError: string | null;
  timestamp: string;
}

// =============================================================================
// Default Configuration
// =============================================================================

const DEFAULT_CONFIG: Neo4jConfig = {
  uri: process.env['NEO4J_URI'] ?? 'bolt://localhost:7687',
  user: process.env['NEO4J_USER'] ?? 'neo4j',
  password: process.env['NEO4J_PASSWORD'] ?? 'neo4j',
  maxConnectionPoolSize: parseInt(process.env['NEO4J_POOL_SIZE'] ?? '50', 10),
  connectionAcquisitionTimeout: 30000,
  connectionTimeout: 10000,
};

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  initialDelayMs: 100,
  maxDelayMs: 30000,
  multiplier: 2,
};

// =============================================================================
// Neo4j Connection Manager
// =============================================================================

export class Neo4jConnectionManager {
  private driver: Driver | null = null;
  private config: Neo4jConfig;
  private retryConfig: RetryConfig;
  private isShuttingDown = false;
  private activeSessions = new Set<Session>();
  private connectionAttempts = 0;
  private lastHealthCheck: ConnectionHealth | null = null;

  constructor(config?: Partial<Neo4jConfig>, retryConfig?: Partial<RetryConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  // ---------------------------------------------------------------------------
  // Connection Management
  // ---------------------------------------------------------------------------

  /**
   * Initialize the connection to Neo4j with automatic retry on failure
   */
  async connect(): Promise<void> {
    if (this.driver) {
      return;
    }

    await this.connectWithRetry();
  }

  private async connectWithRetry(): Promise<void> {
    let lastError: Error | null = null;
    let delay = this.retryConfig.initialDelayMs;

    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      if (this.isShuttingDown) {
        throw new Error('Connection manager is shutting down');
      }

      try {
        this.connectionAttempts = attempt;
        await this.createDriver();
        await this.verifyConnectivity();
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.retryConfig.maxRetries) {
          await this.sleep(delay);
          delay = Math.min(delay * this.retryConfig.multiplier, this.retryConfig.maxDelayMs);
        }
      }
    }

    throw new Error(
      `Failed to connect to Neo4j after ${this.retryConfig.maxRetries} attempts: ${lastError?.message}`
    );
  }

  private async createDriver(): Promise<void> {
    this.driver = neo4j.driver(
      this.config.uri,
      neo4jAuth.basic(this.config.user, this.config.password),
      {
        maxConnectionPoolSize: this.config.maxConnectionPoolSize,
        connectionAcquisitionTimeout: this.config.connectionAcquisitionTimeout,
        connectionTimeout: this.config.connectionTimeout,
      }
    );
  }

  private async verifyConnectivity(): Promise<void> {
    if (!this.driver) {
      throw new Error('Driver not initialized');
    }
    await this.driver.verifyConnectivity();
  }

  // ---------------------------------------------------------------------------
  // Session Management
  // ---------------------------------------------------------------------------

  /**
   * Get a read session from the connection pool
   */
  getReadSession(database?: string): Session {
    return this.getSession(sessionConstants.READ, database);
  }

  /**
   * Get a write session from the connection pool
   */
  getWriteSession(database?: string): Session {
    return this.getSession(sessionConstants.WRITE, database);
  }

  private getSession(mode: SessionMode, database?: string): Session {
    if (!this.driver) {
      throw new Error('Not connected to Neo4j. Call connect() first.');
    }

    if (this.isShuttingDown) {
      throw new Error('Connection manager is shutting down');
    }

    const session = this.driver.session({
      defaultAccessMode: mode,
      database: database ?? process.env['NEO4J_DATABASE'] ?? 'neo4j',
    });

    this.activeSessions.add(session);
    return session;
  }

  /**
   * Release a session back to the pool
   */
  async releaseSession(session: Session): Promise<void> {
    this.activeSessions.delete(session);
    await session.close();
  }

  /**
   * Execute a query with automatic session management
   */
  async executeRead<T>(
    query: string,
    params?: Record<string, unknown>,
    database?: string
  ): Promise<T[]> {
    const session = this.getReadSession(database);
    try {
      const result = await session.run(query, params);
      return result.records.map((record) => record.toObject() as T);
    } finally {
      await this.releaseSession(session);
    }
  }

  /**
   * Execute a write query with automatic session management
   */
  async executeWrite<T>(
    query: string,
    params?: Record<string, unknown>,
    database?: string
  ): Promise<T[]> {
    const session = this.getWriteSession(database);
    try {
      const result = await session.run(query, params);
      return result.records.map((record) => record.toObject() as T);
    } finally {
      await this.releaseSession(session);
    }
  }

  // ---------------------------------------------------------------------------
  // Health Check
  // ---------------------------------------------------------------------------

  /**
   * Check the health of the Neo4j connection
   */
  async healthCheck(): Promise<ConnectionHealth> {
    const startTime = Date.now();
    const health: ConnectionHealth = {
      isHealthy: false,
      latencyMs: null,
      serverVersion: null,
      lastError: null,
      timestamp: new Date().toISOString(),
    };

    if (!this.driver) {
      health.lastError = 'Not connected';
      this.lastHealthCheck = health;
      return health;
    }

    try {
      const session = this.driver.session();
      try {
        const result = await session.run('RETURN 1 as ping');
        const latency = Date.now() - startTime;

        const serverInfo = await this.driver.getServerInfo();

        health.isHealthy = result.records.length === 1;
        health.latencyMs = latency;
        health.serverVersion = serverInfo.agent ?? null;
      } finally {
        await session.close();
      }
    } catch (error) {
      health.lastError = error instanceof Error ? error.message : String(error);
    }

    this.lastHealthCheck = health;
    return health;
  }

  /**
   * Get the last cached health check result
   */
  getLastHealthCheck(): ConnectionHealth | null {
    return this.lastHealthCheck;
  }

  // ---------------------------------------------------------------------------
  // Graceful Shutdown
  // ---------------------------------------------------------------------------

  /**
   * Gracefully shutdown the connection manager, draining active sessions
   */
  async shutdown(timeoutMs = 30000): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;

    // Wait for active sessions to drain with timeout
    const drainStart = Date.now();
    while (this.activeSessions.size > 0) {
      if (Date.now() - drainStart > timeoutMs) {
        // Force close remaining sessions after timeout
        const forceClosePromises = Array.from(this.activeSessions).map(
          async (session) => {
            try {
              await session.close();
            } catch {
              // Ignore errors during force close
            }
          }
        );
        await Promise.all(forceClosePromises);
        break;
      }
      await this.sleep(100);
    }

    this.activeSessions.clear();

    // Close the driver
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Status
  // ---------------------------------------------------------------------------

  /**
   * Check if the connection manager is connected
   */
  isConnected(): boolean {
    return this.driver !== null && !this.isShuttingDown;
  }

  /**
   * Get the number of active sessions
   */
  getActiveSessionCount(): number {
    return this.activeSessions.size;
  }

  /**
   * Get the number of connection attempts made during the last connect()
   */
  getConnectionAttempts(): number {
    return this.connectionAttempts;
  }

  /**
   * Get the current configuration (without password)
   */
  getConfig(): Omit<Neo4jConfig, 'password'> {
    const { password: _, ...safeConfig } = this.config;
    return safeConfig;
  }

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let instance: Neo4jConnectionManager | null = null;

/**
 * Get the singleton instance of Neo4jConnectionManager
 */
export function getNeo4jConnectionManager(
  config?: Partial<Neo4jConfig>,
  retryConfig?: Partial<RetryConfig>
): Neo4jConnectionManager {
  if (!instance) {
    instance = new Neo4jConnectionManager(config, retryConfig);
  }
  return instance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetNeo4jConnectionManager(): void {
  if (instance) {
    void instance.shutdown();
    instance = null;
  }
}
