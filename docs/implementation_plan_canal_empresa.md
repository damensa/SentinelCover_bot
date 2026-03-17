# [IMPLEMENTATION PLAN] - Phase 3: Automatització de la Presentació a Canal Empresa (FUE/RITSIC)

Aquest pla detalla el següent gran pas del projecte: l'automatització robòtica (RPA) per a la càrrega dels certificats (ELEC1, Aigua, etc.) directament al portal de **Canal Empresa** de la Generalitat de Catalunya, tancant el cercle des de la recollida de dades per WhatsApp fins a l'obtenció del justificant oficial del RITSIC.

## Objectius
- Automatitzar l'accés al portal de tràmits.
- Mapejar les dades recollides (XFA/Session) als formularis web de la Generalitat.
- Pujar el PDF generat i descarregar el justificant d'inscripció.

## Cambis Proposats

### 1. Servei d'Automatització (Web Scraper/RPA)
#### [NEW] [canal-empresa-service.ts](file:///c:/Users/dave_/.gemini/antigravity/scratch/notebooklm-mcp/src/services/canal-empresa-service.ts)
- Implementar un servei basat en **Puppeteer** per navegar pel portal.
- **Login:** Gestió de l'entrada amb certificat digital o idCAT Mòbil (requerirà intervenció manual o gestió de tokens si és possible).
- **Navigation:** Ruta automàtica cap al tràmit RITSIC (Presentació de la declaració responsable).
- **Form Filling:** Injecció de dades als camps web (`DOM selectors`) a partir de l'objecte de dades del bot.

### 2. Mapeig de Camps Web
#### [NEW] [web_field_map.json](file:///c:/Users/dave_/.gemini/antigravity/scratch/notebooklm-mcp/docs/web_field_map.json)
- Crear un diccionari que relacioni els IDs de l'XFA (e.g., `TXT_CUPS`) amb els selectors CSS del portal de tràmits.

### 3. Flux de Treball (Workflow)
#### [MODIFY] [whatsapp.ts](file:///c:/Users/dave_/.gemini/antigravity/scratch/notebooklm-mcp/src/whatsapp.ts)
- Afegir una opció final al bot: "Vols que tramiti el certificat ara mateix?".
- Si l'usuari accepta, invocar el `CanalEmpresaService`.

## Pla de Verificació

### Proves de Navegació
1. Executar el servei en mode `headless: false` per veure com el bot obre el navegador i arriba a la pàgina de login.
2. Verificar que s'identifiquen correctament els camps de "CUPS", "Potència" i "Titular" a la web.

### Proves d'Autenticació
- **Manual Check:** El bot s'ha de pausar i esperar que l'usuari completi l'idCAT Mòbil al seu telèfon, o bé utilitzar un certificat de proves si està disponible.

### Verificació Final
- Un cop completat, el bot ha de retornar per WhatsApp el fitxer `justificant_ritsic.pdf`.
