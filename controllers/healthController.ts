import { Request, Response } from 'express';
import mongoose from 'mongoose';

export const healthCheck = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
};

export const readinessCheck = async (req: Request, res: Response) => {
  try {
    const connection = mongoose.connection;

    if (!connection) {
      throw new Error('MongoDB connection not initialized');
    }

    const dbState = connection.readyState;

    const dbStates: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const checks = {
      database: dbStates[dbState] || 'unknown',
    };

    const allHealthy = dbState === 1;

    res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      status: allHealthy ? 'ready' : 'not ready',
      checks,
      mongodb: {
        state: dbStates[dbState],
        host: connection.host || 'N/A',
        name: connection.name || 'N/A',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      status: 'not ready',
      error: err instanceof Error ? err.message : 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
};
