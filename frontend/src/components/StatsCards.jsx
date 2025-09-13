import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FaWallet, FaShoppingCart, FaUsers, FaStar } from "react-icons/fa";

const StatCard = ({ label, value, mtdValue, Icon, iconBg, iconColor }) => {
  return (
    <Card
  style={{
    background: "#111213",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    color: "#fff",
    height: "120px", // Fixed height
    width: "100%", // Full width of container
    display: "flex",
    flexDirection: "column",
  }}
>
  <Card.Body style={{ 
    padding: "16px", 
    display: "flex", 
    flexDirection: "column", 
    justifyContent: "space-between",
    height: "100%"
  }}>
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "8px",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginBottom: "4px" }}>
          {label}
        </div>
        <div
          style={{
            fontSize: "20px",
            fontWeight: 600,
            letterSpacing: "0.2px",
            marginBottom: "4px",
          }}
        >
          {value}
        </div>
        {mtdValue && (
          <div
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.6)",
              fontWeight: 400,
            }}
          >
            MTD: {mtdValue}
          </div>
        )}
      </div>
      <div
        style={{
          height: "36px",
          width: "36px",
          borderRadius: "8px",
          display: "grid",
          placeItems: "center",
          background: iconBg,
          color: iconColor,
          flexShrink: 0,
        }}
      >
        <Icon size={18} />
      </div>
    </div>

  </Card.Body>
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "1px",
      background:
        "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
      pointerEvents: "none",
    }}
  />
</Card>

  );
};

export default function StatsCards({ 
  totalRevenue = 0, 
  totalBills = 0, 
  totalMtdBills = 0,
  avgConversion = 0, 
  avgRating = 0 
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
    <Container fluid style={{ background: "#0b0b0b", padding: "6px 10px" }}>
      <Row className="g-3">
        {stats.map((s, i) => (
          <Col key={i} xs={12} md={6} lg={3}>
            <StatCard {...s} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}
