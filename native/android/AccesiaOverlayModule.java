package com.keraune.accesiaapp;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

public class AccesiaOverlayModule extends ReactContextBaseJavaModule {
  private final ReactApplicationContext reactContext;

  public AccesiaOverlayModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @NonNull
  @Override
  public String getName() {
    return "AccesiaOverlay";
  }

  @ReactMethod
  public void hasOverlayPermission(Promise promise) {
    try {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
        promise.resolve(true);
        return;
      }

      promise.resolve(Settings.canDrawOverlays(reactContext));
    } catch (Exception exception) {
      promise.reject("OVERLAY_PERMISSION_ERROR", exception);
    }
  }

  @ReactMethod
  public void openOverlaySettings(Promise promise) {
    try {
      Intent intent = new Intent(
        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
        Uri.parse("package:" + reactContext.getPackageName())
      );
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      reactContext.startActivity(intent);
      promise.resolve(true);
    } catch (Exception exception) {
      promise.reject("OVERLAY_SETTINGS_ERROR", exception);
    }
  }

  @ReactMethod
  public void startOverlay(ReadableMap options, Promise promise) {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(reactContext)) {
        promise.reject("OVERLAY_PERMISSION_REQUIRED", "AccesIA necesita el permiso Mostrar sobre otras apps.");
        return;
      }

      Intent intent = new Intent(reactContext, AccesiaOverlayService.class);
      intent.setAction(AccesiaOverlayService.ACTION_START);
      intent.putExtra(AccesiaOverlayService.EXTRA_SOURCE, getStringOption(options, "source", "device"));
      intent.putExtra(AccesiaOverlayService.EXTRA_THEME, getStringOption(options, "theme", "dark"));
      intent.putExtra(AccesiaOverlayService.EXTRA_SCALE, getDoubleOption(options, "scale", 1.18));
      boolean minimize = getBooleanOption(options, "minimize", false);

      reactContext.startService(intent);

      if (minimize) {
        Intent homeIntent = new Intent(Intent.ACTION_MAIN);
        homeIntent.addCategory(Intent.CATEGORY_HOME);
        homeIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(homeIntent);
      }

      promise.resolve(true);
    } catch (Exception exception) {
      promise.reject("OVERLAY_START_ERROR", exception);
    }
  }

  @ReactMethod
  public void stopOverlay(Promise promise) {
    try {
      Intent intent = new Intent(reactContext, AccesiaOverlayService.class);
      intent.setAction(AccesiaOverlayService.ACTION_STOP);
      reactContext.startService(intent);
      promise.resolve(true);
    } catch (Exception exception) {
      promise.reject("OVERLAY_STOP_ERROR", exception);
    }
  }

  private String getStringOption(ReadableMap options, String key, String fallback) {
    if (options != null && options.hasKey(key) && !options.isNull(key)) {
      return options.getString(key);
    }
    return fallback;
  }

  private double getDoubleOption(ReadableMap options, String key, double fallback) {
    if (options != null && options.hasKey(key) && !options.isNull(key)) {
      return options.getDouble(key);
    }
    return fallback;
  }

  private boolean getBooleanOption(ReadableMap options, String key, boolean fallback) {
    if (options != null && options.hasKey(key) && !options.isNull(key)) {
      return options.getBoolean(key);
    }
    return fallback;
  }
}
