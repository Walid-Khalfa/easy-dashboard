import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Dropdown, Button, Table, Input } from 'antd';
import { motion } from 'framer-motion';
import { EllipsisOutlined, LeftOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';

import uniqueId from '@/utils/uinqueId';
import inverseColor from '@/utils/inverseColor';

export default function DataTable({ config, DropDownRowMenu, AddNewItem }) {
  const inputColorRef = useRef(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [tableItemsList, setTableItemsList] = useState([]);
  const [coloredRow, setColoredRow] = useState({});

  const openColorBox = () => {
    inputColorRef.current.click();
  };
  const handelColorChange = e => {
    const tmpObj = {};
    const tmpColoredRows = selectedRowKeys.map(x => {
      tmpObj[x] = e.target.value;
    });

    setColoredRow({ ...coloredRow, ...tmpObj });
    setSelectedRowKeys([]);
  };
  function MakeNewColor() {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Button onClick={openColorBox}>Make new Color</Button>
        <input
          type="color"
          ref={inputColorRef}
          onChange={handelColorChange}
          style={{
            opacity: 0,
            position: 'absolute',
            left: 0,
            top: '10px',
            width: '100%',
          }}
        />
      </div>
    );
  }
  let { entity, dataTableColumns, dataTableTitle } = config;
  const newDataTableColumns = dataTableColumns.map(obj => ({
    ...obj,
    render: (text, row) => {
      return {
        props: {
          style: {
            background: coloredRow[row._id] ? coloredRow[row._id] : '',
            color: coloredRow[row._id] ? inverseColor(coloredRow[row._id]) : '',
          },
        },
        children: text,
      };
    },
  }));
  dataTableColumns = [
    ...newDataTableColumns,
    {
      title: '',
      render: row => {
        return {
          props: {
            style: {
              background: coloredRow[row._id] ? coloredRow[row._id] : '',
              color: coloredRow[row._id] ? inverseColor(coloredRow[row._id]) : '',
            },
          },
          children: (
            <Dropdown overlay={DropDownRowMenu({ row })} trigger={['click']}>
              <EllipsisOutlined style={{ cursor: 'pointer', fontSize: '24px' }} />
            </Dropdown>
          ),
        };
      },
    },
  ];

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

  useEffect(() => {
    const listIds = items.map(x => x._id);
    setTableItemsList(listIds);
  }, [items]);

  const [firstRow, setFirstRow] = useState();

  const [onSelect, setSelect] = useState(false);
  const onClickRow = (record, rowIndex) => {
    return {
      onClick: () => {
        // const exist = selectedRowKeys.includes(record._id);
        // if (exist) {
        //   let filtered = selectedRowKeys.filter(function (value) {
        //     return value != record._id;
        //   });
        //   setSelectedRowKeys(filtered);
        // } else {
        //   setSelectedRowKeys([...selectedRowKeys, record._id]);
        // }
      },
      onMouseDown: () => {
        setFirstRow(rowIndex);
        setSelectedRowKeys([record._id]);
        setSelect(true);
      },
      onMouseEnter: () => {
        if (onSelect) {
          const selectedRange = tableItemsList.slice(firstRow, rowIndex + 1);
          setSelectedRowKeys(selectedRange);
        }
      },
      onMouseUp: () => {
        setSelect(false);
      },
    };
  };

  const handelColorRow = (checked, record, index, originNode) => {
    return {
      props: {
        style: {
          background: coloredRow[record._id] ? coloredRow[record._id] : '',
        },
      },
      // children: originNode,
    };
  };

  const onSelectChange = (selectedKeys, selectedRows) => {
    setSelectedRowKeys(selectedKeys);
    console.log('selectedRowKeys changed: ', selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    hideSelectAll: true,
    columnWidth: 0,
  };

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
          <MakeNewColor key={`${uniqueId()}`} config={config} />
          <Button onClick={handelDataTableLoad} key={`${uniqueId()}`}>
            Refresh
          </Button>
          <AddNewItem key={`${uniqueId()}`} config={config} />
        </div>
      </div>
      <Table
        columns={dataTableColumns}
        rowKey={item => item._id}
        rowSelection={rowSelection}
        onRow={onClickRow}
        ellipsis={true}
        size={'small'}
        dataSource={items}
        pagination={pagination}
        loading={listIsLoading}
        onChange={handelDataTableLoad}
      />
    </motion.div>
  );
}

const styles = {
  pageHeader: {
    padding: '20px 0px',
    background: 'transparent',
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
  },
  pageTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 24,
    fontWeight: 600,
    color: '#FAFAFA',
    margin: 0,
  },
};
