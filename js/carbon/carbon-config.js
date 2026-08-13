/* ============================================================
   Les Hyperion — Carbon Tracker Configuration
   ------------------------------------------------------------
   All Power Automate wiring lives here. Nothing else in the
   carbon module needs editing when endpoints change.
   ============================================================ */

const CARBON_CONFIG = {

  /* ----------------------------------------------------------
     POWER AUTOMATE — WRITE
     Flow trigger: "When an HTTP request is received"
     Action:       "Add a row into a table" (Excel Online)
     Paste the generated HTTP POST URL below.
     Leave empty ('') to run in local-only mode.
     ---------------------------------------------------------- */
  writeEndpoint: '',

  /* ----------------------------------------------------------
     POWER AUTOMATE — READ
     Flow trigger: "When an HTTP request is received" (GET)
     Actions:      "List rows present in a table" → "Response"
     Returns the full log as JSON so the figures can be drawn.
     Leave empty ('') to chart only this session's entries.
     ---------------------------------------------------------- */
  readEndpoint: '',

  /* How long to wait on a flow before giving up (ms) */
  timeoutMs: 12000,

  /* Landscapes / programmes shown in the log form */
  landscapes: [
    'Greater Kruger',
    'iSimangaliso / KwaNgwenya',
    'Okavango',
    'Nyekweri / Masai Mara',
    'Araucanía',
    'Mnemba Island',
    'Bazaruto Archipelago',
    'Head Office',
    'Other',
  ],

  /* Transport modes. Only modes with ready:true are selectable. */
  modes: [
    { id: 'flight',  label: 'Air travel', icon: '✈',  ready: true  },
    { id: 'vehicle', label: 'Vehicle',    icon: '🚙', ready: false },
    { id: 'boat',    label: 'Boat',       icon: '⛵', ready: false },
    { id: 'ebike',   label: 'E-bike',     icon: '🚲', ready: false },
  ],

  /* Local storage key for offline / unsynced entries */
  storageKey: 'lh-carbon-log',
};
