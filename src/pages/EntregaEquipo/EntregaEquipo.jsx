import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Calendar, Printer, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { generarPDFEntrega } from '../../utils/pdfGenerator';
import EntregaEquipoService from '../../services/EntregaEquipoService';
import './EntregaEquipo.css';
import Signer from '../../components/Signer/SignerClean';

const UBICACIONES = ['Tienda', 'Fabrica'];
const SERVICIOS = ['Mantenimiento', 'Equipo Nuevo', 'Asignacion de equipo'];

const EQUIPOS_BASE = [
  'CPU', 'Monitor', 'Teclado', 'Mouse', 'Impresora', 
  'Impresora Tickets', 'Impresora Laser', 'No brake', 'Fax',
  'Lector de huella', 'Lector de codigo de barras', 'Lector de banda magnetica',
  'Cajon de dinero', 'Telefono Linea 1', 'Telefono Linea 2', 
  'Modem', 'Camara WEB'
];

const EntregaEquipo = ({ usuario }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      fecha: format(new Date(), 'yyyy-MM-dd'),
      ubicacion: '',
      servicioRealizado: '',
      equipos: EQUIPOS_BASE.map(desc => ({
        descripcion: desc,
        marca: '',
        modelo: '',
        serie: ''
      })),
      credenciales: { usuario: '', password: '' }
    }
  });

  const [equipos, setEquipos] = useState(
    EQUIPOS_BASE.map(desc => ({
      descripcion: desc,
      marca: '',
      modelo: '',
      serie: ''
    }))
  );
  
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const ubicacion = watch('ubicacion');
  const tieneCPU = equipos.some(eq => eq.descripcion === 'CPU' && eq.marca);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMensaje({ tipo: '', texto: '' });
    
    try {
      const formData = {
        ...data,
        equipos: equipos.filter(eq => eq.marca || eq.modelo || eq.serie),
        creado_por: usuario.id,
        fechaCreacion: new Date().toISOString()
      };
      
      const response = await EntregaEquipoService.crearEntrega(formData);
      
      if (response.success) {
        setMensaje({ 
          tipo: 'success', 
          texto: 'Entrega guardada exitosamente. Generando PDF...' 
        });
        
        generarPDF(formData);
      }
      
    } catch (error) {
      console.error('Error al procesar formulario:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: error.message || 'Error al procesar la entrega' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generarPDF = (data) => {
    try {
      generarPDFEntrega(data);
      setMensaje({ 
        tipo: 'success', 
        texto: 'PDF generado exitosamente' 
      });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: 'Error al generar el PDF. Por favor, revise los datos e intente nuevamente.' 
      });
    }
  };
  
  const guardarBorrador = async () => {
    setIsLoading(true);
    setMensaje({ tipo: '', texto: '' });
    
    try {
      const formData = {
        ...watch(),
        equipos: equipos.filter(eq => eq.marca || eq.modelo || eq.serie),
        estado: 'borrador',
        creado_por: usuario.id,
        fechaCreacion: new Date().toISOString()
      };
      
      const response = await EntregaEquipoService.crearEntrega(formData);
      
      if (response.success) {
        setMensaje({ 
          tipo: 'success', 
          texto: 'Borrador guardado exitosamente' 
        });
      }
      
    } catch (error) {
      console.error('Error al guardar borrador:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: error.message || 'Error al guardar el borrador' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const actualizarEquipo = (index, campo, valor) => {
    const nuevosEquipos = [...equipos];
    nuevosEquipos[index][campo] = valor;
    setEquipos(nuevosEquipos);
  };

  const agregarEquipoPersonalizado = () => {
    setEquipos([...equipos, { descripcion: '', marca: '', modelo: '', serie: '' }]);
  };

  const eliminarEquipo = (index) => {
    if (index >= EQUIPOS_BASE.length) {
      setEquipos(equipos.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="entrega-equipo-container">
      <div className="form-header">
        <h1>Entrega de Equipo de Cómputo</h1>
        <div className="fecha-display">
          <Calendar size={20} />
          <span>Fecha: {format(new Date(), 'dd/MM/yyyy')}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="entrega-form">
        {/* Datos Básicos */}
        <section className="form-section">
          <h2>Información General</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Sobre *</label>
              <input
                type="text"
                {...register('sobre', { required: 'El sobre es obligatorio' })}
                className={errors.sobre ? 'error' : ''}
              />
              {errors.sobre && <span className="error-text">{errors.sobre.message}</span>}
            </div>
            <div className="form-group">
              <label>Ubicación *</label>
              <select
                {...register('ubicacion', { required: 'La ubicación es obligatoria' })}
                className={errors.ubicacion ? 'error' : ''}
              >
                <option value="">Seleccionar...</option>
                {UBICACIONES.map(ub => (
                  <option key={ub} value={ub}>{ub}</option>
                ))}
              </select>
              {errors.ubicacion && <span className="error-text">{errors.ubicacion.message}</span>}
            </div>
          </div>
        </section>

        {/* Datos de Usuario */}
        <section className="form-section">
          <h2>Datos de Usuario</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Usuario *</label>
              <input
                type="text"
                {...register('usuario', { required: 'El usuario es obligatorio' })}
                className={errors.usuario ? 'error' : ''}
              />
              {errors.usuario && <span className="error-text">{errors.usuario.message}</span>}
            </div>
            <div className="form-group">
              <label>Nombre del Equipo *</label>
              <input
                type="text"
                {...register('nombreEquipo', { required: 'El nombre del equipo es obligatorio' })}
                className={errors.nombreEquipo ? 'error' : ''}
              />
              {errors.nombreEquipo && <span className="error-text">{errors.nombreEquipo.message}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Correo *</label>
              <input
                type="email"
                {...register('correo', { 
                  required: 'El correo es obligatorio',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Correo inválido'
                  }
                })}
                className={errors.correo ? 'error' : ''}
              />
              {errors.correo && <span className="error-text">{errors.correo.message}</span>}
            </div>
            <div className="form-group">
              <label>Referencia *</label>
              <input
                type="text"
                {...register('referencia', { required: 'La referencia es obligatoria' })}
                className={errors.referencia ? 'error' : ''}
              />
              {errors.referencia && <span className="error-text">{errors.referencia.message}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Departamento *</label>
              <input
                type="text"
                {...register('departamento', { required: 'El departamento es obligatorio' })}
                className={errors.departamento ? 'error' : ''}
              />
              {errors.departamento && <span className="error-text">{errors.departamento.message}</span>}
            </div>
            <div className="form-group">
              <label>Grupo de Trabajo</label>
              <input
                type="text"
                {...register('grupoTrabajo')}
                defaultValue="Vanity"
              />
            </div>
          </div>

          {/* Campos condicionales según ubicación */}
          {ubicacion === 'Fabrica' && (
            <div className="form-row">
              <div className="form-group">
                <label>Dirección IP *</label>
                <input
                  type="text"
                  {...register('direccionIP', {
                    required: ubicacion === 'Fabrica' ? 'La dirección IP es obligatoria para Fábrica' : false,
                    pattern: {
                      value: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                      message: 'Formato de IP inválido'
                    }
                  })}
                  className={errors.direccionIP ? 'error' : ''}
                  placeholder="192.168.1.100"
                />
                {errors.direccionIP && <span className="error-text">{errors.direccionIP.message}</span>}
              </div>
              <div className="form-group">
                <label>Extensión</label>
                <input
                  type="text"
                  {...register('extension')}
                  placeholder="1234"
                />
              </div>
              {/* Componente para generar claves y firmar PDFs */}
              <Signer usuario={usuario} />
            </div>
          )}

          {ubicacion === 'Tienda' && (
            <div className="form-row">
              <div className="form-group">
                <label>Teléfono 1</label>
                <input
                  type="tel"
                  {...register('telefono1')}
                  placeholder="555-1234"
                />
              </div>
              <div className="form-group">
                <label>Teléfono 2</label>
                <input
                  type="tel"
                  {...register('telefono2')}
                  placeholder="555-5678"
                />
              </div>
            </div>
          )}
        </section>

        {/* Tabla de Equipos */}
        <section className="form-section">
          <div className="section-header">
            <h2>Datos de Equipo</h2>
            <button 
              type="button" 
              onClick={agregarEquipoPersonalizado}
              className="btn-add"
            >
              <Plus size={16} />
              Agregar Equipo
            </button>
          </div>
          
          <div className="equipos-table">
            <div className="table-header">
              <div>Descripción</div>
              <div>Marca</div>
              <div>Modelo</div>
              <div># Serie</div>
              <div>Acciones</div>
            </div>
            
            {equipos.map((equipo, index) => (
              <div key={index} className="table-row">
                <div className="table-cell">
                  {index < EQUIPOS_BASE.length ? (
                    <span>{equipo.descripcion}</span>
                  ) : (
                    <input
                      type="text"
                      value={equipo.descripcion}
                      onChange={(e) => actualizarEquipo(index, 'descripcion', e.target.value)}
                      placeholder="Descripción personalizada"
                    />
                  )}
                </div>
                <div className="table-cell">
                  <input
                    type="text"
                    value={equipo.marca}
                    onChange={(e) => actualizarEquipo(index, 'marca', e.target.value)}
                    placeholder="Marca"
                  />
                </div>
                <div className="table-cell">
                  <input
                    type="text"
                    value={equipo.modelo}
                    onChange={(e) => actualizarEquipo(index, 'modelo', e.target.value)}
                    placeholder="Modelo"
                  />
                </div>
                <div className="table-cell">
                  <input
                    type="text"
                    value={equipo.serie}
                    onChange={(e) => actualizarEquipo(index, 'serie', e.target.value)}
                    placeholder="# Serie"
                  />
                </div>
                <div className="table-cell">
                  {index >= EQUIPOS_BASE.length && (
                    <button
                      type="button"
                      onClick={() => eliminarEquipo(index)}
                      className="btn-delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Campos adicionales para CPU */}
        {tieneCPU && (
          <section className="form-section">
            <h2>Especificaciones del CPU</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Procesador</label>
                <input type="text" {...register('procesador')} />
              </div>
              <div className="form-group">
                <label>Memoria</label>
                <input type="text" {...register('memoria')} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Disco Duro</label>
                <input type="text" {...register('discoDuro')} />
              </div>
              <div className="form-group">
                <label>Versión SO</label>
                <input type="text" {...register('versionSO')} />
              </div>
            </div>
          </section>
        )}

        {/* Software */}
        <section className="form-section">
          <h2>Software</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Tipo Office</label>
              <input type="text" {...register('tipoOffice')} />
            </div>
            <div className="form-group">
              <label>Key Office</label>
              <input type="text" {...register('keyOffice')} />
            </div>
          </div>
        </section>

        {/* Credenciales */}
        <section className="form-section">
          <h2>Credenciales</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Usuario</label>
              <input type="text" {...register('credenciales.usuario')} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" {...register('credenciales.password')} />
            </div>
          </div>
        </section>

        {/* Servicio realizado */}
        <section className="form-section">
          <h2>Servicio Realizado *</h2>
          <div className="radio-group">
            {SERVICIOS.map(servicio => (
              <label key={servicio} className="radio-label">
                <input
                  type="radio"
                  value={servicio}
                  {...register('servicioRealizado', { required: 'Debe seleccionar un servicio' })}
                />
                {servicio}
              </label>
            ))}
          </div>
          {errors.servicioRealizado && <span className="error-text">{errors.servicioRealizado.message}</span>}
        </section>

        {/* Adicional */}
        <section className="form-section">
          <h2>Información Adicional</h2>
          <div className="form-group">
            <label>Adicional</label>
            <textarea 
              {...register('adicional')}
              rows="4"
              placeholder="Información adicional..."
            />
          </div>
        </section>

        {/* Mensajes */}
        {mensaje.texto && (
          <div className={`mensaje ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        {/* Botones de acción */}
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={16} className="spinner" />
                Procesando...
              </>
            ) : (
              <>
                <Printer size={16} />
                Generar PDF
              </>
            )}
          </button>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={guardarBorrador}
            disabled={isLoading}
          >
            <Save size={16} />
            Guardar Borrador
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntregaEquipo;