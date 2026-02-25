import { Request, Response } from 'express';
import { ClientService } from '../../application/services/ClientService';

export class ClientController {
  private service: ClientService;

  constructor() {
    this.service = new ClientService();
  }

  async create(req: Request, res: Response) {
    const result = await this.service.create(req.body);

    if (!result.success) {
      const statusCode = result.error?.code === 'VALIDATION_ERROR' ? 400 : 500;
      return res.status(statusCode).json({ success: false, error: result.error });
    }

    return res.status(201).json({ success: true, data: result.data });
  }

  async read(req: Request, res: Response) {
    const id = String(req.params.id);
    const result = await this.service.findById(id);

    if (!result.success) {
      const statusCode = result.error?.code === 'NOT_FOUND' ? 404 : 500;
      return res.status(statusCode).json({ success: false, error: result.error });
    }

    return res.status(200).json({ success: true, data: result.data });
  }

  async list(req: Request, res: Response) {
    const page = parseInt(String(req.query.page || req.query.items || 1) as string) || 1;
    const limit = parseInt(String(req.query.limit || req.query.items || 10) as string) || 10;
    const sort = String(req.query.sort || '') as string;

    const result = await this.service.findAll(page, limit, sort);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    return res.status(200).json({
      success: true,
      data: result.data?.data || [],
      pagination: result.data?.pagination,
    });
  }

  async update(req: Request, res: Response) {
    const id = String(req.params.id);
    const result = await this.service.update(id, req.body);

    if (!result.success) {
      const statusCode =
        result.error?.code === 'NOT_FOUND'
          ? 404
          : result.error?.code === 'VALIDATION_ERROR'
            ? 400
            : 500;
      return res.status(statusCode).json({ success: false, error: result.error });
    }

    return res.status(200).json({ success: true, data: result.data });
  }

  async delete(req: Request, res: Response) {
    const id = String(req.params.id);
    const result = await this.service.delete(id);

    if (!result.success) {
      const statusCode = result.error?.code === 'NOT_FOUND' ? 404 : 500;
      return res.status(statusCode).json({ success: false, error: result.error });
    }

    return res.status(200).json({ success: true, data: result.data });
  }

  async search(req: Request, res: Response) {
    const query = req.query.q as string;
    const fieldsParam = req.query.fields as string;
    const fields = fieldsParam ? fieldsParam.split(',') : undefined;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.service.search(query, fields, limit);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    return res.status(200).json({ success: true, data: result.data || [] });
  }
}

export default new ClientController();
