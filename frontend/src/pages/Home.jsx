import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  Container, Row, Col, Button, ButtonGroup, InputGroup,
  Form, Dropdown, Table, ButtonToolbar
} from "react-bootstrap";
import {
  FaSearch, FaChevronDown, FaChevronRight, FaDownload, FaFilter,
  FaArrowUp, FaArrowDown, FaSync
} from "react-icons/fa";
import "./Home.css";
import HeroHeader from "../components/Header";
import StatsCards from "../components/StatsCards";

/* ---------- API config ---------- */
const API_BASE = (import.meta?.env?.VITE_API_BASE) || "http://localhost:3000";
const SHEET_TABS = ["South cluster", "North Cluster"];
const sheetUrl = (tab) => `${API_BASE}/api/sheet?sheet=${encodeURIComponent(tab)}`;

/* ---------- Helpers & Normalization ---------- */
const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const perfLabel = (v) => (v >= 85 ? "Excellent" : v >= 70 ? "Good" : v >= 50 ? "Average" : "Poor");

const normKey = (k) =>
  String(k).trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

const indexRow = (row) => {
  const idx = {};
  for (const [k, v] of Object.entries(row || {})) idx[normKey(k)] = v;
  return idx;
};

const getAny = (idx, names, d = "") => {
  for (const n of names) {
    const v = idx[normKey(n)];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return d;
};

const num = (x) => {
  if (x === undefined || x === null || x === "") return 0;
  const n = Number(String(x).replace(/[^0-9.\-]/g, ""));
  return isNaN(n) ? 0 : n;
};

const parsePercentage = (val) => {
  if (!val && val !== 0) return 0;
  const str = String(val).replace(/[%\s]/g, "");
  const n = Number(str);
  return isNaN(n) ? 0 : n;
};

/* ---------- Robust row mapper ---------- */
const mapRow = (raw, i, cluster) => {
  const r = indexRow(raw);

  if (i === 0) {
    console.log("============ RAW SHEET ROW (before normalize) ============", raw);
    console.log("========== NORMALIZED KEYS ===========", Object.keys(r));
    console.log("========== NORMALIZED ROW OBJ =========", r);
    console.log("========== CONVERSION DEBUG ===========");
    console.log("MTD_CON%_CON_%:", r['mtd_con%_con_%']);
    console.log("CON_%:", r['con_%']);
    console.log("MTD_CON_:", r['mtd_con_']);
    console.log("MTD_CON:", r['mtd_con']);
    console.log("MTD_CON%:", r['mtd_con%']);
  }

  return {
    id: `${cluster}:${i + 1}`,
    cluster,
    store: String(r.store || "—"),

    revenue: num(getAny(r, ['abs_sale_value','sale_value'])),
    qty:     num(getAny(r, ['qty_ftd','ftd'])),
    yoy:     parsePercentage(getAny(r, ['bills_l2l','qty_l2l','l2l'])),
    walkins: num(getAny(r, ['walk_in_ftd','walkin_ftd','ftd_walk_in'])),
    bills:   num(getAny(r, ['bills_ftd','ftd'])),
    mtd_bills: num(getAny(r, ['bills_mtd','mtd'])),
    mtd_qty:   num(getAny(r, ['qty_mtd'])),
    abs:       num(getAny(r, ['abs_ftd','abs_ftd'])),
    mtd_abs:   num(getAny(r, ['abs_mtd','mtd_abs'])),
    abv:       num(getAny(r, ['abs_abv','abv'])),
    rating:    parsePercentage(getAny(r, ['mtd_con_','mtd_con','mtd_con%','con_%'])),
    targetAmount:   num(getAny(r, ['abs_target','target'])),
    targetAchieved: parsePercentage(getAny(r, ['abs_ach_','ach_','ach%'])),
    conversion:     parsePercentage(getAny(r, ['mtd_con%_con_%','con_%','mtd_con_','mtd_con','mtd_con%'])),
    performance: (() => {
      const c = parsePercentage(getAny(r, ['mtd_con%_con_%','con_%','mtd_con_','mtd_con','mtd_con%']));
      if (c >= 85) return "Excellent";
      if (c >= 70) return "Good";
      if (c >= 50) return "Average";
      return "Poor";
    })(),
  };
};

const toCsv = (rows) => {
  const headers = [
    "Cluster","Store","Revenue","Quantity","YoY_Growth","Walk_ins","Bills",
    "Conversion","ABS","Rating","Target_Amount","Target_Achievement","Performance"
  ];
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(","),
    ...rows.map(r => [
      r.cluster, r.store, r.revenue, r.qty, r.yoy, r.walkins, r.bills,
      Number(r.conversion || 0).toFixed(1),
      Number(r.abs || 0).toFixed(2),
      Number(r.rating || 0).toFixed(1),
      r.targetAmount, r.targetAchieved, r.performance
    ].map(esc).join(","))
  ].join("\n");
};

/* ---------- Reliable Sheet Fetcher ---------- */
function useSheetRows() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const abortRef = useRef(null);

  const fetchRows = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setErr(null);

    try {
      console.log("🚀 Fetching rows from Google Sheets (API)...");
      const results = await Promise.allSettled(
        SHEET_TABS.map(async (tab) => {
          const response = await fetch(sheetUrl(tab), {
            cache: "no-store",
            signal: ctrl.signal,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          if (!response.ok) throw new Error(`HTTP ${response.status} for ${tab}`);
          const json = await response.json();
          console.log(`🟡 [${tab}] sheet rows:`, (json.rows || []).length, json.error ? json.error : "");
          return { tab, json };
        })
      );
      const allAborted = results.every(r => r.status === "rejected" && r.reason?.name === "AbortError");
      if (allAborted) return;

      const merged = [];
      let hadRealFailure = false;
      for (const r of results) {
        if (r.status === "fulfilled") {
          const { tab, json } = r.value;
          if (json.error) {
            console.error(`❌ Sheet ${tab} error:`, json.error);
            hadRealFailure = true;
            continue;
          }
          const mapped = (json.rows || []).map((row, i) => mapRow(row, i, tab));
          if (mapped.length) console.log(`✅ First mapped row for [${tab}]:`, mapped[0]);
          merged.push(...mapped);
        } else if (r.reason?.name !== "AbortError") {
          hadRealFailure = true;
          console.error("[sheet] load failed:", String(r.reason));
        }
      }
      if (merged.length === 0 && hadRealFailure) setErr(new Error("Failed to load any sheet data"));
      setRows(merged);
      setLastUpdated(new Date());
      setErr(null);
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error("❌ Sheet fetch error:", e);
        setErr(e);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
    const t = setInterval(fetchRows, 2 * 60 * 1000); // every 2 minutes
    return () => {
      clearInterval(t);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchRows]);

  return { rows, loading, err, refresh: fetchRows, lastUpdated };
}

/* ------------- MAIN COMPONENT ------------- */
export default function StoreInsights() {
  const [query, setQuery] = useState("");
  const [clusterFilter, setClusterFilter] = useState("All Clusters");
  const [storeFilter, setStoreFilter] = useState("All Stores");
  const [perfFilter, setPerfFilter] = useState("All Performance");
  const [month, setMonth] = useState("2025-08");
  const [expanded, setExpanded] = useState(() => new Set());
  const [compare, setCompare] = useState("Target");
  const { rows: LIVE_ROWS, loading, err, refresh, lastUpdated } = useSheetRows();

  const clusterOptions = useMemo(
    () => ["All Clusters", ...Array.from(new Set(LIVE_ROWS.map(r => r.cluster).filter(Boolean)))],
    [LIVE_ROWS]
  );
  const storeOptions = useMemo(() => {
    const list = LIVE_ROWS
      .filter(r => clusterFilter === "All Clusters" || r.cluster === clusterFilter)
      .map(r => r.store)
      .filter(Boolean);
    return ["All Stores", ...Array.from(new Set(list))];
  }, [LIVE_ROWS, clusterFilter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filteredRows = LIVE_ROWS.filter((r) => {
      const byCluster = clusterFilter === "All Clusters" || r.cluster === clusterFilter;
      const byStore = storeFilter === "All Stores" || r.store === storeFilter;
      const byPerf = perfFilter === "All Performance" || r.performance === perfFilter;
      const textMatch =
        !q ||
        r.store?.toLowerCase().includes(q) ||
        (r.cluster || "").toLowerCase().includes(q);
      return byCluster && byStore && byPerf && textMatch;
    });
    
    // Sort to show poor performance stores first
    return filteredRows.sort((a, b) => {
      const performanceOrder = { "Poor": 0, "Average": 1, "Good": 2, "Excellent": 3 };
      return performanceOrder[a.performance] - performanceOrder[b.performance];
    });
  }, [query, storeFilter, perfFilter, clusterFilter, LIVE_ROWS]);

  const toggleRow = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleExport = useCallback(() => {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `store_insights_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [filtered]);

  const totalRevenue = filtered.reduce((sum, r) => sum + (r.revenue || 0), 0);
  const totalBills = filtered.reduce((sum, r) => sum + (r.bills || 0), 0);
  const totalMtdBills = filtered.reduce((sum, r) => sum + (r.mtd_bills || 0), 0);
  const totalWalkins = filtered.reduce((sum, r) => sum + (r.walkins || 0), 0);
  const totalQuantity = filtered.reduce((sum, r) => sum + (r.qty || 0), 0);
  const totalMtdQuantity = filtered.reduce((sum, r) => sum + (r.mtd_qty || 0), 0);
  const avgConversion = (() => {
    if (filtered.length === 0) return 0;
    
    // Calculate weighted average conversion based on walk-ins
    // Stores with more walk-ins have more influence on the overall average
    const totalWalkins = filtered.reduce((sum, r) => sum + (r.walkins || 0), 0);
    if (totalWalkins === 0) return 0;
    
    const weightedSum = filtered.reduce((sum, r) => {
      const walkins = r.walkins || 0;
      const conversion = r.conversion || 0;
      return sum + (conversion * walkins);
    }, 0);
    
    return weightedSum / totalWalkins;
  })();
  const avgRating = filtered.length > 0
    ? filtered.reduce((sum, r) => sum + (r.rating || 0), 0) / filtered.length
    : 0;

  return (
    <>
      <HeroHeader />
      <StatsCards 
        totalRevenue={totalRevenue}
        totalBills={totalBills}
        totalMtdBills={totalMtdBills}
        avgConversion={avgConversion}
        avgRating={avgRating}
        totalWalkins={totalWalkins}
        totalQuantity={totalQuantity}
        totalMtdQuantity={totalMtdQuantity}
      />

      <div style={{ background: "#0b0b0b", minHeight: "100vh" }}>
        <Container fluid className="sp-wrap">

          {/* Status Bar */}
          <Row className="mb-3 align-items-center">
            <Col>
              <ButtonGroup size="sm" aria-label="Primary tabs">
                <Button type="button" className="sp-tab">OVERVIEW</Button>
                <Button type="button" className="sp-tab sp-tab--active">STORE INSIGHTS</Button>
              </ButtonGroup>
            </Col>
            <Col xs="auto">
              <div className="d-flex align-items-center gap-2">
                {loading && (
                  <span className="text-warning">
                    <FaSync className="fa-spin me-1" />
                    Loading...
                  </span>
                )}
                {err && (
                  <span className="text-danger">
                    ⚠️ {err.message}
                  </span>
                )}
                {lastUpdated && !loading && (
                  <span className="text-success">
                    ✅ Updated {lastUpdated.toLocaleTimeString("en-IN")}
                  </span>
                )}
                <Button
                  size="sm"
                  variant="outline-light"
                  onClick={refresh}
                  disabled={loading}
                >
                  <FaSync className={loading ? "fa-spin" : ""} /> Refresh
                </Button>
              </div>
            </Col>
          </Row>


          {/* Filters Toolbar */}
          <Row className="g-2 sp-toolbar mb-3" role="region" aria-label="Filters">
            <Col xs={12} md={4}>
              <InputGroup className="sp-input">
                <InputGroup.Text className="sp-input-pre">
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search stores, clusters..."
                  className="sp-input-control"
                  aria-label="Search"
                />
              </InputGroup>
            </Col>

            <Col xs="auto">
              <Dropdown onSelect={(k) => { setClusterFilter(k || "All Clusters"); setStoreFilter("All Stores"); }}>
                <Dropdown.Toggle className="sp-dd">{clusterFilter}</Dropdown.Toggle>
                <Dropdown.Menu variant="dark" className="sp-dd-menu">
                  {clusterOptions.map((name) => (
                    <Dropdown.Item key={name} eventKey={name}>
                      {name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>

            <Col xs="auto">
              <Dropdown onSelect={(k) => setStoreFilter(k || "All Stores")}>
                <Dropdown.Toggle className="sp-dd">{storeFilter}</Dropdown.Toggle>
                <Dropdown.Menu variant="dark" className="sp-dd-menu">
                  {storeOptions.map((name) => (
                    <Dropdown.Item key={name} eventKey={name}>
                      {name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>

            <Col xs="auto">
              <Dropdown onSelect={(k) => setPerfFilter(k || "All Performance")}>
                <Dropdown.Toggle className="sp-dd">{perfFilter}</Dropdown.Toggle>
                <Dropdown.Menu variant="dark" className="sp-dd-menu">
                  {["All Performance", "Excellent", "Good", "Average", "Poor"].map((p) => (
                    <Dropdown.Item key={p} eventKey={p}>
                      {p}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>

            <Col xs="auto">
              <Dropdown onSelect={(k) => setCompare(k || "Target")}>
                <Dropdown.Toggle className="sp-dd">
                  Compare with <b className="sp-dd-bold">{compare}</b>
                </Dropdown.Toggle>
                <Dropdown.Menu variant="dark" className="sp-dd-menu">
                  {["Target", "Last Month", "LTM", "Forecast"].map((p) => (
                    <Dropdown.Item key={p} eventKey={p}>
                      {p}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>

            <Col xs="auto">
              <Form.Control
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="sp-month"
                aria-label="Select Month"
              />
            </Col>

            <Col xs="auto" className="ms-auto">
              <ButtonToolbar>
                <Button type="button" className="sp-btn">
                  <FaFilter style={{ marginRight: 6 }} />
                  Filters
                </Button>
                <Button type="button" className="sp-btn ms-2" onClick={handleExport}>
                  <FaDownload style={{ marginRight: 6 }} />
                  Export
                </Button>
              </ButtonToolbar>
            </Col>
          </Row>

          {/* Main Data Table */}
          <div className="sp-card">
            <div className="sp-card-head">
              <div className="sp-title">Store Performance Dashboard</div>
              <div className="sp-sub">
                {new Date(`${month}-01`).toLocaleString("en-IN", { month: "long", year: "numeric" })} • 
                {filtered.length} stores • 
                Real-time data from Google Sheets
              </div>
            </div>

            <div className="sp-table-wrap">
              <div className="sp-table-viewport">
                <Table hover variant="dark" borderless size="sm" className="sp-table">
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}></th>
                      <th>Store</th>
                      <th>Revenue (₹)</th>
                      <th>Quantity</th>
                      <th>YoY Growth (%)</th>
                      <th>Walk-ins</th>
                      <th>Total Bills</th>
                      <th>Conversion (%)</th>
                      <th>ABS</th>
                      <th>Rating (%)</th>
                      <th>Performance</th>
                      <th>Cluster</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={12} className="text-center text-muted py-4">
                          <FaSync className="fa-spin me-2" />
                          Loading store data...
                        </td>
                      </tr>
                    )}

                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={12} className="text-center text-muted py-4">
                          {err ? "Error loading data. Please refresh." : "No stores match your filters"}
                        </td>
                      </tr>
                    )}

                    {!loading && filtered.map((r, i) => {
                      const open = expanded.has(r.id);
                      const conversion = Number(r.conversion || 0);
                      const rating = Number(r.rating || 0);
                      const yoyGrowth = Number(r.yoy || 0);
                      const targetAchievement = Number(r.targetAchieved || 0);

                      return (
                        <React.Fragment key={r.id}>
                          <tr
                            className={`sp-row ${i % 2 ? "sp-row--alt" : ""} ${r.performance === "Poor" ? "sp-row--poor" : ""}`}
                            onClick={() => toggleRow(r.id)}
                            role="button"
                            aria-expanded={open}
                            style={{ cursor: "pointer" }}
                          >
                            <td className="sp-chevron">
                              {open ? <FaChevronDown /> : <FaChevronRight />}
                            </td>

                            <td>
                              <div className="sp-store-title">{r.store}</div>
                              <div className="sp-store-sub">
                                <span className="sp-badge is-sg">Suitor Guy</span>
                                <span className="sp-sep">•</span>
                                <span className="sp-manager">Manager</span>
                              </div>
                            </td>

                            <td>
                              <div className="sp-revenue-main">₹{fmt(r.revenue)}</div>
                              <div className="sp-revenue-sub">
                                Target: ₹{fmt(r.targetAmount)}
                                {targetAchievement >= 100 ? (
                                  <FaArrowUp className="arrow-up ms-1" />
                                ) : (
                                  <FaArrowDown className="arrow-down ms-1" />
                                )}
                              </div>
                            </td>

                            <td>
                              <div className="sp-qty-main">{fmt(r.qty)}</div>
                              <div className="sp-qty-sub">
                                MTD: {fmt(r.mtd_qty)}
                              </div>
                            </td>

                            <td className={yoyGrowth >= 0 ? "text-success" : "text-danger"}>
                              <div className="sp-yoy-main">
                                {yoyGrowth > 0 ? "+" : ""}{yoyGrowth.toFixed(1)}%
                              </div>
                              <div className="sp-yoy-sub">vs Last Year</div>
                            </td>

                            <td>
                              <div className="sp-walkins">{fmt(r.walkins)}</div>
                              <div className="sp-walkins-sub">Daily avg</div>
                            </td>

                            <td>
                              <div className="sp-bills">{fmt(r.bills)}</div>
                              <div className="sp-bills-sub">MTD: {fmt(r.mtd_bills)}</div>
                            </td>

                            <td className={conversion >= 70 ? "text-success" : conversion < 50 ? "text-danger" : "text-warning"}>
                              <strong>{conversion.toFixed(1)}%</strong>
                            </td>

                            <td>
                              <div className="sp-abs-main">{Number(r.abs || 0).toFixed(2)}</div>
                              <div className="sp-abs-sub">MTD: {Number(r.mtd_abs || 0).toFixed(2)}</div>
                            </td>

                            <td className={rating >= 70 ? "text-success" : rating < 50 ? "text-danger" : "text-warning"}>
                              {rating.toFixed(1)}%
                            </td>

                            <td>
                              <span className={`sp-pill sp-${r.performance.toLowerCase()}`}>
                                {r.performance}
                              </span>
                            </td>

                            <td>
                              <span className="sp-cluster">{r.cluster}</span>
                            </td>
                          </tr>

                          {open && (
                            <tr className="sp-expand-row">
                              <td></td>
                              <td colSpan={11}>
                                <div className="sp-expand">
                                  <Row className="g-4">
                                    <Col md={4}>
                                      <div className="sp-sec-title">Store Details</div>
                                      <div className="sp-kv">
                                        <span>Brand</span>
                                        <b>Suitor Guy</b>
                                      </div>
                                      <div className="sp-kv">
                                        <span>Manager</span>
                                        <b>Store Manager</b>
                                      </div>
                                      <div className="sp-kv">
                                        <span>Cluster</span>
                                        <b>{r.cluster}</b>
                                      </div>
                                      <div className="sp-kv">
                                        <span>Performance</span>
                                        <b className={`text-${r.performance.toLowerCase() === 'excellent' ? 'success' : 
                                                      r.performance.toLowerCase() === 'good' ? 'info' :
                                                      r.performance.toLowerCase() === 'average' ? 'warning' : 'danger'}`}>
                                          {r.performance}
                                        </b>
                                      </div>
                                    </Col>

                                    <Col md={4}>
                                      <div className="sp-sec-title">Performance Metrics</div>
                                      <div className="sp-kv">
                                        <span>Average Basket Value</span>
                                        <b>₹{fmt(r.abv || Math.round((r.revenue || 0) / Math.max(1, r.bills || 0)))}</b>
                                      </div>
                                      <div className="sp-kv">
                                        <span>Daily Walk-ins</span>
                                        <b>{Math.round((r.walkins || 0) / 30)}</b>
                                      </div>
                                      <div className="sp-kv">
                                        <span>Conversion Rate</span>
                                        <b>{conversion.toFixed(1)}%</b>
                                      </div>
                                      <div className="sp-kv">
                                        <span>FTD ABS</span>
                                        <b>{Number(r.abs || 0).toFixed(2)}</b>
                                      </div>
                                      <div className="sp-kv">
                                        <span>MTD ABS</span>
                                        <b>{Number(r.mtd_abs || 0).toFixed(2)}</b>
                                      </div>
                                    </Col>

                                    <Col md={4}>
                                      <div className="sp-sec-title">Sales & Targets</div>
                                      <div className="sp-kv">
                                        <span>Revenue Target</span>
                                        <b>₹{fmt(r.targetAmount)}</b>
                                      </div>
                                      <div className="sp-kv">
                                        <span>Achievement</span>
                                        <b className={targetAchievement >= 100 ? "text-success" : "text-warning"}>
                                          {targetAchievement.toFixed(1)}%
                                        </b>
                                      </div>
                                      <div className="sp-kv">
                                        <span>YoY Growth</span>
                                        <b className={yoyGrowth >= 0 ? "text-success" : "text-danger"}>
                                          {yoyGrowth > 0 ? "+" : ""}{yoyGrowth.toFixed(1)}%
                                        </b>
                                      </div>
                                      <div className="sp-kv">
                                        <span>Status</span>
                                        <b className={targetAchievement >= 100 ? "text-success" : "text-warning"}>
                                          {targetAchievement >= 100 ? "On Track" : "Needs Attention"}
                                        </b>
                                      </div>
                                    </Col>
                                  </Row>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}