//frontend/app/admin/leads/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogOut, Loader2, ArrowLeft, Search, User, MapPin, Mail, Phone, FileText, MessageSquareQuote, Calendar, LayoutDashboard, ListOrdered } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/api';

export default function LeadsDetail() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('omma_admin_token');
    
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const fetchLeads = async () => {
      try {
        const data = await adminService.getLeadsDetails(token);
        setLeads(data);
      } catch (error) {
        console.error("Error al obtener detalle de leads", error);
        sessionStorage.removeItem('omma_admin_token');
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('omma_admin_token');
    router.push('/admin/login');
  };

  // 1. AGRUPACIÓN INTELIGENTE ACTUALIZADA (Ahora separa PDFs y Solicitudes)
  const groupedLeads = Object.values(leads.reduce((acc: any, lead) => {
    if (!acc[lead.visitante_id]) {
      acc[lead.visitante_id] = {
        ...lead,
        productos_descargados: [],
        solicitudes_especiales: [] // Nueva bolsita para citas y talleres
      };
    }
    
    // Si la fila actual trae un catálogo, lo metemos a su bolsita
    if (lead.producto_descargado && !acc[lead.visitante_id].productos_descargados.includes(lead.producto_descargado)) {
      acc[lead.visitante_id].productos_descargados.push(lead.producto_descargado);
    }

    // Si la fila actual trae una acción especial, la metemos a su bolsita
    if (lead.tipo_accion && ['AGENDAR_TALLER', 'AGENDAR_CITA', 'SOPORTE_TELEFONICO'].includes(lead.tipo_accion)) {
      if (!acc[lead.visitante_id].solicitudes_especiales.includes(lead.tipo_accion)) {
        acc[lead.visitante_id].solicitudes_especiales.push(lead.tipo_accion);
      }
    }
    
    return acc;
  }, {})).sort((a: any, b: any) => {
    return new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime();
  });

  // 2. FILTRADO DINÁMICO
  const filteredLeads = groupedLeads.filter((lead: any) => {
    const search = searchTerm.toLowerCase();
    
    const matchesName = lead.visitante_nombre && lead.visitante_nombre.toLowerCase().includes(search);
    const matchesEmail = lead.email && lead.email.toLowerCase().includes(search);
    const matchesPais = lead.pais && lead.pais.toLowerCase().includes(search);
    const matchesProducto = lead.productos_descargados.some((prod: string) => prod.toLowerCase().includes(search));
    const matchesEspecial = lead.solicitudes_especiales.some((sol: string) => sol.toLowerCase().replace('_', ' ').includes(search));

    return matchesName || matchesEmail || matchesPais || matchesProducto || matchesEspecial;
  });

  // Formateador de fechas
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('es-MX', options);
  };

  // Traductor de código a texto legible
  const formatearSolicitud = (codigo: string) => {
    switch (codigo) {
      case 'AGENDAR_TALLER': return 'Taller Solicitado';
      case 'AGENDAR_CITA': return 'Cita Solicitada';
      case 'SOPORTE_TELEFONICO': return 'Pidió Llamada';
      default: return codigo;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 size={40} className="animate-spin text-[#0B162C] mb-4" />
        <p className="text-[#0B162C] font-semibold animate-pulse">Organizando base de datos...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans pb-12">
      {/* CABECERA RESPONSIVA INTELIGENTE */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        {/* Fila 1: Logo y Cerrar Sesión (Siempre visibles arriba) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="relative w-[150px] h-[45px] md:w-[180px] md:h-[50px]">
              <Image 
                src="/images/logo_omma.png" 
                alt="OMMA Group Logo" 
                fill 
                priority 
                sizes="(max-width: 768px) 150px, 180px"
                className="object-contain object-left" 
              />
            </div>
            
            {/* Navegación Desktop (Oculta en móvil) */}
            <div className="hidden md:flex items-center gap-4 border-l border-gray-200 pl-6">
              <button 
                onClick={() => router.push('/admin/dashboard')}
                className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0B162C] transition-colors"
              >
                <ArrowLeft size={18} /> Volver al Resumen
              </button>
              <span className="text-gray-300">|</span>
              <span className="text-sm font-bold text-[#0B162C] bg-slate-100 px-3 py-1.5 rounded-lg">
                Registro Detallado
              </span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 p-2 md:px-4 md:py-2 rounded-lg transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
            <span className="hidden md:inline">Cerrar Sesión</span>
          </button>
        </div>

        {/* Fila 2: Sub-menú Móvil (Solo visible en celulares) */}
        <div className="md:hidden bg-slate-50 border-t border-gray-100 px-4 py-3 flex gap-2">
          <button 
            onClick={() => router.push('/admin/dashboard')}
            className="flex-1 flex justify-center items-center gap-2 text-[13px] font-semibold text-gray-500 bg-white border border-transparent py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LayoutDashboard size={16} /> Resumen
          </button>
          <button className="flex-1 flex justify-center items-center gap-2 text-[13px] font-bold text-[#0B162C] bg-white border border-gray-200 py-2 rounded-lg shadow-sm">
            <ListOrdered size={16} /> Detalles
          </button>
        </div>
      </header>

      <div className="max-w-[95%] mx-auto mt-6 md:mt-8 space-y-6">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="w-full md:w-auto">
            <h1 className="text-2xl md:text-3xl font-black text-[#0B162C]">Base de Datos de Prospectos</h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">Lista completa agrupada por visitante y sus interacciones con el catálogo.</p>
          </div>
          
          <div className="w-full md:w-96 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, correo, país o producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B162C] shadow-sm transition-shadow"
            />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0B162C] text-white text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold whitespace-nowrap"><div className="flex items-center gap-2"><User size={16}/> Visitante</div></th>
                  <th className="p-4 font-semibold whitespace-nowrap"><div className="flex items-center gap-2"><MapPin size={16}/> Ubicación</div></th>
                  <th className="p-4 font-semibold whitespace-nowrap"><div className="flex items-center gap-2"><Mail size={16}/> Contacto</div></th>
                  <th className="p-4 font-semibold"><div className="flex items-center gap-2"><FileText size={16}/> Intereses y Solicitudes</div></th>
                  <th className="p-4 font-semibold whitespace-nowrap"><div className="flex items-center gap-2"><MessageSquareQuote size={16}/> Comentarios</div></th>
                  <th className="p-4 font-semibold whitespace-nowrap"><div className="flex items-center gap-2"><Calendar size={16}/> Fecha Registro</div></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-[#0B162C] whitespace-nowrap">
                        {lead.visitante_nombre}
                      </td>
                      <td className="p-4 text-gray-600 whitespace-nowrap">
                        {lead.ciudad ? `${lead.ciudad}, ` : ''}{lead.pais || '-'} <br/>
                        <span className="text-xs text-gray-400">CP: {lead.codigo_postal || 'N/A'}</span>
                      </td>
                      <td className="p-4 text-gray-600 whitespace-nowrap">
                        {lead.email && <div className="flex items-center gap-1.5"><Mail size={14} className="text-gray-400"/> {lead.email}</div>}
                        {lead.telefono && <div className="flex items-center gap-1.5 mt-1"><Phone size={14} className="text-gray-400"/> {lead.telefono}</div>}
                        {!lead.email && !lead.telefono && <span className="text-gray-400 italic">No proporcionado</span>}
                      </td>
                      
                      {/* COLUMNA DE INTERESES (Combina PDFs y Solicitudes) */}
                      <td className="p-4 min-w-[250px]">
                        <div className="flex flex-col gap-2">
                          
                          {/* 1. Dibujamos las Solicitudes Especiales (Naranjas) */}
                          {lead.solicitudes_especiales?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {lead.solicitudes_especiales.map((sol: string, i: number) => (
                                <span key={`sol-${i}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200 shadow-sm">
                                  🔥 {formatearSolicitud(sol)}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* 2. Dibujamos los PDFs Descargados (Azules) */}
                          {lead.productos_descargados?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {lead.productos_descargados.map((prod: string, i: number) => (
                                <span key={`prod-${i}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                  📄 {prod}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* 3. Si no hizo nada de lo anterior */}
                          {lead.productos_descargados?.length === 0 && lead.solicitudes_especiales?.length === 0 && (
                            <span className="w-fit text-gray-400 italic bg-gray-100 px-2.5 py-1 rounded-full text-[11px]">Solo navegó por el menú</span>
                          )}

                        </div>
                      </td>

                      <td className="p-4 text-gray-700 max-w-xs truncate" title={lead.comentario}>
                        {lead.comentario || <span className="text-gray-400 italic">Sin comentarios</span>}
                      </td>
                      <td className="p-4 text-gray-500 whitespace-nowrap text-xs font-medium">
                        {formatDate(lead.fecha_registro)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No se encontraron registros que coincidan con tu búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </main>
  );
}