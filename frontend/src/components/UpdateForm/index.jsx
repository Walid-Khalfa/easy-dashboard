import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { useCrudContext } from '@/context/crud';
import { selectUpdatedItem } from '@/redux/crud/selectors';
import { Button, Form } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from '@/components/Loading';

export default function UpdateForm({ config, formElements }) {
  let { entity } = config;
  const dispatch = useDispatch();
  const { current, isLoading, isSuccess } = useSelector(selectUpdatedItem);
  const { state, crudContextAction } = useCrudContext();
  const { panel, collapsedBox, readBox } = crudContextAction;
  const [form] = Form.useForm();

  const onSubmit = fieldsValue => {
    if (fieldsValue) {
      if (fieldsValue.birthday) {
        fieldsValue = {
          ...fieldsValue,
          birthday: fieldsValue['birthday'].format('DD/MM/YYYY'),
        };
      }
      if (fieldsValue.date) {
        fieldsValue = {
          ...fieldsValue,
          birthday: fieldsValue['date'].format('DD/MM/YYYY'),
        };
      }
    }
    const id = current._id;
    dispatch(crud.update(entity, id, fieldsValue));
  };

  useEffect(() => {
    if (current) {
      if (current.birthday) {
        current.birthday = dayjs(current.birthday);
      }
      if (current.date) {
        current.date = dayjs(current.date);
      }
      form.setFieldsValue(current);
    }
  }, [current, form]);

  useEffect(() => {
    if (isSuccess) {
      readBox.open();
      collapsedBox.open();
      panel.open();
      form.resetFields();
      dispatch(crud.resetAction('update'));
      dispatch(crud.list(entity));
    }
  }, [isSuccess, form, dispatch, entity, readBox, collapsedBox, panel]);

  const { isEditBoxOpen } = state;

  return (
    <AnimatePresence>
      {isEditBoxOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={styles.container}
        >
          <Loading isLoading={isLoading}>
            <Form form={form} layout="vertical" onFinish={onSubmit} style={styles.form}>
              {formElements}
              <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button type="primary" htmlType="submit" style={styles.submitButton}>
                    Update {entity}
                  </Button>
                </motion.div>
              </Form.Item>
            </Form>
          </Loading>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const styles = {
  container: {
    padding: '8px 0',
  },
  form: {
    padding: '0',
  },
  submitButton: {
    height: 48,
    padding: '0 32px',
    fontSize: 15,
    fontWeight: 600,
    background: 'linear-gradient(135deg, #D4A853 0%, #E8C87A 100%)',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(212, 168, 83, 0.25)',
    color: '#0D0D0D',
  },
};
