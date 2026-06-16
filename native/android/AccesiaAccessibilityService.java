package com.keraune.accesiaapp;

import android.accessibilityservice.AccessibilityService;
import android.view.accessibility.AccessibilityEvent;

public class AccesiaAccessibilityService extends AccessibilityService {
  private static AccesiaAccessibilityService instance;

  public static boolean isReady() {
    return instance != null;
  }

  public static boolean runGlobalAction(String action) {
    if (instance == null) return false;

    switch (action) {
      case "home":
        return instance.performGlobalAction(GLOBAL_ACTION_HOME);
      case "back":
        return instance.performGlobalAction(GLOBAL_ACTION_BACK);
      case "recents":
        return instance.performGlobalAction(GLOBAL_ACTION_RECENTS);
      case "notifications":
        return instance.performGlobalAction(GLOBAL_ACTION_NOTIFICATIONS);
      case "quickSettings":
        return instance.performGlobalAction(GLOBAL_ACTION_QUICK_SETTINGS);
      default:
        return false;
    }
  }

  @Override
  protected void onServiceConnected() {
    super.onServiceConnected();
    instance = this;
  }

  @Override
  public void onAccessibilityEvent(AccessibilityEvent event) {
    // AccesIA currently uses the service for user-triggered global actions only.
  }

  @Override
  public void onInterrupt() {
    // No continuous feedback is played by this service.
  }

  @Override
  public boolean onUnbind(android.content.Intent intent) {
    instance = null;
    return super.onUnbind(intent);
  }

  @Override
  public void onDestroy() {
    instance = null;
    super.onDestroy();
  }
}
