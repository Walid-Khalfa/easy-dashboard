import React, { useMemo } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

function LoadingComponent({ isLoading, children }) {
  const antIcon = useMemo(
    () => (
      <LoadingOutlined
        style={{
          fontSize: 28,
          color: '#D4A853',
        }}
        spin
      />
    ),
    []
  );

  return (
    <Spin indicator={antIcon} spinning={isLoading} tip="" wrapperStyle={styles.wrapper}>
      {children}
    </Spin>
  );
}

const Loading = React.memo(LoadingComponent);

const styles = {
  wrapper: {
    minHeight: 100,
  },
};

export default Loading;
