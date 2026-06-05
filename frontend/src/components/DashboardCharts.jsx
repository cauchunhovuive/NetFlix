import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

// ─── Custom Tooltip ───
const ChartTooltip = ({ active, payload, label, formatter = (v) => `$${v}` }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="chart-tooltip-value" style={{ color: p.color }}>
          {p.name}: {formatter(p.value)}
        </div>
      ))}
    </div>
  );
};

// ─── Colors ───
const BAR_COLORS = [
  "#46d369", "#f5c518", "#8b5cf6", "#3b82f6", "#e50914",
  "#f97316", "#06b6d4", "#ec4899", "#14b8a6", "#a855f7",
  "#ef4444", "#eab308", "#22c55e", "#6366f1", "#0ea5e9",
];

const GENRE_COLORS = [
  "#e50914", "#f5c518", "#46d369", "#8b5cf6", "#3b82f6",
  "#f97316", "#06b6d4", "#ec4899", "#14b8a6", "#a855f7",
  "#ef4444", "#eab308", "#22c55e", "#6366f1", "#0ea5e9",
];

// ─── 1. Daily Revenue Line Chart ───
export function DailyRevenueChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">Chưa có dữ liệu doanh thu</div>;
  }

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <span className="chart-card-icon">📈</span>
        <span className="chart-card-title">Doanh thu 30 ngày</span>
      </div>
      <div className="chart-card-body">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<ChartTooltip formatter={(v) => `$${v.toLocaleString()}`} />} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#f5c518"
              strokeWidth={2.5}
              dot={{ fill: "#f5c518", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#f5c518", stroke: "#fff", strokeWidth: 2 }}
              name="Doanh thu"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── 2. Genre Distribution Pie Chart ───
export function GenrePieChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">Chưa có dữ liệu thể loại</div>;
  }

  const total = data.reduce((sum, g) => sum + g.count, 0);

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <span className="chart-card-icon">🎯</span>
        <span className="chart-card-title">Phân bố thể loại</span>
      </div>
      <div className="chart-card-body chart-card-body-pie">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="genre"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={GENRE_COLORS[i % GENRE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                const pct = ((d.count / total) * 100).toFixed(1);
                return (
                  <div className="chart-tooltip">
                    <div className="chart-tooltip-label">{d.genre}</div>
                    <div className="chart-tooltip-value" style={{ color: GENRE_COLORS[data.indexOf(d) % GENRE_COLORS.length] }}>
                      {d.count} phim ({pct}%)
                    </div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="chart-legend">
          {data.slice(0, 6).map((g, i) => (
            <div key={g.genre} className="chart-legend-item">
              <span
                className="chart-legend-dot"
                style={{ background: GENRE_COLORS[i % GENRE_COLORS.length] }}
              />
              <span className="chart-legend-label">{g.genre}</span>
              <span className="chart-legend-value">{g.count}</span>
            </div>
          ))}
          {data.length > 6 && (
            <div className="chart-legend-item chart-legend-more">
              <span>+{data.length - 6} thể loại khác</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 3. Top Top-Up Users Bar Chart ───
export function TopTopUpUsersChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">Chưa có dữ liệu nạp tiền</div>;
  }

  return (
    <div className="chart-card chart-card-wide">
      <div className="chart-card-header">
        <span className="chart-card-icon">💰</span>
        <span className="chart-card-title">Top người dùng nạp nhiều nhất</span>
      </div>
      <div className="chart-card-body">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickFormatter={(v) => `$${v}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={130}
              tickFormatter={(v) => v.length > 18 ? v.slice(0, 18) + "…" : v}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="chart-tooltip">
                    <div className="chart-tooltip-label">{d.name}</div>
                    <div className="chart-tooltip-value" style={{ color: "#46d369" }}>
                      💰 ${d.totalAmount.toLocaleString()}
                    </div>
                    <div className="chart-tooltip-value" style={{ color: "rgba(255,255,255,0.5)" }}>
                      📥 {d.topups} lần nạp
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="totalAmount" radius={[0, 6, 6, 0]} maxBarSize={20}>
              {data.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
