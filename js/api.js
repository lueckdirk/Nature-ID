import { API_CONFIG, TAXON_IDS, US_STATE_BOUNDS, REGION_BOUNDS, DIFFICULTY_SETTINGS } from './config.js';

/**
 * Service class for interacting with the iNaturalist API
 */
export class INaturalistAPI {
    /**
     * Extract taxonomic information from the taxon's ancestors array
     * This method processes the ancestor_ids and ancestors data already present in observations
     * @param {Object} taxon - The taxon object from an observation
     * @returns {Object} Enriched taxon with genus_name, family_name, etc.
     */
    static enrichTaxonFromAncestors(taxon) {
        // If already enriched, return as-is
        if (taxon.genus_name || taxon.family_name) {
            return taxon;
        }

        // Initialize taxonomy fields
        taxon.genus_name = 'Unknown';
        taxon.family_name = 'Unknown';
        taxon.order_name = 'Unknown';
        taxon.class_name = 'Unknown';
        taxon.genus_id = null;
        taxon.family_id = null;
        taxon.order_id = null;

        // Check if we have ancestors array (available with details=all)
        if (taxon.ancestors && Array.isArray(taxon.ancestors)) {
            for (const ancestor of taxon.ancestors) {
                switch(ancestor.rank) {
                    case 'genus':
                        taxon.genus_name = ancestor.name;
                        taxon.genus_id = ancestor.id;
                        break;
                    case 'family':
                        taxon.family_name = ancestor.name;
                        taxon.family_id = ancestor.id;
                        break;
                    case 'order':
                        taxon.order_name = ancestor.name;
                        taxon.order_id = ancestor.id;
                        break;
                    case 'class':
                        taxon.class_name = ancestor.name;
                        break;
                }
            }
        }

        // Fallback: try to extract from the taxon object itself if it's at that rank
        if (taxon.rank === 'species' || taxon.rank === 'subspecies') {
            // For species, check if ancestor_ids exist and try alternative approach
            // The taxon.name for species is typically "Genus species"
            if (taxon.genus_name === 'Unknown' && taxon.name) {
                const nameParts = taxon.name.split(' ');
                if (nameParts.length >= 2) {
                    taxon.genus_name = nameParts[0];
                }
            }
        }

        return taxon;
    }

    /**
     * Fetch species observations from iNaturalist API
     * @param {string} category - Species category (birds, plants, etc.)
     * @param {string} difficulty - Difficulty level (easy, medium, hard)
     * @param {string} region - Geographic region or state code
     * @returns {Promise<Array>} Array of observation objects with enriched taxonomy
     */
    static async fetchObservations(category, difficulty, region) {
        const taxonIds = TAXON_IDS[category];
        const settings = DIFFICULTY_SETTINGS[difficulty];
        const page = Math.floor(Math.random() * API_CONFIG.MAX_PAGES) + 1;
        const bounds = US_STATE_BOUNDS[region] || REGION_BOUNDS[region];
        
        // IMPORTANT: Using details=all to get ancestor information
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
                const observations = data.results || [];
                
                // Enrich each observation's taxon with ancestor data
                observations.forEach(obs => {
                    if (obs.taxon) {
                        this.enrichTaxonFromAncestors(obs.taxon);
                    }
                });
                
                return observations;
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

            // IMPORTANT: Using details=all to get ancestor information
            let url = `${API_CONFIG.BASE_URL}?quality_grade=research&photos=true&per_page=50&taxon_id=${id}&order=random&details=all`;
            
            if (bounds) {
                url += `&swlat=${bounds.swlat}&swlng=${bounds.swlng}&nelat=${bounds.nelat}&nelng=${bounds.nelng}`;
            }

            try {
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    const results = data.results || [];
                    
                    // Enrich each taxon with ancestor data
                    results.forEach(obs => {
                        if (obs.taxon) {
                            this.enrichTaxonFromAncestors(obs.taxon);
                        }
                    });
                    
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
     * @param {Object} taxon - Taxon object (enriched with ancestor data)
     * @returns {Object} Formatted taxonomy information
     */
    static getTaxonomyInfo(taxon) {
        return {
            scientificName: taxon.name,
            commonName: taxon.preferred_common_name,
            genus: taxon.genus_name || 'Unknown',
            family: taxon.family_name || 'Unknown',
            order: taxon.order_name || 'Unknown',
            class: taxon.class_name || 'Unknown'
        };
    }
}
