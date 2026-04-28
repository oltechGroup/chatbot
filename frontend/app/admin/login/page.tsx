//frontend/app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, UserRound, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // <-- Aquí agregamos AnimatePresence
import { adminService } from '../../services/api'; // <-- Aquí aplicamos tu ruta corregida

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setErrorMensaje('');
    setIsLoading(true);

    try {
      const response = await adminService.login(username, password);
      
      if (response.token) {
        sessionStorage.setItem('omma_admin_token', response.token);
        router.push('/admin/dashboard');
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        setErrorMensaje('Contraseña incorrecta. Acceso denegado.');
      } else if (error.response && error.response.status === 404) {
        setErrorMensaje('El usuario administrador no existe.');
      } else {
        setErrorMensaje('Hubo un error al intentar conectar con el servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] font-sans relative overflow-hidden px-4">
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0B162C]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-10 z-10 relative"
      >
        <div className="flex justify-center mb-8">
          <div className="relative w-[200px] h-[60px]">
            <Image 
              src="/images/logo_omma.png" 
              alt="OMMA Group Logo" 
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#0B162C]">Acceso Restringido</h1>
          <p className="text-sm text-gray-500 mt-2">Panel de Administración de OMMA Assist</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#0B162C] ml-1">Usuario</label>
            <div className="relative flex items-center">
              <UserRound className="absolute left-4 text-gray-400" size={20} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej. OLTECH"
                required
                disabled={isLoading}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-[#0B162C] focus:bg-white focus:outline-none focus:border-[#0B162C] focus:ring-1 focus:ring-[#0B162C] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#0B162C] ml-1">Contraseña</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-gray-400" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-[#0B162C] focus:bg-white focus:outline-none focus:border-[#0B162C] focus:ring-1 focus:ring-[#0B162C] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <AnimatePresence>
            {errorMensaje && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center font-medium"
              >
                {errorMensaje}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full bg-[#0B162C] hover:bg-[#1E3A5F] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:hover:bg-[#0B162C] disabled:active:scale-100 mt-4 group"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
            &copy; 2026 OMMA Group LLC
          </p>
        </div>
      </motion.div>
    </main>
  );
}