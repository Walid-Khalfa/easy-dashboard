import { z } from 'zod';

export interface IClient {
  _id?: string;
  removed: boolean;
  enabled: boolean;
  company: string;
  name: string;
  surname: string;
  bankAccount?: string;
  companyRegNumber?: string;
  companyTaxNumber?: string;
  companyTaxID?: string;
  customField: { fieldName: string; fieldValue: string }[];
  address?: string;
  country?: string;
  phone: string;
  email?: string;
  website?: string;
  created: Date;
  updatedAt?: Date;
}

export const createClientSchema = z.object({
  body: z.object({
    company: z.string().min(1, 'Company is required'),
    name: z.string().min(1, 'Name is required'),
    surname: z.string().min(1, 'Surname is required'),
    bankAccount: z.string().optional(),
    companyRegNumber: z.string().optional(),
    companyTaxNumber: z.string().optional(),
    companyTaxID: z.string().optional(),
    customField: z
      .array(
        z.object({
          fieldName: z.string(),
          fieldValue: z.string(),
        })
      )
      .optional(),
    address: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().min(1, 'Phone is required'),
    email: z.string().email('Invalid email').optional(),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
  }),
});

export const updateClientSchema = z.object({
  body: z.object({
    company: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    surname: z.string().min(1).optional(),
    bankAccount: z.string().optional(),
    companyRegNumber: z.string().optional(),
    companyTaxNumber: z.string().optional(),
    companyTaxID: z.string().optional(),
    customField: z
      .array(
        z.object({
          fieldName: z.string(),
          fieldValue: z.string(),
        })
      )
      .optional(),
    address: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().min(1).optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional().or(z.literal('')),
  }),
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});

export const clientIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});

export type CreateClientDTO = z.infer<typeof createClientSchema>['body'];
export type UpdateClientDTO = z.infer<typeof updateClientSchema>['body'];
