import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export const generarPDFEntrega = (datos) => {
  const doc = new jsPDF();
  
  // Configuración inicial
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;
  
  // Función para agregar texto centrado
  const addCenteredText = (text, y, fontSize = 12, isBold = false) => {
    doc.setFontSize(fontSize);
    if (isBold) doc.setFont(undefined, 'bold');
    else doc.setFont(undefined, 'normal');
    const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
    doc.text(text, (pageWidth - textWidth) / 2, y);
    return y + (fontSize * 0.4);
  };
  
  // Función para agregar línea horizontal
  const addLine = (y, margin = 10) => {
    doc.line(margin, y, pageWidth - margin, y);
    return y + 5;
  };
  
  // Encabezado del documento
  yPosition = addCenteredText('ENTREGA DE EQUIPO DE CÓMPUTO', yPosition, 16, true);
  yPosition += 5;
  yPosition = addLine(yPosition);
  yPosition += 5;
  
  // Información general
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  
  const fechaActual = format(new Date(), 'dd/MM/yyyy');
  doc.text(`Fecha: ${fechaActual}`, 15, yPosition);
  doc.text(`Sobre: ${datos.sobre || ''}`, pageWidth - 80, yPosition);
  yPosition += 15;
  
  // Datos de Usuario
  yPosition = addCenteredText('DATOS DE USUARIO', yPosition, 12, true);
  yPosition += 5;
  
  const datosUsuario = [
    [`Usuario:`, datos.usuario || ''],
    [`Nombre del Equipo:`, datos.nombreEquipo || ''],
    [`Correo:`, datos.correo || ''],
    [`Ubicación:`, datos.ubicacion || ''],
    [`Referencia:`, datos.referencia || ''],
    [`Departamento:`, datos.departamento || ''],
    [`Grupo de Trabajo:`, datos.grupoTrabajo || 'Vanity']
  ];
  
  // Agregar campos condicionales según ubicación
  if (datos.ubicacion === 'Fabrica') {
    datosUsuario.push([`Dirección IP:`, datos.direccionIP || '']);
    datosUsuario.push([`Extensión:`, datos.extension || '']);
  } else if (datos.ubicacion === 'Tienda') {
    datosUsuario.push([`Teléfono 1:`, datos.telefono1 || '']);
    datosUsuario.push([`Teléfono 2:`, datos.telefono2 || '']);
  }
  
  doc.autoTable({
    startY: yPosition,
    body: datosUsuario,
    theme: 'plain',
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 100 }
    },
    margin: { left: 15, right: 15 },
    styles: { fontSize: 9, cellPadding: 2 }
  });
  
  yPosition = doc.lastAutoTable.finalY + 10;
  
  // Datos de Equipo
  yPosition = addCenteredText('DATOS DE EQUIPO', yPosition, 12, true);
  yPosition += 5;
  
  // Filtrar equipos que tienen al menos un campo lleno
  const equiposFiltrados = datos.equipos?.filter(equipo => 
    equipo.marca || equipo.modelo || equipo.serie
  ) || [];
  
  if (equiposFiltrados.length > 0) {
    const equiposData = equiposFiltrados.map(equipo => [
      equipo.descripcion || '',
      equipo.marca || '',
      equipo.modelo || '',
      equipo.serie || ''
    ]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['Descripción', 'Marca', 'Modelo', '# Serie']],
      body: equiposData,
      theme: 'striped',
      headStyles: { fillColor: [102, 126, 234], textColor: 255, fontStyle: 'bold' },
      margin: { left: 15, right: 15 },
      styles: { fontSize: 8, cellPadding: 3 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 10;
  }
  
  // Verificar si necesitamos una nueva página
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Especificaciones del CPU (si existe)
  const tieneCPU = equiposFiltrados.some(eq => eq.descripcion === 'CPU');
  if (tieneCPU && (datos.procesador || datos.memoria || datos.discoDuro || datos.versionSO)) {
    yPosition = addCenteredText('ESPECIFICACIONES DEL CPU', yPosition, 12, true);
    yPosition += 5;
    
    const especificacionesCPU = [
      [`Procesador:`, datos.procesador || ''],
      [`Memoria:`, datos.memoria || ''],
      [`Disco Duro:`, datos.discoDuro || ''],
      [`Versión SO:`, datos.versionSO || '']
    ].filter(([, valor]) => valor); // Solo mostrar campos con valor
    
    doc.autoTable({
      startY: yPosition,
      body: especificacionesCPU,
      theme: 'plain',
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 100 }
      },
      margin: { left: 15, right: 15 },
      styles: { fontSize: 9, cellPadding: 2 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 10;
  }
  
  // Software
  if (datos.tipoOffice || datos.keyOffice) {
    yPosition = addCenteredText('SOFTWARE', yPosition, 12, true);
    yPosition += 5;
    
    const software = [
      [`Tipo Office:`, datos.tipoOffice || ''],
      [`Key Office:`, datos.keyOffice || '']
    ].filter(([, valor]) => valor);
    
    doc.autoTable({
      startY: yPosition,
      body: software,
      theme: 'plain',
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 100 }
      },
      margin: { left: 15, right: 15 },
      styles: { fontSize: 9, cellPadding: 2 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 10;
  }
  
  // Credenciales
  if (datos.credenciales?.usuario || datos.credenciales?.password) {
    yPosition = addCenteredText('CREDENCIALES', yPosition, 12, true);
    yPosition += 5;
    
    const credenciales = [
      [`Usuario:`, datos.credenciales?.usuario || ''],
      [`Password:`, datos.credenciales?.password || '']
    ].filter(([, valor]) => valor);
    
    doc.autoTable({
      startY: yPosition,
      body: credenciales,
      theme: 'plain',
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 100 }
      },
      margin: { left: 15, right: 15 },
      styles: { fontSize: 9, cellPadding: 2 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 10;
  }
  
  // Servicio realizado
  if (datos.servicioRealizado) {
    yPosition = addCenteredText('SERVICIO REALIZADO', yPosition, 12, true);
    yPosition += 5;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(`${datos.servicioRealizado}`, 15, yPosition);
    yPosition += 15;
  }
  
  // Información adicional
  if (datos.adicional) {
    yPosition = addCenteredText('INFORMACIÓN ADICIONAL', yPosition, 12, true);
    yPosition += 5;
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    const splitText = doc.splitTextToSize(datos.adicional, pageWidth - 30);
    doc.text(splitText, 15, yPosition);
    yPosition += splitText.length * 4 + 10;
  }
  
  // Verificar si necesitamos una nueva página para las notas
  if (yPosition > pageHeight - 100) {
    doc.addPage();
    yPosition = 20;
  }
  
  // NOTAS IMPORTANTES
  yPosition = addCenteredText('NOTAS IMPORTANTES', yPosition, 12, true);
  yPosition += 5;
  yPosition = addLine(yPosition);
  yPosition += 5;
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  
  const notas = [
    '• Se entrega equipo funcionando y en buenas condiciones, cableado ordenado y en buen estado.',
    '• Si algún tercero requiere manipulado, deberán notificar a sistemas.',
    '• El acomodo del cableado y equipo es responsabilidad de personal de tienda, a menos que',
    '  sistemas solicite apoyo para la manipulación de los mismos.'
  ];
  
  notas.forEach(nota => {
    const splitNota = doc.splitTextToSize(nota, pageWidth - 30);
    doc.text(splitNota, 15, yPosition);
    yPosition += splitNota.length * 4 + 2;
  });
  
  yPosition += 20;
  
  // Firmas
  yPosition = addLine(yPosition);
  yPosition += 10;
  
  // Firma de quien recibe
  doc.setFontSize(10);
  doc.text('Firma, nombre y fecha de quien recibe:', 15, yPosition);
  yPosition += 20;
  doc.line(15, yPosition, 120, yPosition);
  yPosition += 10;
  doc.setFontSize(8);
  doc.text('Nombre: _____________________________ Fecha: _______________', 15, yPosition);
  yPosition += 15;
  
  // Firma del ingeniero
  doc.setFontSize(10);
  doc.text('Nombre y Firma Ingeniero de Soporte:', 15, yPosition);
  yPosition += 20;
  doc.line(15, yPosition, 120, yPosition);
  yPosition += 10;
  doc.setFontSize(8);
  doc.text('Nombre: _____________________________ Fecha: _______________', 15, yPosition);
  
  // Pie de página
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 10);
    doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 15, pageHeight - 10);
  }
  
  // Guardar o mostrar PDF
  const nombreArchivo = `Entrega_Equipo_${datos.usuario || 'Usuario'}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(nombreArchivo);
  
  return doc;
};