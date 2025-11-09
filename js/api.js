import { API_CONFIG, TAXON_IDS, US_STATE_BOUNDS, REGION_BOUNDS, DIFFICULTY_SETTINGS } from './config.js';

/**
 * Service class for interacting with the iNaturalist API
 */
export class INaturalistAPI {
    /**
     * Fetch detailed taxon information including full taxonomic hierarchy
     * @param {number} taxonId - The taxon ID to fetch
     * @returns {Promise<Object|null>} Taxon object with ancestors, or null if failed
     */
    static async fetchTaxonDetails(taxonId) {
        try {
            const response = await fetch(`https://api.inaturalist.org/v1/taxa/${taxonId}`);
            if (response.ok) {
                const data = await response.json();
                return data.results?.[0] || null;
            }
            return null;
        } catch (error) {
            console.error('Error fetching taxon details:', error);
            return null;
        }
    }

    /**
     * Extract taxonomic rank from ancestors array
     * @param {Array} ancestors - Array of ancestor taxon objects
     * @param {string} rank - The rank to find (genus, family, order, class, etc.)
     * @returns {string} The name of the taxon at that rank, or 'Unknown'
     */
    static extractRankFromAncestors(ancestors, rank) {
        if (!ancestors || !Array.isArray(ancestors)) return 'Unknown';
        
        const ancestor = ancestors.find(a => a.rank === rank);
        return ancestor ? ancestor.name : 'Unknown';
    }

    /**
     * Enrich observation with detailed taxonomy information
     * @param {Object} observation - Observation object from API
     * @returns {Promise<Object>} Observation with enriched taxon data
     */
    static async enrichObservationWithTaxonomy(observation) {
        if (!observation.taxon || !observation.taxon.id) {
            return observation;
        }

        const taxonDetails = await this.fetchTaxonDetails(observation.taxon.id);
        
        if (taxonDetails && taxonDetails.ancestors) {
            // Add the full taxonomic hierarchy to the observation
            observation.taxon.genus_name = this.extractRankFromAncestors(taxonDetails.ancestors, 'genus');
            observation.taxon.family_name = this.extractRankFromAncestors(taxonDetails.ancestors, 'family');
            observation.taxon.order_name = this.extractRankFromAncestors(taxonDetails.ancestors, 'order');
            observation.taxon.class_name = this.extractRankFromAncestors(taxonDetails.ancestors, 'class');
            
            // Also store the IDs for reference (useful for fetchRelatedSpecies)
            const genusAncestor = taxonDetails.ancestors.find(a => a.rank === 'genus');
            const familyAncestor = taxonDetails.ancestors.find(a => a.rank === 'family');
            const orderAncestor = taxonDetails.ancestors.find(a => a.rank === 'order');
            
            observation.taxon.genus_id = genusAncestor?.id || null;
            observation.taxon.family_id = familyAncestor?.id || null;
            observation.taxon.order_id = orderAncestor?.id || null;
        }
        
        return observation;
    }

    /**
     * Fetch species observations from iNaturalist API
     * @param {string} category - Species category (birds, plants, etc.)
     * @param {string} difficulty - Difficulty level (easy, medium, hard)
     * @param {string} region - Geographic region or state code
     * @param {boolean} enrichWithTaxonomy - Whether to fetch detailed taxonomy (default: true)
     * @returns {Promise<Array>} Array of observation objects
     */
    static async fetchObservations(category, difficulty, region, enrichWithTaxonomy = true) {
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
                const observations = data.results || [];
                
                // Enrich observations with detailed taxonomy if requested
                if (enrichWithTaxonomy && observations.length > 0) {
                    // Add a small delay between requests to avoid rate limiting
                    const enrichedObservations = [];
                    for (const obs of observations) {
                        if (this.isValidObservation(obs)) {
                            const enriched = await this.enrichObservationWithTaxonomy(obs);
                            enrichedObservations.push(enriched);
                            // Small delay to be respectful to the API
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                    }
                    return enrichedObservations;
                }
                
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
     * @param {Object} taxon - Taxon object (should be enriched with taxonomy data)
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
