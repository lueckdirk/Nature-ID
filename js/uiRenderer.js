import { INaturalistAPI } from './api.js';
import { SpacedRepetition } from './spacedRepetition.js';
import { Store } from './store.js';
import { PRESET_DECKS, BOX_LABELS, WI_NR40_INVASIVES, WIDNR_FACT_URL } from './config.js';

/**
 * Handles all UI rendering and updates for the study tool
 */
export class UIRenderer {
    constructor(appEl) {
        this.app = appEl;
    }

    // ══════════════════════════════════════
    // LIBRARY VIEW
    // ══════════════════════════════════════
    renderLibrary(callbacks) {
        const sr = Store.getSR();
        const log = Store.getStudyLog();
        const customDecks = Store.getDecks();
        const totalSpecies = new Set(Object.keys(sr)).size;
        const masteredCount = Object.values(sr).filter(d => d.box >= 4).length;

        this.app.innerHTML = `
            <div class="app-header">
                <div>
                    <h1>🌿 Nature ID</h1>
                    <div class="subtitle">Species Study Tool</div>
                </div>
            </div>
            <div class="stats-bar">
                <div class="stat-chip">🧠 <span class="num">${totalSpecies}</span> species seen</div>
                <div class="stat-chip">⭐ <span class="num">${masteredCount}</span> mastered</div>
                <div class="stat-chip">🔥 <span class="num">${log.streak}</span> day streak</div>
            </div>

            <div class="section-title">Study Decks</div>
            <div class="deck-grid">
                ${PRESET_DECKS.map(p => this._renderDeckCard(p, sr)).join('')}
                ${customDecks.map(d => this._renderDeckCard(d, sr)).join('')}
                <div class="deck-card create-card" data-action="createDeck">
                    <span class="icon">+</span>
                    <span class="name">Custom Deck</span>
                </div>
            </div>

            <div class="section-title" style="margin-top:12px">Classic Quiz</div>
            <div class="deck-grid">
                <div class="deck-card" data-action="openClassic" style="grid-column:1/-1">
                    <span class="icon">🎮</span>
                    <div class="name">Classic Quiz Mode</div>
                    <div class="desc">The original Nature ID Game — pick category, difficulty & region</div>
                </div>
            </div>
        `;
    }

    _renderDeckCard(deck, sr) {
        const cache = Store.getSpeciesCache(deck.id);
        const species = cache?.species || [];
        const mastery = SpacedRepetition.getDeckMastery(species, sr);
        return `
            <div class="deck-card" data-action="openDeck" data-deck-id="${deck.id}">
                <span class="icon">${deck.icon || '📚'}</span>
                <div class="name">${deck.name}</div>
                <div class="desc">${deck.description || ''}</div>
                <div class="progress-row">
                    <div class="progress-track">
                        <div class="progress-fill" style="width:${mastery.pct}%"></div>
                    </div>
                    <div class="progress-pct">${species.length > 0 ? mastery.pct + '%' : '—'}</div>
                </div>
            </div>
        `;
    }

    // ══════════════════════════════════════
    // DECK DETAIL VIEW
    // ══════════════════════════════════════
    renderDeckDetail(deck) {
        const sr = Store.getSR();
        const cache = Store.getSpeciesCache(deck.id);
        const species = cache?.species || [];
        const mastery = SpacedRepetition.getDeckMastery(species, sr);
        const settings = Store.getSettings();
        const isCustom = !PRESET_DECKS.find(p => p.id === deck.id);

        this.app.innerHTML = `
            <div class="app-header">
                <button class="back-btn" data-action="goLibrary">←</button>
                <h1>${deck.icon || '📚'} ${deck.name}</h1>
            </div>
            <div class="deck-detail">
                <div class="deck-hero">
                    <span class="icon">${deck.icon || '📚'}</span>
                    <h2>${deck.name}</h2>
                    <div class="meta">${deck.description || ''}</div>
                    ${species.length > 0 ? `
                        <div style="margin-top:16px">
                            <div class="progress-row" style="max-width:240px;margin:0 auto">
                                <div class="progress-track" style="height:8px">
                                    <div class="progress-fill" style="width:${mastery.pct}%"></div>
                                </div>
                                <div class="progress-pct">${mastery.pct}%</div>
                            </div>
                            <div style="font-size:0.82rem;color:var(--text-mid);margin-top:8px">
                                ${mastery.total} species · ${mastery.mastered} mastered · ${mastery.learning} learning · ${mastery.newCount} new
                            </div>
                        </div>
                    ` : '<div style="margin-top:12px;font-size:0.85rem;color:var(--text-mid)">Tap a mode below to load species data</div>'}
                </div>
                <div class="mode-buttons">
                    <div class="mode-btn" data-action="startSession" data-mode="quiz">
                        <span class="mode-icon">🎯</span>
                        <div class="mode-info">
                            <h3>Quiz Mode</h3>
                            <p>Multiple choice — test your identification skills</p>
                        </div>
                    </div>
                    <div class="mode-btn" data-action="startSession" data-mode="study">
                        <span class="mode-icon">📖</span>
                        <div class="mode-info">
                            <h3>Study Mode</h3>
                            <p>Flashcards — learn species at your own pace</p>
                        </div>
                    </div>
                    <div class="mode-btn" data-action="startBrowse">
                        <span class="mode-icon">📋</span>
                        <div class="mode-info">
                            <h3>Browse List</h3>
                            <p>View all species — see strengths, weaknesses & details</p>
                        </div>
                    </div>
                </div>
                <div class="session-settings">
                    <label>Cards per session</label>
                    <select data-action="setSessionSize">
                        ${[10, 15, 20, 30, 50].map(n =>
                            `<option value="${n}" ${settings.sessionSize === n ? 'selected' : ''}>${n}</option>`
                        ).join('')}
                    </select>
                </div>
                ${isCustom ? `<button class="delete-deck-btn" data-action="deleteDeck" data-deck-id="${deck.id}">Delete this deck</button>` : ''}
            </div>
        `;
    }

    // ══════════════════════════════════════
    // LOADING
    // ══════════════════════════════════════
    renderLoading(message = 'Fetching species data from iNaturalist...') {
        this.app.innerHTML = `
            <div class="loading-view">
                <div class="spinner"></div>
                <p>${message}</p>
                <p style="font-size:0.82rem;color:var(--text-light)">This may take a moment for the first load</p>
            </div>
        `;
    }

    // ══════════════════════════════════════
    // SESSION VIEW (Quiz + Study)
    // ══════════════════════════════════════
    renderSession(state) {
        const { sessionCards, cardIndex, sessionStreak, sessionMode, answered, revealed, selectedAnswer } = state;
        const card = sessionCards[cardIndex];
        if (!card) { this.renderError('No card to display'); return; }

        const totalCards = sessionCards.length;
        const progressPct = (cardIndex / totalCards) * 100;
        const photoUrl = card.photoUrl || card.defaultPhoto;

        let cardContent = '';
        if (sessionMode === 'quiz') {
            cardContent = this._renderQuizOptions(card, answered, selectedAnswer);
        } else {
            cardContent = this._renderStudyCard(card, revealed, answered);
        }

        let infoPanel = '';
        if (answered || (sessionMode === 'study' && revealed && answered)) {
            infoPanel = this._renderInfoPanel(card, state);
        }

        this.app.innerHTML = `
            <div class="session-view">
                <div class="session-topbar">
                    <button class="back-btn" data-action="endSession" style="width:32px;height:32px;font-size:1rem">✕</button>
                    <div class="session-progress-wrap">
                        <div class="session-progress">
                            <div class="session-progress-fill" style="width:${progressPct}%"></div>
                        </div>
                        <div class="session-count">${cardIndex + 1} of ${totalCards}</div>
                    </div>
                    ${sessionStreak >= 2 ? `<div class="streak-badge">🔥 ${sessionStreak}</div>` : ''}
                </div>
                <div class="card-area">
                    <div class="species-photo-wrap" data-action="zoomImage" data-url="${photoUrl || ''}">
                        ${photoUrl ? `<img class="species-photo" src="${photoUrl}" alt="Identify this species" onerror="this.style.display='none'" />` : ''}
                        ${!photoUrl ? '<div class="photo-loading">🌿</div>' : ''}
                        <div class="photo-hint">🔍 Tap to zoom</div>
                    </div>
                    ${cardContent}
                </div>
                ${infoPanel}
            </div>
        `;
    }

    _renderQuizOptions(card, answered, selectedAnswer) {
        return `
            <div class="quiz-prompt">What species is this?</div>
            <div class="options-list">
                ${card.options.map((opt, i) => {
                    let cls = 'option-btn';
                    if (answered) {
                        cls += ' disabled';
                        if (i === selectedAnswer && i !== card.correctIndex) cls += ' incorrect';
                        if (i === card.correctIndex) cls += ' correct';
                    }
                    return `
                        <div class="${cls}" data-action="selectAnswer" data-index="${i}">
                            <div>${opt.commonName}</div>
                            ${opt.sciName !== opt.commonName ? `<div class="sci-name">${opt.sciName}</div>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    _renderStudyCard(card, revealed, answered) {
        if (!revealed) {
            return `
                <div class="study-card">
                    <div class="study-front">
                        <p>Can you identify this species?</p>
                        <button class="reveal-btn" data-action="revealCard">Reveal Answer</button>
                    </div>
                </div>
            `;
        }
        const isIntro = card.introduced;
        return `
            <div class="study-card">
                <div class="study-back">
                    <div class="common-name">${card.commonName}</div>
                    <div class="sci-name-label">${card.sciName}</div>
                    <span class="native-badge ${isIntro ? 'introduced' : 'native'}">${isIntro ? '⚠️ Introduced' : '🏠 Native'}</span>
                    ${!answered ? `
                        <div class="confidence-prompt">How well did you know it?</div>
                        <div class="confidence-buttons">
                            <div class="conf-btn conf-yes" data-action="rateConfidence" data-quality="2">
                                <span class="conf-icon">✅</span>
                                <span class="conf-label">Knew it</span>
                            </div>
                            <div class="conf-btn conf-sorta" data-action="rateConfidence" data-quality="1">
                                <span class="conf-icon">🤔</span>
                                <span class="conf-label">Close</span>
                            </div>
                            <div class="conf-btn conf-no" data-action="rateConfidence" data-quality="0">
                                <span class="conf-icon">❌</span>
                                <span class="conf-label">Nope</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    _renderInfoPanel(card, state) {
        const sr = Store.getSR();
        const srData = sr[card.id];
        const boxLabel = SpacedRepetition.getBoxLabel(srData?.box);
        const isIntro = card.introduced;

        let resultHtml = '';
        if (state.sessionMode === 'quiz') {
            const isCorrect = state.selectedAnswer === card.correctIndex;
            resultHtml = `<div class="info-result ${isCorrect ? 'correct' : 'incorrect'}">
                ${isCorrect ? '✅ Correct!' : `❌ It's ${card.commonName}`}
            </div>`;
        }

        // ── NR40 status check ──
        const nr40 = card.nr40 || this._lookupNR40(card.sciName);
        let nr40Html = '';
        if (nr40) {
            nr40Html = `
                <div class="info-nr40">
                    <span class="info-tag nr40-status nr40-${nr40.status.toLowerCase().replace('*', '')}">
                        🚫 WI NR40: ${nr40.status === 'Prohibited*' ? 'Prohibited/Restricted' : nr40.status}
                    </span>
                    ${nr40.dnrFact ? `
                        <a class="info-link compact" href="${WIDNR_FACT_URL}${nr40.dnrFact}.html" target="_blank" rel="noopener">
                            📋 WIDNR Fact Sheet →
                        </a>
                    ` : ''}
                </div>
            `;
        }

        // ── External resource links ──
        let linksHtml = `
            <div class="info-links">
                <div class="info-links-title">Learn More</div>
                <a class="info-link" href="https://www.inaturalist.org/taxa/${card.id}" target="_blank" rel="noopener">
                    🌿 iNaturalist →
                </a>
                ${card.wikipediaUrl ? `
                    <a class="info-link" href="${card.wikipediaUrl}" target="_blank" rel="noopener">
                        📖 Wikipedia →
                    </a>
                ` : ''}
                ${isIntro ? `
                    <a class="info-link" href="https://www.invasive.org/browse/subinfo.cfm?sub=${encodeURIComponent(card.sciName)}" target="_blank" rel="noopener">
                        🔍 Invasive.org →
                    </a>
                ` : ''}
                <a class="info-link" href="https://www.inaturalist.org/taxa/${card.id}/browse_photos" target="_blank" rel="noopener">
                    📸 More Photos →
                </a>
            </div>
        `;

        // Trigger async fetch of iNat taxon links (lazy load)
        this._fetchAndAppendTaxonLinks(card.id);

        return `
            <div class="info-panel">
                ${resultHtml}
                <div class="info-species">
                    <img class="info-thumb" src="${card.defaultPhoto || ''}" alt="${card.commonName}" onerror="this.style.display='none'" />
                    <div class="info-names">
                        <div class="common">${card.commonName}</div>
                        <div class="sci">${card.sciName}</div>
                    </div>
                </div>
                <div class="info-tags">
                    <span class="info-tag ${isIntro ? 'introduced' : 'native'}">${isIntro ? '⚠️ Introduced' : '🏠 Native'}</span>
                    ${nr40 ? '' : ''}
                    <span class="info-tag obs-count">📊 ${card.obsCount?.toLocaleString() || '?'} observations</span>
                    <span class="info-tag box-tag">📦 ${boxLabel}</span>
                </div>
                ${nr40Html}
                ${linksHtml}
                <div id="taxon-links-extra"></div>
            </div>
            <div class="next-btn-wrap">
                <button class="next-btn" data-action="nextCard">
                    ${state.cardIndex + 1 < state.sessionCards.length ? 'Next →' : 'Finish Session'}
                </button>
            </div>
        `;
    }

    /**
     * Look up NR40 status by scientific name
     */
    _lookupNR40(sciName) {
        return WI_NR40_INVASIVES[sciName] || null;
    }

    /**
     * Async fetch iNaturalist's "More Info" links and append to info panel
     */
    async _fetchAndAppendTaxonLinks(taxonId) {
        try {
            const links = await INaturalistAPI.fetchTaxonLinks(taxonId);
            const container = document.getElementById('taxon-links-extra');
            if (!container || links.length === 0) return;

            // Filter to the most useful link types
            const useful = links
                .filter(l => l.url && l.site_title)
                .slice(0, 5);

            if (useful.length > 0) {
                container.innerHTML = `
                    <div class="info-links" style="margin-top:8px">
                        <div class="info-links-title">External Resources</div>
                        ${useful.map(l => `
                            <a class="info-link" href="${l.url}" target="_blank" rel="noopener">
                                🔗 ${l.site_title} →
                            </a>
                        `).join('')}
                    </div>
                `;
            }
        } catch {}
    }

    // ══════════════════════════════════════
    // SESSION SUMMARY
    // ══════════════════════════════════════
    // ══════════════════════════════════════
    // BROWSE VIEW — Full species list with mastery & detail
    // ══════════════════════════════════════
    renderBrowse(state) {
        const { activeDeck, browseFilter, browseSpecies, browseSelected } = state;
        const sr = Store.getSR();

        // Classify each species by mastery
        const classified = (browseSpecies || []).map(sp => {
            const d = sr[sp.id];
            let level = 'unseen';
            if (d) {
                if (d.box >= 4) level = 'strong';
                else if (d.box >= 2) level = 'learning';
                else level = 'weak';
            }
            return { ...sp, level, box: d?.box ?? -1, correct: d?.correct ?? 0, incorrect: d?.incorrect ?? 0 };
        });

        // Filter
        const filter = browseFilter || 'all';
        const filtered = filter === 'all' ? classified :
            classified.filter(sp => sp.level === filter);

        // Sort: unseen first, then weak, learning, strong; alpha within
        const levelOrder = { unseen: 0, weak: 1, learning: 2, strong: 3 };
        filtered.sort((a, b) => levelOrder[a.level] - levelOrder[b.level] || a.commonName.localeCompare(b.commonName));

        // Counts for filter chips
        const counts = { all: classified.length, unseen: 0, weak: 0, learning: 0, strong: 0 };
        for (const sp of classified) counts[sp.level]++;

        // If a species is selected, render detail view
        if (browseSelected) {
            const sp = classified.find(s => s.id === browseSelected);
            if (sp) {
                this._renderBrowseDetail(sp, activeDeck);
                return;
            }
        }

        this.app.innerHTML = `
            <div class="app-header">
                <button class="back-btn" data-action="goBackFromBrowse">←</button>
                <h1>📋 ${activeDeck?.name || 'Species List'}</h1>
            </div>
            <div class="browse-view">
                <div class="browse-filters">
                    <button class="filter-chip ${filter === 'all' ? 'active' : ''}" data-action="browseFilter" data-filter="all">
                        All <span class="chip-count">${counts.all}</span>
                    </button>
                    <button class="filter-chip ${filter === 'unseen' ? 'active' : ''}" data-action="browseFilter" data-filter="unseen">
                        🆕 Unseen <span class="chip-count">${counts.unseen}</span>
                    </button>
                    <button class="filter-chip ${filter === 'weak' ? 'active' : ''}" data-action="browseFilter" data-filter="weak">
                        🔴 Weak <span class="chip-count">${counts.weak}</span>
                    </button>
                    <button class="filter-chip ${filter === 'learning' ? 'active' : ''}" data-action="browseFilter" data-filter="learning">
                        🟡 Learning <span class="chip-count">${counts.learning}</span>
                    </button>
                    <button class="filter-chip ${filter === 'strong' ? 'active' : ''}" data-action="browseFilter" data-filter="strong">
                        🟢 Strong <span class="chip-count">${counts.strong}</span>
                    </button>
                </div>
                ${filtered.length === 0 ? `
                    <div class="browse-empty">
                        <p>No species match this filter yet.</p>
                        <p style="font-size:0.85rem;color:var(--text-mid)">Study some cards first to build your mastery data!</p>
                    </div>
                ` : `
                    <div class="browse-grid">
                        ${filtered.map(sp => `
                            <div class="browse-card mastery-${sp.level}" data-action="browseSelect" data-species-id="${sp.id}">
                                <div class="browse-thumb-wrap">
                                    <img class="browse-thumb" src="${sp.defaultPhoto || ''}" alt="${sp.commonName}" loading="lazy" onerror="this.style.display='none'" />
                                    <span class="browse-mastery-dot mastery-dot-${sp.level}"></span>
                                </div>
                                <div class="browse-names">
                                    <div class="browse-common">${sp.commonName}</div>
                                    <div class="browse-sci">${sp.sciName}</div>
                                </div>
                                ${sp.introduced ? '<span class="browse-badge intro">Introduced</span>' : ''}
                                ${this._lookupNR40(sp.sciName) ? '<span class="browse-badge nr40">NR40</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    }

    _renderBrowseDetail(sp, deck) {
        const nr40 = sp.nr40 || this._lookupNR40(sp.sciName);
        const sr = Store.getSR();
        const srData = sr[sp.id];
        const boxLabel = SpacedRepetition.getBoxLabel(srData?.box);
        const isIntro = sp.introduced;

        let nr40Html = '';
        if (nr40) {
            nr40Html = `
                <div class="info-nr40">
                    <span class="info-tag nr40-status nr40-${nr40.status.toLowerCase().replace('*', '')}">
                        🚫 WI NR40: ${nr40.status === 'Prohibited*' ? 'Prohibited/Restricted' : nr40.status}
                    </span>
                    ${nr40.dnrFact ? `
                        <a class="info-link compact" href="${WIDNR_FACT_URL}${nr40.dnrFact}.html" target="_blank" rel="noopener">
                            📋 WIDNR Fact Sheet →
                        </a>
                    ` : ''}
                </div>
            `;
        }

        this.app.innerHTML = `
            <div class="app-header">
                <button class="back-btn" data-action="browseBack">←</button>
                <h1>${sp.commonName}</h1>
            </div>
            <div class="browse-detail">
                <div class="detail-hero">
                    <img class="detail-photo" src="${sp.defaultPhoto || ''}" alt="${sp.commonName}" data-action="zoomImage" data-url="${sp.defaultPhoto || ''}" />
                </div>
                <div class="detail-photo-strip" id="browsePhotoStrip">
                    <div class="photo-strip-loading">Loading more photos...</div>
                </div>
                <div class="detail-body">
                    <h2 class="detail-common">${sp.commonName}</h2>
                    <div class="detail-sci">${sp.sciName}</div>

                    <div class="detail-tags">
                        <span class="info-tag ${isIntro ? 'introduced' : 'native'}">${isIntro ? '⚠️ Introduced' : '🏠 Native'}</span>
                        <span class="info-tag obs-count">📊 ${sp.obsCount?.toLocaleString() || '?'} observations</span>
                        <span class="info-tag box-tag mastery-tag-${sp.level}">
                            ${sp.level === 'unseen' ? '🆕' : sp.level === 'weak' ? '🔴' : sp.level === 'learning' ? '🟡' : '🟢'} ${boxLabel}
                        </span>
                    </div>

                    ${srData ? `
                        <div class="detail-stats">
                            <div class="detail-stat">
                                <div class="val">${srData.correct || 0}</div>
                                <div class="label">Correct</div>
                            </div>
                            <div class="detail-stat">
                                <div class="val">${srData.incorrect || 0}</div>
                                <div class="label">Incorrect</div>
                            </div>
                            <div class="detail-stat">
                                <div class="val">${srData.box || 0}/5</div>
                                <div class="label">Box</div>
                            </div>
                        </div>
                    ` : `
                        <div class="detail-stats-empty">You haven't studied this species yet — it will appear in your next session.</div>
                    `}

                    ${nr40Html}

                    <div class="info-links">
                        <div class="info-links-title">Learn More</div>
                        <a class="info-link" href="https://www.inaturalist.org/taxa/${sp.id}" target="_blank" rel="noopener">
                            🌿 iNaturalist →
                        </a>
                        ${sp.wikipediaUrl ? `
                            <a class="info-link" href="${sp.wikipediaUrl}" target="_blank" rel="noopener">
                                📖 Wikipedia →
                            </a>
                        ` : ''}
                        ${isIntro ? `
                            <a class="info-link" href="https://www.invasive.org/browse/subinfo.cfm?sub=${encodeURIComponent(sp.sciName)}" target="_blank" rel="noopener">
                                🔍 Invasive.org →
                            </a>
                        ` : ''}
                        <a class="info-link" href="https://www.inaturalist.org/taxa/${sp.id}/browse_photos" target="_blank" rel="noopener">
                            📸 More Photos on iNat →
                        </a>
                    </div>
                    <div id="taxon-links-extra"></div>
                </div>
            </div>
        `;

        // Lazy-load photo strip and external links
        this._loadBrowsePhotoStrip(sp.id, deck?.query?.place_id);
        this._fetchAndAppendTaxonLinks(sp.id);
    }

    async _loadBrowsePhotoStrip(taxonId, placeId) {
        try {
            const photos = await INaturalistAPI.getObservationPhotos(taxonId, placeId, 12);
            const strip = document.getElementById('browsePhotoStrip');
            if (!strip) return;
            if (photos.length === 0) {
                strip.innerHTML = '';
                return;
            }
            strip.innerHTML = photos.map(url => `
                <img class="strip-photo" src="${url}" alt="observation photo" loading="lazy"
                     data-action="zoomImage" data-url="${url}" onerror="this.remove()" />
            `).join('');
        } catch {
            const strip = document.getElementById('browsePhotoStrip');
            if (strip) strip.innerHTML = '';
        }
    }

    renderSummary(state) {
        const totalCards = state.sessionCards.length;
        const pct = totalCards > 0 ? Math.round((state.sessionScore / totalCards) * 100) : 0;
        const log = Store.getStudyLog();
        let emoji = '🌱';
        if (pct >= 90) emoji = '🏆';
        else if (pct >= 70) emoji = '🌟';
        else if (pct >= 50) emoji = '👍';

        this.app.innerHTML = `
            <div class="app-header">
                <button class="back-btn" data-action="goLibrary">←</button>
                <h1>Session Complete</h1>
            </div>
            <div class="summary-view">
                <div class="summary-card">
                    <div class="big-emoji">${emoji}</div>
                    <h2>${pct >= 70 ? 'Great work!' : pct >= 40 ? 'Keep practicing!' : 'Learning in progress!'}</h2>
                    <div class="sub">${state.activeDeck?.name || 'Study Session'}</div>
                    <div class="summary-stats">
                        <div class="summary-stat">
                            <div class="val">${state.sessionScore}/${totalCards}</div>
                            <div class="label">Correct</div>
                        </div>
                        <div class="summary-stat">
                            <div class="val">${pct}%</div>
                            <div class="label">Accuracy</div>
                        </div>
                        <div class="summary-stat">
                            <div class="val">🔥 ${log.streak}</div>
                            <div class="label">Day Streak</div>
                        </div>
                    </div>
                </div>
                <div class="summary-actions">
                    <button class="btn-primary" data-action="startSession" data-mode="${state.sessionMode}">Study Again</button>
                    <button class="btn-secondary" data-action="goLibrary">Back to Library</button>
                </div>
            </div>
        `;
    }

    // ══════════════════════════════════════
    // ERROR
    // ══════════════════════════════════════
    renderError(message) {
        this.app.innerHTML = `
            <div class="app-header">
                <button class="back-btn" data-action="goLibrary">←</button>
                <h1>Oops</h1>
            </div>
            <div class="error-view">
                <div class="error-icon">🌧️</div>
                <p>${message || 'Something went wrong.'}</p>
                <button class="retry-btn" data-action="goLibrary">Back to Library</button>
            </div>
        `;
    }

    // ══════════════════════════════════════
    // CREATE DECK MODAL
    // ══════════════════════════════════════
    renderCreateModal(modalState) {
        const s = modalState;
        return `
            <div class="modal-overlay" data-action="closeModal">
                <div class="modal-content modal-form" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2>Create Custom Deck</h2>
                        <button class="modal-close" data-action="closeModal">×</button>
                    </div>
                    <div class="form-group">
                        <label>Deck Name</label>
                        <input class="form-input" id="deckName" placeholder="e.g., My Forest Plants" />
                    </div>
                    <div class="form-group">
                        <label>Region</label>
                        <input class="form-input" id="placeSearch" placeholder="Search for a place..." data-action="searchPlace" autocomplete="off" />
                        ${s.selectedPlace ? `<div style="margin-top:6px;font-size:0.85rem;color:var(--primary);font-weight:500">✓ ${s.selectedPlace.display_name || s.selectedPlace.name}</div>` : ''}
                        ${s.placeResults.length > 0 ? `
                            <div class="search-results">
                                ${s.placeResults.map(p => `
                                    <div class="search-result-item ${s.selectedPlace?.id === p.id ? 'selected' : ''}"
                                         data-action="selectPlace" data-place-id="${p.id}"
                                         data-place-name="${(p.display_name || p.name).replace(/"/g, '&quot;')}">
                                        <div>${p.display_name || p.name}</div>
                                        ${p.place_type_name ? `<div class="sub">${p.place_type_name}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <div class="radio-group">
                            ${[
                                ['all_plants', '🌿 All Plants'],
                                ['invasive_plants', '⚠️ Invasive Plants Only'],
                                ['all_animals', '🦌 All Animals'],
                                ['all_life', '🌍 All Life'],
                                ['custom_taxon', '🔍 Specific Taxon...'],
                            ].map(([val, label]) => `
                                <div class="radio-option ${s.selectedCategory === val ? 'selected' : ''}"
                                     data-action="selectCategory" data-category="${val}">
                                    <span class="radio-dot"></span>
                                    <span>${label}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ${s.selectedCategory === 'custom_taxon' ? `
                        <div class="form-group">
                            <label>Search Taxon</label>
                            <input class="form-input" id="taxonSearch" placeholder="e.g., Quercus, Oak, Aves..."
                                   data-action="searchTaxa" autocomplete="off" />
                            ${s.selectedTaxon ? `<div style="margin-top:6px;font-size:0.85rem;color:var(--primary);font-weight:500">✓ ${s.selectedTaxon.preferred_common_name || s.selectedTaxon.name} <span style="color:var(--text-light);font-style:italic">(${s.selectedTaxon.name})</span></div>` : ''}
                            ${s.taxaResults.length > 0 ? `
                                <div class="search-results">
                                    ${s.taxaResults.map(t => `
                                        <div class="search-result-item" data-action="selectTaxon" data-taxon-id="${t.id}"
                                             data-taxon-name="${(t.preferred_common_name || t.name).replace(/"/g, '&quot;')}"
                                             data-taxon-sci="${t.name}">
                                            <div>${t.preferred_common_name || t.name}</div>
                                            <div class="sub">${t.name} · ${t.rank || ''}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                    <button class="create-deck-submit" data-action="submitCreateDeck" ${!s.selectedPlace ? 'disabled' : ''}>
                        Create Deck
                    </button>
                </div>
            </div>
        `;
    }

    // ══════════════════════════════════════
    // IMAGE ZOOM MODAL
    // ══════════════════════════════════════
    renderImageModal(imageUrl) {
        // Reuse the existing modal structure
        const existing = document.getElementById('imageModal');
        if (existing) {
            const img = document.getElementById('modalImage');
            if (img) img.src = imageUrl.replace('medium', 'large');
            existing.style.display = 'flex';
        }
    }

    // ══════════════════════════════════════
    // CLASSIC QUIZ (original game UI)
    // ══════════════════════════════════════
    renderClassicQuiz() {
        this.app.innerHTML = `
            <div class="app-header">
                <button class="back-btn" data-action="goLibrary">←</button>
                <h1>🎮 Classic Quiz</h1>
            </div>
            <div class="classic-controls">
                <div class="menu-bar">
                    <select id="categorySelect">
                        <option value="all">All Species</option>
                        <option value="birds">🐦 Birds</option>
                        <option value="plants">🌱 Plants</option>
                        <option value="insects">🦋 Insects</option>
                        <option value="mammals">🐾 Mammals</option>
                        <option value="fish">🐠 Fish</option>
                        <option value="reptiles">🦎 Reptiles</option>
                        <option value="amphibians">🐸 Amphibians</option>
                        <option value="arachnids">🕷️ Spiders</option>
                        <option value="mollusks">🐌 Mollusks</option>
                        <option value="fungi">🍄 Fungi</option>
                    </select>
                    <select id="difficultySelect">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                    <select id="regionSelect">
                        <option value="global">Global</option>
                        <optgroup label="US Regions">
                            <option value="northeast">Northeast US</option>
                            <option value="southeast">Southeast US</option>
                            <option value="midwest">Midwest US</option>
                            <option value="southwest">Southwest US</option>
                            <option value="west">Western US</option>
                            <option value="pacific">Pacific Northwest</option>
                        </optgroup>
                        <optgroup label="Other">
                            <option value="canada">Canada</option>
                            <option value="uk">United Kingdom</option>
                            <option value="australia">Australia</option>
                            <option value="europe">Europe</option>
                        </optgroup>
                    </select>
                </div>
                <div class="classic-score-board">
                    <span>Score: <strong id="classicScore">0</strong></span>
                    <span>Streak: <strong id="classicStreak">0</strong></span>
                    <span>Total: <strong id="classicTotal">0</strong></span>
                </div>
            </div>
            <div id="classicGameContent">
                <div class="loading-view"><div class="spinner"></div><p>Loading...</p></div>
            </div>
        `;
    }

    renderClassicQuestion(question, difficulty) {
        const el = document.getElementById('classicGameContent');
        if (!el) return;
        const { correct, options } = question;
        const url = correct.photos[0].url.replace('square', 'medium');
        const useScientific = difficulty === 'hard';

        el.innerHTML = `
            <div class="species-photo-wrap" data-action="zoomImage" data-url="${url}">
                <img class="species-photo" src="${url}" alt="Species to identify" onerror="this.style.display='none'" />
                <div class="photo-hint">🔍 Tap to zoom</div>
            </div>
            <div class="quiz-prompt">What species is this?</div>
            <div class="options-list">
                ${options.map((opt, i) => {
                    const tax = INaturalistAPI.getTaxonomyInfo(opt.taxon);
                    return `
                        <div class="option-btn" data-action="classicAnswer" data-index="${i}">
                            <div>${useScientific ? `<em>${tax.scientificName}</em>` : tax.commonName}</div>
                            ${!useScientific ? `<div class="sci-name">${tax.scientificName}</div>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="text-align:center;margin-top:12px">
                <button class="skip-btn" data-action="classicSkip">Skip →</button>
            </div>
        `;
    }

    showClassicFeedback(selectedIndex, correctIndex, correctName) {
        const el = document.getElementById('classicGameContent');
        if (!el) return;
        const options = el.querySelectorAll('.option-btn');
        options.forEach(o => o.classList.add('disabled'));
        if (selectedIndex !== null && selectedIndex !== correctIndex) {
            options[selectedIndex]?.classList.add('incorrect');
        }
        options[correctIndex]?.classList.add('correct');

        // Add next button
        const nextDiv = document.createElement('div');
        nextDiv.style.textAlign = 'center';
        nextDiv.style.marginTop = '16px';
        nextDiv.innerHTML = `<button class="next-btn" data-action="classicNext" style="max-width:300px">Next →</button>`;
        el.appendChild(nextDiv);
    }

    updateClassicScore(score, streak, total) {
        const s = document.getElementById('classicScore');
        const st = document.getElementById('classicStreak');
        const t = document.getElementById('classicTotal');
        if (s) s.textContent = score;
        if (st) st.textContent = streak;
        if (t) t.textContent = total;
    }

    showClassicLoading() {
        const el = document.getElementById('classicGameContent');
        if (el) el.innerHTML = '<div class="loading-view"><div class="spinner"></div><p>Loading...</p></div>';
    }

    showClassicError(msg) {
        const el = document.getElementById('classicGameContent');
        if (el) el.innerHTML = `<div class="error-view"><div class="error-icon">🌧️</div><p>${msg}</p></div>`;
    }
}
