import config from '../config/config.js';

const API_BASE_URL = config.API_BASE_URL;

class EntregaEquipoService {
  
  static async crearEntrega(datosEntrega) {
    try {
      const response = await fetch(`${API_BASE_URL}/entrega-equipo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosEntrega)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al crear entrega');
      }
      
      return data;
    } catch (error) {
      console.error('Error en crearEntrega:', error);
      throw error;
    }
  }
  
  static async obtenerEntregas(filtros = {}) {
    try {
      const queryParams = new URLSearchParams(filtros);
      const response = await fetch(`${API_BASE_URL}/entrega-equipo?${queryParams}`);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener entregas');
      }
      
      return data;
    } catch (error) {
      console.error('Error en obtenerEntregas:', error);
      throw error;
    }
  }
  
  static async obtenerEntregaPorId(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/entrega-equipo/${id}`);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener entrega');
      }
      
      return data;
    } catch (error) {
      console.error('Error en obtenerEntregaPorId:', error);
      throw error;
    }
  }
  
  static async actualizarEntrega(id, datosActualizacion) {
    try {
      const response = await fetch(`${API_BASE_URL}/entrega-equipo/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosActualizacion)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar entrega');
      }
      
      return data;
    } catch (error) {
      console.error('Error en actualizarEntrega:', error);
      throw error;
    }
  }
  
  static async eliminarEntrega(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/entrega-equipo/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar entrega');
      }
      
      return data;
    } catch (error) {
      console.error('Error en eliminarEntrega:', error);
      throw error;
    }
  }
  
  static async generarPDF(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/entrega-equipo/${id}/pdf`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al generar PDF');
      }
      
      return data;
    } catch (error) {
      console.error('Error en generarPDF:', error);
      throw error;
    }
  }
}

export default EntregaEquipoService;