// Configuration constants for the Nature ID Study Tool

export const TAXON_IDS = {
    'all': null,
    'birds': [3],
    'plants': [47126],
    'insects': [47158],
    'mammals': [40151],
    'fish': [47178],
    'reptiles': [26036],
    'amphibians': [20978],
    'arachnids': [47119],
    'mollusks': [47115],
    'fungi': [47170]
};

export const US_STATE_BOUNDS = {
    'AL': {swlat: 30.2, swlng: -88.5, nelat: 35.0, nelng: -84.9},
    'AK': {swlat: 51.2, swlng: -179.1, nelat: 71.4, nelng: -129.9},
    'AZ': {swlat: 31.3, swlng: -114.8, nelat: 37.0, nelng: -109.0},
    'AR': {swlat: 33.0, swlng: -94.6, nelat: 36.5, nelng: -89.6},
    'CA': {swlat: 32.5, swlng: -124.5, nelat: 42.0, nelng: -114.1},
    'CO': {swlat: 36.9, swlng: -109.1, nelat: 41.0, nelng: -102.0},
    'CT': {swlat: 40.9, swlng: -73.7, nelat: 42.1, nelng: -71.8},
    'DE': {swlat: 38.4, swlng: -75.8, nelat: 39.8, nelng: -75.0},
    'FL': {swlat: 24.4, swlng: -87.6, nelat: 31.0, nelng: -79.8},
    'GA': {swlat: 30.3, swlng: -85.6, nelat: 35.0, nelng: -80.8},
    'HI': {swlat: 18.9, swlng: -160.2, nelat: 22.2, nelng: -154.8},
    'ID': {swlat: 41.9, swlng: -117.2, nelat: 49.0, nelng: -111.0},
    'IL': {swlat: 36.9, swlng: -91.5, nelat: 42.5, nelng: -87.0},
    'IN': {swlat: 37.7, swlng: -88.1, nelat: 41.8, nelng: -84.8},
    'IA': {swlat: 40.4, swlng: -96.6, nelat: 43.5, nelng: -90.1},
    'KS': {swlat: 36.9, swlng: -102.1, nelat: 40.0, nelng: -94.6},
    'KY': {swlat: 36.5, swlng: -89.6, nelat: 39.1, nelng: -81.9},
    'LA': {swlat: 28.9, swlng: -94.0, nelat: 33.0, nelng: -88.8},
    'ME': {swlat: 42.9, swlng: -71.1, nelat: 47.5, nelng: -66.9},
    'MD': {swlat: 37.9, swlng: -79.5, nelat: 39.7, nelng: -75.0},
    'MA': {swlat: 41.2, swlng: -73.5, nelat: 42.9, nelng: -69.9},
    'MI': {swlat: 41.6, swlng: -90.4, nelat: 48.3, nelng: -82.1},
    'MN': {swlat: 43.5, swlng: -97.2, nelat: 49.4, nelng: -89.5},
    'MS': {swlat: 30.2, swlng: -91.7, nelat: 35.0, nelng: -88.1},
    'MO': {swlat: 35.9, swlng: -95.8, nelat: 40.6, nelng: -89.1},
    'MT': {swlat: 44.3, swlng: -116.1, nelat: 49.0, nelng: -104.0},
    'NE': {swlat: 40.0, swlng: -104.1, nelat: 43.0, nelng: -95.3},
    'NV': {swlat: 35.0, swlng: -120.0, nelat: 42.0, nelng: -114.0},
    'NH': {swlat: 42.7, swlng: -72.6, nelat: 45.3, nelng: -70.6},
    'NJ': {swlat: 38.9, swlng: -75.6, nelat: 41.4, nelng: -73.9},
    'NM': {swlat: 31.3, swlng: -109.1, nelat: 37.0, nelng: -103.0},
    'NY': {swlat: 40.4, swlng: -79.8, nelat: 45.0, nelng: -71.8},
    'NC': {swlat: 33.8, swlng: -84.3, nelat: 36.6, nelng: -75.4},
    'ND': {swlat: 45.9, swlng: -104.1, nelat: 49.0, nelng: -96.6},
    'OH': {swlat: 38.4, swlng: -84.8, nelat: 42.3, nelng: -80.5},
    'OK': {swlat: 33.6, swlng: -103.0, nelat: 37.0, nelng: -94.4},
    'OR': {swlat: 41.9, swlng: -124.6, nelat: 46.3, nelng: -116.5},
    'PA': {swlat: 39.7, swlng: -80.5, nelat: 42.5, nelng: -74.7},
    'RI': {swlat: 41.1, swlng: -71.9, nelat: 42.0, nelng: -71.1},
    'SC': {swlat: 32.0, swlng: -83.4, nelat: 35.2, nelng: -78.5},
    'SD': {swlat: 42.5, swlng: -104.1, nelat: 45.9, nelng: -96.4},
    'TN': {swlat: 34.9, swlng: -90.3, nelat: 36.7, nelng: -81.6},
    'TX': {swlat: 25.8, swlng: -106.6, nelat: 36.5, nelng: -93.5},
    'UT': {swlat: 36.9, swlng: -114.1, nelat: 42.0, nelng: -109.0},
    'VT': {swlat: 42.7, swlng: -73.4, nelat: 45.0, nelng: -71.5},
    'VA': {swlat: 36.5, swlng: -83.7, nelat: 39.5, nelng: -75.2},
    'WA': {swlat: 45.5, swlng: -124.8, nelat: 49.0, nelng: -116.9},
    'WV': {swlat: 37.2, swlng: -82.6, nelat: 40.6, nelng: -77.7},
    'WI': {swlat: 42.5, swlng: -92.9, nelat: 47.3, nelng: -86.2},
    'WY': {swlat: 41.0, swlng: -111.1, nelat: 45.0, nelng: -104.0}
};

export const REGION_BOUNDS = {
    'global': null,
    'northeast': {swlat: 39.7, swlng: -80.5, nelat: 47.5, nelng: -66.9},
    'southeast': {swlat: 24.4, swlng: -88.5, nelat: 39.7, nelng: -75.4},
    'midwest': {swlat: 36.9, swlng: -104.0, nelat: 49.4, nelng: -80.5},
    'southwest': {swlat: 25.8, swlng: -125.0, nelat: 42.0, nelng: -93.5},
    'west': {swlat: 32.5, swlng: -125.0, nelat: 49.0, nelng: -104.0},
    'pacific': {swlat: 42.0, swlng: -125.0, nelat: 49.0, nelng: -116.9},
    'canada': {swlat: 41.6, swlng: -141.0, nelat: 83.1, nelng: -52.6},
    'uk': {swlat: 49.9, swlng: -10.7, nelat: 60.8, nelng: 1.8},
    'australia': {swlat: -43.6, swlng: 113.3, nelat: -10.7, nelng: 153.6},
    'europe': {swlat: 35.8, swlng: -10.7, nelat: 71.2, nelng: 40.2}
};

export const API_CONFIG = {
    BASE_URL: 'https://api.inaturalist.org/v1',
    OBSERVATIONS_URL: 'https://api.inaturalist.org/v1/observations',
    PRELOAD_QUEUE_SIZE: 5,
    MIN_QUESTIONS_PER_FETCH: 3,
    PHOTOS_PER_PAGE: 50,
    MAX_PAGES: 50,
    CACHE_TTL: 7200000, // 2 hours in ms
};

export const DIFFICULTY_SETTINGS = {
    easy: {
        qualityGrade: 'needs_id,research',
        popular: 'true',
        useScientificNames: false,
        requireSameFamily: false
    },
    medium: {
        qualityGrade: 'needs_id,research',
        popular: 'false',
        useScientificNames: false,
        requireSameFamily: true
    },
    hard: {
        qualityGrade: 'research',
        popular: 'false',
        useScientificNames: true,
        requireSameFamily: true
    }
};

export const SCORE_VALUES = {
    CORRECT: 10,
    STREAK_MULTIPLIER: 1
};

// ── Spaced Repetition ──
export const SR_INTERVALS = [0, 1, 3, 7, 14, 30]; // days per box
export const BOX_LABELS = ['New', 'Learning', 'Reviewing', 'Familiar', 'Confident', 'Mastered'];
export const DEFAULT_SESSION_SIZE = 15;

// ── Driftless Area tree genera (by scientific name) ──
// Resolved to iNaturalist taxon IDs at runtime via taxa/autocomplete API
// This avoids hardcoding IDs which can be wrong
export const DRIFTLESS_TREE_GENERA = [
    // Hardwoods
    'Quercus',       // Oaks
    'Carya',         // Hickories
    'Acer',          // Maples
    'Fraxinus',      // Ashes
    'Ulmus',         // Elms
    'Tilia',         // Basswood/Linden
    'Betula',        // Birches
    'Juglans',       // Walnuts
    'Prunus',        // Cherries/Plums (tree species)
    'Ostrya',        // Ironwood/Hop-hornbeam
    'Celtis',        // Hackberries
    'Populus',       // Poplars/Aspens/Cottonwoods
    'Gleditsia',     // Honeylocust
    'Robinia',       // Black Locust (invasive!)
    'Cornus',        // Dogwoods
    // Conifers
    'Pinus',         // Pines
    'Juniperus',     // Eastern red cedar, juniper
    'Tsuga',         // Hemlock
    'Abies',         // Firs
];

// ── Driftless Area shrub genera (by scientific name) ──
export const DRIFTLESS_SHRUB_GENERA = [
    'Cornus',        // Dogwoods (shrub species)
    'Viburnum',      // Viburnums
    'Rubus',         // Raspberries/blackberries
    'Ribes',         // Gooseberries/currants
    'Rhus',          // Sumacs
    'Rosa',          // Roses
    'Lonicera',      // Honeysuckles (many invasive!)
    'Sambucus',      // Elderberries
    'Rhamnus',       // Buckthorns (invasive!)
    'Frangula',      // Glossy Buckthorn
    'Euonymus',      // Burning bush (invasive!)
    'Berberis',      // Barberry (invasive!)
    'Elaeagnus',     // Autumn olive (invasive!)
    'Zanthoxylum',   // Prickly ash
    'Hamamelis',     // Witch hazel
    'Toxicodendron', // Poison ivy/sumac
    'Salix',         // Willows
    'Corylus',       // Hazelnuts
    'Amelanchier',   // Serviceberries
    'Symphoricarpos', // Snowberries
];

// ── Wisconsin NR40 Invasive Plant Species ──
// Sourced from official NR40 plant list: dnr.wisconsin.gov/sites/default/files/topic/Invasives/NR40plantlist.pdf
// Focused on terrestrial species relevant to Driftless Area forestry / TSI work.
// Status key: Prohibited = cannot possess/transport/introduce statewide
//             Restricted = cannot transport/transfer/introduce but existing populations may remain
//             Prohibited* = Prohibited in most counties, Restricted in listed counties (see NR 40.04/40.05)
// dnrFact: slug for WIDNR fact sheet at dnr.wi.gov/topic/Invasives/fact/{slug}.html (null = no known sheet)
export const WI_NR40_INVASIVES = {
    // ── Invasive Trees (NR40) ──
    'Ailanthus altissima': { common: 'Tree of Heaven', status: 'Restricted', dnrFact: 'TreeOfHeaven' },
    'Robinia pseudoacacia': { common: 'Black Locust', status: 'Restricted', dnrFact: 'BlackLocust' },
    'Ulmus pumila': { common: 'Siberian Elm', status: 'Restricted', dnrFact: 'SiberianElm' },
    'Morus alba': { common: 'White Mulberry', status: 'Restricted', dnrFact: 'WhiteMulberry' },
    'Populus alba': { common: 'White Poplar', status: 'Restricted', dnrFact: 'WhitePoplar' },
    'Alnus glutinosa': { common: 'Black Alder', status: 'Restricted', dnrFact: null },
    'Paulownia tomentosa': { common: 'Princesstree', status: 'Prohibited', dnrFact: null },
    'Phellodendron amurense': { common: 'Amur Cork Tree', status: 'Prohibited', dnrFact: null },

    // ── Invasive Shrubs (NR40) ──
    'Acer tataricum': { common: 'Amur Maple', status: 'Restricted', dnrFact: null },
    'Berberis thunbergii': { common: 'Japanese Barberry', status: 'Restricted', dnrFact: 'JapaneseBarberry' },
    'Berberis vulgaris': { common: 'Common Barberry', status: 'Prohibited', dnrFact: null },
    'Caragana arborescens': { common: 'Siberian Peashrub', status: 'Restricted', dnrFact: null },
    'Elaeagnus umbellata': { common: 'Autumn Olive', status: 'Restricted', dnrFact: 'AutumnOlive' },
    'Elaeagnus angustifolia': { common: 'Russian Olive', status: 'Restricted', dnrFact: 'RussianOlive' },
    'Euonymus alatus': { common: 'Burning Bush', status: 'Restricted', dnrFact: 'BurningBush' },
    'Frangula alnus': { common: 'Glossy Buckthorn', status: 'Restricted', dnrFact: 'GlossyBuckthorn' },
    'Rhamnus cathartica': { common: 'Common Buckthorn', status: 'Restricted', dnrFact: 'CommonBuckthorn' },
    'Rosa multiflora': { common: 'Multiflora Rose', status: 'Restricted', dnrFact: 'MultifloraRose' },
    'Robinia hispida': { common: 'Bristly Locust', status: 'Restricted', dnrFact: null },

    // ── Invasive Honeysuckles (NR40) ──
    'Lonicera maackii': { common: 'Amur Honeysuckle', status: 'Prohibited*', dnrFact: 'AmurHoneysuckle' },
    'Lonicera morrowii': { common: "Morrow's Honeysuckle", status: 'Restricted', dnrFact: 'MorrowHoneysuckle' },
    'Lonicera tatarica': { common: 'Tatarian Honeysuckle', status: 'Restricted', dnrFact: 'TatarianHoneysuckle' },
    'Lonicera x bella': { common: "Bell's Honeysuckle", status: 'Restricted', dnrFact: null },
    'Lonicera japonica': { common: 'Japanese Honeysuckle', status: 'Prohibited', dnrFact: null },

    // ── Invasive Vines (NR40) ──
    'Celastrus orbiculatus': { common: 'Oriental Bittersweet', status: 'Restricted', dnrFact: 'OrientalBittersweet' },

    // ── Invasive Forbs / Herbaceous (NR40) ──
    'Alliaria petiolata': { common: 'Garlic Mustard', status: 'Restricted', dnrFact: 'GarlicMustard' },
    'Cirsium arvense': { common: 'Canada Thistle', status: 'Restricted', dnrFact: 'CanadaThistle' },
    'Conium maculatum': { common: 'Poison Hemlock', status: 'Prohibited*', dnrFact: null },
    'Coronilla varia': { common: 'Crown Vetch', status: 'Restricted', dnrFact: 'CrownVetch' },
    'Dipsacus laciniatus': { common: 'Cut-leaved Teasel', status: 'Restricted', dnrFact: 'CutleavedTeasel' },
    'Dipsacus fullonum': { common: 'Common Teasel', status: 'Restricted', dnrFact: 'CommonTeasel' },
    'Euphorbia esula': { common: 'Leafy Spurge', status: 'Restricted', dnrFact: 'LeafySpurge' },
    'Fallopia japonica': { common: 'Japanese Knotweed', status: 'Restricted', dnrFact: null },
    'Heracleum mantegazzianum': { common: 'Giant Hogweed', status: 'Prohibited', dnrFact: null },
    'Hesperis matronalis': { common: "Dame's Rocket", status: 'Restricted', dnrFact: 'DamesRocket' },
    'Lythrum salicaria': { common: 'Purple Loosestrife', status: 'Restricted', dnrFact: 'PurpleLoosestrife' },
    'Pastinaca sativa': { common: 'Wild Parsnip', status: 'Restricted', dnrFact: 'WildParsnip' },
    'Ranunculus ficaria': { common: 'Lesser Celandine', status: 'Prohibited', dnrFact: null },
    'Centaurea stoebe': { common: 'Spotted Knapweed', status: 'Restricted', dnrFact: 'SpottedKnapweed' },
    'Tanacetum vulgare': { common: 'Tansy', status: 'Restricted', dnrFact: 'Tansy' },
    'Aegopodium podagraria': { common: "Bishop's Goutweed", status: 'Restricted', dnrFact: null },
    'Iris pseudacorus': { common: 'Yellow Iris', status: 'Restricted', dnrFact: null },

    // ── Prohibited/Restricted (varies by county — Prohibited* in most of WI) ──
    'Torilis japonica': { common: 'Japanese Hedgeparsley', status: 'Prohibited*', dnrFact: 'JapaneseHedgeparsley' },
    'Phragmites australis': { common: 'Common Reed', status: 'Prohibited*', dnrFact: 'Phragmites' },
    'Cirsium palustre': { common: 'European Marsh Thistle', status: 'Prohibited*', dnrFact: null },
    'Anthriscus sylvestris': { common: 'Wild Chervil', status: 'Prohibited*', dnrFact: null },
};

// WIDNR invasive fact sheet base URL
export const WIDNR_FACT_URL = 'https://dnr.wi.gov/topic/Invasives/fact/';

// ── Preset Decks (Driftless Area focus) ──
export const PRESET_DECKS = [
    {
        id: 'driftless_plants',
        name: 'Driftless Area Plants',
        icon: '🌿',
        description: 'Common plants of the Driftless region',
        query: { place_id: 155136, iconic_taxa: 'Plantae', quality_grade: 'research', rank: 'species', per_page: 200, photos: true }
    },
    {
        id: 'driftless_invasives',
        name: 'Driftless Invasives',
        icon: '⚠️',
        description: 'Non-native invasive plants in the Driftless Area',
        establishment: 'introduced',  // ALL results are introduced
        query: { place_id: 155136, iconic_taxa: 'Plantae', introduced: true, quality_grade: 'research', rank: 'species', per_page: 200, photos: true }
    },
    {
        id: 'nr40_invasives',
        name: 'WI NR40 Invasives',
        icon: '🚫',
        description: 'WI-regulated invasive species (NR40 Prohibited & Restricted)',
        establishment: 'introduced',
        // Uses curated species list — queries built at runtime from NR40 names
        source: 'nr40',
        query: { place_id: 155136, quality_grade: 'research', rank: 'species', per_page: 200, photos: true }
    },
    {
        id: 'driftless_trees',
        name: 'Driftless Trees',
        icon: '🌳',
        description: 'Trees of the Driftless — oaks, hickories, maples, pines & more',
        // Uses multi-genus queries for actual tree species
        source: 'tree_genera',
        query: { place_id: 155136, iconic_taxa: 'Plantae', quality_grade: 'research', rank: 'species', per_page: 100, photos: true }
    },
    {
        id: 'driftless_shrubs',
        name: 'Driftless Shrubs',
        icon: '🌳',
        description: 'Shrubs & woody plants — buckthorn, honeysuckle, viburnums & more',
        source: 'shrub_genera',
        query: { place_id: 155136, iconic_taxa: 'Plantae', quality_grade: 'research', rank: 'species', per_page: 100, photos: true }
    },
    {
        id: 'driftless_animals',
        name: 'Driftless Wildlife',
        icon: '🦌',
        description: 'Animals observed in the Driftless region',
        query: { place_id: 155136, iconic_taxa: 'Animalia', quality_grade: 'research', rank: 'species', per_page: 200, photos: true }
    }
];
