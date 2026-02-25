import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { useCrudContext } from '@/context/crud';
import { selectCreatedItem } from '@/redux/crud/selectors';
import { Button, Form } from 'antd';
import { motion } from 'framer-motion';
import Loading from '@/components/Loading';

export default function CreateForm({ config, formElements }) {
  let { entity } = config;
  const dispatch = useDispatch();
  const { isLoading, isSuccess } = useSelector(selectCreatedItem);
  const { crudContextAction } = useCrudContext();
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
          date: fieldsValue['date'].format('DD/MM/YYYY'),
        };
      }
    }
    dispatch(crud.create(entity, fieldsValue));
  };

  useEffect(() => {
    if (isSuccess) {
      readBox.open();
      collapsedBox.open();
      panel.open();
      form.resetFields();
      dispatch(crud.resetAction('create'));
      dispatch(crud.list(entity));
    }
  }, [isSuccess, form, dispatch, entity, readBox, collapsedBox, panel]);

  return (
    <Loading isLoading={isLoading}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Form form={form} layout="vertical" onFinish={onSubmit} style={styles.form}>
          {formElements}
          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button type="primary" htmlType="submit" style={styles.submitButton}>
                Create New {entity}
              </Button>
            </motion.div>
          </Form.Item>
        </Form>
      </motion.div>
    </Loading>
  );
}

const styles = {
  form: {
    padding: '8px 0',
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
  },
};
