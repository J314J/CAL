<div align="center">

```

░█████╗░░█████╗░██╗░░░░░
██╔══██╗██╔══██╗██║░░░░░
██║░░╚═╝███████║██║░░░░░
██║░░██╗██╔══██║██║░░░░░
╚█████╔╝██║░░██║███████╗
░╚════╝░╚═╝░░╚═╝╚══════╝

  Cloud Attendance Lite
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PLATAFORMA DE REGISTRO DE ASISTENCIA
```

<img src="assets/esit-logo.png" alt="ESIT Logo" height="80"/>

**Escuela Superior de Innovación y Tecnología**  
Ciclo 06 — Estancia Profesional | Grupo SN-10  
Cliente: Dirección de Gestión Académica Digital (DGAD)

---

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Google Apps Script](https://img.shields.io/badge/Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white)
![Looker Studio](https://img.shields.io/badge/Looker%20Studio-669DF6?style=for-the-badge&logo=looker&logoColor=white)

![Estado](https://img.shields.io/badge/Estado-Producción-brightgreen?style=flat-square)
![Versión](https://img.shields.io/badge/Versión-v1.0.0-blue?style=flat-square)
![Entrega](https://img.shields.io/badge/Entrega-28%20Feb%202026-orange?style=flat-square)
![Licencia](https://img.shields.io/badge/Licencia-Académica-lightgrey?style=flat-square)

</div>

---

## 📖 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Stack Tecnológico](#-stack-tecnológico)
- [Funcionalidades](#-funcionalidades)
- [Estructura del Repositorio](#-estructura-del-repositorio)
- [Configuración e Instalación](#-configuración-e-instalación)
- [Flujo de Autenticación](#-flujo-de-autenticación)
- [Endpoints y Rutas](#-endpoints-y-rutas)
- [Casos de Prueba](#-casos-de-prueba)
- [Trazabilidad del Equipo](#-trazabilidad-del-equipo)
- [Capturas y Evidencias](#-capturas-y-evidencias)
- [Demo en Video](#-demo-en-video)
- [Accesos del Sistema](#-accesos-del-sistema)

---

## 📋 Descripción General

**CAL — Cloud Attendance Lite** es una plataforma web de registro y control de asistencia a eventos institucionales desarrollada íntegramente sobre **Google Workspace**. Fue construida como proyecto de estancia profesional para la Dirección de Gestión Académica Digital (DGAD) de ESIT durante el ciclo Diciembre–Febrero 2025–2026.

**Problema que resuelve:** El registro manual de asistencia en eventos institucionales es lento, propenso a errores y no genera datos trazables ni reportes automáticos.

**Solución:** Los administradores generan un código QR por evento. Los participantes escanean el QR desde su celular, ingresan su correo y quedan registrados en tiempo real. El sistema valida duplicados, envía confirmación por correo y genera reportes automáticos semanales y mensuales.

---

## 🏗 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        PARTICIPANTE                              │
│   Escanea QR → FormularioQR.html → Apps Script → Google Sheets  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       APPS SCRIPT (Backend)                      │
│                                                                  │
│  doGet()          onFormSubmit()      Triggers automáticos       │
│  ├── Login        ├── Validar datos   ├── Semanal (lun 8AM)      │
│  ├── PanelAdmin   ├── Anti-duplicado  └── Mensual (día 1, 9AM)   │
│  └── FormularioQR ├── Marcar Presente                            │
│                   ├── Ordenar por timestamp                      │
│                   └── Enviar email (MailApp)                     │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│              GOOGLE SHEETS (BD)               │
│                                               │
│  ├── Respuestas de formulario v3              │
│  ├── Catálogo_Eventos                         │
│  ├── Catálogo_Participantes                   │
│  ├── Dashboard_Resumen                        │
│  └── Admins                                   │
└──────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│           FIREBASE AUTHENTICATION             │
│  Email/Password + OTP 2FA (6 dígitos, 5 min) │
└──────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│           LOOKER STUDIO (Dashboard)           │
│  Conectado a Google Sheets — Tiempo real      │
└──────────────────────────────────────────────┘
```

---

## 🛠 Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| **Backend** | Google Apps Script (JavaScript) | Lógica del servidor, triggers, routing |
| **Frontend** | HTML5 + CSS3 + JavaScript vanilla | Interfaces web servidas por Apps Script |
| **Base de datos** | Google Sheets | Almacenamiento estructurado sin servidor |
| **Autenticación** | Firebase Authentication | Login seguro con Email/Password |
| **2FA** | OTP 6 dígitos (generado en frontend) | Segunda capa de autenticación |
| **Email** | MailApp (Apps Script) | Confirmaciones, OTP, reportes, backups |
| **Dashboard** | Looker Studio | Visualización de métricas en tiempo real |
| **Gestión QR** | api.qrserver.com | Generación de códigos QR dinámicos |
| **Gestión de proyecto** | Jira | Épicas, historias, trazabilidad por fase |

### Lenguajes utilizados

```
JavaScript  ████████████████████░░  ~72%   (Apps Script + Frontend JS)
HTML5       ████████░░░░░░░░░░░░░░  ~20%   (3 páginas web)
CSS3        ████░░░░░░░░░░░░░░░░░░   ~8%   (Estilos inline y embebidos)
```

---

## ✨ Funcionalidades

### Para Participantes
- ✅ Registro de asistencia escaneando QR desde cualquier celular
- ✅ Validación de duplicados (no se puede registrar dos veces el mismo día)
- ✅ Confirmación automática por correo electrónico al registrarse

### Para Administradores
- 🔐 Login con Firebase Auth + OTP 2FA (código de 6 dígitos, expira en 5 min, máx. 3 intentos)
- 📱 Generación de QR dinámico por evento
- 📤 Compartir QR por WhatsApp, Email o Telegram
- 📊 Dashboard con estadísticas en tiempo real
- 📧 Reportes automáticos semanales (lunes 8:00 AM) y mensuales (día 1, 9:00 AM)
- 💾 Backup automático en CSV antes de cualquier reseteo de datos
- 🔄 Reseteo de datos con doble confirmación y backup obligatorio

---

## 📁 Estructura del Repositorio

```
CAL/
│
├── 📂 src/               # Código fuente
├── 📂 docs/              # Bitácoras por fase (PDF)
├── 📂 capturas-logs/     # Evidencias visuales
├── 📂 video-assets/      # Video demo
├── 📂 assets/            # Logo institucional
│
├── .gitignore
├── AUDITORIA.md
└── README.md
```

---

## ⚙️ Configuración e Instalación

### Prerrequisitos

- Cuenta de Google con acceso a Google Workspace
- Proyecto en [Firebase Console](https://console.firebase.google.com)
- Acceso a Google Apps Script

### Paso 1 — Google Sheets

Crea una hoja de cálculo con estas pestañas (nombres exactos):

| Pestaña | Columnas principales |
|---------|---------------------|
| `Respuestas de formulario v3` | Timestamp, Nombre, ID, Correo, Evento, Fecha, Hora, Grupo, Obs., Asistencia |
| `Catálogo_Eventos` | ID Evento, Nombre, Fecha, URL QR |
| `Catálogo_Participantes` | ID, Nombre, Correo, Tipo, Grupo |
| `Dashboard_Resumen` | (usada por Looker Studio) |
| `Admins` | ID, Nombre, Correo, Sesion (0/1) |

### Paso 2 — Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Activa **Authentication → Email/Password**
3. Agrega tu correo de administrador como usuario
4. Copia el objeto `firebaseConfig` desde **Configuración del proyecto → Tus apps → Web**

### Paso 3 — Apps Script

1. Abre tu Google Sheets → **Extensiones → Apps Script**
2. Copia todos los archivos de `src/` al editor
3. Ve a **Configuración del proyecto → Propiedades de la secuencia de comandos** y agrega:

```
SPREADSHEET_ID  →  [ID de tu Google Sheets]
ADMIN_EMAIL     →  [correo del administrador]
```

> ⚠️ **Nunca escribas valores reales directamente en el código.**

4. En `Login.html` y `PanelAdmin.html`, reemplaza los marcadores:

```javascript
const firebaseConfig = {
  apiKey:            "YOUR_FIREBASE_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
const DEPLOYMENT_URL = 'YOUR_DEPLOYMENT_URL';
```

5. Despliega → **Nueva implementación → Aplicación web**
   - Ejecutar como: **Yo**
   - Acceso: **Cualquier persona**

6. Ejecuta `inicializarSistema()` **una sola vez** para crear los triggers automáticos.

---

## 🔐 Flujo de Autenticación

```
Usuario
  │
  ├─ Ingresa email + contraseña
  │
  ▼
Firebase Auth verifica credenciales
  │
  ├─ ❌ Inválidas → Mensaje de error
  │
  └─ ✅ Válidas → Cierra sesión temporal
        │
        ▼
Apps Script genera OTP (6 dígitos aleatorios)
        │
        ▼
MailApp envía OTP al correo del usuario
        │
        ▼
Usuario ingresa el código
        │
        ├─ ⏰ Expirado (> 5 min) → Rechazado
        ├─ ❌ Incorrecto × 3 → Bloqueado, debe reiniciar
        │
        └─ ✅ Correcto → Sesión real en Firebase + campo Sesion=1 en Sheets
              │
              ▼
           Panel Admin visible
```

---

## 🔗 Endpoints y Rutas

El sistema usa una **Single Web App** con parámetros de ruta:

| Parámetro URL | Página cargada | Acceso |
|--------------|----------------|--------|
| *(sin parámetros)* | Login | Público |
| `?page=admin` | Panel de Administración | Requiere Firebase Auth |
| `?evento=ID&fecha=YYYY-MM-DD&nombre=NOMBRE` | Formulario QR | Público |

**URL base del sistema (producción):**
```
https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec
```

### Funciones expuestas al frontend (`google.script.run`)

| Función | Descripción |
|---------|-------------|
| `obtenerEstadisticas()` | Retorna totales del dashboard |
| `obtenerEventos()` | Lista de eventos con URLs de QR |
| `crearEventoYGenerarQR(nombre, id, fecha)` | Crea evento y genera QR |
| `registrarAsistenciaQR(correo, idEvento, fecha, nombre)` | Registra asistencia vía QR |
| `enviarCodigoOTP(email, nombre, codigo)` | Envía OTP por correo |
| `establecerSesion(email, valor)` | Guarda estado de sesión en Sheets |
| `generarReporteSemanal()` | Genera y envía reporte semanal |
| `generarReporteMensual()` | Genera y envía reporte mensual |
| `limpiarHojaRespuestas()` | Backup CSV + reseteo de datos |
| `inicializarSistema()` | Setup inicial: triggers + validaciones |

---

## 🧪 Casos de Prueba

**Resultado global: 8/8 ✅ APROBADOS** (Fase 4, Febrero 2026)

| ID | Descripción | Resultado |
|----|-------------|-----------|
| CP-06 | Panel inaccesible directamente por URL sin login | ✅ PASS |
| CP-07 | Firebase Auth bloquea acceso con credenciales inválidas | ✅ PASS |
| CP-08 | OTP expira correctamente a los 5 minutos | ✅ PASS |
| CP-09 | Bloqueo tras 3 intentos OTP incorrectos | ✅ PASS |
| CP-10 | Anti-duplicado: mismo correo + mismo evento + mismo día | ✅ PASS |
| CP-11 | Backup CSV generado y enviado antes del reseteo | ✅ PASS |
| CP-12 | Trigger semanal ejecuta correctamente (lunes 8AM) | ✅ PASS |
| CP-13 | Registros se ordenan por timestamp tras cada envío | ✅ PASS |

> Evidencia: ver `capturas-logs/pruebas-cp06-cp13.png` y `docs/Fase4-Bitacora.pdf`

---

## 👥 Trazabilidad del Equipo

| Miembro | Rol | Contribuciones clave |
|---------|-----|---------------------|
| **Jonathan Ernesto Beltran Guerra** | Líder Jr. / Fullstack / Coordinador | Arquitectura 2FA, flujo OTP, triggers automáticos, gestión Jira, lógica `onFormSubmit`, control duplicados |
| **Daniel Alberto Perez** | Ingeniero Cloud Jr. | Panel Admin, Firebase Auth, documentación técnica Fase 4, Plan Recursos |
| **Jorge Eduardo Lopez Cabrera** | Analista de Procesos Jr. | Google Forms, dashboard Looker Studio, pruebas HTML Fase 3 |
| **Alisson Lisbeth Serpas Martinez** | QA / Documentador Técnico Jr. | Matriz de pruebas, bug fix columna Hora, documentación todas las fases |

**Tutor:** Carlos Guillermo Rodríguez Álvarez  
**Período:** 08 Diciembre 2025 – 28 Febrero 2026

---

## 🎬 Demo en Video

[![CAL — Demo en Video](https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

> ▶️ Haz clic en la imagen para ver el demo completo  
> ⚠️ En el video todas las credenciales aparecen como `USER_DEMO`, `KEY_DEMO`, `TOKEN_DEMO`

---

## 🔗 Accesos del Sistema

| Recurso | URL |
|---------|-----|
| Sistema en producción | `https://script.google.com/macros/s/[ID]/exec` |
| Formulario de registro | `https://forms.gle/[ID]` |
| Dashboard Looker Studio | `https://lookerstudio.google.com/reporting/[ID]` |
| Repositorio GitHub | `https://github.com/J314J/CAL` |

---

<div align="center">

**CAL — Cloud Attendance Lite v1.0.0**  
© 2026 Grupo SN-10 · ESIT · Dirección de Gestión Académica Digital (DGAD)

*Proyecto desarrollado como parte del Ciclo 06 de Estancia Profesional*

</div>
