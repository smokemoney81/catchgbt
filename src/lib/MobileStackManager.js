/**
 * MobileStackManager - Pure state-based navigation
 * 
 * Completely independent of browser history API. Manages all navigation
 * state purely in memory. Works seamlessly with Android back-button and
 * eliminates history.pushState/popstate complications.
 */

export class MobileStackManager {
  constructor() {
    this.stacks = {
      Dashboard: [],
      Map: [],
      Logbook: [],
      Profile: [],
    };
    this.currentTab = 'Dashboard';
    this.direction = 1; // 1=forward, -1=back
    this.listeners = new Set();
  }

  push(pathname) {
    const stack = this.stacks[this.currentTab];
    if (!stack) return;
    
    // Avoid duplicate at top
    if (stack[stack.length - 1] === pathname) return;
    
    stack.push(pathname);
    this.direction = 1;
    this.notifyListeners();
  }

  pop() {
    const stack = this.stacks[this.currentTab];
    if (!stack || stack.length <= 1) return false;
    
    stack.pop();
    this.direction = -1;
    this.notifyListeners();
    return true;
  }

  switchTab(tabName) {
    const validTabs = ['Dashboard', 'Map', 'Logbook', 'Profile'];
    if (!validTabs.includes(tabName)) return;
    
    this.currentTab = tabName;
    this.direction = 1;
    this.notifyListeners();
  }

  resetStack() {
    const stack = this.stacks[this.currentTab];
    if (!stack) return;
    
    stack.length = 0;
    this.direction = 1;
    this.notifyListeners();
  }

  // Android back-button handler - returns true if handled
  handleAndroidBack() {
    const stack = this.stacks[this.currentTab];
    
    if (!stack) return false;
    
    // If we're deeper than root, go back
    if (stack.length > 1) {
      return this.pop();
    }
    
    // At root - cannot go back
    return false;
  }

  // Query methods
  getCurrentStack() {
    return this.stacks[this.currentTab] || [];
  }

  getCurrentPathname() {
    const stack = this.getCurrentStack();
    return stack[stack.length - 1] ?? '/';
  }

  canGoBack() {
    return this.getCurrentStack().length > 1;
  }

  getState() {
    return {
      stack: this.getCurrentStack(),
      pathname: this.getCurrentPathname(),
      canGoBack: this.canGoBack(),
      direction: this.direction,
      currentTab: this.currentTab,
    };
  }

  // Event system
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.getState()));
  }

  // Debugging
  getDebugInfo() {
    return {
      stacks: JSON.stringify(this.stacks),
      currentTab: this.currentTab,
      direction: this.direction,
      listenerCount: this.listeners.size,
    };
  }
}

// Singleton - completely external to React
export const mobileStack = new MobileStackManager();