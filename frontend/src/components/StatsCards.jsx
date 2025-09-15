import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FaWallet, FaShoppingCart, FaUsers, FaStar, FaWalking, FaBox } from "react-icons/fa";

const StatCard = ({ label, value, mtdValue, Icon, iconBg, iconColor }) => {
  return (
    <Card className="stat-card-mobile">
      <Card.Body className="stat-card-body">
        <div className="stat-card-content">
          <div className="stat-card-text">
            <div className="stat-card-label">
              {label}
            </div>
            <div className="stat-card-value">
              {value}
            </div>
            {mtdValue && (
              <div className="stat-card-mtd">
                MTD: {mtdValue}
              </div>
            )}
          </div>
          <div className="stat-card-icon" style={{ background: iconBg, color: iconColor }}>
            <Icon size={18} />
          </div>
        </div>
      </Card.Body>
      <div className="stat-card-gradient" />
    </Card>
  );
};

export default function StatsCards({ 
  totalRevenue = 0, 
  totalBills = 0, 
  totalMtdBills = 0,
  avgConversion = 0, 
  avgRating = 0,
  totalWalkins = 0,
  totalQuantity = 0,
  totalMtdQuantity = 0
}) {
  const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
  
  const stats = [
    {
      label: "Total Revenue",
      value: `₹${fmt(totalRevenue)}`,
      Icon: FaWallet,
      iconBg: "rgba(250, 204, 21, 0.12)",
      iconColor: "#facc15",
    },
    {
      label: "Total Bills",
      value: fmt(totalBills),
      mtdValue: fmt(totalMtdBills),
      Icon: FaShoppingCart,
      iconBg: "rgba(168, 85, 247, 0.12)",
      iconColor: "#a855f7",
    },
    {
      label: "Total Walk-ins",
      value: fmt(totalWalkins),
      Icon: FaWalking,
      iconBg: "rgba(239, 68, 68, 0.12)",
      iconColor: "#ef4444",
    },
    {
      label: "Total Quantity",
      value: fmt(totalQuantity),
      mtdValue: fmt(totalMtdQuantity),
      Icon: FaBox,
      iconBg: "rgba(245, 158, 11, 0.12)",
      iconColor: "#f59e0b",
    },
    {
      label: "Avg Sales Conversion",
      value: `${avgConversion.toFixed(1)}%`,
      Icon: FaUsers,
      iconBg: "rgba(34, 197, 94, 0.12)",
      iconColor: "#22c55e",
    },
    {
      label: "Avg Customer Ratings",
      value: `${avgRating.toFixed(1)}/5`,
      Icon: FaStar,
      iconBg: "rgba(34, 211, 238, 0.12)",
      iconColor: "#22d3ee",
    },
  ];

  return (
    <Container fluid className="stats-container">
      <Row className="g-2 g-md-3">
        {stats.map((s, i) => (
          <Col key={i} xs={6} sm={4} md={3} lg={2}>
            <StatCard {...s} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}
