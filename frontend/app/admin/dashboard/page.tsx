//frontend/app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Users, FileDown, MapPin, LogOut, Loader2, BarChart3, LayoutDashboard, ListOrdered } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/api';

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('omma_admin_token');
    
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const data = await adminService.getStats(token);
        setStats(data);
      } catch (error) {
        console.error("Error al obtener estadísticas", error);
        sessionStorage.removeItem('omma_admin_token');
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('omma_admin_token');
    router.push('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 size={40} className="animate-spin text-[#0B162C] mb-4" />
        <p className="text-[#0B162C] font-semibold animate-pulse">Cargando panel de control...</p>
      </div>
    );
  }

  const maxDescargas = stats?.productosMasBuscados?.length 
    ? Math.max(...stats.productosMasBuscados.map((p: any) => Number(p.total))) 
    : 1;

  const maxPaises = stats?.ubicacionGeografica?.length 
    ? Math.max(...stats.ubicacionGeografica.map((p: any) => Number(p.total))) 
    : 1;

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
            <div className="hidden md:flex items-center gap-6 border-l border-gray-200 pl-6">
              <button className="flex items-center gap-2 text-sm font-bold text-[#0B162C] bg-slate-100 px-3 py-1.5 rounded-lg">
                <LayoutDashboard size={18} /> Resumen General
              </button>
              <button 
                onClick={() => router.push('/admin/leads')}
                className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0B162C] transition-colors"
              >
                <ListOrdered size={18} /> Registro Detallado
              </button>
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
          <button className="flex-1 flex justify-center items-center gap-2 text-[13px] font-bold text-[#0B162C] bg-white border border-gray-200 py-2 rounded-lg shadow-sm">
            <LayoutDashboard size={16} /> Resumen
          </button>
          <button 
            onClick={() => router.push('/admin/leads')}
            className="flex-1 flex justify-center items-center gap-2 text-[13px] font-semibold text-gray-500 bg-white border border-transparent py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ListOrdered size={16} /> Detalles
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-8 space-y-6 md:space-y-8">
        
        {/* ENCABEZADO Y TARJETA PRINCIPAL (TOTAL LEADS) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-6">
          <div className="bg-[#0B162C] rounded-3xl p-6 md:p-8 flex-1 text-white shadow-xl relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-6 md:p-8 opacity-10">
              <BarChart3 size={100} className="md:w-[120px] md:h-[120px]" />
            </div>
            <p className="text-blue-200 font-semibold uppercase tracking-wider text-xs md:text-sm mb-2 relative z-10 flex items-center gap-2">
              <Users size={16} className="md:w-[18px] md:h-[18px]" /> Total de Leads Captados
            </p>
            <h2 className="text-5xl md:text-7xl font-black relative z-10">{stats?.totalLeads || 0}</h2>
            <p className="text-gray-300 mt-2 relative z-10 text-xs md:text-sm">Doctores registrados en el sistema.</p>
          </div>
        </motion.div>

        {/* GRÁFICAS DE DOS COLUMNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COLUMNA 1: DESCARGAS DE CATÁLOGOS */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-50 text-blue-600 p-2.5 md:p-3 rounded-xl">
                <FileDown size={20} className="md:w-[24px] md:h-[24px]" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[#0B162C]">Catálogos Más Buscados</h3>
            </div>
            
            <div className="space-y-4 md:space-y-5">
              {stats?.productosMasBuscados?.length > 0 ? (
                stats.productosMasBuscados.map((prod: any, idx: number) => (
                  <div key={idx} className="relative">
                    <div className="flex justify-between text-xs md:text-sm font-semibold mb-1.5">
                      <span className="text-gray-700 truncate pr-4">{prod.nombre}</span>
                      <span className="text-[#0B162C]">{prod.total}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 md:h-2.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(Number(prod.total) / maxDescargas) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="bg-[#0B162C] h-2 md:h-2.5 rounded-full"
                      ></motion.div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic">Aún no hay descargas registradas.</p>
              )}
            </div>
          </motion.div>

          {/* COLUMNA 2: UBICACIÓN GEOGRÁFICA */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-50 text-green-600 p-2.5 md:p-3 rounded-xl">
                <MapPin size={20} className="md:w-[24px] md:h-[24px]" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[#0B162C]">Ubicación Geográfica</h3>
            </div>

            <div className="space-y-4 md:space-y-5">
              {stats?.ubicacionGeografica?.length > 0 ? (
                stats.ubicacionGeografica.map((loc: any, idx: number) => (
                  <div key={idx} className="relative">
                    <div className="flex justify-between text-xs md:text-sm font-semibold mb-1.5">
                      <span className="text-gray-700 truncate pr-4">{loc.pais || 'No especificado'}</span>
                      <span className="text-[#0B162C]">{loc.total}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 md:h-2.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(Number(loc.total) / maxPaises) * 100}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="bg-green-500 h-2 md:h-2.5 rounded-full"
                      ></motion.div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic">Aún no hay países registrados.</p>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  );
}