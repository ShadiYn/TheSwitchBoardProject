# The Switchboard

Juego narrativo de simulación de turno de noche. Eres el operador de una centralita misteriosa que conecta a callers con problemas extraños — hasta que empiezas a darte cuenta de que el propio Switchboard es el misterio.

## Stack

- **React 18** + **Vite 5**
- **Zustand 4** (con middleware `immer`) para estado global
- CSS Modules + variables CSS para theming (sin librería de UI)
- Sin backend — todo el progreso se guarda en `localStorage` (3 ranuras)

## Arrancar el proyecto

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

Para build de producción:

```bash
npm run build
npm run preview
```

## Estructura

```
src/
├── components/      # UI dividida por dominio (Phone, Dialogue, Office, Notebook, EndOfShift, Department)
├── screens/         # TitleScreen, GameScreen, EndingScreen — alto nivel
├── store/           # gameStore.js — único store Zustand con todo el estado de partida
├── engines/         # Lógica pura: flagEngine, callQueue, saveLoad, endingEngine
├── hooks/           # useDialogue (efecto máquina de escribir)
├── data/            # JSON: callers, departments, shifts, endings, calls/*.json
└── styles/          # tokens.css (paleta CRT), global.css, crt.css
```

## Contenido incluido

- **30 turnos** de juego, con cola de llamadas definida en `shifts.json`
- **15 callers** con voces y arcos distintos (`callers.json`)
- **42 llamadas** con diálogo ramificado completo, repartidas en 14 archivos JSON dentro de `data/calls/`
- **8 finales** con condiciones de desbloqueo basadas en stats ocultos y flags (`endings.json`)
- Sistema de **misterio progresivo**: el archivador con operadores anteriores, el gato profético, la llamada imposible del turno 17, y El Cronista (el operador original atrapado desde 1952)

## Cómo añadir una llamada nueva

1. Añade el objeto de llamada (con `id`, `callerId`, `shift`, `nodes`) a un archivo en `data/calls/`, o crea uno nuevo.
2. Regístrala en `data/callsIndex.json`: `{ "mi_call_id": { "file": "miarchivo.json", "unlockCondition": null } }`.
3. Añade el `id` al array `calls` del turno correspondiente en `data/shifts.json`.

El motor de carga (`engines/callQueue.js`) usa `import.meta.glob` para indexar todos los archivos de `data/calls/` automáticamente — no hace falta tocar código de carga.

## Sistema de flags

Toda la lógica condicional (elecciones visibles, desbloqueo de llamadas, anomalías de oficina, finales) pasa por `evaluateCondition()` en `engines/flagEngine.js`. Soporta `AND`, `OR`, `NOT`, `flagSet`, `flagNotSet`, `stat.gte/lte/gt/lt/eq`, y `runNumber.gte`.

## Stats ocultos

El jugador nunca ve números crudos. Los cuatro stats (`empathy`, `efficiency`, `curiosity`, `chaos`) se acumulan en `gameStore.stats` y determinan qué final se alcanza en el turno 30 (ver `engines/endingEngine.js`).

## Pendiente / próximos pasos sugeridos

- Sonido (efectos de teléfono, máquina de escribir, radio)
- `worldEventEngine.js` más rico (actualmente `EndOfShift.jsx` tiene eventos hardcodeados por turno)
- Tests unitarios para `flagEngine` y `endingEngine`
- Pase de accesibilidad (navegación por teclado completa, ARIA)
- Versión móvil del layout (`GameScreen.module.css` está pensado para escritorio)
