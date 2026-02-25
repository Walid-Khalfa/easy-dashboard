import { useSelector } from 'react-redux';

export const selectListItems = () =>
  useSelector((state: any) => {
    const crudState = state.crud || {};
    return {
      result: {
        items: crudState.items || [],
        pagination: crudState.pagination || { page: 1, pages: 1, count: 0 },
      },
      isLoading: crudState.isLoading || false,
      isSuccess: crudState.isSuccess || false,
    };
  });

export const selectCreatedItem = () =>
  useSelector((state: any) => {
    const crudState = state.crud || {};
    return {
      current: crudState.current || null,
      isLoading: crudState.isLoading || false,
      isSuccess: crudState.isSuccess || false,
    };
  });

export const selectUpdatedItem = () =>
  useSelector((state: any) => {
    const crudState = state.crud || {};
    return {
      current: crudState.current || null,
      isLoading: crudState.isLoading || false,
      isSuccess: crudState.isSuccess || false,
    };
  });

export const selectDeletedItem = () =>
  useSelector((state: any) => {
    const crudState = state.crud || {};
    return {
      current: crudState.current || null,
      isLoading: crudState.isLoading || false,
      isSuccess: crudState.isSuccess || false,
    };
  });

export const selectSearchedItems = () =>
  useSelector((state: any) => {
    const crudState = state.crud || {};
    return {
      result: crudState.items || [],
      isLoading: crudState.isLoading || false,
      isSuccess: crudState.isSuccess || false,
    };
  });

export const selectCurrentItem = () =>
  useSelector((state: any) => {
    const crudState = state.crud || {};
    return {
      current: crudState.current || null,
      isLoading: crudState.isLoading || false,
      isSuccess: crudState.isSuccess || false,
    };
  });

export const selectItemById = (id: string) =>
  useSelector((state: any) => {
    const crudState = state.crud || {};
    const items = crudState.items || [];
    return items.find((item: any) => item._id === id) || null;
  });
