/**
 * Stealth injection scripts to bypass bot detection mechanisms
 */

/**
 * Gets the stealth script content that overrides various browser APIs
 * to make the browser appear more human-like
 */
export function getStealthScript(): string {
  return `
// Override navigator.webdriver to return false instead of undefined
(() => {
  try {
    if (navigator.webdriver !== undefined) {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
        configurable: true
      });
    }
  } catch (e) {
    // Ignore errors if property can't be redefined
  }
})();

// Override navigator.plugins to return a realistic plugin array
(() => {
  try {
    const plugins = [
      {
        name: 'Chrome PDF Plugin',
        filename: 'internal-pdf-viewer',
        description: 'Portable Document Format'
      },
      {
        name: 'Chrome PDF Viewer',
        filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
        description: ''
      },
      {
        name: 'Native Client',
        filename: 'internal-nacl-plugin',
        description: ''
      }
    ];

    Object.defineProperty(navigator, 'plugins', {
      get: () => plugins,
      configurable: true
    });
  } catch (e) {
    // Ignore errors if property can't be redefined
  }
})();

// Override navigator.languages to return realistic language preferences
(() => {
  try {
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
      configurable: true
    });
  } catch (e) {
    // Ignore errors if property can't be redefined
  }
})();

// Create a realistic chrome object and remove automation signatures
(() => {
  try {
    // Remove automation detection properties
    if (window.chrome && window.chrome.runtime && window.chrome.runtime.onConnect) {
      delete window.chrome.runtime.onConnect;
    }
    
    if (window.chrome && window.chrome.csi) {
      delete window.chrome.csi;
    }
    
    if (window.chrome && window.chrome.loadTimes) {
      delete window.chrome.loadTimes;
    }
    
    // Add realistic chrome object if missing
    if (!window.chrome) {
      window.chrome = {};
    }
    
    // Add realistic runtime object
    if (!window.chrome.runtime) {
      window.chrome.runtime = {
        PlatformOs: {
          MAC: 'mac',
          WIN: 'win',
          ANDROID: 'android',
          CROS: 'cros',
          LINUX: 'linux',
          OPENBSD: 'openbsd'
        },
        PlatformArch: {
          ARM: 'arm',
          ARM64: 'arm64',
          X86_32: 'x86-32',
          X86_64: 'x86-64'
        },
        PlatformNaclArch: {
          ARM: 'arm',
          X86_32: 'x86-32',
          X86_64: 'x86-64'
        }
      };
    }
  } catch (e) {
    // Ignore errors
  }
})();

// Override navigator.permissions.query to handle notifications permission
(() => {
  try {
    const originalQuery = navigator.permissions.query;
    navigator.permissions.query = function(parameters) {
      if (parameters.name === 'notifications') {
        return Promise.resolve({ state: 'default' });
      }
      return originalQuery.apply(this, arguments);
    };
  } catch (e) {
    // Ignore errors if permissions API is not available
  }
})();

// Override window.Notification permission
(() => {
  try {
    if (window.Notification) {
      Object.defineProperty(window.Notification, 'permission', {
        get: () => 'default',
        configurable: true
      });
    }
  } catch (e) {
    // Ignore errors if Notification API is not available
  }
})();

// Override iframe contentWindow detection
(() => {
  try {
    const originalCreateElement = document.createElement;
    document.createElement = function(...args) {
      const element = originalCreateElement.apply(this, args);
      
      if (args[0] && args[0].toLowerCase() === 'iframe') {
        // Override the contentWindow property to avoid detection
        let _contentWindow = null;
        Object.defineProperty(element, 'contentWindow', {
          get: function() {
            return _contentWindow;
          },
          set: function(val) {
            _contentWindow = val;
          },
          configurable: true
        });
      }
      
      return element;
    };
  } catch (e) {
    // Ignore errors
  }
})();

// Hide Playwright-specific properties
(() => {
  try {
    // Remove playwright from window
    if (window.playwright) {
      delete window.playwright;
    }
    
    // Remove __playwright from window  
    if (window.__playwright) {
      delete window.__playwright;
    }
    
    // Remove __pw_manual from window
    if (window.__pw_manual) {
      delete window.__pw_manual;
    }
    
    // Remove _WEBDRIVER_ELEM_CACHE from document
    if (document._WEBDRIVER_ELEM_CACHE) {
      delete document._WEBDRIVER_ELEM_CACHE;
    }
    
    // Hide webdriver property on document
    if (document.webdriver !== undefined) {
      delete document.webdriver;
    }
  } catch (e) {
    // Ignore errors
  }
})();

// Override Object.getOwnPropertyDescriptor for navigator.webdriver
(() => {
  try {
    const originalGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    Object.getOwnPropertyDescriptor = function(obj, prop) {
      if (obj === navigator && prop === 'webdriver') {
        return undefined;
      }
      return originalGetOwnPropertyDescriptor.apply(this, arguments);
    };
  } catch (e) {
    // Ignore errors
  }
})();
`;
}

/**
 * Injects stealth scripts into a page to bypass bot detection
 * @param page Playwright page instance
 */
export async function injectStealthScripts(page: any): Promise<void> {
  try {
    await page.addInitScript(getStealthScript());
  } catch (error) {
    // Silently ignore errors - stealth should not break functionality
    if (process.env.AGENT_BROWSER_DEBUG === '1') {
      console.error('[DEBUG] Failed to inject stealth scripts:', error);
    }
  }
}

/**
 * Gets stealth-enabled Chromium launch arguments
 */
export function getStealthArgs(): string[] {
  return [
    '--disable-blink-features=AutomationControlled',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-infobars',
  ];
}

/**
 * Gets a realistic Chrome user agent string for macOS
 */
export function getRealisticUserAgent(): string {
  return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
}

/**
 * Checks if stealth mode is enabled via environment variable
 * @returns true if stealth mode is enabled (default), false if explicitly disabled
 */
export function isStealthEnabled(): boolean {
  return process.env.AGENT_BROWSER_STEALTH !== 'false';
}
