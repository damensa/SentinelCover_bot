# Guia d'Arrencada del Bot Sentinel

Aquesta guia explica com engegar i aturar el bot de forma segura per evitar bloquejos i pèrdua de sessió.

## Com engegar el bot
Utilitza sempre el mètode d'arrencada segura. Això neteja processos antics i fitxers de bloqueig automàticament.

### Opció 1: Des de la terminal (Recomanat)
Executa aquesta comanda a la carpeta del bot:
```bash
npm run safe-start
```

### Opció 2: Directament a Windows
Fes doble clic al fitxer:
`safe_start.bat`

## Com aturar el bot
Per aturar el bot correctament, prem **`Ctrl + C`** a la terminal i confirma (si t'ho demana) amb `S`.
*Això permet que el bot tanqui la sessió del navegador de forma neta.*

## Resolució de Problemes

### El bot diu "Target closed" o no arrenca
1. Tanca la terminal.
2. Torna a executar `npm run safe-start`.
*El script s'encarregarà de netejar el que hagi quedat pendent.*

### Vull forçar un nou escaneig de QR
Si vols tancar la sessió actual i tornar a escanejar el codi QR:
1. Atura el bot.
2. Esborra la carpeta `.wwebjs_auth`.
3. Torna a engegar el bot.

---
*Bot Sentinel - Estabilitat i Confiança*
