/**
 * Handles the image zoom modal functionality
 */
export class ModalHandler {
    constructor() {
        this.currentZoom = 1;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.scrollLeft = 0;
        this.scrollTop = 0;

        // Create modal DOM (appended once, reused)
        this._createModalDOM();
        this._initEventListeners();
    }

    _createModalDOM() {
        const modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'image-zoom-modal';
        modal.innerHTML = `
            <div class="izm-content">
                <button class="izm-close" id="izmClose">&times;</button>
                <div class="izm-hint">Scroll to zoom, drag to pan</div>
                <div class="izm-container" id="izmContainer">
                    <img id="izmImage" class="izm-image" alt="Enlarged species image" />
                </div>
                <div class="izm-controls">
                    <button class="izm-btn" id="izmOut">-</button>
                    <button class="izm-btn" id="izmReset">⌂</button>
                    <button class="izm-btn" id="izmIn">+</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        this.modal = modal;
        this.image = document.getElementById('izmImage');
        this.container = document.getElementById('izmContainer');
    }

    _initEventListeners() {
        document.getElementById('izmClose').addEventListener('click', () => this.close());
        document.getElementById('izmIn').addEventListener('click', () => this.zoomIn());
        document.getElementById('izmOut').addEventListener('click', () => this.zoomOut());
        document.getElementById('izmReset').addEventListener('click', () => this.resetZoom());

        this.modal.addEventListener('click', e => {
            if (e.target === this.modal) this.close();
        });

        document.addEventListener('keydown', e => {
            if (this.modal.style.display === 'flex') {
                if (e.key === 'Escape') this.close();
                if (e.key === '+' || e.key === '=') this.zoomIn();
                if (e.key === '-' || e.key === '_') this.zoomOut();
                if (e.key === '0') this.resetZoom();
            }
        });

        this.container.addEventListener('wheel', e => {
            e.preventDefault();
            e.deltaY < 0 ? this.zoomIn() : this.zoomOut();
        }, { passive: false });

        // Drag to pan
        this.container.addEventListener('mousedown', e => {
            this.isDragging = true;
            this.startX = e.pageX - this.container.offsetLeft;
            this.startY = e.pageY - this.container.offsetTop;
            this.scrollLeft = this.container.scrollLeft;
            this.scrollTop = this.container.scrollTop;
        });
        this.container.addEventListener('mouseleave', () => this.isDragging = false);
        this.container.addEventListener('mouseup', () => this.isDragging = false);
        this.container.addEventListener('mousemove', e => {
            if (!this.isDragging) return;
            e.preventDefault();
            const x = e.pageX - this.container.offsetLeft;
            const y = e.pageY - this.container.offsetTop;
            this.container.scrollLeft = this.scrollLeft - (x - this.startX) * 2;
            this.container.scrollTop = this.scrollTop - (y - this.startY) * 2;
        });

        // Touch support
        this.container.addEventListener('touchstart', e => {
            if (e.touches.length === 1) {
                this.isDragging = true;
                this.startX = e.touches[0].pageX - this.container.offsetLeft;
                this.startY = e.touches[0].pageY - this.container.offsetTop;
                this.scrollLeft = this.container.scrollLeft;
                this.scrollTop = this.container.scrollTop;
            }
        });
        this.container.addEventListener('touchend', () => this.isDragging = false);
        this.container.addEventListener('touchmove', e => {
            if (!this.isDragging || e.touches.length !== 1) return;
            e.preventDefault();
            const x = e.touches[0].pageX - this.container.offsetLeft;
            const y = e.touches[0].pageY - this.container.offsetTop;
            this.container.scrollLeft = this.scrollLeft - (x - this.startX) * 2;
            this.container.scrollTop = this.scrollTop - (y - this.startY) * 2;
        });
    }

    open(imageUrl) {
        this.image.src = imageUrl.replace('medium', 'large');
        this.modal.style.display = 'flex';
        this.currentZoom = 1;
        this.image.style.transform = 'scale(1)';
    }

    close() {
        this.modal.style.display = 'none';
        this.resetZoom();
    }

    zoomIn() {
        this.currentZoom = Math.min(5, this.currentZoom + 0.25);
        this.image.style.transform = `scale(${this.currentZoom})`;
    }

    zoomOut() {
        this.currentZoom = Math.max(0.5, this.currentZoom - 0.25);
        this.image.style.transform = `scale(${this.currentZoom})`;
    }

    resetZoom() {
        this.currentZoom = 1;
        this.image.style.transform = 'scale(1)';
        this.container.scrollLeft = 0;
        this.container.scrollTop = 0;
    }
}
