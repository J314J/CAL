/**
 * =========================================
 * CLOUD ATTENDANCE LITE (PRACloud)
 * Sistema de Registro de Asistencia Digital
 * =========================================
 *
 * Grupo SN-10 | ESIT - Ciclo 06 Estancia Profesional
 * Cliente: Dirección de Gestión Académica Digital (DGAD)
 *
 * ─── SETUP (primera vez) ─────────────────
 * 1. Abre Apps Script → Configuración del proyecto → Propiedades de secuencia
 * 2. Agrega estas propiedades:
 *    SPREADSHEET_ID  →  ID de tu Google Sheets
 *    ADMIN_EMAIL     →  correo del administrador (para reportes y backups)
 *    FORM_URL        →  URL de tu Google Form principal
 *    SHEETS_URL      →  URL de tu Google Sheets (para el panel admin)
 *    LOOKER_URL      →  URL de tu dashboard Looker Studio
 * 3. En Login.html y PanelAdmin.html reemplaza los marcadores FIREBASE_*
 *    con los valores de tu proyecto Firebase (ver README.md)
 * 4. Despliega como Web App → Ejecutar como: Yo, Acceso: Cualquiera
 * 5. Copia la URL del deployment y colócala como DEPLOYMENT_URL
 *    en Login.html y PanelAdmin.html
 * 6. Ejecuta inicializarSistema() una sola vez para crear los triggers
 * ─────────────────────────────────────────
 */

// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
const CONFIG = {
  // ⚠️  Nunca pongas valores reales aquí.
  //     Usa Script Properties (Configuración del proyecto → Propiedades de secuencia)
  SPREADSHEET_ID: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'),

  SHEETS: {
    RESPUESTAS:    'Respuestas de formulario v3',
    EVENTOS:       'Catálogo_Eventos',
    PARTICIPANTES: 'Catálogo_Participantes',
    DASHBOARD:     'Dashboard_Resumen',
    ADMINS:        'Admins',
  },

  EMAIL: {
    REMITENTE:              'DGAD - Sistema de Asistencia',
    ASUNTO_CONFIRMACION:    '✓ Confirmación de Asistencia - DGAD',
    ASUNTO_REPORTE_SEMANAL: '📊 Reporte Semanal de Asistencia - DGAD',
    ASUNTO_REPORTE_MENSUAL: '📊 Reporte Mensual de Asistencia - DGAD',
    // correo destino de reportes y alertas (definido en Script Properties)
    ADMIN_EMAIL: PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL'),
  },

  QR: {
    API_URL: 'https://api.qrserver.com/v1/create-qr-code/',
    SIZE:    '300x300',
  },
};

// ============================================
// ROUTING PRINCIPAL (doGet)
// ============================================
function doGet(e) {
  try {
    Logger.log('🔍 doGet llamado');
    Logger.log('📋 Parámetros: ' + JSON.stringify(e.parameter));

    const p = e.parameter || {};

    if (p.evento) {
      return mostrarFormularioQR(p.evento, p.fecha || new Date(), p.nombre || p.evento);
    }
    if (p.page === 'admin') {
      return mostrarPanelAdmin();
    }
    return mostrarLogin();

  } catch (error) {
    Logger.log('❌ ERROR en doGet: ' + error);
    return HtmlService.createHtmlOutput(
      '<h3 style="color:red;">Error: ' + error + '</h3>' +
      '<p>Contacta al administrador del sistema.</p>'
    );
  }
}

// ============================================
// PÁGINAS
// ============================================
function mostrarLogin() {
  return HtmlService.createHtmlOutputFromFile('Login')
    .setTitle('Login - DGAD')
    .setFaviconUrl('https://www.gstatic.com/images/branding/product/1x/forms_48dp.png')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function mostrarPanelAdmin() {
  return HtmlService.createHtmlOutputFromFile('PanelAdmin')
    .setTitle('Panel de Administración - DGAD')
    .setFaviconUrl('https://www.gstatic.com/images/branding/product/1x/forms_48dp.png')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function mostrarFormularioQR(idEvento, fecha, nombreEvento) {
  const template = HtmlService.createTemplateFromFile('FormularioQR');
  template.idEvento     = idEvento;
  template.fecha        = fecha;
  template.nombreEvento = nombreEvento || idEvento;
  return template.evaluate()
    .setTitle('Registro de Asistencia - DGAD')
    .setFaviconUrl('https://www.gstatic.com/images/branding/product/1x/forms_48dp.png')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ============================================
// INICIALIZAR SISTEMA
// ============================================
function inicializarSistema() {
  try {
    Logger.log('Iniciando configuración del sistema...');
    const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const hojas = ss.getSheets().map(h => h.getName());
    Logger.log('Hojas encontradas: ' + hojas.join(', '));
    eliminarTriggersAntiguos();
    crearTriggers();
    configurarValidaciones();
    Logger.log('✓ Sistema inicializado correctamente');
    return { success: true, message: 'Sistema inicializado correctamente' };
  } catch (error) {
    Logger.log('ERROR en inicialización: ' + error);
    return { success: false, message: error.toString() };
  }
}

function obtenerURLDeployment() {
  try { return ScriptApp.getService().getUrl(); } catch (e) { return null; }
}

// ============================================
// PROCESAR FORMULARIO (trigger onFormSubmit)
// ============================================
function onFormSubmit(e) {
  try {
    Logger.log('=== INICIO onFormSubmit ===');
    const ss         = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const hoja       = ss.getSheetByName(CONFIG.SHEETS.RESPUESTAS);
    const ultimaFila = hoja.getLastRow();
    const datos      = hoja.getRange(ultimaFila, 1, 1, 9).getValues()[0];
    const ahora      = new Date();

    const registro = {
      timestamp:     datos[0] || ahora,
      nombre:        datos[1] || 'Participante',
      idCodigo:      datos[2] || 'N/A',
      correo:        datos[3] || '',
      tipoEvento:    datos[4] || '',
      fecha:         datos[5] || ahora,
      hora:          datos[6] || Utilities.formatDate(ahora, 'America/El_Salvador', 'HH:mm'),
      grupo:         datos[7] || 'No especificado',
      observaciones: datos[8] || '',
    };

    // Resolver nombre del evento desde catálogo
    if (registro.tipoEvento) {
      const hojaEventos  = ss.getSheetByName(CONFIG.SHEETS.EVENTOS);
      if (hojaEventos) {
        const datosEventos = hojaEventos.getDataRange().getValues();
        for (let i = 1; i < datosEventos.length; i++) {
          if (registro.tipoEvento.includes(datosEventos[i][0]) ||
              registro.tipoEvento === datosEventos[i][0]) {
            registro.tipoEvento = datosEventos[i][1];
            break;
          }
        }
      }
    }
    if (!registro.tipoEvento || registro.tipoEvento.trim() === '') {
      registro.tipoEvento = 'Evento DGAD';
    }

    hoja.getRange(ultimaFila, 10).setValue('Presente');
    hoja.getRange(ultimaFila, 5).setValue(registro.tipoEvento);
    SpreadsheetApp.flush();

    registrarParticipante(registro);
    enviarConfirmacionAsistencia(registro);

    // Ordenar por timestamp
    const totalFilas    = hoja.getLastRow();
    const totalColumnas = hoja.getLastColumn();
    if (totalFilas > 1) {
      hoja.getRange(2, 1, totalFilas - 1, totalColumnas)
          .sort({ column: 1, ascending: true });
    }

    Logger.log('=== FIN onFormSubmit - EXITOSO ===');
  } catch (error) {
    Logger.log('❌ ERROR en onFormSubmit: ' + error);
    try { enviarAlertaError('Error al procesar formulario', error.toString()); } catch (e) {}
  }
}

// ============================================
// PARTICIPANTES
// ============================================
function registrarParticipante(registro) {
  try {
    const ss   = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const hoja = ss.getSheetByName(CONFIG.SHEETS.PARTICIPANTES);
    if (!hoja) return;
    const datos  = hoja.getDataRange().getValues();
    const existe = datos.some(fila => fila[2] === registro.correo);
    if (!existe) {
      hoja.appendRow([
        generarIDParticipante(datos.length),
        registro.nombre,
        registro.correo,
        'Estudiante',
        registro.grupo,
      ]);
    }
  } catch (error) {
    Logger.log('ERROR en registrarParticipante: ' + error);
  }
}

function generarIDParticipante(cantidadActual) {
  return `SN-10-${String(cantidadActual).padStart(2, '0')}`;
}

// ============================================
// REGISTRO VÍA QR
// ============================================
function registrarAsistenciaQR(correo, idEvento, fecha, nombreEvento) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

    if (!nombreEvento || nombreEvento === 'null' || nombreEvento === 'undefined') {
      const hojaEventos  = ss.getSheetByName(CONFIG.SHEETS.EVENTOS);
      const datosEventos = hojaEventos.getDataRange().getValues();
      nombreEvento = idEvento;
      for (let i = 1; i < datosEventos.length; i++) {
        if (datosEventos[i][0] === idEvento) { nombreEvento = datosEventos[i][1]; break; }
      }
    }

    const hojaParticipantes  = ss.getSheetByName(CONFIG.SHEETS.PARTICIPANTES);
    const datosParticipantes = hojaParticipantes.getDataRange().getValues();
    let participante = null;
    for (let i = 1; i < datosParticipantes.length; i++) {
      if (datosParticipantes[i][2] === correo) {
        participante = {
          id:     datosParticipantes[i][0],
          nombre: datosParticipantes[i][1],
          correo: datosParticipantes[i][2],
          tipo:   datosParticipantes[i][3],
          grupo:  datosParticipantes[i][4],
        };
        break;
      }
    }

    if (!participante) {
      return { success: false, message: 'No estás registrado en el sistema. Por favor, regístrate primero usando el formulario principal.' };
    }

    const hojaRespuestas  = ss.getSheetByName(CONFIG.SHEETS.RESPUESTAS);
    const datosRespuestas = hojaRespuestas.getDataRange().getValues();
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    for (let i = 1; i < datosRespuestas.length; i++) {
      const fr = new Date(datosRespuestas[i][5]); fr.setHours(0, 0, 0, 0);
      if (datosRespuestas[i][3] === correo &&
          datosRespuestas[i][4] === nombreEvento &&
          fr.getTime() === hoy.getTime()) {
        return { success: false, message: 'Ya has registrado tu asistencia para este evento hoy.' };
      }
    }

    const timestamp = new Date();
    const hora = Utilities.formatDate(timestamp, 'America/El_Salvador', 'HH:mm');
    hojaRespuestas.appendRow([timestamp, participante.nombre, participante.id,
      participante.correo, nombreEvento, fecha || hoy, hora,
      participante.grupo, 'Registrado vía QR', 'Presente']);

    enviarConfirmacionAsistencia({
      nombre: participante.nombre, correo: participante.correo,
      tipoEvento: nombreEvento, fecha: fecha || hoy, hora, grupo: participante.grupo,
    });

    return { success: true, message: `¡Asistencia registrada exitosamente para ${participante.nombre}!` };
  } catch (error) {
    Logger.log('ERROR en registrarAsistenciaQR: ' + error);
    return { success: false, message: 'Error al registrar asistencia: ' + error.toString() };
  }
}

// ============================================
// EVENTOS Y QR
// ============================================
function crearEventoYGenerarQR(nombreEvento, idEvento, fecha) {
  try {
    const ss          = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const hojaEventos = ss.getSheetByName(CONFIG.SHEETS.EVENTOS);
    const qrData      = generarQREvento(nombreEvento, idEvento, fecha);
    if (!qrData) return null;

    const datosEventos = hojaEventos.getDataRange().getValues();
    let eventoExiste = false, filaEvento = -1;
    for (let i = 1; i < datosEventos.length; i++) {
      if (datosEventos[i][0] === idEvento) { eventoExiste = true; filaEvento = i + 1; break; }
    }
    if (!eventoExiste) {
      hojaEventos.appendRow([idEvento, nombreEvento, fecha, qrData.urlEvento]);
    } else {
      hojaEventos.getRange(filaEvento, 4).setValue(qrData.urlEvento);
    }
    SpreadsheetApp.flush();
    qrData.estadoEvento = eventoExiste ? 'existente' : 'nuevo';
    return qrData;
  } catch (error) {
    Logger.log('ERROR en crearEventoYGenerarQR: ' + error);
    return null;
  }
}

function generarQREvento(nombreEvento, idEvento, fecha) {
  try {
    const urlBase = ScriptApp.getService().getUrl();
    let fechaFormateada = fecha instanceof Date
      ? Utilities.formatDate(fecha, 'America/El_Salvador', 'yyyy-MM-dd')
      : fecha;
    const params      = `?evento=${encodeURIComponent(idEvento)}&fecha=${encodeURIComponent(fechaFormateada)}&nombre=${encodeURIComponent(nombreEvento)}`;
    const urlCompleta = urlBase + params;
    const urlQR       = `${CONFIG.QR.API_URL}?size=${CONFIG.QR.SIZE}&data=${encodeURIComponent(urlCompleta)}`;
    return { urlQR, urlEvento: urlCompleta, idEvento, nombreEvento, fecha: fechaFormateada };
  } catch (error) {
    Logger.log('ERROR al generar QR: ' + error);
    return null;
  }
}

function obtenerEventos() {
  try {
    const ss   = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const hoja = ss.getSheetByName(CONFIG.SHEETS.EVENTOS);
    if (!hoja) return [];
    const datos   = hoja.getDataRange().getValues();
    const eventos = [];
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][0]) {
        eventos.push({
          id:    String(datos[i][0]),
          nombre: String(datos[i][1]) || 'Sin nombre',
          fecha:  String(datos[i][2]) || '',
          urlQR:  String(datos[i][3]) || '',
        });
      }
    }
    return eventos;
  } catch (error) {
    Logger.log('ERROR en obtenerEventos: ' + error);
    return [];
  }
}

function obtenerEstadisticas() {
  const ss   = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const hoja = ss.getSheetByName(CONFIG.SHEETS.RESPUESTAS);
  const datos = hoja.getDataRange().getValues();
  const hoy   = new Date(); hoy.setHours(0, 0, 0, 0);
  let totalHoy = 0, presentesHoy = 0;
  for (let i = 1; i < datos.length; i++) {
    const f = new Date(datos[i][0]); f.setHours(0, 0, 0, 0);
    if (f.getTime() === hoy.getTime()) { totalHoy++; if (datos[i][9] === 'Presente') presentesHoy++; }
  }
  return { totalRegistros: datos.length - 1, registrosHoy: totalHoy, presentesHoy, totalEventos: obtenerEventos().length };
}

// ============================================
// REPORTES
// ============================================
function generarReporteSemanal() {
  try {
    const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const hoja  = ss.getSheetByName(CONFIG.SHEETS.RESPUESTAS);
    const datos = hoja.getDataRange().getValues();
    const hoy   = new Date();
    const inicio = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    let registros = 0, presentes = 0; const eventos = new Set();
    for (let i = 1; i < datos.length; i++) {
      const f = new Date(datos[i][0]);
      if (f >= inicio && f <= hoy) { registros++; if (datos[i][9] === 'Presente') presentes++; eventos.add(datos[i][4]); }
    }
    const reporte = {
      periodo: `${formatearFecha(inicio)} - ${formatearFecha(hoy)}`,
      totalRegistros: registros, totalPresentes: presentes, totalEventos: eventos.size,
      porcentajeAsistencia: registros > 0 ? ((presentes / registros) * 100).toFixed(2) : 0,
    };
    enviarReporteEmail(reporte, 'semanal');
    return reporte;
  } catch (error) { Logger.log('ERROR en generarReporteSemanal: ' + error); return null; }
}

function generarReporteMensual() {
  try {
    const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const hoja  = ss.getSheetByName(CONFIG.SHEETS.RESPUESTAS);
    const datos = hoja.getDataRange().getValues();
    const hoy   = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    let registros = 0, presentes = 0; const eventos = new Set(); const participantes = new Set();
    for (let i = 1; i < datos.length; i++) {
      const f = new Date(datos[i][0]);
      if (f >= inicio && f <= hoy) { registros++; if (datos[i][9] === 'Presente') presentes++; eventos.add(datos[i][4]); participantes.add(datos[i][3]); }
    }
    const reporte = {
      periodo: `${formatearFecha(inicio)} - ${formatearFecha(hoy)}`,
      totalRegistros: registros, totalPresentes: presentes, totalEventos: eventos.size,
      totalParticipantesUnicos: participantes.size,
      porcentajeAsistencia: registros > 0 ? ((presentes / registros) * 100).toFixed(2) : 0,
    };
    enviarReporteEmail(reporte, 'mensual');
    return reporte;
  } catch (error) { Logger.log('ERROR en generarReporteMensual: ' + error); return null; }
}

// ============================================
// EMAILS
// ============================================
function enviarConfirmacionAsistencia(registro) {
  try {
    if (!registro.correo || !registro.correo.includes('@')) return;
    const nombre = registro.nombre || 'Participante';
    MailApp.sendEmail({
      to: registro.correo,
      subject: CONFIG.EMAIL.ASUNTO_CONFIRMACION,
      htmlBody: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px;text-align:center;">
            <h1 style="color:white;margin:0;">✓ Asistencia Confirmada</h1>
          </div>
          <div style="padding:40px;background:#f7f7f7;text-align:center;">
            <p style="font-size:18px;color:#333;">Hola <strong>${nombre}</strong>,</p>
            <div style="background:white;padding:40px;border-radius:12px;margin:20px 0;box-shadow:0 2px 10px rgba(0,0,0,.1);">
              <div style="font-size:64px;">✅</div>
              <h2 style="color:#4CAF50;margin:0;">PRESENTE</h2>
              <p style="color:#666;margin-top:15px;">Tu asistencia ha sido registrada exitosamente</p>
            </div>
            <p style="font-size:13px;color:#999;">Sistema de Asistencia DGAD - Mensaje Automático</p>
          </div>
          <div style="background:#333;padding:20px;text-align:center;">
            <p style="color:#999;font-size:12px;margin:0;">© 2026 Dirección de Gestión Académica Digital (DGAD)</p>
          </div>
        </div>`,
    });
    Logger.log('✅ Email enviado a: ' + registro.correo);
  } catch (error) { Logger.log('❌ ERROR al enviar email: ' + error); }
}

function enviarReporteEmail(reporte, tipo) {
  try {
    const titulo = tipo === 'semanal' ? 'Semanal' : 'Mensual';
    const asunto = tipo === 'semanal' ? CONFIG.EMAIL.ASUNTO_REPORTE_SEMANAL : CONFIG.EMAIL.ASUNTO_REPORTE_MENSUAL;
    MailApp.sendEmail({
      to: CONFIG.EMAIL.ADMIN_EMAIL,
      subject: asunto,
      htmlBody: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:30px;text-align:center;">
            <h1 style="color:white;margin:0;">📊 Reporte ${titulo}</h1>
            <p style="color:white;margin:10px 0 0;">${reporte.periodo}</p>
          </div>
          <div style="padding:30px;background:#f7f7f7;">
            <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;">
              <tr><td style="padding:15px;border-bottom:1px solid #eee;"><strong>Total Registros</strong></td><td style="padding:15px;border-bottom:1px solid #eee;text-align:right;font-size:24px;">${reporte.totalRegistros}</td></tr>
              <tr><td style="padding:15px;border-bottom:1px solid #eee;"><strong style="color:#4CAF50;">Presentes</strong></td><td style="padding:15px;border-bottom:1px solid #eee;text-align:right;font-size:24px;color:#4CAF50;">${reporte.totalPresentes}</td></tr>
              <tr><td style="padding:15px;border-bottom:1px solid #eee;"><strong style="color:#FF9800;">Eventos</strong></td><td style="padding:15px;border-bottom:1px solid #eee;text-align:right;font-size:24px;color:#FF9800;">${reporte.totalEventos}</td></tr>
              ${tipo === 'mensual' ? `<tr><td style="padding:15px;border-bottom:1px solid #eee;"><strong style="color:#9C27B0;">Participantes Únicos</strong></td><td style="padding:15px;border-bottom:1px solid #eee;text-align:right;font-size:24px;color:#9C27B0;">${reporte.totalParticipantesUnicos}</td></tr>` : ''}
              <tr><td style="padding:15px;"><strong style="color:#2196F3;">Asistencia</strong></td><td style="padding:15px;text-align:right;font-size:24px;color:#2196F3;">${reporte.porcentajeAsistencia}%</td></tr>
            </table>
          </div>
          <div style="background:#333;padding:20px;text-align:center;">
            <p style="color:#999;font-size:12px;margin:0;">© 2026 DGAD</p>
          </div>
        </div>`,
    });
    Logger.log(`✓ Reporte ${tipo} enviado`);
  } catch (error) { Logger.log('ERROR al enviar reporte: ' + error); }
}

function enviarCodigoOTP(email, nombre, codigo) {
  try {
    if (!email || !email.includes('@')) return { success: false, message: 'Email inválido' };
    if (!codigo || codigo.length !== 6) return { success: false, message: 'Código OTP inválido' };
    MailApp.sendEmail({
      to: email,
      subject: '🔐 Código de Verificación - DGAD Admin',
      htmlBody: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px;text-align:center;">
            <h1 style="color:white;margin:0;">🔐 Código de Verificación</h1>
          </div>
          <div style="padding:40px;background:#f7f7f7;text-align:center;">
            <p style="font-size:18px;color:#333;">Hola <strong>${nombre || email}</strong>,</p>
            <div style="background:white;padding:30px;border-radius:12px;margin:30px 0;box-shadow:0 2px 10px rgba(0,0,0,.1);">
              <div style="font-size:48px;font-weight:bold;color:#667eea;letter-spacing:8px;font-family:monospace;">${codigo}</div>
            </div>
            <div style="background:#fff3cd;border-left:4px solid #ffc107;padding:15px;border-radius:4px;text-align:left;">
              <strong style="color:#856404;">⚠️ Importante:</strong>
              <ul style="margin:10px 0 0 20px;color:#856404;font-size:13px;">
                <li>Válido por <strong>5 minutos</strong></li>
                <li>No compartas este código con nadie</li>
                <li>Si no solicitaste este código, ignora este mensaje</li>
              </ul>
            </div>
            <p style="font-size:13px;color:#999;margin-top:30px;">Sistema de Asistencia DGAD - Mensaje Automático</p>
          </div>
          <div style="background:#333;padding:20px;text-align:center;">
            <p style="color:#999;font-size:12px;margin:0;">© 2026 DGAD</p>
          </div>
        </div>`,
    });
    Logger.log('✅ Email OTP enviado a: ' + email);
    return { success: true, message: 'Código enviado exitosamente' };
  } catch (error) {
    Logger.log('❌ ERROR al enviar OTP: ' + error);
    return { success: false, message: error.toString() };
  }
}

function enviarAlertaError(titulo, mensaje) {
  try {
    MailApp.sendEmail({ to: CONFIG.EMAIL.ADMIN_EMAIL, subject: '⚠️ Alerta DGAD - ' + titulo, body: `Error:\n\n${mensaje}\n\nFecha: ${new Date()}` });
  } catch (e) {}
}

// ============================================
// AUTENTICACIÓN (tabla Admins en Sheets)
// ============================================
function verificarAdmin(email) {
  try {
    const ss   = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const hoja = ss.getSheetByName(CONFIG.SHEETS.ADMINS);
    const datos = hoja.getDataRange().getValues();
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][2].toLowerCase().trim() === email.toLowerCase().trim()) return { autorizado: true, email };
    }
    return { autorizado: false };
  } catch (error) { return { autorizado: false }; }
}

function establecerSesion(email, valor) {
  try {
    const ss   = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const hoja = ss.getSheetByName(CONFIG.SHEETS.ADMINS);
    const datos = hoja.getDataRange().getValues();
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][2].toLowerCase().trim() === email.toLowerCase().trim()) {
        hoja.getRange(i + 1, 4).setValue(valor);
        SpreadsheetApp.flush();
        return { success: true };
      }
    }
    return { success: false, message: 'Admin no encontrado' };
  } catch (error) { return { success: false, message: error.toString() }; }
}

function verificarSesion(email) {
  try {
    const ss   = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const hoja = ss.getSheetByName(CONFIG.SHEETS.ADMINS);
    const datos = hoja.getDataRange().getValues();
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][2].toLowerCase().trim() === email.toLowerCase().trim()) return { success: true, activa: datos[i][3] == 1 };
    }
    return { success: false, activa: false };
  } catch (error) { return { success: false, activa: false }; }
}

function verificarAdminYSesion(email) {
  try {
    const ss   = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const hoja = ss.getSheetByName(CONFIG.SHEETS.ADMINS);
    const datos = hoja.getDataRange().getValues();
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][2].toLowerCase().trim() === email.toLowerCase().trim()) return { autorizado: true, activa: datos[i][3] == 1 };
    }
    return { autorizado: false, activa: false };
  } catch (error) { return { autorizado: false, activa: false }; }
}

// ============================================
// RESETEO CON BACKUP
// ============================================
function limpiarHojaRespuestas() {
  try {
    const ss   = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const hoja = ss.getSheetByName(CONFIG.SHEETS.RESPUESTAS);
    if (!hoja) return { success: false, message: 'No se encontró la hoja de respuestas' };
    const ultimaFila = hoja.getLastRow();
    if (ultimaFila <= 1) return { success: false, message: 'No hay datos para eliminar' };

    const datos        = hoja.getDataRange().getValues();
    const totalRegistros = ultimaFila - 1;
    let csvContent = '';
    for (let i = 0; i < datos.length; i++) {
      csvContent += datos[i].map(c => '"' + (c || '').toString().replace(/"/g, '""') + '"').join(',') + '\n';
    }
    const ahora   = new Date();
    const fecha   = Utilities.formatDate(ahora, 'America/El_Salvador', 'yyyy-MM-dd_HH-mm-ss');
    const archivo = 'BACKUP_Asistencias_' + fecha + '.csv';
    const blob    = Utilities.newBlob(csvContent, 'text/csv', archivo);

    MailApp.sendEmail({
      to: CONFIG.EMAIL.ADMIN_EMAIL,
      subject: '📦 Backup Automático - Reseteo de Datos DGAD',
      htmlBody: `<p>Backup generado antes de resetear.<br><strong>Registros:</strong> ${totalRegistros}<br><strong>Fecha:</strong> ${Utilities.formatDate(ahora, 'America/El_Salvador', 'dd/MM/yyyy HH:mm:ss')}</p>`,
      attachments: [blob],
    });
    Logger.log('✅ Backup enviado');

    hoja.deleteRows(2, ultimaFila - 1);
    return { success: true, message: `✅ Backup enviado. Se eliminaron ${totalRegistros} registros.` };
  } catch (error) {
    Logger.log('ERROR en limpiarHojaRespuestas: ' + error);
    return { success: false, message: error.toString() };
  }
}

// ============================================
// TRIGGERS
// ============================================
function crearTriggers() {
  ScriptApp.newTrigger('onFormSubmit').forSpreadsheet(SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)).onFormSubmit().create();
  ScriptApp.newTrigger('generarReporteSemanal').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(8).create();
  ScriptApp.newTrigger('generarReporteMensual').timeBased().onMonthDay(1).atHour(9).create();
  Logger.log('✓ Triggers creados');
}

function eliminarTriggersAntiguos() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  Logger.log('✓ Triggers eliminados');
}

function configurarValidaciones() {
  try {
    const ss   = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const hoja = ss.getSheetByName(CONFIG.SHEETS.RESPUESTAS);
    if (!hoja) return;
    const regla = SpreadsheetApp.newDataValidation().requireValueInList(['Presente', 'Ausente', 'Tardanza']).setAllowInvalid(false).build();
    hoja.getRange('J2:J').setDataValidation(regla);
  } catch (error) { Logger.log('ERROR validaciones: ' + error); }
}

// ============================================
// UTILIDADES
// ============================================
function formatearFecha(fecha) {
  if (!fecha) return 'N/A';
  try {
    return new Date(fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/El_Salvador' });
  } catch (e) { return fecha.toString(); }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
