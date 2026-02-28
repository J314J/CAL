# 📋 AUDITORIA.md — Trazabilidad Individual
## Cloud Attendance Lite (CAL) — Grupo SN-10
**ESIT · Ciclo 06 Estancia Profesional · DGAD**  
Período: 08 Dic 2025 – 28 Feb 2026

---

## Repositorio

| Campo | Valor |
|-------|-------|
| URL | https://github.com/J314J/CAL |
| Branch principal | `main` |
| Tag versión final | `v1.0.0` |
| Fecha de tag | 28 Febrero 2026 |

---

## Contribuciones por Miembro

### Jonathan Ernesto Beltran Guerra
**Rol:** Líder Jr. / Coordinador de Proyecto

| Fase | Tarea |
|------|-------|
| Fase 0 | Script automatización, configuración Jira |
| Fase 1 | Canales de comunicación, acuerdos de equipo |
| Fase 2 | Gestión Jira: épicas, historias, trazabilidad |
| Fase 3 | JavaScript: Login, cambio contraseña, validación OTP |
| Fase 4 | 2FA: Firebase + OTP (5 min, 3 intentos) + **Limpieza y documentación del repositorio GitHub (tarea reasignada — ver nota al pie de Alexander Escobar)** |

---

### Alisson Lisbeth Serpas Martinez
**Rol:** QA / Documentador Técnico Jr.

| Fase | Tarea |
|------|-------|
| Fase 0 | Matriz de pruebas inicial |
| Fase 1 | Estandarización README y repositorio |
| Fase 2 | Bug fix: índice columna Hora (col 6 → col 9) |
| Fase 3 | Documentación Fase 3, prueba QR |
| Fase 4 | Documentación técnica completa: CP-06 a CP-13 |

---

### Daniel Alberto Perez
**Rol:** Ingeniero Cloud Jr.

| Fase | Tarea |
|------|-------|
| Fase 0 | Documentación y refactorización de código |
| Fase 1 | Análisis Técnico: actores, procesos, diagrama |
| Fase 2 | Estructura Google Sheets: 5 pestañas como BD |
| Fase 3 | Panel Admin seguro, validación código de seguridad |
| Fase 4 | Firebase Auth completo, documentación técnica |

---

### Jorge Eduardo Francisco Lopez Cabrera
**Rol:** Analista de Procesos Jr.

| Fase | Tarea |
|------|-------|
| Fase 0 | Dashboard Looker Studio inicial |
| Fase 1 | Plan Recursos Tecnológicos: arquitectura serverless |
| Fase 2 | Creación Google Forms con campos obligatorios |
| Fase 3 | Pruebas HTML: Login, Reset Password, OTP |
| Fase 4 | Soporte documentación final y consolidación de bitácoras |

---

### Alexander Enrique Escobar Ortíz
**Rol:** Desarrollador Fullstack Jr.

| Fase | Tarea |
|------|-------|
| Fase 0 | Creación Google Drive y repositorio GitHub |
| Fase 1 | Diagrama conceptual Draw.io |
| Fase 2 | Lógica Apps Script: validación, duplicados, escritura |
| Fase 3 | Validación matriz de pruebas, push GitHub |
| Fase 4 | ⚠️ **TAREA REASIGNADA A JONATHAN BELTRAN** — Ver nota de reasignación |

> **Nota de reasignación — Fase 4:**  
> La tarea de consolidación del código, limpieza y documentación final del repositorio GitHub fue asignada originalmente a Alexander Enrique Escobar Ortíz (Bitácora Fase 3, sección 7, pág. 6–7). Ante el incumplimiento del plazo de 48 horas establecido por el tutor y la actitud no colaborativa registrada, la tarea fue reasignada a Jonathan Ernesto Beltran Guerra por instrucción del tutor Ing. Carlos G. Rodríguez (comunicación del 25 Feb 2026). Constancia registrada en Jira (épica REPO-CLEANUP) y en la Bitácora Fase 4.

---

## Casos de Prueba — 8/8 Aprobados

| ID | Descripción | Fase | Responsable | Resultado |
|----|-------------|------|-------------|-----------|
| CP-06 | Panel inaccesible sin login | Fase 4 | Daniel Perez | ✅ PASS |
| CP-07 | Firebase bloquea credenciales inválidas | Fase 4 | Jonathan Beltran | ✅ PASS |
| CP-08 | OTP expira a los 5 minutos | Fase 4 | Jonathan Beltran | ✅ PASS |
| CP-09 | Bloqueo tras 3 intentos OTP | Fase 4 | Jonathan Beltran | ✅ PASS |
| CP-10 | Anti-duplicado mismo día mismo evento | Fase 4 | Alisson Serpas | ✅ PASS |
| CP-11 | Backup CSV antes del reseteo | Fase 4 | Daniel Perez | ✅ PASS |
| CP-12 | Trigger semanal funciona correctamente | Fase 4 | Jonathan Beltran | ✅ PASS |
| CP-13 | Ordenamiento por timestamp | Fase 4 | Jonathan Beltran | ✅ PASS |

---

## Reglas de Seguridad del Repositorio

1. **Sin credenciales reales en el código** — todo va en Script Properties
2. **Sin push directo a `main`** — todo cambio entra por Pull Request
3. **PR requiere 1 aprobación** antes de merge
4. **`.gitignore` activo** — excluye archivos locales con valores reales
5. **Tag `v1.0.0`** marca el estado final de la entrega

---

*Documento de trazabilidad — Entrega académica 1 Marzo 2026*  
*Tutor: Carlos Guillermo Rodríguez Álvarez*
