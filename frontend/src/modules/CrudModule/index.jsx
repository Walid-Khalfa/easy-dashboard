import React, { useLayoutEffect } from 'react';
import { Row, Col, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import CreateForm from '@/components/CreateForm';
import UpdateForm from '@/components/UpdateForm';
import DeleteModal from '@/components/DeleteModal';
import ReadItem from '@/components/ReadItem';
import SearchItem from '@/components/SearchItem';
import { useDispatch } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { useCrudContext } from '@/context/crud';
import { CrudLayout } from '@/layout';
import CrudDataTable from './CrudDataTable';

function SidePanelTopContent({ config, formElements }) {
  return (
    <>
      <ReadItem config={config} />
      <UpdateForm config={config} formElements={formElements} />
    </>
  );
}

function FixHeaderPanel({ config }) {
  const { crudContextAction } = useCrudContext();
  const { collapsedBox } = crudContextAction;

  const addNewItem = () => {
    collapsedBox.close();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={styles.panelHeader}
    >
      <Row gutter={12}>
        <Col className="gutter-row" span={21}>
          <h1 style={styles.panelTitle}>{config.panelTitle}</h1>
        </Col>
      </Row>
      <Row gutter={8}>
        <Col className="gutter-row" span={21}>
          <SearchItem config={config} />
        </Col>
        <Col className="gutter-row" span={3}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={addNewItem}
              block={true}
              icon={<PlusOutlined />}
              style={styles.addButton}
            />
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );
}

export default function CrudModule({ config, createForm, updateForm }) {
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    dispatch(crud.resetState());
  }, [dispatch]);

  return (
    <CrudLayout
      config={config}
      fixHeaderPanel={<FixHeaderPanel config={config} />}
      sidePanelBottomContent={<CreateForm config={config} formElements={createForm} />}
      sidePanelTopContent={<SidePanelTopContent config={config} formElements={updateForm} />}
    >
      <CrudDataTable config={config} />
      <DeleteModal config={config} />
    </CrudLayout>
  );
}

const styles = {
  panelHeader: {
    padding: '20px 20px 12px',
  },
  panelTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 22,
    fontWeight: 600,
    color: '#FAFAFA',
    marginBottom: 16,
    letterSpacing: '-0.02em',
  },
  addButton: {
    height: 44,
    background: 'linear-gradient(135deg, #D4A853 0%, #E8C87A 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#0D0D0D',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
