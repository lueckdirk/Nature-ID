import { API_CONFIG, TAXON_IDS, US_STATE_BOUNDS, REGION_BOUNDS, DIFFICULTY_SETTINGS,
    DRIFTLESS_TREE_GENERA, DRIFTLESS_SHRUB_GENERA, WI_NR40_INVASIVES } from './config.js';

/**
 * Service class for interacting with the iNaturalist API
 */
export class INaturalistAPI {

    // ── Original observation-based methods (for classic quiz mode) ──

    /**
     * Extract taxonomic information from the taxon's ancestors array
     */
    static enrichTaxonFromAncestors(taxon) {
        if (taxon.genus_name || taxon.family_name) return taxon;

        taxon.genus_name = 'Unknown';
        taxon.family_name = 'Unknown';
        taxon.order_name = 'Unknown';
        taxon.class_name = 'Unknown';
        taxon.genus_id = null;
        taxon.family_id = null;
        taxon.order_id = null;

        if (taxon.ancestors && Array.isArray(taxon.ancestors)) {
            for (const ancestor of taxon.ancestors) {
                switch (ancestor.rank) {
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

        if ((taxon.rank === 'species' || taxon.rank === 'subspecies') &&
            taxon.genus_name === 'Unknown' && taxon.name) {
            const parts = taxon.name.split(' ');
            if (parts.length >= 2) taxon.genus_name = parts[0];
        }

        return taxon;
    }

    /**
     * Fetch observations for classic quiz mode
     */
    static async fetchObservations(category, difficulty, region) {
        const taxonIds = TAXON_IDS[category];
        const settings = DIFFICULTY_SETTINGS[difficulty];
        const page = Math.floor(Math.random() * API_CONFIG.MAX_PAGES) + 1;
        const bounds = US_STATE_BOUNDS[region] || REGION_BOUNDS[region];

        let url = `${API_CONFIG.OBSERVATIONS_URL}?quality_grade=${settings.qualityGrade}&popular=${settings.popular}&photos=true&per_page=${API_CONFIG.PHOTOS_PER_PAGE}&page=${page}&order=random&details=all`;

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
                observations.forEach(obs => {
                    if (obs.taxon) this.enrichTaxonFromAncestors(obs.taxon);
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
     * Fetch related species for wrong answers
     */
    static async fetchRelatedSpecies(targetTaxon, region, count = 10) {
        const bounds = US_STATE_BOUNDS[region] || REGION_BOUNDS[region];
        const levels = [
            { level: 'genus', id: targetTaxon.genus_id },
            { level: 'family', id: targetTaxon.family_id },
            { level: 'order', id: targetTaxon.order_id }
        ];

        for (const { level, id } of levels) {
            if (!id) continue;
            let url = `${API_CONFIG.OBSERVATIONS_URL}?quality_grade=research&photos=true&per_page=50&taxon_id=${id}&order=random&details=all`;
            if (bounds) {
                url += `&swlat=${bounds.swlat}&swlng=${bounds.swlng}&nelat=${bounds.nelat}&nelng=${bounds.nelng}`;
            }
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    const results = data.results || [];
                    results.forEach(obs => {
                        if (obs.taxon) this.enrichTaxonFromAncestors(obs.taxon);
                    });
                    const filtered = results.filter(obs =>
                        obs.taxon && obs.taxon.id !== targetTaxon.id &&
                        obs.taxon.preferred_common_name &&
                        obs.photos && obs.photos.length > 0
                    );
                    if (filtered.length >= count) return filtered.slice(0, count);
                }
            } catch (error) {
                console.error(`Error fetching ${level} species:`, error);
            }
        }
        return [];
    }

    static isValidObservation(observation) {
        return observation.taxon &&
            observation.taxon.preferred_common_name &&
            observation.taxon.name &&
            observation.photos &&
            observation.photos.length > 0;
    }

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

    // ── New deck-based methods (species_counts endpoint) ──

    /**
     * Fetch species counts for a deck query
     * @param {Object} params - Query parameters for species_counts
     * @returns {Promise<Array>} Array of { taxon, count } results
     */
    static async speciesCounts(params) {
        const url = new URL(`${API_CONFIG.BASE_URL}/observations/species_counts`);
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null) url.searchParams.set(k, v);
        }
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();
        return data.results || [];
    }

    /**
     * Search places by name
     */
    static async searchPlaces(query) {
        if (!query || query.length < 2) return [];
        const url = new URL(`${API_CONFIG.BASE_URL}/places/autocomplete`);
        url.searchParams.set('q', query);
        url.searchParams.set('per_page', '10');
        try {
            const res = await fetch(url);
            if (!res.ok) return [];
            const data = await res.json();
            return data.results || [];
        } catch { return []; }
    }

    /**
     * Search taxa by name
     */
    static async searchTaxa(query) {
        if (!query || query.length < 2) return [];
        const url = new URL(`${API_CONFIG.BASE_URL}/taxa/autocomplete`);
        url.searchParams.set('q', query);
        url.searchParams.set('per_page', '10');
        try {
            const res = await fetch(url);
            if (!res.ok) return [];
            const data = await res.json();
            return data.results || [];
        } catch { return []; }
    }

    /**
     * Fetch random observation photos for a taxon (varied images)
     */
    static async getObservationPhotos(taxonId, placeId, count = 8) {
        const url = new URL(`${API_CONFIG.OBSERVATIONS_URL}`);
        url.searchParams.set('taxon_id', taxonId);
        if (placeId) url.searchParams.set('place_id', placeId);
        url.searchParams.set('quality_grade', 'research');
        url.searchParams.set('photos', 'true');
        url.searchParams.set('per_page', count);
        url.searchParams.set('order', 'random');
        try {
            const res = await fetch(url);
            if (!res.ok) return [];
            const data = await res.json();
            return (data.results || [])
                .filter(o => o.photos && o.photos.length > 0)
                .map(o => o.photos[0].url.replace('square', 'medium'));
        } catch { return []; }
    }

    /**
     * Get a photo URL from a taxon object at a given size
     */
    static getPhotoUrl(taxon, size = 'medium') {
        if (!taxon.default_photo) return null;
        const url = taxon.default_photo.medium_url || taxon.default_photo.url || '';
        return url.replace('square', size).replace('small', size);
    }

    // ── Multi-genus queries (trees, shrubs) ──

    /**
     * Fetch species counts across multiple genera using Promise.all
     * iNaturalist API v1 doesn't support comma-separated taxon_ids for species_counts,
     * so we make one call per genus and merge/deduplicate results.
     * @param {Object} generaMap - Map of taxonId -> genusName (e.g. DRIFTLESS_TREE_GENERA)
     * @param {Object} baseParams - Base query params (place_id, quality_grade, etc.)
     * @returns {Promise<Array>} Deduplicated species results
     */
    static async multiGenusSpeciesCounts(generaMap, baseParams) {
        const genusIds = Object.keys(generaMap).map(Number);
        // Fire all genus queries in parallel
        const promises = genusIds.map(gid =>
            this.speciesCounts({ ...baseParams, taxon_id: gid })
                .catch(err => { console.warn(`Genus ${gid} failed:`, err); return []; })
        );
        const allResults = await Promise.all(promises);
        // Merge and deduplicate by taxon.id
        const seen = new Map();
        for (const results of allResults) {
            for (const r of results) {
                if (r.taxon && !seen.has(r.taxon.id)) {
                    seen.set(r.taxon.id, r);
                }
            }
        }
        return Array.from(seen.values());
    }

    // ── Introduced species cross-reference ──

    /**
     * Fetch the set of taxon IDs that are introduced/invasive in a given place.
     * Uses the query-level `introduced=true` parameter which is PLACE-SPECIFIC
     * (unlike the taxon.introduced field which is global and unreliable).
     * @param {number} placeId - iNaturalist place_id
     * @returns {Promise<Set<number>>} Set of introduced taxon IDs
     */
    static async fetchIntroducedIds(placeId) {
        const ids = new Set();
        try {
            // Fetch a large batch of introduced plant species for this place
            const results = await this.speciesCounts({
                place_id: placeId,
                iconic_taxa: 'Plantae',
                introduced: true,
                quality_grade: 'research',
                rank: 'species',
                per_page: 500,
                photos: true
            });
            for (const r of results) {
                if (r.taxon) ids.add(r.taxon.id);
            }
        } catch (err) {
            console.warn('Failed to fetch introduced IDs:', err);
        }
        return ids;
    }

    // ── External info links ──

    /**
     * Fetch external info links for a taxon from iNaturalist's (undocumented) links endpoint
     * Returns links to Wikipedia, field guides, management info, etc.
     * @param {number} taxonId
     * @returns {Promise<Array>} Array of link objects { site_title, url, ... }
     */
    static async fetchTaxonLinks(taxonId) {
        try {
            const res = await fetch(`https://www.inaturalist.org/taxa/${taxonId}/links.json`);
            if (!res.ok) return [];
            return await res.json();
        } catch { return []; }
    }

    // ── NR40 curated deck support ──

    /**
     * Fetch species data for WI NR40 curated invasive species.
     * Searches by scientific name and gathers observation photos.
     * @param {Object} baseParams - Base query params (place_id, etc.)
     * @returns {Promise<Array>} Species results matching NR40 list
     */
    static async fetchNR40Species(baseParams) {
        const names = Object.keys(WI_NR40_INVASIVES);
        // Search for each NR40 species by scientific name
        const promises = names.map(name =>
            this.speciesCounts({
                ...baseParams,
                taxon_name: name,
                introduced: true
            }).catch(() => [])
        );
        const allResults = await Promise.all(promises);
        const seen = new Map();
        for (let i = 0; i < allResults.length; i++) {
            for (const r of allResults[i]) {
                if (r.taxon && !seen.has(r.taxon.id)) {
                    // Attach NR40 metadata to the taxon
                    const nr40 = WI_NR40_INVASIVES[names[i]];
                    if (nr40) {
                        r.taxon._nr40 = nr40;
                    }
                    seen.set(r.taxon.id, r);
                }
            }
        }
        return Array.from(seen.values());
    }
}
