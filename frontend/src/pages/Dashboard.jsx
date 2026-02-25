import React from 'react';
import { Row, Col, Progress, Tag, Divider } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/layout';
import RecentTable from '@/components/RecentTable';

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const TopCard = ({ title, tagContent, tagColor, prefix, delay }) => {
  return (
    <motion.div variants={cardVariants}>
      <Col className="gutter-row" span={6}>
        <div className="dashboard-card" style={styles.topCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>{title}</h3>
            <span style={styles.cardPrefix}>{prefix}</span>
          </div>
          <Divider style={styles.cardDivider} />
          <div style={styles.cardContent}>
            <Tag color={tagColor} style={styles.cardTag}>
              {tagContent}
            </Tag>
          </div>
        </div>
      </Col>
    </motion.div>
  );
};

const PreviewState = ({ tag, color, value }) => {
  const colorMap = {
    bleu: '#60A5FA',
    green: '#4ADE80',
    red: '#F87171',
    orange: '#FBBF24',
    purple: '#A78BFA',
    grey: '#6B6B6B',
    cyan: '#22D3EE',
    brown: '#B45309',
  };

  const colorCode = colorMap[color] || '#A3A3A3';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      style={styles.previewItem}
    >
      <div style={styles.previewLabel}>
        <span style={{ color: '#A3A3A3', fontSize: 13 }}>{tag}</span>
        <span style={{ color: '#FAFAFA', fontWeight: 600, fontSize: 13 }}>{value}%</span>
      </div>
      <Progress
        percent={value}
        showInfo={false}
        strokeColor={colorCode}
        trailColor="rgba(255,255,255,0.08)"
        style={{ marginTop: 6 }}
      />
    </motion.div>
  );
};

export default function Dashboard() {
  const leadColumns = [
    {
      title: 'Client',
      dataIndex: 'client',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: status => {
        const statusConfig = {
          pending: { color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.15)' },
          completed: { color: '#4ADE80', bg: 'rgba(74, 222, 128, 0.15)' },
        };
        const config = statusConfig[status] || statusConfig.pending;

        return (
          <Tag
            style={{
              color: config.color,
              background: config.bg,
              border: 'none',
              fontWeight: 500,
              textTransform: 'capitalize',
            }}
          >
            {status}
          </Tag>
        );
      },
    },
  ];

  const productColumns = [
    {
      title: 'Product Name',
      dataIndex: 'productName',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      render: price => <span style={{ fontWeight: 600, color: '#D4A853' }}>${price}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: status => {
        const statusConfig = {
          available: { color: '#4ADE80', bg: 'rgba(74, 222, 128, 0.15)' },
          unavailable: { color: '#F87171', bg: 'rgba(248, 113, 113, 0.15)' },
        };
        const config = statusConfig[status] || statusConfig.available;

        return (
          <Tag
            style={{
              color: config.color,
              background: config.bg,
              border: 'none',
              fontWeight: 500,
              textTransform: 'capitalize',
            }}
          >
            {status}
          </Tag>
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <motion.div variants={containerVariants} initial="initial" animate="animate">
        <Row gutter={[24, 24]}>
          <TopCard
            title="Leads"
            tagColor="#22D3EE"
            prefix="This month"
            tagContent="$34,000"
            delay={0}
          />
          <TopCard
            title="Orders"
            tagColor="#A78BFA"
            prefix="This month"
            tagContent="$34,000"
            delay={1}
          />
          <TopCard
            title="Payments"
            tagColor="#4ADE80"
            prefix="This month"
            tagContent="$34,000"
            delay={2}
          />
          <TopCard
            title="Due Balance"
            tagColor="#F87171"
            prefix="Not Paid"
            tagContent="$34,000"
            delay={3}
          />
        </Row>

        <div className="space30" />

        <Row gutter={[24, 24]}>
          <Col className="gutter-row" span={18}>
            <motion.div variants={cardVariants}>
              <div className="dashboard-card" style={styles.mainCard}>
                <Row className="pad10" gutter={[0, 0]}>
                  <Col className="gutter-row" span={8}>
                    <div className="pad15">
                      <h3 style={styles.sectionTitle}>Lead Preview</h3>
                      <PreviewState tag="Draft" color="grey" value={3} />
                      <PreviewState tag="Pending" color="bleu" value={5} />
                      <PreviewState tag="Not Paid" color="orange" value={12} />
                      <PreviewState tag="Overdue" color="red" value={6} />
                      <PreviewState tag="Partially Paid" color="cyan" value={8} />
                      <PreviewState tag="Paid" color="green" value={55} />
                    </div>
                  </Col>
                  <Col className="gutter-row" span={8}>
                    <div className="pad15">
                      <h3 style={styles.sectionTitle}>Quote Preview</h3>
                      <PreviewState tag="Draft" color="grey" value={3} />
                      <PreviewState tag="Pending" color="bleu" value={5} />
                      <PreviewState tag="Not Paid" color="orange" value={12} />
                      <PreviewState tag="Overdue" color="red" value={6} />
                      <PreviewState tag="Partially Paid" color="cyan" value={8} />
                      <PreviewState tag="Paid" color="green" value={55} />
                    </div>
                  </Col>
                  <Col className="gutter-row" span={8}>
                    <div className="pad15">
                      <h3 style={styles.sectionTitle}>Order Preview</h3>
                      <PreviewState tag="Draft" color="grey" value={3} />
                      <PreviewState tag="Pending" color="bleu" value={5} />
                      <PreviewState tag="Not Paid" color="orange" value={12} />
                      <PreviewState tag="Overdue" color="red" value={6} />
                      <PreviewState tag="Partially Paid" color="cyan" value={8} />
                      <PreviewState tag="Paid" color="green" value={55} />
                    </div>
                  </Col>
                </Row>
              </div>
            </motion.div>
          </Col>

          <Col className="gutter-row" span={6}>
            <motion.div variants={cardVariants}>
              <div className="dashboard-card" style={{ ...styles.mainCard, textAlign: 'center' }}>
                <div className="pad20">
                  <h3 style={styles.sectionTitle}>Customer Preview</h3>

                  <div style={styles.progressWrapper}>
                    <Progress
                      type="dashboard"
                      percent={25}
                      width={160}
                      strokeColor="#D4A853"
                      trailColor="rgba(255,255,255,0.08)"
                      gapDegree={8}
                    />
                  </div>

                  <p style={styles.progressLabel}>New Customers this Month</p>
                  <Divider style={styles.cardDivider} />

                  <div style={styles.statRow}>
                    <span style={styles.statLabel}>Active Customers</span>
                    <span style={styles.statValue}>
                      <ArrowUpOutlined style={{ color: '#4ADE80', marginRight: 4 }} />
                      11.28%
                    </span>
                  </div>
                  <div style={styles.statNumber}>2,847</div>
                </div>
              </div>
            </motion.div>
          </Col>
        </Row>

        <div className="space30" />

        <Row gutter={[24, 24]}>
          <Col className="gutter-row" span={12}>
            <motion.div variants={cardVariants}>
              <div className="dashboard-card">
                <div className="pad20">
                  <h3 style={styles.sectionTitle}>Recent Leads</h3>
                </div>
                <RecentTable entity="lead" dataTableColumns={leadColumns} />
              </div>
            </motion.div>
          </Col>

          <Col className="gutter-row" span={12}>
            <motion.div variants={cardVariants}>
              <div className="dashboard-card">
                <div className="pad20">
                  <h3 style={styles.sectionTitle}>Recent Products</h3>
                </div>
                <RecentTable entity="product" dataTableColumns={productColumns} />
              </div>
            </motion.div>
          </Col>
        </Row>
      </motion.div>
    </DashboardLayout>
  );
}

const styles = {
  topCard: {
    background: 'rgba(22, 22, 22, 0.8)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '20px 20px 16px',
    height: '100%',
    minHeight: '130px',
    transition: 'all 0.3s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 16,
    fontWeight: 600,
    color: '#FAFAFA',
    margin: 0,
  },
  cardPrefix: {
    fontSize: 12,
    color: '#6B6B6B',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  cardDivider: {
    borderColor: 'rgba(255, 255, 255, 0.06)',
    margin: '12px 0',
  },
  cardContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTag: {
    background: 'rgba(212, 168, 83, 0.15)',
    border: 'none',
    color: '#D4A853',
    fontSize: 18,
    fontWeight: 600,
    padding: '6px 16px',
    borderRadius: '10px',
  },
  mainCard: {
    background: 'rgba(22, 22, 22, 0.8)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    height: '100%',
    minHeight: '380px',
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 16,
    fontWeight: 600,
    color: '#FAFAFA',
    marginBottom: 24,
  },
  previewItem: {
    marginBottom: 16,
  },
  previewLabel: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  progressWrapper: {
    marginTop: 24,
    marginBottom: 8,
  },
  progressLabel: {
    color: '#6B6B6B',
    fontSize: 14,
    marginTop: 8,
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    color: '#6B6B6B',
    fontSize: 13,
  },
  statValue: {
    color: '#4ADE80',
    fontWeight: 600,
    fontSize: 14,
  },
  statNumber: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 28,
    fontWeight: 600,
    color: '#FAFAFA',
    textAlign: 'right',
    marginTop: 4,
  },
};
