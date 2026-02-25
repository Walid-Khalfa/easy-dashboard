import { createAsyncThunk } from '@reduxjs/toolkit';
import { request } from '@/request';

export const list = createAsyncThunk(
  'crud/list',
  async ({ entity, pagination = 1 }: { entity: string; pagination?: number }) => {
    const response = await request.list(entity, pagination);
    return response;
  }
);

export const create = createAsyncThunk(
  'crud/create',
  async ({ entity, data }: { entity: string; data: any }) => {
    const response = await request.create(entity, data);
    return response;
  }
);

export const update = createAsyncThunk(
  'crud/update',
  async ({ entity, id, data }: { entity: string; id: string; data: any }) => {
    const response = await request.update(entity, id, data);
    return response;
  }
);

export const remove = createAsyncThunk(
  'crud/delete',
  async ({ entity, id }: { entity: string; id: string }) => {
    const response = await request.delete(entity, id);
    return response;
  }
);

export const search = createAsyncThunk(
  'crud/search',
  async ({ entity, source, data }: { entity: string; source: any; data: any }) => {
    const response = await request.search(entity, source, data);
    return response;
  }
);

export const resetState = () => ({ type: 'crud/resetState' });

export const resetAction = (actionType: string) => ({
  type: 'crud/resetAction',
  payload: actionType,
});

export const currentItem = (data: any) => ({ type: 'crud/currentItem', payload: data });

export const crud = {
  list,
  create,
  update,
  delete: remove,
  search,
  resetState,
  resetAction,
  currentItem,
};
