import { Request, Response, NextFunction } from 'express';

interface MetricsData {
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  timestamp: string;
}

export const getMetrics = (): MetricsData => {
  const memoryUsage = process.memoryUsage();

  return {
    uptime: process.uptime(),
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
    },
    timestamp: new Date().toISOString(),
  };
};

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const metrics = getMetrics();

    if (process.env.NODE_ENV === 'production') {
      console.log(
        JSON.stringify({
          type: 'request_metrics',
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          memory: metrics.memory,
          timestamp: metrics.timestamp,
        })
      );
    }
  });

  next();
};
