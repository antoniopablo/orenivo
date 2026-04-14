# ═══════════════════════════════════════════════════════════════
# ORENIVO — CHECKLIST MAESTRO DE LANZAMIENTO
# Desde hoy hasta los primeros €1,000 MRR
# Marca cada tarea con [x] cuando la completes
# ═══════════════════════════════════════════════════════════════


## 🔥 HOY (30 minutos)

- [ ] Verificar dominio orenivo.com en instantdomainsearch.com
- [ ] Registrar dominio (~€10)
- [ ] Pagar cuenta Chrome Web Store Developer ($5)
- [ ] Descargar orenivo-project-complete.tar.gz
- [ ] Descomprimir: `tar -xzf orenivo-project-complete.tar.gz`
- [ ] `cd orenivo && npm install && npm run dev`
- [ ] Verificar que carga en chrome://extensions


## 📋 SEMANA 1 — Setup + Sprint 1

### Código (5-8 horas)
- [ ] Extensión carga en ChatGPT con side panel abierto
- [ ] Content script lee lista de conversaciones del DOM
- [ ] Conversaciones aparecen en el side panel
- [ ] chrome.storage.local guarda datos entre sesiones
- [ ] Probar en Claude.ai (segundo adaptador)

### Marketing (2-3 horas)
- [ ] Crear cuenta Twitter/X → primer tweet #buildinpublic
- [ ] Crear cuenta Reddit → empezar a comentar en r/ChatGPT
- [ ] Crear perfil Product Hunt → upvotear 5 productos
- [ ] Crear cuenta LinkedIn → optimizar headline y bio
- [ ] Primer post LinkedIn (Post 1: problema de las 247 conversaciones)
- [ ] Instalar Easy Folders y Superpower ChatGPT → anotar debilidades

### Infraestructura (30 min)
- [ ] Crear cuenta Mailchimp → lista "Orenivo Users"
- [ ] Crear cuenta Supabase (para futuro sync)
- [ ] Crear cuenta Lemon Squeezy (para futuros pagos)
- [ ] Crear cuenta Sentry (error tracking)


## 📋 SEMANA 2 — Sprint 2: MVP de carpetas

### Código (5-8 horas)
- [ ] CRUD de carpetas funcional (crear, renombrar, eliminar)
- [ ] Colores de carpetas
- [ ] Subcarpetas
- [ ] Drag & drop de conversaciones a carpetas
- [ ] Barra de búsqueda por título
- [ ] Pin/unpin conversaciones
- [ ] Dark mode consistente

### Marketing (2 horas)
- [ ] Tweet diario con captura de progreso
- [ ] Post LinkedIn (Post 2: dato del 84% de devs)
- [ ] Comentar 3x/día en Reddit (sin promocionar)
- [ ] Comentar en 3 posts de LinkedIn de otros


## 📋 SEMANA 3 — Sprint 3: Robustez

### Código (5-8 horas)
- [ ] MutationObserver para actualizaciones dinámicas
- [ ] Manejo de navegación SPA
- [ ] Selección múltiple + mover en lote
- [ ] Export/Import de carpetas como JSON
- [ ] Onboarding de 3 pasos para nuevos usuarios
- [ ] Error boundaries
- [ ] Tests básicos con Vitest (lógica de storage)

### Marketing (2 horas)
- [ ] Tweet diario
- [ ] Post LinkedIn (Post 5: decisión técnica Side Panel vs DOM)
- [ ] Seguir construyendo karma en Reddit
- [ ] Post LinkedIn en español (Post 3: historia personal)


## 📋 SEMANA 4 — Sprint 4: Claude + Polish

### Código (5-8 horas)
- [ ] Adaptador Claude.ai probado y funcionando
- [ ] Vista unificada multi-plataforma (ChatGPT + Claude juntos)
- [ ] Refactorizar al patrón adaptador limpio
- [ ] Optimizar performance (debounce, lazy loading)

### Marketing (2 horas)
- [ ] Tweet diario con milestone (2 plataformas!)
- [ ] Post LinkedIn (Post 6: milestone con números)
- [ ] Subir landing page a Carrd o Vercel
- [ ] Configurar email capture en landing page → Mailchimp


## 📋 SEMANA 5-6 — Sprint 5: Prompts + Base premium

### Código (5-8 horas/sprint)
- [ ] CRUD de prompt templates
- [ ] Variables dinámicas en prompts ({tema}, {idioma})
- [ ] Inyección one-click del prompt en el input
- [ ] Setup Supabase auth (Google OAuth)
- [ ] Página de cuenta/settings
- [ ] Adaptador Gemini (tercera plataforma)

### Marketing (3 horas)
- [ ] Post LinkedIn de teaser (Post 7: "La semana que viene lanzo")
- [ ] Recoger 50 emails de beta testers
- [ ] Preparar screenshots Chrome Web Store (5x)
- [ ] Escribir descripción CWS (ya la tienes, revisarla)


## 📋 SEMANA 7-8 — Sprint 6: Premium + pagos

### Código (5-8 horas/sprint)
- [ ] Integración Lemon Squeezy para suscripciones
- [ ] Lógica de freemium (5 carpetas gratis, ilimitadas Pro)
- [ ] Sync Supabase bidireccional (Pro feature)
- [ ] Adaptador DeepSeek (cuarta plataforma)
- [ ] UI de paywall y gating de features
- [ ] Reverse trial 14 días activo por defecto


## 📋 SEMANA 9-10 — Sprint 7: Preparación lanzamiento

### Assets y contenido
- [ ] 5 screenshots Chrome Web Store (1280x800)
- [ ] Video corto demo (30-60 seg, opcional pero recomendado)
- [ ] Descripción CWS en inglés (revisar y pulir)
- [ ] Descripción CWS en español
- [ ] Localizar CWS a 8+ idiomas (PT, FR, DE, JA, KO, ZH, IT)
- [ ] Política de privacidad publicada en web
- [ ] Landing page final con pricing y link a CWS

### Pre-lanzamiento
- [ ] Submit extensión a Chrome Web Store (espera 1-3 días review)
- [ ] Preparar 3 assets para Product Hunt
- [ ] Página Coming Soon en Product Hunt
- [ ] Email a lista de beta testers: "Lanzamos el [fecha]"
- [ ] Posts de Reddit pre-escritos (ya los tienes)
- [ ] Posts de LinkedIn pre-escritos (ya los tienes)
- [ ] Posts de Twitter pre-escritos (ya los tienes)


## 📋 SEMANA 11-12 — 🚀 LANZAMIENTO

### Día de lanzamiento
- [ ] Extensión aprobada y visible en Chrome Web Store
- [ ] Publicar en Product Hunt
- [ ] Post en r/SideProject + r/shamelessplug
- [ ] Post en Twitter (tweet de lanzamiento)
- [ ] Post en LinkedIn (Post 8: lanzamiento)
- [ ] Email a lista de suscriptores
- [ ] Enviar a 5 directorios IA (TAAFT, Futurepedia, etc.)
- [ ] Post en Indie Hackers

### Semana de lanzamiento (días 2-7)
- [ ] Post en r/ChatGPT (día 2-3)
- [ ] Post en r/ClaudeAI (día 4-5)
- [ ] Show HN en Hacker News (día 5-6)
- [ ] LinkedIn Post 9 (métricas 24h)
- [ ] LinkedIn Post 10 (historia humana)
- [ ] Responder a CADA review en CWS
- [ ] Responder a CADA comentario en Reddit/PH/HN
- [ ] Enviar a 10 directorios más
- [ ] Tweet diario con métricas reales

### Post-lanzamiento (semana 2-4)
- [ ] Post en r/productivity
- [ ] Post en r/webdev (si open source)
- [ ] Post en Menéame
- [ ] Post en comunidades españolas (Telegram, Discord)
- [ ] Blog post tutorial en landing page
- [ ] Segundo post en Reddit (diferente ángulo)
- [ ] Activar prompt de reviews en la extensión
- [ ] Contactar 3 extensiones complementarias para cross-promo


## 📋 MES 3-4 — CRECIMIENTO

### Producto
- [ ] Feature más solicitada por usuarios
- [ ] Tags/etiquetas para conversaciones
- [ ] Keyboard shortcuts
- [ ] Import desde Easy Folders (facilitar migración)
- [ ] Video tutorial en español para YouTube

### Distribución
- [ ] SEO: blog post "How to organize ChatGPT conversations"
- [ ] SEO: blog post "Best ChatGPT Chrome extensions 2026"
- [ ] Enviar a listas awesome-* de GitHub (si open source)
- [ ] Discord/comunidad para power users
- [ ] Recoger 30+ reviews en Chrome Web Store
- [ ] Analizar CWS search analytics → optimizar keywords
- [ ] A/B test pricing (mensual vs lifetime)

### Métricas objetivo
- [ ] 500+ usuarios instalados
- [ ] 20+ reviews en CWS (4.5+ estrellas)
- [ ] 10+ usuarios de pago
- [ ] €100+ MRR


## 📋 MES 5-6 — ESCALAR

### Producto
- [ ] Búsqueda full-text (dentro del contenido)
- [ ] Galería de prompts compartidos por la comunidad
- [ ] Analytics de uso personal

### Distribución
- [ ] Newsletter mensual (changelog + tips)
- [ ] Contenido recurrente LinkedIn (3x/semana)
- [ ] SEO programático (páginas por plataforma/idioma)
- [ ] Contactar bloggers/reviewers de Chrome extensions

### Métricas objetivo
- [ ] 2,000+ usuarios instalados
- [ ] 50+ reviews en CWS
- [ ] 75+ usuarios de pago
- [ ] €500+ MRR


## 📋 MES 7-12 — CONSOLIDAR

### Producto
- [ ] Tier de equipos (carpetas compartidas)
- [ ] Integración Notion/Obsidian export
- [ ] Soporte Grok, Perplexity, AI Studio
- [ ] Versión Firefox

### Decisiones clave
- [ ] €1,500 MRR → ¿más horas o mismo ritmo?
- [ ] €3,000 MRR → ¿contratar freelancer para soporte?
- [ ] €5,000 MRR → ¿empezar Spanish Price Tracker (producto #2)?

### Métricas objetivo
- [ ] 8,000+ usuarios
- [ ] 200+ usuarios de pago
- [ ] €1,000+ MRR


# ═══════════════════════════════════════════════════════════════
# PRESUPUESTO TRACKER
# ═══════════════════════════════════════════════════════════════
#
# Concepto                  | Coste      | Estado
# ──────────────────────────|────────────|────────
# Chrome Web Store fee      | €5         | [ ]
# Dominio .com              | €10-15     | [ ]
# Carrd landing page        | €9/año     | [ ]
# Supabase                  | €0 (free)  | [ ]
# Lemon Squeezy             | €0 (free)  | [ ]
# Mailchimp                 | €0 (free)  | [ ]
# Sentry                    | €0 (free)  | [ ]
# Vercel hosting            | €0 (free)  | [ ]
# ──────────────────────────|────────────|────────
# TOTAL                     | ~€25-30    |
# RESERVA                   | ~€470      |
#
# ═══════════════════════════════════════════════════════════════
