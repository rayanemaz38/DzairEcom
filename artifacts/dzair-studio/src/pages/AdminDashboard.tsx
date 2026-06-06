import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, Bell, Clock, CheckCircle2, List, Settings, LogOut,
  FileText, TrendingUp, Download, Trash2, Menu, X, Wrench
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import OrdersTable from "@/components/OrdersTable";
import OrderModal from "@/components/OrderModal";

type Order = {
  id: string; firstName: string; lastName: string; whatsapp: string;
  email?: string; services: { name: string; price: number; tier?: string }[];
  total: number; notes?: string; status: string; date: string; adminNotes?: string;
};

type Page = "overview" | "new" | "progress" | "completed" | "all" | "settings" | "config";

const STATUS_COLORS: Record<string, string> = {
  New: "#ffaa00", "In Progress": "#0066ff", Completed: "#00ff88", Cancelled: "#ff4444",
};

function StatCard({ label, value, icon: Icon, color, pulse }: { label: string; value: string | number; icon: any; color: string; pulse?: boolean }) {
  return (
    <div className="bg-[rgba(10,10,25,0.85)] backdrop-blur-[20px] border border-[rgba(0,212,255,0.15)] rounded-xl p-6 flex items-center gap-5">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}40` }}>
        <Icon size={28} style={{ color }} className={pulse ? "animate-pulse-badge" : ""} />
      </div>
      <div>
        <p className="text-[#a0a8b8] text-xs uppercase tracking-wider font-[Orbitron] mb-1">{label}</p>
        <p className="font-[Orbitron] text-2xl font-bold" style={{ color }}>{value}</p>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, badge, onClick }: { icon: any; label: string; active: boolean; badge?: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-[Orbitron] tracking-wider relative ${active ? "bg-[rgba(0,212,255,0.1)] border-l-2 border-[#00d4ff] text-[#00d4ff]" : "text-[#a0a8b8] hover:text-white hover:bg-[rgba(255,255,255,0.03)]"}`}
    >
      <Icon size={18} />
      <span className="text-xs">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto w-5 h-5 rounded-full bg-[#ffaa00] text-black text-[10px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function AdminDashboard() {
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem("dzair_admin") === "true");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [shake, setShake] = useState(false);
  const [page, setPage] = useState<Page>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [time, setTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [serviceSettings, setServiceSettings] = useState(() =>
    JSON.parse(localStorage.getItem("dzair_service_settings") || '{"landingPages":true,"ecommerceStores":true,"aiImages":true,"aiVideos":true}')
  );
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [clearText, setClearText] = useState("");
  const [showClearModal, setShowClearModal] = useState(false);

  const loadOrders = useCallback(() => {
    setOrders(JSON.parse(localStorage.getItem("dzair_orders") || "[]"));
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPw = localStorage.getItem("dzair_admin_password") || "dzair2026";
    if (password === storedPw) {
      sessionStorage.setItem("dzair_admin", "true");
      setLoggedIn(true);
    } else {
      setLoginError("Access denied. Invalid password.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("dzair_admin");
    setLoggedIn(false);
  };

  const updateOrder = useCallback((id: string, updates: Partial<Order>) => {
    const stored = JSON.parse(localStorage.getItem("dzair_orders") || "[]");
    const updated = stored.map((o: Order) => o.id === id ? { ...o, ...updates } : o);
    localStorage.setItem("dzair_orders", JSON.stringify(updated));
    setOrders(updated);
    if (selectedOrder?.id === id) setSelectedOrder((prev) => prev ? { ...prev, ...updates } : prev);
  }, [selectedOrder]);

  const newCount = orders.filter((o) => o.status === "New").length;

  // Analytics
  const now = new Date();
  const monthOrders = orders.filter((o) => {
    const d = new Date(o.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonthOrders = orders.filter((o) => {
    const d = new Date(o.date);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });
  const monthRevenue = monthOrders.reduce((s, o) => s + o.total, 0);
  const lastRevenue = lastMonthOrders.reduce((s, o) => s + o.total, 0);
  const revChange = lastRevenue ? ((monthRevenue - lastRevenue) / lastRevenue * 100).toFixed(1) : "+∞";

  const revenueChart = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const rev = orders.filter((o) => {
      const od = new Date(o.date);
      return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
    }).reduce((s, o) => s + o.total, 0);
    return { month: d.toLocaleString("default", { month: "short" }), revenue: rev };
  });

  const statusChart = [
    { name: "New", value: orders.filter((o) => o.status === "New").length, color: "#ffaa00" },
    { name: "In Progress", value: orders.filter((o) => o.status === "In Progress").length, color: "#0066ff" },
    { name: "Completed", value: orders.filter((o) => o.status === "Completed").length, color: "#00ff88" },
    { name: "Cancelled", value: orders.filter((o) => o.status === "Cancelled").length, color: "#ff4444" },
  ].filter((s) => s.value > 0);

  const exportCSV = () => {
    const csv = [
      "ID,First Name,Last Name,WhatsApp,Email,Services,Total,Status,Date,Notes",
      ...orders.map((o) => [o.id, o.firstName, o.lastName, o.whatsapp, o.email || "", o.services.map((s) => s.name).join(";"), o.total, o.status, o.date, o.notes || ""].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `dzair_orders_${now.toISOString().split("T")[0]}.csv`; a.click();
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(orders, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `dzair_orders_${now.toISOString().split("T")[0]}.json`; a.click();
  };

  const toggleService = (key: string) => {
    const next = { ...serviceSettings, [key]: !serviceSettings[key] };
    setServiceSettings(next);
    localStorage.setItem("dzair_service_settings", JSON.stringify(next));
  };

  const handlePwChange = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPw = localStorage.getItem("dzair_admin_password") || "dzair2026";
    if (pwForm.current !== storedPw) { setPwMsg("error:Current password is incorrect"); return; }
    if (pwForm.next !== pwForm.confirm) { setPwMsg("error:New passwords do not match"); return; }
    localStorage.setItem("dzair_admin_password", pwForm.next);
    setPwMsg("success:Password updated successfully!");
    setPwForm({ current: "", next: "", confirm: "" });
  };

  const filteredOrders = (status?: string) =>
    status ? orders.filter((o) => o.status === status) : orders;

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center p-4">
        <div className={`bg-[#0a0a12] border border-[rgba(0,212,255,0.2)] rounded-2xl p-10 w-full max-w-md text-center ${shake ? "animate-shake" : ""}`}>
          <img src="/dzair-logo.png" alt="Logo" className="w-20 h-20 rounded-full border-2 border-[#00d4ff] mx-auto mb-6 object-cover" />
          <h1 className="font-[Orbitron] text-[#00d4ff] text-2xl tracking-widest mb-2">DZAIR STUDIO</h1>
          <p className="text-[#a0a8b8] text-sm mb-8 tracking-wider font-[Orbitron] text-xs">ADMIN ACCESS</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setLoginError(""); }}
              placeholder="Enter password..."
              className="w-full bg-[#050508] border border-[rgba(0,212,255,0.2)] text-white px-4 py-3 rounded-lg outline-none focus:border-[#00d4ff] text-center tracking-[4px]"
            />
            {loginError && <p className="text-[#ff4444] text-sm">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-black font-[Orbitron] font-bold py-3 rounded-lg tracking-wider hover:brightness-110 transition-all"
            >
              ENTER DASHBOARD
            </button>
          </form>
        </div>
      </div>
    );
  }

  const PAGE_LABELS: Record<Page, string> = {
    overview: "DASHBOARD OVERVIEW", new: "NEW ORDERS", progress: "IN PROGRESS",
    completed: "COMPLETED ORDERS", all: "ALL ORDERS", settings: "SERVICE SETTINGS", config: "SETTINGS",
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-[rgba(0,212,255,0.1)] flex items-center gap-3">
        <img src="/dzair-logo.png" alt="Logo" className="w-10 h-10 rounded-full border border-[#00d4ff] object-cover" />
        <div>
          <div className="font-[Orbitron] text-[#00d4ff] text-sm font-bold tracking-wider">DZAIR STUDIO</div>
          <span className="text-[10px] font-bold text-[#ffaa00] tracking-wider">ADMIN PANEL</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <SidebarItem icon={LayoutDashboard} label="DASHBOARD" active={page === "overview"} onClick={() => { setPage("overview"); setSidebarOpen(false); }} />
        <SidebarItem icon={Bell} label="NEW ORDERS" active={page === "new"} badge={newCount} onClick={() => { setPage("new"); setSidebarOpen(false); }} />
        <SidebarItem icon={Clock} label="IN PROGRESS" active={page === "progress"} onClick={() => { setPage("progress"); setSidebarOpen(false); }} />
        <SidebarItem icon={CheckCircle2} label="COMPLETED" active={page === "completed"} onClick={() => { setPage("completed"); setSidebarOpen(false); }} />
        <SidebarItem icon={List} label="ALL ORDERS" active={page === "all"} onClick={() => { setPage("all"); setSidebarOpen(false); }} />
        <div className="my-2 border-t border-[rgba(0,212,255,0.08)]" />
        <SidebarItem icon={Wrench} label="SERVICE SETTINGS" active={page === "settings"} onClick={() => { setPage("settings"); setSidebarOpen(false); }} />
        <SidebarItem icon={Settings} label="SETTINGS" active={page === "config"} onClick={() => { setPage("config"); setSidebarOpen(false); }} />
      </nav>
      <div className="p-4 border-t border-[rgba(0,212,255,0.1)]">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[#ff4444] hover:bg-[rgba(255,68,68,0.1)] rounded-lg transition-colors text-sm font-[Orbitron] tracking-wider">
          <LogOut size={18} />
          <span className="text-xs">LOGOUT</span>
        </button>
        <p className="text-center text-[10px] text-[#5a6070] mt-3">
          <a href="mailto:collabaidzair@proton.me" className="hover:text-[#00d4ff] transition-colors">collabaidzair@proton.me</a>
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050508] text-white flex">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex w-[260px] bg-[#0a0a0f] border-r border-[rgba(0,212,255,0.1)] flex-col fixed top-0 bottom-0 left-0 z-40">
        {sidebar}
      </aside>

      {/* SIDEBAR MOBILE */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-[#0a0a0f] border-r border-[rgba(0,212,255,0.1)] flex flex-col">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-[#a0a8b8]">
              <X size={24} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* MAIN */}
      <main className="flex-1 md:ml-[260px] flex flex-col min-h-screen">
        {/* TOP BAR */}
        <div className="sticky top-0 z-30 bg-[rgba(5,5,8,0.95)] backdrop-blur-[15px] border-b border-[rgba(0,212,255,0.1)] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-[#00d4ff]" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="font-[Orbitron] text-sm md:text-base font-bold tracking-widest text-white">
              {PAGE_LABELS[page]}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#5a6070] text-xs hidden sm:block">
              {time.toLocaleDateString()} {time.toLocaleTimeString()}
            </span>
            {newCount > 0 && (
              <div className="relative">
                <Bell size={20} className="text-[#ffaa00]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ffaa00] text-black text-[8px] font-bold flex items-center justify-center">
                  {newCount}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">

          {/* OVERVIEW */}
          {page === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard label="Total Orders" value={orders.length} icon={FileText} color="#00d4ff" />
                <StatCard label="New Orders" value={newCount} icon={Bell} color="#ffaa00" pulse={newCount > 0} />
                <StatCard label="Completed" value={orders.filter((o) => o.status === "Completed").length} icon={CheckCircle2} color="#00ff88" />
                <StatCard label="Revenue This Month" value={`$${monthRevenue}`} icon={TrendingUp} color="#00d4ff" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Revenue Bar Chart */}
                <div className="lg:col-span-3 bg-[rgba(10,10,25,0.85)] border border-[rgba(0,212,255,0.15)] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-[Orbitron] text-sm tracking-widest text-white">REVENUE OVERVIEW</h3>
                    <span className="text-[#a0a8b8] text-xs">Last 6 months</span>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={revenueChart} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                      <XAxis dataKey="month" tick={{ fill: "#a0a8b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#a0a8b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#0a0a12", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 8, color: "#fff" }}
                        formatter={(v: number) => [`$${v}`, "Revenue"]}
                      />
                      <Bar dataKey="revenue" fill="#00d4ff" radius={[4, 4, 0, 0]} opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Status Donut */}
                <div className="lg:col-span-2 bg-[rgba(10,10,25,0.85)] border border-[rgba(0,212,255,0.15)] rounded-xl p-6">
                  <h3 className="font-[Orbitron] text-sm tracking-widest text-white mb-6">ORDER STATUS</h3>
                  {statusChart.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={statusChart}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          dataKey="value"
                          stroke="none"
                        >
                          {statusChart.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: "#0a0a12", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 8, color: "#fff" }}
                        />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#a0a8b8" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-40 text-[#5a6070] text-sm">No orders yet</div>
                  )}
                  <div className="text-center mt-2">
                    <span className="font-[Orbitron] text-3xl font-bold text-white">{orders.length}</span>
                    <p className="text-[#a0a8b8] text-xs mt-1">Total Orders</p>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-[Orbitron] text-sm tracking-widest text-white">RECENT ORDERS</h3>
                  <button onClick={() => setPage("all")} className="text-[#00d4ff] text-xs hover:underline font-[Orbitron] tracking-wider">
                    VIEW ALL
                  </button>
                </div>
                <OrdersTable
                  orders={orders.slice(-5).reverse()}
                  onView={(o) => setSelectedOrder(o)}
                />
              </div>
            </div>
          )}

          {/* ORDERS PAGES */}
          {(page === "all" || page === "new" || page === "progress" || page === "completed") && (
            <div>
              <div className="flex justify-end mb-4 gap-2">
                <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 border border-[rgba(0,212,255,0.3)] text-[#00d4ff] text-xs rounded hover:bg-[rgba(0,212,255,0.1)] transition-colors font-[Orbitron] tracking-wider">
                  <Download size={14} /> CSV
                </button>
              </div>
              <OrdersTable
                orders={filteredOrders(page === "new" ? "New" : page === "progress" ? "In Progress" : page === "completed" ? "Completed" : undefined)}
                onView={(o) => setSelectedOrder(o)}
              />
            </div>
          )}

          {/* SERVICE SETTINGS */}
          {page === "settings" && (
            <div className="max-w-2xl space-y-4">
              {[
                { key: "landingPages", label: "CUSTOM LANDING PAGES", desc: "Enable or disable landing page orders from the public site" },
                { key: "ecommerceStores", label: "E-COMMERCE STORES", desc: "Enable or disable e-commerce store orders from the public site" },
                { key: "aiImages", label: "AI PRODUCT PHOTOGRAPHY", desc: "Enable or disable AI image orders from the public site" },
                { key: "aiVideos", label: "AI VIDEO ADVERTISING", desc: "Enable or disable AI video orders from the public site" },
              ].map((svc) => {
                const on = serviceSettings[svc.key];
                return (
                  <div key={svc.key} className="bg-[rgba(10,10,25,0.85)] border border-[rgba(0,212,255,0.15)] rounded-xl p-6 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-[Orbitron] text-sm font-bold text-white tracking-wider mb-1">{svc.label}</h4>
                      <p className="text-[#a0a8b8] text-sm">{svc.desc}</p>
                      <p className={`text-xs font-bold font-[Orbitron] tracking-wider mt-2 ${on ? "text-[#00ff88]" : "text-[#ff4444]"}`}>
                        {on ? "ACTIVE" : "DISABLED"}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleService(svc.key)}
                      className={`toggle-switch ${on ? "on" : ""} shrink-0`}
                      aria-label={`Toggle ${svc.label}`}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* SETTINGS / CONFIG */}
          {page === "config" && (
            <div className="max-w-2xl space-y-8">
              {/* Change Password */}
              <div className="bg-[rgba(10,10,25,0.85)] border border-[rgba(0,212,255,0.15)] rounded-xl p-6">
                <h3 className="font-[Orbitron] text-sm font-bold text-white tracking-widest mb-6">CHANGE PASSWORD</h3>
                <form onSubmit={handlePwChange} className="space-y-4">
                  {["current", "next", "confirm"].map((field) => (
                    <div key={field}>
                      <label className="block text-xs text-[#a0a8b8] mb-1 uppercase tracking-wider">
                        {field === "current" ? "Current Password" : field === "next" ? "New Password" : "Confirm New Password"}
                      </label>
                      <input
                        type="password"
                        value={pwForm[field as keyof typeof pwForm]}
                        onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                        className="w-full bg-[#050508] border border-[rgba(0,212,255,0.2)] rounded px-4 py-2 text-white outline-none focus:border-[#00d4ff]"
                      />
                    </div>
                  ))}
                  {pwMsg && (
                    <p className={`text-sm ${pwMsg.startsWith("success") ? "text-[#00ff88]" : "text-[#ff4444]"}`}>
                      {pwMsg.split(":")[1]}
                    </p>
                  )}
                  <button type="submit" className="font-[Orbitron] text-xs tracking-wider px-6 py-2.5 bg-[#00d4ff] text-black font-bold rounded hover:brightness-110 transition-all">
                    UPDATE PASSWORD
                  </button>
                </form>
              </div>

              {/* Data Management */}
              <div className="bg-[rgba(10,10,25,0.85)] border border-[rgba(0,212,255,0.15)] rounded-xl p-6">
                <h3 className="font-[Orbitron] text-sm font-bold text-white tracking-widest mb-6">DATA MANAGEMENT</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={exportJSON} className="flex items-center gap-2 px-5 py-2.5 border border-[rgba(0,212,255,0.3)] text-[#00d4ff] text-xs rounded hover:bg-[rgba(0,212,255,0.1)] transition-colors font-[Orbitron] tracking-wider">
                    <Download size={14} /> EXPORT JSON
                  </button>
                  <button onClick={exportCSV} className="flex items-center gap-2 px-5 py-2.5 border border-[rgba(0,212,255,0.3)] text-[#00d4ff] text-xs rounded hover:bg-[rgba(0,212,255,0.1)] transition-colors font-[Orbitron] tracking-wider">
                    <Download size={14} /> EXPORT CSV
                  </button>
                  <button onClick={() => setShowClearModal(true)} className="flex items-center gap-2 px-5 py-2.5 border border-[#ff4444] text-[#ff4444] text-xs rounded hover:bg-[rgba(255,68,68,0.1)] transition-colors font-[Orbitron] tracking-wider">
                    <Trash2 size={14} /> CLEAR ALL DATA
                  </button>
                </div>
              </div>

              {/* About */}
              <div className="bg-[rgba(10,10,25,0.85)] border border-[rgba(0,212,255,0.15)] rounded-xl p-6 space-y-2 text-sm">
                <h3 className="font-[Orbitron] text-sm font-bold text-white tracking-widest mb-4">ABOUT</h3>
                {[
                  ["Version", "1.0.0"],
                  ["Built by", "DZAIR STUDIO"],
                  ["Support", "collabaidzair@proton.me"],
                  ["Last updated", "June 2026"],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3 text-[#a0a8b8]">
                    <span className="text-white w-28">{k}:</span>
                    {k === "Support" ? (
                      <a href={`mailto:${v}`} className="hover:text-[#00d4ff] transition-colors">{v}</a>
                    ) : (
                      <span>{v}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ORDER MODAL */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => { setSelectedOrder(null); loadOrders(); }}
          onUpdate={updateOrder}
        />
      )}

      {/* CLEAR DATA MODAL */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a12] border border-[#ff4444] rounded-xl p-8 w-full max-w-md">
            <h3 className="font-[Orbitron] text-xl font-bold text-[#ff4444] mb-4">DELETE ALL DATA?</h3>
            <p className="text-[#a0a8b8] text-sm mb-6">This will permanently delete all orders and settings. This action cannot be undone.</p>
            <p className="text-xs text-[#a0a8b8] mb-2">Type <strong className="text-white">DELETE</strong> to confirm:</p>
            <input
              type="text"
              value={clearText}
              onChange={(e) => setClearText(e.target.value)}
              className="w-full bg-[#050508] border border-[rgba(255,68,68,0.4)] rounded px-4 py-2 text-white outline-none focus:border-[#ff4444] mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowClearModal(false); setClearText(""); }} className="flex-1 py-2 border border-[rgba(255,255,255,0.2)] text-[#a0a8b8] rounded hover:text-white transition-colors">
                CANCEL
              </button>
              <button
                disabled={clearText !== "DELETE"}
                onClick={() => {
                  localStorage.removeItem("dzair_orders");
                  localStorage.removeItem("dzair_order_counter");
                  setOrders([]);
                  setShowClearModal(false);
                  setClearText("");
                }}
                className="flex-1 py-2 bg-[#ff4444] text-white font-bold rounded hover:bg-[#ff6666] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                DELETE EVERYTHING
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
