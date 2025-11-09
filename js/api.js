import { API_CONFIG, TAXON_IDS, US_STATE_BOUNDS, REGION_BOUNDS, DIFFICULTY_SETTINGS } from './config.js';

/**
 * Service class for interacting with the iNaturalist API
 */
export class INaturalistAPI {
    /**
     * Fetch species observations from iNaturalist API
     * @param {string} category - Species category (birds, plants, etc.)
     * @param {string} difficulty - Difficulty level (easy, medium, hard)
     * @param {string} region - Geographic region or state code
     * @returns {Promise<Array>} Array of observation objects
     */
    static async fetchObservations(category, difficulty, region) {
        const taxonIds = TAXON_IDS[category];
        const settings = DIFFICULTY_SETTINGS[difficulty];
        const page = Math.floor(Math.random() * API_CONFIG.MAX_PAGES) + 1;
        const bounds = US_STATE_BOUNDS[region] || REGION_BOUNDS[region];
        
        let url = `${API_CONFIG.BASE_URL}?quality_grade=${settings.qualityGrade}&popular=${settings.popular}&photos=true&per_page=${API_CONFIG.PHOTOS_PER_PAGE}&page=${page}&order=random&details=all`;
        
        if (taxonIds) {
            url += '&' + taxonIds.map(id => `taxon_id=${id}`).join('&');
        }
        
        if (bounds) {
            url += `&swlat=${bounds.swlat}&swlng=${bounds.swlng}&nelat=${bounds.nelat}&nelng=${bounds.nelng}`;
        }
        
        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                return data.results || [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching observations:', error);
            return [];
        }
    }

    /**
     * Fetch species from the same taxonomic group as the target species
     * @param {Object} targetTaxon - The target taxon object
     * @param {string} region - Geographic region
     * @param {number} count - Number of related species to fetch
     * @returns {Promise<Array>} Array of related observation objects
     */
    static async fetchRelatedSpecies(targetTaxon, region, count = 10) {
        const bounds = US_STATE_BOUNDS[region] || REGION_BOUNDS[region];
        
        // Try to find species from same genus first, then family, then order
        const taxonomicLevels = [
            { level: 'genus', id: targetTaxon.genus_id },
            { level: 'family', id: targetTaxon.family_id },
            { level: 'order', id: targetTaxon.order_id }
        ];

        for (const { level, id } of taxonomicLevels) {
            if (!id) continue;

            let url = `${API_CONFIG.BASE_URL}?quality_grade=research&photos=true&per_page=50&taxon_id=${id}&order=random`;
            
            if (bounds) {
                url += `&swlat=${bounds.swlat}&swlng=${bounds.swlng}&nelat=${bounds.nelat}&nelng=${bounds.nelng}`;
            }

            try {
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    const results = data.results || [];
                    
                    // Filter out the target species and ensure we have common names
                    const filtered = results.filter(obs => 
                        obs.taxon && 
                        obs.taxon.id !== targetTaxon.id &&
                        obs.taxon.preferred_common_name &&
                        obs.photos &&
                        obs.photos.length > 0
                    );

                    if (filtered.length >= count) {
                        return filtered.slice(0, count);
                    }
                }
            } catch (error) {
                console.error(`Error fetching ${level} species:`, error);
            }
        }

        return [];
    }

    /**
     * Validate if an observation has required data
     * @param {Object} observation - Observation object to validate
     * @returns {boolean} True if observation is valid
     */
    static isValidObservation(observation) {
        return observation.taxon && 
               observation.taxon.preferred_common_name && 
               observation.taxon.name &&
               observation.photos && 
               observation.photos.length > 0;
    }

    /**
     * Get taxonomy information for display
     * @param {Object} taxon - Taxon object
     * @returns {Object} Formatted taxonomy information
     */
    static getTaxonomyInfo(taxon) {
        return {
            scientificName: taxon.name,
            commonName: taxon.preferred_common_name,
            genus: taxon.genus || 'Unknown',
            family: taxon.family || 'Unknown',
            order: taxon.order || 'Unknown',
            class: taxon.class || 'Unknown'
        };
    }
}
