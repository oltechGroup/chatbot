//frontend/app/services/api.ts
import axios from 'axios';

// Creamos la instancia de Axios usando la variable de entorno que definimos
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatbotService = {
  // 1. Primer paso: Registrar el nombre y obtener el ID del visitante
  registrarNombre: async (nombre: string) => {
    const response = await api.post('/visitantes/registrar-nombre', { nombre });
    return response.data;
  },

  // 2. Segundo paso: Actualizar país, CP, Ciudad Y LOS NUEVOS CAMPOS (Teléfono, Email, Comentario)
  actualizarDatos: async (id: number, datos: { 
    pais?: string; 
    codigo_postal?: string; 
    ciudad?: string;
    telefono?: string;    
    email?: string;       
    comentario?: string;  
  }) => {
    const response = await api.put(`/visitantes/actualizar/${id}`, datos);
    return response.data;
  },

  // 3. Obtener las categorías principales (Hombro, Rodilla, etc.)
  obtenerCategorias: async () => {
    const response = await api.get('/productos/categorias');
    return response.data;
  },

  // 4. Obtener las subcategorías (Protesis de hombro, etc.)
  obtenerSubcategorias: async (categoriaId: number) => {
    const response = await api.get(`/productos/subcategorias/${categoriaId}`);
    return response.data;
  },

  // 5. Registrar cuando alguien ve o descarga un catálogo
  registrarInteraccion: async (visitanteId: number, subcategoriaId: number, tipoAccion: 'VISTA_SECCION' | 'DESCARGA_CATALOGO') => {
    const response = await api.post('/interacciones/registrar', {
      visitante_id: visitanteId,
      subcategoria_id: subcategoriaId,
      tipo_accion: tipoAccion,
    });
    return response.data;
  },
};

// --- NUEVA ZONA VIP: SERVICIOS DE ADMINISTRACIÓN ---
export const adminService = {
  // 1. Iniciar sesión y obtener el Token de seguridad (JWT)
  login: async (username: string, password: string) => {
    const response = await api.post('/admin/login', { username, password });
    return response.data;
  },

  // 2. Obtener las estadísticas para las gráficas del Dashboard
  getStats: async (token: string) => {
    const response = await api.get('/admin/stats', {
      headers: {
        // Adjuntamos tu credencial de acceso en la cabecera de la petición
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
};

export default api;