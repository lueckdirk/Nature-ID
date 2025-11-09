// Configuration constants for the Nature ID Game

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
    BASE_URL: 'https://api.inaturalist.org/v1/observations',
    PRELOAD_QUEUE_SIZE: 5,
    MIN_QUESTIONS_PER_FETCH: 3,
    PHOTOS_PER_PAGE: 50,
    MAX_PAGES: 50
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
