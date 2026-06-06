import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { Eye, ArrowUpDown } from 'lucide-react';

export default function OrdersTable({ 
  orders, 
  onView 
}: { 
  orders: any[]; 
  onView: (order: any) => void;
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  
  const filtered = orders.filter(o => {
    const matchesSearch = (o.id + o.firstName + o.lastName).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const factor = sortAsc ? 1 : -1;
    if (sortField === 'date') return (new Date(a.date).getTime() - new Date(b.date).getTime()) * factor;
    if (sortField === 'total') return (a.total - b.total) * factor;
    return 0;
  });

  const paginated = filtered.slice((page - 1) * 10, page * 10);
  const totalPages = Math.ceil(filtered.length / 10);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'New': return <span className="px-2 py-1 rounded text-xs border border-[#ffaa00] text-[#ffaa00] bg-[rgba(255,170,0,0.2)]">New</span>;
      case 'In Progress': return <span className="px-2 py-1 rounded text-xs border border-[#0066ff] text-[#0066ff] bg-[rgba(0,102,255,0.2)]">In Progress</span>;
      case 'Completed': return <span className="px-2 py-1 rounded text-xs border border-[#00ff88] text-[#00ff88] bg-[rgba(0,255,136,0.2)]">Completed</span>;
      case 'Cancelled': return <span className="px-2 py-1 rounded text-xs border border-[#ff4444] text-[#ff4444] bg-[rgba(255,68,68,0.2)]">Cancelled</span>;
      default: return null;
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  return (
    <div className="bg-[rgba(10,10,25,0.85)] border border-[rgba(0,212,255,0.2)] rounded-xl overflow-hidden backdrop-blur-[20px]">
      <div className="p-4 border-b border-[rgba(0,212,255,0.1)] flex flex-col md:flex-row gap-4 justify-between">
        <input 
          type="text" 
          placeholder="Search by name or ID..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#050508] border border-[rgba(0,212,255,0.2)] rounded px-4 py-2 text-white outline-none focus:border-[#00d4ff] md:w-64"
        />
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#050508] border border-[rgba(0,212,255,0.2)] rounded px-4 py-2 text-white outline-none focus:border-[#00d4ff]"
        >
          <option value="all">All Statuses</option>
          <option value="New">New</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#a0a8b8]">
          <thead className="bg-[#050508] text-white font-[Orbitron] text-xs tracking-wider border-b border-[rgba(0,212,255,0.1)]">
            <tr>
              <th className="p-4">ORDER ID</th>
              <th className="p-4">CUSTOMER</th>
              <th className="p-4">WHATSAPP</th>
              <th className="p-4">SERVICES</th>
              <th className="p-4 cursor-pointer hover:text-[#00d4ff]" onClick={() => handleSort('total')}>
                <div className="flex items-center gap-1">TOTAL <ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4 cursor-pointer hover:text-[#00d4ff]" onClick={() => handleSort('date')}>
                <div className="flex items-center gap-1">DATE <ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4">STATUS</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((order, idx) => (
              <tr key={order.id} className={`border-b border-[rgba(0,212,255,0.05)] hover:bg-[rgba(0,212,255,0.05)] hover:border-l-[3px] hover:border-l-[#00d4ff] transition-colors ${idx % 2 === 0 ? 'bg-[#0a0a12]' : 'bg-[#050508]'}`}>
                <td className="p-4 font-mono text-[#00d4ff]">{order.id}</td>
                <td className="p-4 text-white">{order.firstName} {order.lastName}</td>
                <td className="p-4">
                  <a href={`https://wa.me/${order.whatsapp.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#00ff88] hover:underline">
                    <FaWhatsapp /> {order.whatsapp}
                  </a>
                </td>
                <td className="p-4 max-w-[200px] truncate" title={order.services.map((s:any)=>s.name).join(', ')}>
                  {order.services.map((s:any)=>s.name).join(', ')}
                </td>
                <td className="p-4 font-bold text-white">${order.total}</td>
                <td className="p-4">{new Date(order.date).toLocaleDateString()}</td>
                <td className="p-4">{getStatusBadge(order.status)}</td>
                <td className="p-4 text-right">
                  <button onClick={() => onView(order)} className="p-2 bg-[rgba(0,212,255,0.1)] text-[#00d4ff] rounded hover:bg-[#00d4ff] hover:text-black transition-colors">
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-[#5a6070]">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="p-4 border-t border-[rgba(0,212,255,0.1)] flex justify-between items-center bg-[#050508]">
          <span className="text-sm text-[#a0a8b8]">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border border-[rgba(0,212,255,0.2)] rounded text-[#a0a8b8] hover:text-white disabled:opacity-50"
            >
              Prev
            </button>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border border-[rgba(0,212,255,0.2)] rounded text-[#a0a8b8] hover:text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
