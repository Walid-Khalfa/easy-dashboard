import { z } from 'zod';

export interface IProduct {
  _id?: string;
  enabled: boolean;
  productName: string;
  description?: string;
  price?: number;
  status: string;
  removed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const createProductSchema = z.object({
  body: z.object({
    productName: z.string().min(1, 'Product name is required'),
    description: z.string().optional(),
    price: z.number().min(0).optional(),
    status: z.string().default('available'),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    productName: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.number().min(0).optional(),
    status: z.string().optional(),
    enabled: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});

export const productIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});

export type CreateProductDTO = z.infer<typeof createProductSchema>['body'];
export type UpdateProductDTO = z.infer<typeof updateProductSchema>['body'];
