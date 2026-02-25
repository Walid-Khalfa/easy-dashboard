import { z } from 'zod';

export const LeadStatus = {
  PENDING: 'pending',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  CONVERTED: 'converted',
  LOST: 'lost',
} as const;

export type LeadStatusType = (typeof LeadStatus)[keyof typeof LeadStatus];

export interface ILead {
  _id?: string;
  date: string;
  client: string;
  phone: string;
  email: string;
  budget?: number;
  request?: string;
  status: LeadStatusType;
  removed: boolean;
  enabled: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export const createLeadSchema = z.object({
  body: z.object({
    date: z.string().min(1, 'Date is required'),
    client: z.string().min(1, 'Client is required'),
    phone: z
      .string()
      .min(1, 'Phone is required')
      .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Invalid phone number'),
    email: z.string().email('Invalid email address'),
    budget: z.number().min(0).optional(),
    request: z.string().optional(),
    status: z.enum(['pending', 'contacted', 'qualified', 'converted', 'lost']).default('pending'),
  }),
});

export const updateLeadSchema = z.object({
  body: z.object({
    date: z.string().min(1).optional(),
    client: z.string().min(1).optional(),
    phone: z
      .string()
      .min(1)
      .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)
      .optional(),
    email: z.string().email().optional(),
    budget: z.number().min(0).optional(),
    request: z.string().optional(),
    status: z.enum(['pending', 'contacted', 'qualified', 'converted', 'lost']).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});

export const leadIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});

export type CreateLeadDTO = z.infer<typeof createLeadSchema>['body'];
export type UpdateLeadDTO = z.infer<typeof updateLeadSchema>['body'];
