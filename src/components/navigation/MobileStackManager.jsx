import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

class StackManager {
  constructor() {
    this.stacks = {
      home: ['Dashboard'],
      logbook: ['Logbook'],
      map: ['Map'],
      analysis: ['Analysis'],
      settings: ['Settings'],
      other: []
    };
    this.currentTab = 'home';
    this.direction = 'push';
    this.listeners = [];
  }

  getTabForPage(pageName) {
    const tabMap = {
      'Dashboard': 'home', 'Home': 'home',
      'Logbook': 'logbook', 'Log': 'logbook',
      'Map': 'map', 'MapPage': 'map',
      'Analysis': 'analysis', 'WaterAnalysis': 'analysis',
      'Settings': 'settings', 'Profile': 'settings'
    };
    return tabMap[pageName] || 'other';
  }

  push(pageName) {
    const tab = this.getTabForPage(pageName);
    const stack = this.stacks[tab];
    if (stack[stack.length - 1] !== pageName) {
      stack.push(pageName);
      this.currentTab = tab;
      this.direction = 'push';
      this.notifyListeners();
    }
  }

  pop() {
    const stack = this.stacks[this.currentTab];
    if (stack.length > 1) {
      stack.pop();
      this.direction = 'pop';
      this.notifyListeners();
      return stack[stack.length - 1];
    }
    return null;
  }

  handleAndroidBack() {
    const prevPage = this.pop();
    return prevPage !== null;
  }

  switchTab(tabName) {
    if (this.stacks[tabName] && this.stacks[tabName].length > 0) {
      this.currentTab = tabName;
      this.direction = 'tab-switch';
      this.notifyListeners();
      return this.stacks[tabName][this.stacks[tabName].length - 1];
    }
    return null;
  }

  getCurrentPage() {
    const stack = this.stacks[this.currentTab];
    return stack[stack.length - 1] || null;
  }

  canGoBack() {
    return this.stacks[this.currentTab].length > 1;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.getState()));
  }

  getState() {
    return {
      currentTab: this.currentTab,
      currentPage: this.getCurrentPage(),
      direction: this.direction,
      canGoBack: this.canGoBack(),
      stacks: this.stacks
    };
  }
}

const stackManager = new StackManager();
const StackContext = createContext(null);

export function MobileStackProvider({ children }) {
  const [state, setState] = useState(stackManager.getState());

  useEffect(() => {
    const unsubscribe = stackManager.subscribe(setState);
    return unsubscribe;
  }, []);

  return (
    <StackContext.Provider value={{ stackManager, state }}>
      {children}
    </StackContext.Provider>
  );
}

export function useMobileStack() {
  const context = useContext(StackContext);
  if (!context) {
    throw new Error('useMobileStack must be used within MobileStackProvider');
  }
  return context;
}

export { stackManager };