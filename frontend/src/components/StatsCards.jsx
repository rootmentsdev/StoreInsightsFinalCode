import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FaArrowUp, FaWallet, FaShoppingCart, FaUsers, FaStar } from "react-icons/fa";

const StatCard = ({ label, value, trend, note, Icon, iconBg, iconColor }) => {
  return (
    <Card
  style={{
    background: "#111213",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    color: "#fff",
  }}
>
  <Card.Body style={{ padding: "8px" }}> {/* reduced from 18px */}
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "8px", // reduced gap
      }}
    >
      <div>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
          {label}
        </div>
        <div
          style={{
            marginTop: "2px", // reduced from 4px
            fontSize: "20px", // reduced from 24px
            fontWeight: 600,
            letterSpacing: "0.2px",
          }}
        >
          {value}
        </div>
      </div>
      <div
        style={{
          height: "32px", // reduced from 36px
          width: "32px",
          borderRadius: "8px", // reduced radius slightly
          display: "grid",
          placeItems: "center",
          background: iconBg,
          color: iconColor,
        }}
      >
        <Icon size={16} /> {/* smaller icon */}
      </div>
    </div>

    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px", // reduced from 8px
        marginTop: "8px", // reduced from 12px
        padding: "3px 6px", // smaller padding
        borderRadius: "6px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        fontSize: "11px", // slightly smaller
        color: "rgba(255,255,255,0.8)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          fontWeight: 600,
        }}
      >
        <FaArrowUp size={11} />
        <span>{trend}</span>
      </span>
      <span style={{ color: "rgba(255,255,255,0.55)" }}>{note}</span>
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

export default function StatsCards() {
  const stats = [
    {
      label: "Total Revenue",
      value: "₹8.46L",
      trend: "+9.2%",
      note: "vs last year this month",
      Icon: FaWallet,
      iconBg: "rgba(250, 204, 21, 0.12)",
      iconColor: "#facc15",
    },
    {
      label: "Total Bills",
      value: "3,522",
      trend: "+10.5%",
      note: "vs last year this month",
      Icon: FaShoppingCart,
      iconBg: "rgba(168, 85, 247, 0.12)",
      iconColor: "#a855f7",
    },
    {
      label: "Avg Sales Conversion",
      value: "56.4%",
      trend: "+8.5%",
      note: "vs last year this month",
      Icon: FaUsers,
      iconBg: "rgba(34, 197, 94, 0.12)",
      iconColor: "#22c55e",
    },
    {
      label: "Avg Customer Ratings",
      value: "4.7/5",
      trend: "+9.6%",
      note: "vs last year this month",
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
