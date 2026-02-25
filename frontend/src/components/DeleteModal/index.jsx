import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { useCrudContext } from '@/context/crud';
import { selectDeletedItem } from '@/redux/crud/selectors';
import { valueByString } from '@/utils/helpers';

export default function DeleteModal({ config }) {
  let {
    entity,
    entityDisplayLabels,
    deleteMessage = 'Are you sure you want to delete: ',
    modalTitle = 'Confirm Delete',
  } = config;
  const dispatch = useDispatch();
  const { current, isLoading, isSuccess } = useSelector(selectDeletedItem);
  const { state, crudContextAction } = useCrudContext();
  const { isModalOpen } = state;
  const { modal } = crudContextAction;
  const [displayItem, setDisplayItem] = useState('');

  useEffect(() => {
    if (isSuccess) {
      modal.close();
      dispatch(crud.list(entity));
      dispatch(crud.resetAction(entity));
    }
    if (current) {
      let labels = entityDisplayLabels.map(x => valueByString(current, x)).join(' ');
      setDisplayItem(labels);
    }
  }, [isSuccess, current, modal, dispatch, entity]);

  const handleOk = () => {
    const id = current._id;
    dispatch(crud.delete(entity, id));
  };

  const handleCancel = () => {
    if (!isLoading) modal.close();
  };

  return (
    <Modal
      title={
        <span style={styles.modalTitle}>
          <ExclamationCircleOutlined style={styles.warningIcon} />
          {modalTitle}
        </span>
      }
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={isLoading}
      centered
      style={styles.modal}
      footer={[
        <Button key="cancel" onClick={handleCancel} style={styles.cancelButton}>
          Cancel
        </Button>,
        <Button
          key="delete"
          type="primary"
          danger
          onClick={handleOk}
          loading={isLoading}
          style={styles.deleteButton}
        >
          Delete
        </Button>,
      ]}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          style={styles.content}
        >
          <p style={styles.message}>{deleteMessage}</p>
          <motion.span
            key={displayItem}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.itemLabel}
          >
            {displayItem}
          </motion.span>
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
}

const styles = {
  modalTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 18,
    fontWeight: 600,
    color: '#FAFAFA',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  warningIcon: {
    color: '#F87171',
    fontSize: 22,
  },
  modal: {
    top: 100,
  },
  content: {
    padding: '16px 0',
  },
  message: {
    color: '#A3A3A3',
    fontSize: 15,
    marginBottom: 12,
  },
  itemLabel: {
    display: 'inline-block',
    background: 'rgba(248, 113, 113, 0.15)',
    color: '#F87171',
    padding: '10px 16px',
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 15,
  },
  cancelButton: {
    height: 44,
    padding: '0 24px',
    borderRadius: 10,
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#A3A3A3',
  },
  deleteButton: {
    height: 44,
    padding: '0 24px',
    borderRadius: 10,
    background: '#F87171',
    border: 'none',
  },
};
