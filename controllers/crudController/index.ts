import { Request, Response } from 'express';
import mongoose from 'mongoose';
import * as crudMethods from './crudMethods';

export const crudController = (modelName: string) => {
  const Model = mongoose.model(modelName);

  return {
    create: async (req: Request, res: Response) => {
      crudMethods.create(Model, req, res);
    },
    read: async (req: Request, res: Response) => {
      crudMethods.read(Model, req, res);
    },
    update: async (req: Request, res: Response) => {
      crudMethods.update(Model, req, res);
    },
    delete: async (req: Request, res: Response) => {
      crudMethods.deleteItem(Model, req, res);
    },
    list: async (req: Request, res: Response) => {
      crudMethods.list(Model, req, res);
    },
    search: async (req: Request, res: Response) => {
      crudMethods.search(Model, req, res);
    },
  };
};
