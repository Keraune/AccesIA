package com.keraune.accesiaapp;

import android.content.Context;
import android.content.SharedPreferences;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class AccesiaStorageModule extends ReactContextBaseJavaModule {
  private final SharedPreferences preferences;

  public AccesiaStorageModule(ReactApplicationContext reactContext) {
    super(reactContext);
    preferences = reactContext.getSharedPreferences("accesia_storage", Context.MODE_PRIVATE);
  }

  @NonNull
  @Override
  public String getName() {
    return "AccesiaStorage";
  }

  @ReactMethod
  public void getItem(String key, Promise promise) {
    try {
      promise.resolve(preferences.contains(key) ? preferences.getString(key, null) : null);
    } catch (Exception exception) {
      promise.reject("ACCESIA_STORAGE_GET_ERROR", exception);
    }
  }

  @ReactMethod
  public void setItem(String key, String value, Promise promise) {
    try {
      preferences.edit().putString(key, value).apply();
      promise.resolve(true);
    } catch (Exception exception) {
      promise.reject("ACCESIA_STORAGE_SET_ERROR", exception);
    }
  }

  @ReactMethod
  public void removeItem(String key, Promise promise) {
    try {
      preferences.edit().remove(key).apply();
      promise.resolve(true);
    } catch (Exception exception) {
      promise.reject("ACCESIA_STORAGE_REMOVE_ERROR", exception);
    }
  }
}
