import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';

export default function OrderModal({ 
  order, 
  onClose,
  onUpdate
}: { 
  order: any; 
  onClose: () => void;
  onUpdate: (id: string, updates: any) => void;
}) {
  const { toast } = useToast();
  const [status, setStatus] = useState(order.status);
  const [adminNotes, setAdminNotes] = useState(order.adminNotes || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (adminNotes !== order.adminNotes) {
        onUpdate(order.id, { adminNotes });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [adminNotes, order.id, order.adminNotes, onUpdate]);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    onUpdate(order.id, { status: newStatus });
    toast({ title: "Status Updated", description: `Order ${order.id} marked as ${newStatus}` });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this order? Type 'DELETE' to confirm.")) {
      const orders = JSON.parse(localStorage.getItem('dzair_orders') || '[]');
      const updated = orders.filter((o:any) => o.id !== order.id);
      localStorage.setItem('dzair_orders', JSON.stringify(updated));
      toast({ title: "Order Deleted", description: "Order removed permanently" });
      onClose();
      // force reload
      window.location.reload();
    }
  };

  const buildWAMessage = () => {
    const servicesList = order.services.map((s:any) => '- ' + s.name + ' - $' + s.price).join('\n');
    const msg = `Salam ${order.firstName} ${order.lastName}, your order ${order.id} has been confirmed!\n\nServices ordered:\n${servicesList}\n\nTotal amount: $${order.total}\n\nYour order has been approved and we will start working on it immediately. We will keep you updated on the progress.\n\nThank you for choosing DZAIR STUDIO!\n\nBest regards,\nDZAIR STUDIO Team`;
    return 'https://wa.me/' + order.whatsapp.replace('+', '') + '?text=' + encodeURIComponent(msg);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#0a0a12] border border-[rgba(0,212,255,0.3)] rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <div className="p-6 border-b border-[rgba(0,212,255,0.1)] flex justify-between items-center bg-[#050508]">
          <h2 className="font-[Orbitron] text-3xl font-bold text-[#00d4ff] tracking-widest">{order.id}</h2>
          <div className="flex items-center gap-4">
            <select 
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-[#0a0a12] border border-[rgba(0,212,255,0.2)] rounded px-3 py-1 text-white outline-none focus:border-[#00d4ff] text-sm"
            >
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button onClick={onClose} className="text-[#a0a8b8] hover:text-white p-2">
              <X />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-[Orbitron] text-[#00d4ff] mb-4 tracking-widest">CUSTOMER DETAILS</h3>
              <div className="space-y-3 text-sm text-[#a0a8b8] bg-[#050508] p-4 rounded-lg border border-[rgba(255,255,255,0.05)]">
                <p><span className="text-white w-24 inline-block">Name:</span> {order.firstName} {order.lastName}</p>
                <p><span className="text-white w-24 inline-block">WhatsApp:</span> {order.whatsapp}</p>
                <p><span className="text-white w-24 inline-block">Email:</span> {order.email || 'Not provided'}</p>
                <p><span className="text-white w-24 inline-block">Date:</span> {new Date(order.date).toLocaleString()}</p>
              </div>
            </div>

            <button 
              onClick={() => window.open(buildWAMessage(), '_blank')}
              className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold py-4 rounded-lg flex justify-center items-center gap-3 hover:brightness-110 shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all"
            >
              <FaWhatsapp size={24} />
              CONTACT CUSTOMER ON WHATSAPP
            </button>

            {order.notes && (
              <div>
                <h3 className="text-sm font-[Orbitron] text-[#00d4ff] mb-2 tracking-widest">CUSTOMER NOTES</h3>
                <div className="bg-[#050508] border border-[rgba(255,255,255,0.05)] p-4 rounded-lg text-sm text-[#a0a8b8]">
                  {order.notes}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 flex flex-col">
            <div className="flex-1">
              <h3 className="text-sm font-[Orbitron] text-[#00d4ff] mb-4 tracking-widest">SERVICES ORDERED</h3>
              <div className="bg-[#050508] border border-[rgba(255,255,255,0.05)] rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.05)]">
                    <tr>
                      <th className="p-3 font-normal text-[#a0a8b8]">Service</th>
                      <th className="p-3 font-normal text-[#a0a8b8] text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.services.map((s:any, i:number) => (
                      <tr key={i} className="border-b border-[rgba(255,255,255,0.02)] text-white">
                        <td className="p-3">{s.name} {s.tier && <span className="text-xs text-[#00d4ff] ml-1">({s.tier})</span>}</td>
                        <td className="p-3 text-right">${s.price}</td>
                      </tr>
                    ))}
                    <tr className="bg-[rgba(0,212,255,0.05)] border-t border-[rgba(0,212,255,0.2)]">
                      <td className="p-4 font-bold text-white text-right">TOTAL:</td>
                      <td className="p-4 font-[Orbitron] text-xl font-bold text-[#00d4ff] text-right">${order.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-[Orbitron] text-[#00d4ff] mb-2 tracking-widest">ADMIN NOTES (Auto-saves)</h3>
              <textarea 
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add private notes about this order..."
                className="w-full bg-[#050508] border border-[rgba(255,255,255,0.1)] rounded-lg p-3 text-white text-sm outline-none focus:border-[#00d4ff] h-32 resize-none"
              />
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-[rgba(0,212,255,0.1)] bg-[#050508] flex gap-4 flex-wrap">
          {status !== 'In Progress' && (
            <button onClick={() => handleStatusChange('In Progress')} className="px-6 py-2 bg-[rgba(0,102,255,0.1)] text-[#0066ff] border border-[#0066ff] rounded hover:bg-[#0066ff] hover:text-white transition-colors text-sm font-bold tracking-wider">
              MARK IN PROGRESS
            </button>
          )}
          {status !== 'Completed' && (
            <button onClick={() => handleStatusChange('Completed')} className="px-6 py-2 bg-[rgba(0,255,136,0.1)] text-[#00ff88] border border-[#00ff88] rounded hover:bg-[#00ff88] hover:text-black transition-colors text-sm font-bold tracking-wider">
              MARK COMPLETED
            </button>
          )}
          {status !== 'Cancelled' && (
            <button onClick={() => handleStatusChange('Cancelled')} className="px-6 py-2 bg-[rgba(255,68,68,0.1)] text-[#ff4444] border border-[#ff4444] rounded hover:bg-[#ff4444] hover:text-white transition-colors text-sm font-bold tracking-wider">
              MARK CANCELLED
            </button>
          )}
          <div className="flex-1"></div>
          <button onClick={handleDelete} className="px-6 py-2 bg-transparent text-[#5a6070] border border-[#5a6070] rounded hover:bg-[#ff4444] hover:text-white hover:border-[#ff4444] transition-colors text-sm">
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
}
