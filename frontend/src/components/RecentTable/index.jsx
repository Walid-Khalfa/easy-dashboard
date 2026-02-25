import React from 'react';
import { Dropdown, Menu, Table } from 'antd';
import { motion } from 'framer-motion';
import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import { EllipsisOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

function DropDownRowMenu({ row }) {
  return (
    <Menu style={styles.dropdownMenu}>
      <Menu.Item icon={<EyeOutlined style={styles.dropdownIcon} />} style={styles.dropdownItem}>
        View
      </Menu.Item>
      <Menu.Item icon={<EditOutlined style={styles.dropdownIcon} />} style={styles.dropdownItem}>
        Edit
      </Menu.Item>
      <Menu.Item
        icon={<DeleteOutlined style={{ ...styles.dropdownIcon, color: '#F87171' }} />}
        style={styles.dropdownItem}
      >
        <span style={{ color: '#F87171' }}>Delete</span>
      </Menu.Item>
    </Menu>
  );
}

export default function RecentTable({ ...props }) {
  let { entity, dataTableColumns } = props;

  dataTableColumns = [
    ...dataTableColumns,
    {
      title: '',
      width: 50,
      render: row => (
        <Dropdown overlay={DropDownRowMenu({ row })} trigger={['click']}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={styles.actionButton}
          >
            <EllipsisOutlined style={{ cursor: 'pointer', fontSize: '18px', color: '#6B6B6B' }} />
          </motion.div>
        </Dropdown>
      ),
    },
  ];

  const asyncList = () => {
    return request.list(entity);
  };
  const { result, isLoading, isSuccess } = useFetch(asyncList);

  const firstFiveItems = () => {
    if (isSuccess && result) return result.slice(0, 5);
    return [];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Table
        columns={dataTableColumns}
        rowKey={item => item._id}
        dataSource={isSuccess && firstFiveItems()}
        pagination={false}
        loading={isLoading}
        size="small"
        style={styles.table}
      />
    </motion.div>
  );
}

const styles = {
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  dropdownMenu: {
    background: 'rgba(30, 30, 30, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: '6px',
    minWidth: 140,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    color: '#FAFAFA',
    fontSize: 13,
    transition: 'all 0.15s ease',
  },
  dropdownIcon: {
    fontSize: 14,
    color: '#A3A3A3',
  },
  table: {
    marginTop: 8,
  },
};
