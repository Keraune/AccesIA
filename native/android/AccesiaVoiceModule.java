package com.keraune.accesiaapp;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import java.util.ArrayList;

public class AccesiaVoiceModule extends ReactContextBaseJavaModule {
  private final ReactApplicationContext reactContext;
  private final Handler mainHandler = new Handler(Looper.getMainLooper());
  private SpeechRecognizer speechRecognizer;
  private Promise activePromise;
  private String activeTranscript = "";
  private double activeConfidence = 0;
  private boolean manualStopRequested = false;

  public AccesiaVoiceModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @NonNull
  @Override
  public String getName() {
    return "AccesiaVoice";
  }

  @ReactMethod
  public void isAvailable(Promise promise) {
    promise.resolve(SpeechRecognizer.isRecognitionAvailable(reactContext));
  }

  @ReactMethod
  public void startListening(ReadableMap options, Promise promise) {
    mainHandler.post(() -> {
      try {
        if (!SpeechRecognizer.isRecognitionAvailable(reactContext)) {
          promise.resolve(buildResult("unavailable"));
          return;
        }

        if (ContextCompat.checkSelfPermission(reactContext, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
          promise.resolve(buildResult("permissionDenied"));
          return;
        }

        releaseRecognizer();
        activePromise = promise;
        activeTranscript = "";
        activeConfidence = 0;
        manualStopRequested = false;

        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactContext);
        speechRecognizer.setRecognitionListener(new AccesiaRecognitionListener());

        String language = getStringOption(options, "language", "es-PE");
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, language);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, language);
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
        intent.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, reactContext.getPackageName());
        speechRecognizer.startListening(intent);
      } catch (Exception exception) {
        releaseWithResult("error");
      }
    });
  }

  @ReactMethod
  public void stopListening(Promise promise) {
    mainHandler.post(() -> {
      if (speechRecognizer == null) {
        promise.resolve(false);
        return;
      }

      manualStopRequested = true;
      try {
        speechRecognizer.stopListening();
        mainHandler.postDelayed(() -> releaseWithResult(activeTranscript.trim().isEmpty() ? "stopped" : "recognized"), 900);
        promise.resolve(true);
      } catch (Exception exception) {
        releaseWithResult(activeTranscript.trim().isEmpty() ? "stopped" : "recognized");
        promise.resolve(true);
      }
    });
  }

  private class AccesiaRecognitionListener implements RecognitionListener {
    @Override
    public void onReadyForSpeech(Bundle params) {}

    @Override
    public void onBeginningOfSpeech() {}

    @Override
    public void onRmsChanged(float rmsdB) {}

    @Override
    public void onBufferReceived(byte[] buffer) {}

    @Override
    public void onEndOfSpeech() {}

    @Override
    public void onError(int error) {
      if (!activeTranscript.trim().isEmpty()) {
        releaseWithResult("recognized");
        return;
      }

      if (manualStopRequested || error == SpeechRecognizer.ERROR_NO_MATCH || error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT) {
        releaseWithResult("stopped");
        return;
      }

      releaseWithResult("error");
    }

    @Override
    public void onResults(Bundle results) {
      updateTranscript(results, true);
      releaseWithResult(activeTranscript.trim().isEmpty() ? "stopped" : "recognized");
    }

    @Override
    public void onPartialResults(Bundle partialResults) {
      updateTranscript(partialResults, false);
    }

    @Override
    public void onEvent(int eventType, Bundle params) {}
  }

  private void updateTranscript(Bundle bundle, boolean finalResult) {
    if (bundle == null) return;
    ArrayList<String> matches = bundle.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
    if (matches != null && !matches.isEmpty() && matches.get(0) != null) {
      activeTranscript = matches.get(0).trim();
    }

    float[] scores = bundle.getFloatArray(SpeechRecognizer.CONFIDENCE_SCORES);
    if (scores != null && scores.length > 0 && scores[0] >= 0) {
      activeConfidence = scores[0];
    } else if (finalResult && !activeTranscript.isEmpty() && activeConfidence <= 0) {
      activeConfidence = 0.82;
    }
  }

  private WritableMap buildResult(String status) {
    WritableMap result = Arguments.createMap();
    result.putString("status", status);
    result.putString("transcript", activeTranscript);
    result.putDouble("confidence", activeConfidence);
    result.putString("source", "device");
    return result;
  }

  private void releaseWithResult(String status) {
    Promise promise = activePromise;
    WritableMap result = buildResult(status);
    activePromise = null;
    releaseRecognizer();
    if (promise != null) {
      promise.resolve(result);
    }
  }

  private void releaseRecognizer() {
    if (speechRecognizer != null) {
      try {
        speechRecognizer.cancel();
        speechRecognizer.destroy();
      } catch (Exception ignored) {
      }
      speechRecognizer = null;
    }
  }

  private String getStringOption(ReadableMap options, String key, String fallback) {
    if (options != null && options.hasKey(key) && !options.isNull(key)) {
      return options.getString(key);
    }
    return fallback;
  }
}
