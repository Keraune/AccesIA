package com.keraune.accesiaapp;

import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.provider.MediaStore;
import android.provider.Settings;
import android.text.TextUtils;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.text.Normalizer;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class AccesiaDeviceModule extends ReactContextBaseJavaModule {
  private final ReactApplicationContext reactContext;
  private final Map<String, String> knownPackages = new HashMap<>();

  public AccesiaDeviceModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    seedKnownPackages();
  }

  @NonNull
  @Override
  public String getName() {
    return "AccesiaDevice";
  }

  @ReactMethod
  public void openAccessibilitySettings(Promise promise) {
    openSettingsAction(Settings.ACTION_ACCESSIBILITY_SETTINGS, promise);
  }

  @ReactMethod
  public void openDisplaySettings(Promise promise) {
    openSettingsAction(Settings.ACTION_DISPLAY_SETTINGS, promise);
  }

  @ReactMethod
  public void openCaptionSettings(Promise promise) {
    try {
      openSettingsAction(Settings.ACTION_CAPTIONING_SETTINGS, promise);
    } catch (Exception exception) {
      openSettingsAction(Settings.ACTION_ACCESSIBILITY_SETTINGS, promise);
    }
  }

  @ReactMethod
  public void openSystemSettings(Promise promise) {
    openSettingsAction(Settings.ACTION_SETTINGS, promise);
  }

  @ReactMethod
  public void isAccessibilityServiceEnabled(Promise promise) {
    try {
      String packageName = reactContext.getPackageName();
      String serviceName = AccesiaAccessibilityService.class.getName();
      String enabledServices = Settings.Secure.getString(
        reactContext.getContentResolver(),
        Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
      );
      boolean enabled = false;
      if (!TextUtils.isEmpty(enabledServices)) {
        TextUtils.SimpleStringSplitter splitter = new TextUtils.SimpleStringSplitter(':');
        splitter.setString(enabledServices);
        while (splitter.hasNext()) {
          ComponentName componentName = ComponentName.unflattenFromString(splitter.next());
          if (componentName != null
            && packageName.equals(componentName.getPackageName())
            && serviceName.equals(componentName.getClassName())) {
            enabled = true;
            break;
          }
        }
      }
      promise.resolve(enabled || AccesiaAccessibilityService.isReady());
    } catch (Exception exception) {
      promise.reject("ACCESSIBILITY_STATUS_ERROR", exception);
    }
  }

  @ReactMethod
  public void performGlobalAction(String action, Promise promise) {
    try {
      promise.resolve(AccesiaAccessibilityService.runGlobalAction(action));
    } catch (Exception exception) {
      promise.reject("GLOBAL_ACTION_ERROR", exception);
    }
  }

  @ReactMethod
  public void openAppByPackage(String packageName, Promise promise) {
    try {
      boolean launched = launchPackage(packageName);
      if (!launched && "com.android.camera".equals(packageName)) {
        launched = openCameraIntent();
      }
      if (!launched) {
        openPlayStore(packageName);
      }
      WritableMap result = Arguments.createMap();
      result.putBoolean("opened", launched);
      result.putString("packageName", packageName);
      promise.resolve(result);
    } catch (Exception exception) {
      promise.reject("APP_OPEN_ERROR", exception);
    }
  }

  @ReactMethod
  public void openAppByName(String appName, Promise promise) {
    try {
      String normalized = normalize(appName);
      String packageName = knownPackages.get(normalized);
      WritableMap result = Arguments.createMap();

      if (packageName == null) {
        result.putBoolean("opened", false);
        result.putString("packageName", "");
        result.putString("label", appName);
        promise.resolve(result);
        return;
      }

      boolean opened = launchPackage(packageName);
      if (!opened && "com.android.camera".equals(packageName)) {
        opened = openCameraIntent();
      }

      result.putBoolean("opened", opened);
      result.putString("packageName", packageName);
      result.putString("label", appName);
      promise.resolve(result);
    } catch (Exception exception) {
      promise.reject("APP_SEARCH_ERROR", exception);
    }
  }

  private void openSettingsAction(String action, Promise promise) {
    try {
      Intent intent = new Intent(action);
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      reactContext.startActivity(intent);
      promise.resolve(true);
    } catch (Exception exception) {
      try {
        Intent fallback = new Intent(Settings.ACTION_SETTINGS);
        fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(fallback);
        promise.resolve(true);
      } catch (Exception fallbackException) {
        promise.reject("SETTINGS_OPEN_ERROR", fallbackException);
      }
    }
  }

  private boolean launchPackage(String packageName) {
    PackageManager packageManager = reactContext.getPackageManager();
    Intent intent = packageManager.getLaunchIntentForPackage(packageName);
    if (intent == null) return false;
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);
    reactContext.startActivity(intent);
    return true;
  }

  private boolean openCameraIntent() {
    try {
      Intent intent = new Intent(MediaStore.INTENT_ACTION_STILL_IMAGE_CAMERA);
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      reactContext.startActivity(intent);
      return true;
    } catch (Exception exception) {
      return false;
    }
  }

  private void openPlayStore(String packageName) {
    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + packageName));
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    try {
      reactContext.startActivity(intent);
    } catch (Exception ignored) {
      Intent webIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=" + packageName));
      webIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      reactContext.startActivity(webIntent);
    }
  }

  private String normalize(String value) {
    String normalized = Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD)
      .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
      .toLowerCase(Locale.ROOT)
      .replaceAll("[^a-z0-9ñ ]", " ")
      .replaceAll("\\s+", " ")
      .trim();

    if (normalized.equals("you tube")) return "youtube";
    if (normalized.equals("whats app")) return "whatsapp";
    if (normalized.equals("google chrome")) return "chrome";
    if (normalized.equals("google maps")) return "maps";
    if (normalized.equals("mapa")) return "mapas";
    if (normalized.equals("camara") || normalized.equals("camera")) return "camara";
    if (normalized.equals("telefono") || normalized.equals("phone") || normalized.equals("llamadas")) return "telefono";
    if (normalized.equals("configuracion") || normalized.equals("ajustes")) return "ajustes";
    return normalized;
  }

  private void seedKnownPackages() {
    knownPackages.put("youtube", "com.google.android.youtube");
    knownPackages.put("whatsapp", "com.whatsapp");
    knownPackages.put("chrome", "com.android.chrome");
    knownPackages.put("gmail", "com.google.android.gm");
    knownPackages.put("maps", "com.google.android.apps.maps");
    knownPackages.put("mapas", "com.google.android.apps.maps");
    knownPackages.put("camara", "com.android.camera");
    knownPackages.put("telefono", "com.google.android.dialer");
    knownPackages.put("spotify", "com.spotify.music");
    knownPackages.put("telegram", "org.telegram.messenger");
    knownPackages.put("instagram", "com.instagram.android");
    knownPackages.put("facebook", "com.facebook.katana");
    knownPackages.put("tiktok", "com.zhiliaoapp.musically");
    knownPackages.put("netflix", "com.netflix.mediaclient");
    knownPackages.put("ajustes", "com.android.settings");
  }
}
