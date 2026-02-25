import { Request, Response } from 'express';
import { LeadService } from '../../application/services/LeadService';

const leadService = new LeadService();

export const create = async (req: Request, res: Response): Promise<void> => {
  const result = await leadService.create(req.body);

  if (!result.success) {
    const statusCode = result.error?.code === 'VALIDATION_ERROR' ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      error: result.error,
    });
    return;
  }

  res.status(201).json({
    success: true,
    data: result.data,
    message: 'Lead created successfully',
  });
};

export const read = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const result = await leadService.findById(id);

  if (!result.success) {
    const statusCode = result.error?.code === 'NOT_FOUND' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: result.error,
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: result.data,
    message: 'Lead found',
  });
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.items as string) || 10;
  const sort = req.query.sort as string;

  const result = await leadService.findAll(page, limit, sort);

  if (!result.success) {
    res.status(500).json({
      success: false,
      error: result.error,
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: result.data?.data || [],
    pagination: result.data?.pagination,
    message: result.data?.data?.length ? 'Leads found' : 'No leads found',
  });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const result = await leadService.update(id, req.body);

  if (!result.success) {
    const statusCode =
      result.error?.code === 'NOT_FOUND'
        ? 404
        : result.error?.code === 'VALIDATION_ERROR'
          ? 400
          : 500;
    res.status(statusCode).json({
      success: false,
      error: result.error,
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: result.data,
    message: 'Lead updated successfully',
  });
};

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const result = await leadService.delete(id);

  if (!result.success) {
    const statusCode = result.error?.code === 'NOT_FOUND' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: result.error,
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: result.data,
    message: 'Lead deleted successfully',
  });
};

export const search = async (req: Request, res: Response): Promise<void> => {
  const query = req.query.q as string;

  if (!query || query.trim() === '') {
    res.status(200).json({
      success: true,
      data: [],
      message: 'Query is empty',
    });
    return;
  }

  const fieldsParam = req.query.fields as string;
  const fields = fieldsParam ? fieldsParam.split(',') : ['client', 'phone', 'email'];
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await leadService.search(query, fields, limit);

  if (!result.success) {
    res.status(500).json({
      success: false,
      error: result.error,
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: result.data || [],
    message: result.data?.length ? 'Leads found' : 'No leads match search',
  });
};
