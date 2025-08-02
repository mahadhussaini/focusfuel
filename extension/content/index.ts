// Content script for FocusFuel extension
// This script runs on every web page to monitor user behavior and provide features

interface PageStats {
  scrollEvents: number;
  mouseMovements: number;
  clicks: number;
  keyboardEvents: number;
  timeSpent: number;
  lastActivity: number;
}

class ContentScript {
  private stats: PageStats;
  private isActive: boolean = true;
  private activityTimer: NodeJS.Timeout | null = null;
  private lastScrollTime: number = 0;
  private scrollThrottle: number = 100; // ms

  constructor() {
    this.stats = {
      scrollEvents: 0,
      mouseMovements: 0,
      clicks: 0,
      keyboardEvents: 0,
      timeSpent: 0,
      lastActivity: Date.now()
    };

    this.initialize();
  }

  private initialize() {
    this.setupEventListeners();
    this.startActivityTracking();
    this.injectFocusFuelUI();
    this.setupMessageHandling();
  }

  private setupEventListeners() {
    // Scroll events
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.handleScrollEvent();
      }, this.scrollThrottle);
    }, { passive: true });

    // Mouse movement events
    let mouseTimeout: NodeJS.Timeout;
    document.addEventListener('mousemove', () => {
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        this.handleMouseMovement();
      }, 500); // Throttle mouse movements
    }, { passive: true });

    // Click events
    document.addEventListener('click', () => {
      this.handleClickEvent();
    }, { passive: true });

    // Keyboard events
    document.addEventListener('keydown', () => {
      this.handleKeyboardEvent();
    }, { passive: true });

    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });

    // Focus events
    window.addEventListener('focus', () => {
      this.isActive = true;
      this.stats.lastActivity = Date.now();
    });

    window.addEventListener('blur', () => {
      this.isActive = false;
    });
  }

  private handleScrollEvent() {
    this.stats.scrollEvents++;
    this.stats.lastActivity = Date.now();
    this.sendMessageToBackground('SCROLL_EVENT');
  }

  private handleMouseMovement() {
    this.stats.mouseMovements++;
    this.stats.lastActivity = Date.now();
    this.sendMessageToBackground('MOUSE_MOVEMENT');
  }

  private handleClickEvent() {
    this.stats.clicks++;
    this.stats.lastActivity = Date.now();
    this.sendMessageToBackground('CLICK_EVENT');
  }

  private handleKeyboardEvent() {
    this.stats.keyboardEvents++;
    this.stats.lastActivity = Date.now();
    this.sendMessageToBackground('KEYBOARD_EVENT');
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      this.isActive = false;
    } else {
      this.isActive = true;
      this.stats.lastActivity = Date.now();
    }
  }

  private startActivityTracking() {
    this.activityTimer = setInterval(() => {
      if (this.isActive) {
        this.stats.timeSpent += 1000; // 1 second
      }
    }, 1000);
  }

  private sendMessageToBackground(type: string, data?: any) {
    chrome.runtime.sendMessage({
      type,
      data,
      timestamp: Date.now()
    }).catch(() => {
      // Ignore errors when extension is not available
    });
  }

  private injectFocusFuelUI() {
    // Create floating action button for summarization
    this.createFloatingButton();
    
    // Add context menu for text selection
    this.setupContextMenu();
  }

  private createFloatingButton() {
    const button = document.createElement('div');
    button.id = 'focusfuel-fab';
    button.innerHTML = `
      <div class="focusfuel-fab-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
    `;
    
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      background: #0ea5e9;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
      cursor: pointer;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: all 0.2s ease;
      opacity: 0.8;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.opacity = '1';
      button.style.transform = 'scale(1.1)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.opacity = '0.8';
      button.style.transform = 'scale(1)';
    });

    button.addEventListener('click', () => {
      this.showSummaryModal();
    });

    document.body.appendChild(button);
  }

  private setupContextMenu() {
    document.addEventListener('mouseup', (event) => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 50) {
        this.showContextMenu(event, selection.toString());
      }
    });
  }

  private showContextMenu(event: MouseEvent, selectedText: string) {
    // Remove existing context menu
    const existingMenu = document.getElementById('focusfuel-context-menu');
    if (existingMenu) {
      existingMenu.remove();
    }

    const menu = document.createElement('div');
    menu.id = 'focusfuel-context-menu';
    menu.innerHTML = `
      <div class="focusfuel-menu-item" data-action="summarize">Summarize Selection</div>
      <div class="focusfuel-menu-item" data-action="tldr">Generate TLDR</div>
      <div class="focusfuel-menu-item" data-action="bullet-points">Extract Key Points</div>
    `;

    menu.style.cssText = `
      position: fixed;
      top: ${event.pageY + 10}px;
      left: ${event.pageX + 10}px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      z-index: 10001;
      min-width: 200px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const menuItems = menu.querySelectorAll('.focusfuel-menu-item');
    menuItems.forEach(item => {
      (item as HTMLElement).style.cssText = `
        padding: 12px 16px;
        cursor: pointer;
        border-bottom: 1px solid #f3f4f6;
        font-size: 14px;
        color: #374151;
        transition: background-color 0.2s ease;
      `;

      item.addEventListener('mouseenter', () => {
        (item as HTMLElement).style.backgroundColor = '#f9fafb';
      });

      item.addEventListener('mouseleave', () => {
        (item as HTMLElement).style.backgroundColor = 'transparent';
      });

      item.addEventListener('click', () => {
        const action = item.getAttribute('data-action');
        this.handleContextMenuAction(action, selectedText);
        menu.remove();
      });
    });

    // Remove menu when clicking outside
    document.addEventListener('click', () => {
      menu.remove();
    }, { once: true });

    document.body.appendChild(menu);
  }

  private async handleContextMenuAction(action: string | null, selectedText: string) {
    if (!action) return;

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'REQUEST_SUMMARY',
        content: selectedText,
        options: {
          length: action === 'tldr' ? 'short' : action === 'bullet-points' ? 'long' : 'medium'
        }
      });

      if (response.success) {
        this.showSummaryResult(response.summary, action);
      } else {
        console.error('Failed to generate summary:', response.error);
      }
    } catch (error) {
      console.error('Error requesting summary:', error);
    }
  }

  private showSummaryModal() {
    // Get page content
    const content = this.extractPageContent();
    
    chrome.runtime.sendMessage({
      type: 'REQUEST_SUMMARY',
      content,
      options: { length: 'medium' }
    }).then(response => {
      if (response.success) {
        this.showSummaryResult(response.summary, 'page');
      }
    }).catch(error => {
      console.error('Error requesting summary:', error);
    });
  }

  private extractPageContent(): string {
    // Extract main content from the page
    const selectors = [
      'article',
      '[role="main"]',
      'main',
      '.content',
      '.post-content',
      '.article-content',
      '.entry-content'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent || '';
      }
    }

    // Fallback to body content
    return document.body.textContent || '';
  }

  private showSummaryResult(summary: any, type: string) {
    const modal = document.createElement('div');
    modal.id = 'focusfuel-summary-modal';
    modal.innerHTML = `
      <div class="focusfuel-modal-overlay"></div>
      <div class="focusfuel-modal-content">
        <div class="focusfuel-modal-header">
          <h3>FocusFuel Summary</h3>
          <button class="focusfuel-modal-close">&times;</button>
        </div>
        <div class="focusfuel-modal-body">
          <div class="focusfuel-summary-text">${summary.summary}</div>
          <div class="focusfuel-summary-meta">
            <span>${summary.wordCount} words</span>
            <span>${summary.readingTime} min read</span>
          </div>
        </div>
        <div class="focusfuel-modal-footer">
          <button class="focusfuel-btn focusfuel-btn-primary" data-action="save">Save Summary</button>
          <button class="focusfuel-btn focusfuel-btn-secondary" data-action="copy">Copy to Clipboard</button>
        </div>
      </div>
    `;

    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10002;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const overlay = modal.querySelector('.focusfuel-modal-overlay');
    const content = modal.querySelector('.focusfuel-modal-content');
    const closeBtn = modal.querySelector('.focusfuel-modal-close');

    (overlay as HTMLElement).style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
    `;

    (content as HTMLElement).style.cssText = `
      background: white;
      border-radius: 12px;
      max-width: 600px;
      width: 90%;
      max-height: 80%;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 1;
    `;

    // Add styles for modal elements
    this.addModalStyles();

    // Event listeners
    closeBtn!.addEventListener('click', () => modal.remove());
    overlay!.addEventListener('click', () => modal.remove());

    const saveBtn = modal.querySelector('[data-action="save"]');
    const copyBtn = modal.querySelector('[data-action="copy"]');

    saveBtn!.addEventListener('click', () => {
      this.saveSummary(summary);
      modal.remove();
    });

    copyBtn!.addEventListener('click', () => {
      navigator.clipboard.writeText(summary.summary);
      modal.remove();
    });

    document.body.appendChild(modal);
  }

  private addModalStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .focusfuel-modal-header {
        padding: 20px 24px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .focusfuel-modal-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #111827;
      }
      
      .focusfuel-modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #6b7280;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background-color 0.2s ease;
      }
      
      .focusfuel-modal-close:hover {
        background-color: #f3f4f6;
      }
      
      .focusfuel-modal-body {
        padding: 24px;
        max-height: 400px;
        overflow-y: auto;
      }
      
      .focusfuel-summary-text {
        font-size: 16px;
        line-height: 1.6;
        color: #374151;
        margin-bottom: 16px;
      }
      
      .focusfuel-summary-meta {
        display: flex;
        gap: 16px;
        font-size: 14px;
        color: #6b7280;
      }
      
      .focusfuel-modal-footer {
        padding: 20px 24px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }
      
      .focusfuel-btn {
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.2s ease;
      }
      
      .focusfuel-btn-primary {
        background: #0ea5e9;
        color: white;
        border-color: #0ea5e9;
      }
      
      .focusfuel-btn-primary:hover {
        background: #0284c7;
        border-color: #0284c7;
      }
      
      .focusfuel-btn-secondary {
        background: white;
        color: #374151;
        border-color: #d1d5db;
      }
      
      .focusfuel-btn-secondary:hover {
        background: #f9fafb;
        border-color: #9ca3af;
      }
    `;
    document.head.appendChild(style);
  }

  private async saveSummary(summary: any) {
    // Send summary to background script for storage
    chrome.runtime.sendMessage({
      type: 'SAVE_SUMMARY',
      summary: {
        ...summary,
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString()
      }
    });
  }

  private setupMessageHandling() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'GET_PAGE_STATS':
          sendResponse(this.stats);
          break;
          
        case 'DETECT_DISTRACTION':
          this.detectDistraction().then(sendResponse);
          return true; // Keep message channel open
          
        case 'EXTRACT_CONTENT':
          sendResponse({
            content: this.extractPageContent(),
            title: document.title,
            url: window.location.href
          });
          break;
      }
    });
  }

  private async detectDistraction() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'DETECT_DISTRACTION'
      });

      return response;
    } catch (error) {
      console.error('Error detecting distraction:', error);
      return { success: false, error: 'Failed to detect distraction' };
    }
  }

  public destroy() {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
    }

    // Remove injected elements
    const fab = document.getElementById('focusfuel-fab');
    if (fab) fab.remove();

    const contextMenu = document.getElementById('focusfuel-context-menu');
    if (contextMenu) contextMenu.remove();

    const modal = document.getElementById('focusfuel-summary-modal');
    if (modal) modal.remove();
  }
}

// Initialize content script
const contentScript = new ContentScript();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  contentScript.destroy();
});

// Export for testing
export { ContentScript }; 