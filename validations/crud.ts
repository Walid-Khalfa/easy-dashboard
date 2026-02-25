import { z } from 'zod';

// Common validation patterns
const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
const urlRegex = /^https?:\/\/.+/i;

// Client validation schemas
export const clientCreateSchema = z.object({
  body: z.object({
    company: z.string().min(1, 'Company name is required'),
    name: z.string().min(1, 'Name is required'),
    surname: z.string().min(1, 'Surname is required'),
    phone: z.string().min(1, 'Phone is required').regex(phoneRegex, 'Invalid phone number format'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    address: z.string().optional(),
    country: z.string().optional(),
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
    enabled: z.boolean().optional(),
  }),
});

export const clientUpdateSchema = z.object({
  body: z.object({
    company: z.string().min(1, 'Company name is required').optional(),
    name: z.string().min(1, 'Name is required').optional(),
    surname: z.string().min(1, 'Surname is required').optional(),
    phone: z
      .string()
      .min(1, 'Phone is required')
      .regex(phoneRegex, 'Invalid phone number format')
      .optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    address: z.string().optional(),
    country: z.string().optional(),
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
    enabled: z.boolean().optional(),
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

// Lead validation schemas
export const leadCreateSchema = z.object({
  body: z.object({
    date: z.string().min(1, 'Date is required'),
    client: z.string().min(1, 'Client is required'),
    phone: z.string().min(1, 'Phone is required').regex(phoneRegex, 'Invalid phone number format'),
    email: z.string().email('Invalid email address'),
    budget: z.number().min(0, 'Budget must be a positive number').optional(),
    request: z.string().optional(),
    status: z.enum(['pending', 'contacted', 'qualified', 'converted', 'lost']).optional(),
  }),
});

export const leadUpdateSchema = z.object({
  body: z.object({
    date: z.string().min(1, 'Date is required').optional(),
    client: z.string().min(1, 'Client is required').optional(),
    phone: z
      .string()
      .min(1, 'Phone is required')
      .regex(phoneRegex, 'Invalid phone number format')
      .optional(),
    email: z.string().email('Invalid email address').optional(),
    budget: z.number().min(0, 'Budget must be a positive number').optional(),
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

// Product validation schemas
export const productCreateSchema = z.object({
  body: z.object({
    productName: z.string().min(1, 'Product name is required'),
    description: z.string().optional(),
    price: z.number().min(0, 'Price must be a positive number').optional(),
    status: z.enum(['available', 'unavailable', 'discontinued']).optional(),
    enabled: z.boolean().optional(),
  }),
});

export const productUpdateSchema = z.object({
  body: z.object({
    productName: z.string().min(1, 'Product name is required').optional(),
    description: z.string().optional(),
    price: z.number().min(0, 'Price must be a positive number').optional(),
    status: z.enum(['available', 'unavailable', 'discontinued']).optional(),
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

// Common query schemas
export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    items: z.coerce.number().int().positive().max(100).optional(),
    sort: z.string().optional(),
  }),
});

export const listQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    items: z.coerce.number().int().positive().max(100).optional(),
    sort: z
      .string()
      .refine(val => /^[a-zA-Z_]+:(1|-1)$/.test(val), {
        message: "Sort must be in format 'field:1' or 'field:-1'",
      })
      .optional(),
  }),
});

export const searchSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    fields: z.string().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});
