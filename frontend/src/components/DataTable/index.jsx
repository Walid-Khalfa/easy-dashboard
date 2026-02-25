import React, { useCallback, useEffect, useMemo } from 'react';
import { Dropdown, Button, Table } from 'antd';
import { motion } from 'framer-motion';
import { EllipsisOutlined, ReloadOutlined, LeftOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import uniqueId from '@/utils/uinqueId';

function DataTableComponent({ config, DropDownRowMenu, AddNewItem }) {
  let { entity, dataTableColumns, dataTableTitle } = config;

  const columns = useMemo(
    () => [
      ...dataTableColumns,
      {
        title: '',
        width: 60,
        render: row => (
          <Dropdown overlay={DropDownRowMenu({ row })} trigger={['click']}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={styles.actionButton}
            >
              <EllipsisOutlined style={{ cursor: 'pointer', fontSize: '20px' }} />
            </motion.div>
          </Dropdown>
        ),
      },
    ],
    [dataTableColumns, DropDownRowMenu]
  );

  const { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  const { pagination, items } = listResult;

  const dispatch = useDispatch();

  const handelDataTableLoad = useCallback(
    pagination => {
      dispatch(crud.list(entity, pagination.current));
    },
    [dispatch, entity]
  );

  useEffect(() => {
    dispatch(crud.list(entity));
  }, [dispatch, entity]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div style={styles.pageHeader}>
        <div style={styles.headerLeft}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            style={styles.backButton}
          >
            <LeftOutlined />
          </motion.button>
          <h1 style={styles.pageTitle}>{dataTableTitle}</h1>
        </div>
        <div style={styles.headerRight}>
          <Button
            onClick={handelDataTableLoad}
            key={`${uniqueId()}`}
            icon={<ReloadOutlined />}
            style={styles.refreshButton}
          >
            Refresh
          </Button>
          <AddNewItem key={`${uniqueId()}`} config={config} />
        </div>
      </div>
      <Table
        columns={columns}
        rowKey={item => item._id}
        dataSource={items}
        pagination={pagination}
        loading={listIsLoading}
        onChange={handelDataTableLoad}
        style={styles.table}
      />
    </motion.div>
  );
}

const DataTable = React.memo(DataTableComponent);

export default DataTable;

const styles = {
  pageHeader: {
    padding: '20px 0px',
    background: 'transparent',
    borderBottom: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#A3A3A3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  pageTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 24,
    fontWeight: 600,
    color: '#FAFAFA',
    margin: 0,
  },
  refreshButton: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#A3A3A3',
    borderRadius: '10px',
    height: 40,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#A3A3A3',
    transition: 'all 0.2s ease',
  },
  table: {
    marginTop: 16,
  },
};
