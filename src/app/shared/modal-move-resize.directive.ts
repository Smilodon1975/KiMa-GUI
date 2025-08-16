import { AfterViewInit, Directive, ElementRef, Input, OnDestroy } from '@angular/core';

type Cfg = {
  handle?: string;
  resizable?: boolean;
  minW?: number;
  minH?: number;
  allowOffscreen?: boolean;
  allowOversize?: boolean;
  maxW?: number;
  maxH?: number;
  edgeHandles?: boolean;
};


@Directive({
  selector: '[appModalMoveResize]',
  standalone: true,
})
export class ModalMoveResizeDirective implements AfterViewInit, OnDestroy {
  @Input('appModalMoveResize') cfg: Cfg = {};

  private dialog!: HTMLElement;
  private handleEl!: HTMLElement;
  private cleanup: Array<() => void> = [];

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.dialog = this.el.nativeElement;

    // Bootstrap-Zentrierung aushebeln, eigene Positionierung übernehmen
    this.dialog.classList.remove('modal-dialog-centered');
    Object.assign(this.dialog.style, {
      position: 'fixed',
      margin: '0',
      transform: 'none',
      top: '10vh',
      left: `${Math.max(0, (window.innerWidth - this.dialog.getBoundingClientRect().width) / 2)}px`,
      zIndex: '1055'
    });

    // Drag-Handle (Default: Header)
    const sel = this.cfg.handle || '.modal-header';
    this.handleEl = (this.dialog.querySelector(sel) as HTMLElement) || this.dialog;
    this.handleEl.style.cursor = 'move';

    // Scroll-Setup: wenn .modal-dialog-scrollable, dann inneres Scrolling sicherstellen
    this.applyScrollableMode();

    // Beim Öffnen ggf. repositionieren
    const modalRoot = this.dialog.closest('.modal') as HTMLElement | null;
    const onShown = () => { this.applyScrollableMode(); this.ensureInViewport(); }; 
    if (modalRoot) {
      modalRoot.addEventListener('shown.bs.modal', onShown);
      this.cleanup.push(() => modalRoot.removeEventListener('shown.bs.modal', onShown));
    }

    // Dragging mit Schwelle + Interaktiv-Ignorierung
    this.enableDragging();

    // Resizing (sichtbarer, größerer Griff)
    if (this.cfg.resizable !== false) this.addResizeHandle();

    // Re-Clamping bei Window-Resize
    const onWinResize = () => { this.applyScrollableMode(); this.ensureInViewport(); };
    window.addEventListener('resize', onWinResize);
    this.cleanup.push(() => window.removeEventListener('resize', onWinResize));
  }

    private applyScrollableMode(): void {
            const content = this.dialog.querySelector('.modal-content') as HTMLElement | null;
            if (!content) return;

            if (this.cfg.allowOversize) {
                // Oversize: Content darf groß sein, aber Body muss scrollen
                content.style.maxHeight = ''; 
                this.setBodyMaxHeight();      // <-- wichtig
            } else {
                // Ohne Oversize: sanft am Viewport deckeln + Body scrollen
                content.style.maxHeight = 'calc(100vh - 2rem)';
                this.setBodyMaxHeight();      // <-- ebenfalls setzen
            }
        }


    private enableDragging(): void {
        const INTERACTIVE_SEL = 'button,[data-bs-dismiss],a,input,textarea,select,.btn,.form-control,[role="button"]';
        const clampCoord = (coord: number, size: number, viewport: number) => {
            if (this.cfg.allowOffscreen) return coord;
            const min = Math.min(0, viewport - size);
            const max = Math.max(0, viewport - size);
            return Math.max(min, Math.min(max, coord));
            };
        const onPointerDown = (ev: PointerEvent) => {
        // Interaktive Elemente nicht zum Drag nutzen
        const target = ev.target as HTMLElement;
        if (target.closest(INTERACTIVE_SEL)) return;
        if (ev.button !== 0) return;
        const startX = ev.clientX;
        const startY = ev.clientY;
        const rect   = this.dialog.getBoundingClientRect();
        const startL = rect.left;
        const startT = rect.top;
        let dragging = false;
        const THRESH = 4;
        const move = (e: PointerEvent) => {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (!dragging && (Math.abs(dx) > THRESH || Math.abs(dy) > THRESH)) {
            dragging = true;
            try { this.handleEl.setPointerCapture(ev.pointerId); } catch {}
            this.handleEl.classList.add('dragging');
            }
            if (!dragging) return;
            const w  = this.dialog.getBoundingClientRect().width;
            const h  = this.dialog.getBoundingClientRect().height;
            const newL = clampCoord(startL + dx, w, window.innerWidth);
            const newT = clampCoord(startT + dy, h, window.innerHeight);
            this.dialog.style.left = `${newL}px`;
            this.dialog.style.top  = `${newT}px`;
            e.preventDefault();
        };
        const up = (e: PointerEvent) => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up, true);
            this.handleEl.classList.remove('dragging');
            try { this.handleEl.releasePointerCapture(ev.pointerId); } catch {}
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up, true);
        };
        this.handleEl.addEventListener('pointerdown', onPointerDown);
        this.cleanup.push(() => this.handleEl.removeEventListener('pointerdown', onPointerDown));
    }



  private addResizeHandle(): void {
        const content = (this.dialog.querySelector('.modal-content') as HTMLElement) || this.dialog;
        content.style.position = 'relative';
        const handle = document.createElement('div');
        handle.className = 'modal-resize-handle';
        Object.assign(handle.style, {
            position: 'absolute',
            right: '8px',
            bottom: '8px',
            width: '18px',
            height: '18px',
            cursor: 'se-resize',
            zIndex: '2',
            opacity: '0.7',
            background: 'repeating-linear-gradient(135deg, rgba(255,255,255,.45) 0 2px, rgba(255,255,255,0) 2px 4px)',
            borderRight: '2px solid rgba(0,0,0,.35)',
            borderBottom: '2px solid rgba(0,0,0,.35)',
            borderRadius: '3px'
        });
        content.appendChild(handle);
        const onDown = (ev: PointerEvent) => {
            if (ev.button !== 0) return;
            ev.preventDefault();
            try { handle.setPointerCapture(ev.pointerId); } catch {}

            const rect   = this.dialog.getBoundingClientRect();
            const startX = ev.clientX;
            const startY = ev.clientY;
            const startW = rect.width;
            const startH = rect.height;
            const oversize = this.cfg.allowOversize === true;
            const minW = this.cfg.minW ?? 360;
            const minH = this.cfg.minH ?? 200;
            const hardMaxW = this.cfg.maxW ?? Math.max(3000, window.innerWidth  * 3);
            const hardMaxH = this.cfg.maxH ?? Math.max(3000, window.innerHeight * 3);
            this.applyScrollableMode();
            const move = (e: PointerEvent) => {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const maxW = oversize
                ? hardMaxW
                : Math.max(minW, window.innerWidth  - rect.left - 8);
            const maxH = oversize
                ? hardMaxH
                : Math.max(minH, window.innerHeight - rect.top  - 8);
            const newW = Math.min(maxW, Math.max(minW, startW + dx));
            const newH = Math.min(maxH, Math.max(minH, startH + dy));
            this.dialog.style.width  = `${newW}px`;
            this.dialog.style.height = `${newH}px`;
            this.setBodyMaxHeight();
            e.preventDefault();
            };
            const up = () => {
            handle.removeEventListener('pointermove', move);
            handle.removeEventListener('pointerup', up);
            try { handle.releasePointerCapture(ev.pointerId); } catch {}
            this.ensureInViewport();
            };
            handle.addEventListener('pointermove', move);
            handle.addEventListener('pointerup', up, { once: true });};
        handle.addEventListener('pointerdown', onDown);
        this.cleanup.push(() => handle.removeEventListener('pointerdown', onDown));
        if (this.cfg.edgeHandles !== false) this.addEdgeHandles();
        }


  private ensureInViewport(): void {
    const r = this.dialog.getBoundingClientRect();
    const clampCoord = (coord: number, size: number, viewport: number) => {
      const min = Math.min(0, viewport - size);
      const max = Math.max(0, viewport - size);
      return Math.max(min, Math.min(max, coord));
    };
    const newL = clampCoord(r.left, r.width, window.innerWidth);
    const newT = clampCoord(r.top,  r.height, window.innerHeight);
    this.dialog.style.left = `${newL}px`;
    this.dialog.style.top  = `${Math.max(newT, 0)}px`;
    this.dialog.style.transform = 'none';
  }

    private addEdgeHandles(): void {
        const content = (this.dialog.querySelector('.modal-content') as HTMLElement) || this.dialog;
        content.style.position = 'relative';
        const east = document.createElement('div');
        Object.assign(east.style, {
            position: 'absolute',
            top: '0', right: '0',
            width: '10px', height: '100%',
            cursor: 'e-resize', zIndex: '2'
        });
        content.appendChild(east);
        const south = document.createElement('div');
        Object.assign(south.style, {
            position: 'absolute',
            left: '0', bottom: '0',
            width: '100%', height: '10px',
            cursor: 's-resize', zIndex: '2'
        });
        content.appendChild(south);
        const startEdgeResize = (axis: 'x'|'y') => (ev: PointerEvent) => {
            if (ev.button !== 0) return;
            ev.preventDefault();
            const rect   = this.dialog.getBoundingClientRect();
            const startX = ev.clientX;
            const startY = ev.clientY;
            const startW = rect.width;
            const startH = rect.height;
            const oversize = this.cfg.allowOversize === true;
            const minW = this.cfg.minW ?? 360;
            const minH = this.cfg.minH ?? 200;
            const hardMaxW = this.cfg.maxW ?? Math.max(3000, window.innerWidth  * 3);
            const hardMaxH = this.cfg.maxH ?? Math.max(3000, window.innerHeight * 3);
            const maxW = oversize ? hardMaxW : Math.max(minW, window.innerWidth  - rect.left - 8);
            const maxH = oversize ? hardMaxH : Math.max(minH, window.innerHeight - rect.top  - 8);
            this.applyScrollableMode();
            const move = (e: PointerEvent) => {
            if (axis === 'x') {
                const dx = e.clientX - startX;
                const newW = Math.min(maxW, Math.max(minW, startW + dx));
                this.dialog.style.width = `${newW}px`;
            } else {
                const dy = e.clientY - startY;
                const newH = Math.min(maxH, Math.max(minH, startH + dy));
                this.dialog.style.height = `${newH}px`;
            }
            e.preventDefault();
            };

            const up = () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up, true);
            this.ensureInViewport();
            };

            window.addEventListener('pointermove', move);
            window.addEventListener('pointerup', up, true);
        };

        east.addEventListener('pointerdown', startEdgeResize('x'));
        south.addEventListener('pointerdown', startEdgeResize('y'));
        }

        private setBodyMaxHeight(): void {
            const body   = this.dialog.querySelector('.modal-body') as HTMLElement | null;
            if (!body) return;

            const header = this.dialog.querySelector('.modal-header') as HTMLElement | null;
            const footer = this.dialog.querySelector('.modal-footer') as HTMLElement | null;

            const hH = header?.getBoundingClientRect().height ?? 0;
            const fH = footer?.getBoundingClientRect().height ?? 0;
            const padding = 32; // Sicherheitsabstand

            const avail = Math.max(120, window.innerHeight - hH - fH - padding);
            body.style.maxHeight = `${avail}px`;
            body.style.overflowY = 'auto';
            }



  ngOnDestroy(): void {
    this.cleanup.forEach(fn => fn());
  }
}
