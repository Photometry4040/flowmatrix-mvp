/**
 * Panel Preferences Storage
 * Manages user UI preferences for panel layout (collapsed, floating, position, width)
 */

import type { PanelPreferences } from "@/types/workflow";

const PANEL_PREFS_KEY = "flowmatrix_panel_preferences";

const DEFAULT_PREFERENCES: PanelPreferences = {
  leftPanel: {
    isCollapsed: false,
    isFloating: false,
    width: 256, // w-64 in Tailwind
  },
  rightPanel: {
    isCollapsed: false,
    isFloating: false,
    width: 384, // w-96 in Tailwind
  },
};

/**
 * Load panel preferences from localStorage
 * Returns default preferences if not found or on error
 */
export function loadPanelPreferences(): PanelPreferences {
  try {
    const data = localStorage.getItem(PANEL_PREFS_KEY);
    if (!data) return DEFAULT_PREFERENCES;

    const prefs = JSON.parse(data);

    // Merge with defaults to handle version updates
    return {
      leftPanel: { ...DEFAULT_PREFERENCES.leftPanel, ...prefs.leftPanel },
      rightPanel: { ...DEFAULT_PREFERENCES.rightPanel, ...prefs.rightPanel },
    };
  } catch (error) {
    console.error("Failed to load panel preferences:", error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save panel preferences to localStorage
 */
export function savePanelPreferences(prefs: PanelPreferences): void {
  try {
    localStorage.setItem(PANEL_PREFS_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error("Failed to save panel preferences:", error);
  }
}

/**
 * Reset panel preferences to defaults
 */
export function resetPanelPreferences(): void {
  try {
    localStorage.removeItem(PANEL_PREFS_KEY);
  } catch (error) {
    console.error("Failed to reset panel preferences:", error);
  }
}
