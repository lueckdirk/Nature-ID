/**
 * Handles the image zoom modal functionality
 */
export class ModalHandler {
    constructor() {
        this.modal = document.getElementById('imageModal');
        this.modalImage = document.getElementById('modalImage');
        this.modalImageContainer = document.getElementById('modalImageContainer');
        this.currentZoom = 1;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.scrollLeft = 0;
        this.scrollTop = 0;

        this.initEventListeners();
    }

    /**
     * Initialize event listeners for modal controls
     */
    initEventListeners() {
        // Close button
        document.getElementById('modalClose').addEventListener('click', () => this.close());

        // Zoom controls
        document.getElementById('zoomIn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOut').addEventListener('click', () => this.zoomOut());
        document.getElementById('zoomReset').addEventListener('click', () => this.resetZoom());

        // Close on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.modal.style.display === 'flex') {
                if (e.key === 'Escape') this.close();
                if (e.key === '+' || e.key === '=') this.zoomIn();
                if (e.key === '-' || e.key === '_') this.zoomOut();
                if (e.key === '0') this.resetZoom();
            }
        });

        // Scroll to zoom
        this.modalImageContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                this.zoomIn();
            } else {
                this.zoomOut();
            }
        }, { passive: false });

        // Drag to pan
        this.initDragToPan();
    }

    /**
     * Initialize drag-to-pan functionality
     */
    initDragToPan() {
        this.modalImageContainer.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.startX = e.pageX - this.modalImageContainer.offsetLeft;
            this.startY = e.pageY - this.modalImageContainer.offsetTop;
            this.scrollLeft = this.modalImageContainer.scrollLeft;
            this.scrollTop = this.modalImageContainer.scrollTop;
        });

        this.modalImageContainer.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });

        this.modalImageContainer.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        this.modalImageContainer.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            e.preventDefault();
            const x = e.pageX - this.modalImageContainer.offsetLeft;
            const y = e.pageY - this.modalImageContainer.offsetTop;
            const walkX = (x - this.startX) * 2;
            const walkY = (y - this.startY) * 2;
            this.modalImageContainer.scrollLeft = this.scrollLeft - walkX;
            this.modalImageContainer.scrollTop = this.scrollTop - walkY;
        });

        // Touch support for mobile
        this.modalImageContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.isDragging = true;
                this.startX = e.touches[0].pageX - this.modalImageContainer.offsetLeft;
                this.startY = e.touches[0].pageY - this.modalImageContainer.offsetTop;
                this.scrollLeft = this.modalImageContainer.scrollLeft;
                this.scrollTop = this.modalImageContainer.scrollTop;
            }
        });

        this.modalImageContainer.addEventListener('touchend', () => {
            this.isDragging = false;
        });

        this.modalImageContainer.addEventListener('touchmove', (e) => {
            if (!this.isDragging || e.touches.length !== 1) return;
            e.preventDefault();
            const x = e.touches[0].pageX - this.modalImageContainer.offsetLeft;
            const y = e.touches[0].pageY - this.modalImageContainer.offsetTop;
            const walkX = (x - this.startX) * 2;
            const walkY = (y - this.startY) * 2;
            this.modalImageContainer.scrollLeft = this.scrollLeft - walkX;
            this.modalImageContainer.scrollTop = this.scrollTop - walkY;
        });
    }

    /**
     * Open modal with specified image
     * @param {string} imageUrl - URL of image to display
     */
    open(imageUrl) {
        this.modalImage.src = imageUrl.replace('medium', 'large');
        this.modal.style.display = 'flex';
        this.currentZoom = 1;
        this.modalImage.style.transform = 'scale(1)';
    }

    /**
     * Close modal
     */
    close() {
        this.modal.style.display = 'none';
        this.resetZoom();
    }

    /**
     * Zoom in on image
     */
    zoomIn() {
        this.currentZoom = Math.min(5, this.currentZoom + 0.25);
        this.modalImage.style.transform = `scale(${this.currentZoom})`;
    }

    /**
     * Zoom out on image
     */
    zoomOut() {
        this.currentZoom = Math.max(0.5, this.currentZoom - 0.25);
        this.modalImage.style.transform = `scale(${this.currentZoom})`;
    }

    /**
     * Reset zoom to default
     */
    resetZoom() {
        this.currentZoom = 1;
        this.modalImage.style.transform = 'scale(1)';
        this.modalImageContainer.scrollLeft = 0;
        this.modalImageContainer.scrollTop = 0;
    }
}
