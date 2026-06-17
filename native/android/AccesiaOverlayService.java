package com.keraune.accesiaapp;

import android.Manifest;
import android.app.Service;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.PixelFormat;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.provider.Settings;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;

import java.util.ArrayList;
import java.util.Locale;

public class AccesiaOverlayService extends Service {
  public static final String ACTION_START = "com.keraune.accesiaapp.overlay.START";
  public static final String ACTION_STOP = "com.keraune.accesiaapp.overlay.STOP";
  public static final String EXTRA_SOURCE = "source";
  public static final String EXTRA_THEME = "theme";
  public static final String EXTRA_SCALE = "scale";
  public static final String EXTRA_CAPTION_POSITION = "captionPosition";
  public static final String EXTRA_CAPTION_LANGUAGE = "captionLanguage";
  public static final String EXTRA_BUBBLE_SIZE = "bubbleSize";
  public static final String EXTRA_POSITION = "position";

  private static boolean running = false;

  private final Handler mainHandler = new Handler(Looper.getMainLooper());

  private WindowManager windowManager;
  private View overlayView;
  private View captionOverlayView;
  private View closeTargetView;
  private WindowManager.LayoutParams overlayParams;
  private WindowManager.LayoutParams captionOverlayParams;
  private WindowManager.LayoutParams closeTargetParams;
  private TextView captionText;
  private TextView floatingCaptionText;
  private TextView sourceText;
  private TextView stateText;
  private TextView pauseButton;
  private TextView styleButton;
  private TextView sizeButton;
  private TextView subtitlesButton;
  private LinearLayout panelLayout;
  private String source = "device";
  private String theme = "dark";
  private double scale = 1.18;
  private String captionPosition = "bottom";
  private String captionLanguage = "es-PE";
  private String bubbleSize = "standard";
  private String initialPosition = "topRight";
  private boolean expanded = false;
  private boolean subtitlesActive = false;
  private boolean subtitlesPaused = false;
  private boolean manualStopRequested = false;
  private boolean hoveringCloseTarget = false;
  private SpeechRecognizer speechRecognizer;
  private String latestTranscript = "";

  public static boolean isRunning() {
    return running;
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    if (intent != null && ACTION_STOP.equals(intent.getAction())) {
      stopSelf();
      return START_NOT_STICKY;
    }

    if (intent != null) {
      source = intent.getStringExtra(EXTRA_SOURCE) != null ? intent.getStringExtra(EXTRA_SOURCE) : source;
      theme = intent.getStringExtra(EXTRA_THEME) != null ? intent.getStringExtra(EXTRA_THEME) : theme;
      scale = intent.getDoubleExtra(EXTRA_SCALE, scale);
      captionPosition = intent.getStringExtra(EXTRA_CAPTION_POSITION) != null ? intent.getStringExtra(EXTRA_CAPTION_POSITION) : captionPosition;
      captionLanguage = intent.getStringExtra(EXTRA_CAPTION_LANGUAGE) != null ? intent.getStringExtra(EXTRA_CAPTION_LANGUAGE) : captionLanguage;
      bubbleSize = intent.getStringExtra(EXTRA_BUBBLE_SIZE) != null ? intent.getStringExtra(EXTRA_BUBBLE_SIZE) : bubbleSize;
      initialPosition = intent.getStringExtra(EXTRA_POSITION) != null ? intent.getStringExtra(EXTRA_POSITION) : initialPosition;
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
      stopSelf();
      return START_NOT_STICKY;
    }

    showOverlay();
    running = true;
    startCaptions();
    return START_STICKY;
  }

  @Override
  public void onDestroy() {
    running = false;
    manualStopRequested = true;
    subtitlesActive = false;
    stopSpeechRecognizer();
    removeCloseTarget();
    removeCaptionOverlay();
    removeOverlay();
    super.onDestroy();
  }

  @Nullable
  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }

  private void showOverlay() {
    removeOverlay();
    windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
    overlayView = createOverlayView();
    overlayParams = new WindowManager.LayoutParams(
      WindowManager.LayoutParams.WRAP_CONTENT,
      WindowManager.LayoutParams.WRAP_CONTENT,
      getOverlayType(),
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
        | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
        | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
      PixelFormat.TRANSLUCENT
    );
    overlayParams.gravity = Gravity.TOP | Gravity.START;
    applyInitialPosition();
    windowManager.addView(overlayView, overlayParams);
  }

  private int getOverlayType() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      return WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
    }
    return WindowManager.LayoutParams.TYPE_PHONE;
  }

  private View createOverlayView() {
    FrameLayout root = new FrameLayout(this);
    root.setPadding(dp(4), dp(4), dp(4), dp(4));

    LinearLayout container = new LinearLayout(this);
    container.setOrientation(LinearLayout.VERTICAL);
    container.setPadding(0, 0, 0, 0);

    BubbleIconView bubbleFrame = new BubbleIconView(this);
    bubbleFrame.setContentDescription("Burbuja de subtítulos de AccesIA");
    LinearLayout.LayoutParams bubbleParams = new LinearLayout.LayoutParams(getBubbleDimension(), getBubbleDimension());
    container.addView(bubbleFrame, bubbleParams);

    panelLayout = new LinearLayout(this);
    panelLayout.setOrientation(LinearLayout.VERTICAL);
    panelLayout.setVisibility(View.GONE);
    panelLayout.setPadding(dp(14), dp(12), dp(14), dp(14));
    panelLayout.setBackground(createRoundedDrawable(getPanelColor(), dp(22), getBorderColor(), dp(1)));
    LinearLayout.LayoutParams panelParams = new LinearLayout.LayoutParams(dp(312), WindowManager.LayoutParams.WRAP_CONTENT);
    panelParams.topMargin = dp(10);
    panelParams.gravity = isRightAligned() ? Gravity.END : Gravity.START;

    stateText = createText("Escuchando", 13, true, getMutedTextColor());
    captionText = createText("Esperando audio…", (float) (17 * scale), true, getTextColor());
    sourceText = createText(getSourceLabel() + " · " + getLanguageLabel(), 12, true, getMutedTextColor());

    LinearLayout firstRow = createRow(dp(10));
    LinearLayout secondRow = createRow(dp(8));
    LinearLayout thirdRow = createRow(dp(8));

    subtitlesButton = createActionButton("Subtítulos");
    pauseButton = createActionButton("Pausar");
    sizeButton = createActionButton("Tamaño");
    styleButton = createActionButton("Estilo");
    TextView readingButton = createActionButton("Lectura");
    TextView closeButton = createActionButton("Cerrar");

    subtitlesButton.setOnClickListener((view) -> startCaptions());
    pauseButton.setOnClickListener((view) -> togglePauseCaptions());
    sizeButton.setOnClickListener((view) -> {
      scale = scale >= 1.45 ? 1.0 : scale + 0.15;
      updateCaptionText(latestTranscript.trim().isEmpty() ? "Escuchando audio…" : latestTranscript);
      stateText.setText("Tamaño " + Math.round(scale * 100) + "%");
    });
    styleButton.setOnClickListener((view) -> {
      cycleTheme();
      refreshPanelTheme();
      refreshFloatingCaptionTheme();
      updateCaptionState();
    });
    readingButton.setOnClickListener((view) -> openReadingScreen());
    closeButton.setOnClickListener((view) -> stopSelf());

    firstRow.addView(subtitlesButton, new LinearLayout.LayoutParams(0, dp(42), 1));
    firstRow.addView(pauseButton, new LinearLayout.LayoutParams(0, dp(42), 1));
    secondRow.addView(sizeButton, new LinearLayout.LayoutParams(0, dp(42), 1));
    secondRow.addView(styleButton, new LinearLayout.LayoutParams(0, dp(42), 1));
    thirdRow.addView(readingButton, new LinearLayout.LayoutParams(0, dp(42), 1));
    thirdRow.addView(closeButton, new LinearLayout.LayoutParams(0, dp(42), 1));

    panelLayout.addView(stateText);
    panelLayout.addView(captionText);
    panelLayout.addView(sourceText);
    panelLayout.addView(firstRow);
    panelLayout.addView(secondRow);
    panelLayout.addView(thirdRow);
    container.addView(panelLayout, panelParams);
    root.addView(container);

    updateCaptionState();
    bubbleFrame.setOnTouchListener(new DragTouchListener());
    return root;
  }

  private LinearLayout createRow(int topPadding) {
    LinearLayout row = new LinearLayout(this);
    row.setOrientation(LinearLayout.HORIZONTAL);
    row.setGravity(Gravity.CENTER);
    row.setPadding(0, topPadding, 0, 0);
    return row;
  }

  private TextView createText(String text, float size, boolean bold, int color) {
    TextView textView = new TextView(this);
    textView.setText(text);
    textView.setTextColor(color);
    textView.setTextSize(size);
    textView.setPadding(0, dp(3), 0, dp(3));
    textView.setLineSpacing(dp(2), 1.0f);
    textView.setMaxLines(3);
    if (bold) {
      textView.setTypeface(Typeface.DEFAULT_BOLD);
    }
    return textView;
  }

  private TextView createActionButton(String text) {
    TextView button = new TextView(this);
    button.setText(text);
    button.setTextSize(12);
    button.setGravity(Gravity.CENTER);
    button.setTextColor(getTextColor());
    button.setTypeface(Typeface.DEFAULT_BOLD);
    button.setBackground(createRoundedDrawable(getActionColor(), dp(12), getBorderColor(), dp(1)));
    button.setPadding(dp(6), 0, dp(6), 0);
    return button;
  }

  private void toggleExpanded() {
    expanded = !expanded;
    if (panelLayout != null) {
      panelLayout.setVisibility(expanded ? View.VISIBLE : View.GONE);
    }
  }

  private void startCaptions() {
    subtitlesActive = true;
    subtitlesPaused = false;
    manualStopRequested = false;
    showCaptionOverlay();
    updateCaptionText(latestTranscript.trim().isEmpty() ? getListeningMessage() : latestTranscript);
    updateCaptionState();
    startSpeechRecognizer();
  }

  private void togglePauseCaptions() {
    if (!subtitlesActive) {
      startCaptions();
      return;
    }

    subtitlesPaused = !subtitlesPaused;
    if (subtitlesPaused) {
      stopSpeechRecognizer();
      updateCaptionText("Subtítulos pausados");
    } else {
      updateCaptionText(getListeningMessage());
      startSpeechRecognizer();
    }
    updateCaptionState();
  }

  private void updateCaptionState() {
    if (captionText == null || stateText == null || sourceText == null) return;

    captionText.setTextSize((float) (17 * scale));

    if (!subtitlesActive) {
      stateText.setText("Subtítulos inactivos");
      captionText.setText("Toca Subtítulos para iniciar.");
      if (pauseButton != null) pauseButton.setText("Pausar");
    } else if (subtitlesPaused) {
      stateText.setText("Subtítulos pausados");
      captionText.setText("Pausado");
      if (pauseButton != null) pauseButton.setText("Reanudar");
    } else {
      stateText.setText(latestTranscript.trim().isEmpty() ? "Escuchando" : "Subtitulando");
      captionText.setText(latestTranscript.trim().isEmpty() ? "Esperando audio…" : latestTranscript);
      if (pauseButton != null) pauseButton.setText("Pausar");
    }

    sourceText.setText(getSourceLabel() + " · " + getLanguageLabel() + " · " + getCaptionPositionLabel());
    refreshButtonStyles();
  }

  private void showCaptionOverlay() {
    if (windowManager == null) {
      windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
    }

    if (captionOverlayView == null) {
      FrameLayout frame = new FrameLayout(this);
      frame.setPadding(dp(18), dp(6), dp(18), dp(6));
      floatingCaptionText = new TextView(this);
      floatingCaptionText.setGravity(Gravity.CENTER);
      floatingCaptionText.setTextSize((float) (18 * scale));
      floatingCaptionText.setTypeface(Typeface.DEFAULT_BOLD);
      floatingCaptionText.setLineSpacing(dp(3), 1.0f);
      floatingCaptionText.setMaxLines(3);
      floatingCaptionText.setPadding(dp(16), dp(12), dp(16), dp(12));
      frame.addView(
        floatingCaptionText,
        new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.WRAP_CONTENT, Gravity.CENTER)
      );
      captionOverlayView = frame;
    }

    refreshFloatingCaptionTheme();

    if (captionOverlayParams == null) {
      captionOverlayParams = new WindowManager.LayoutParams(
        WindowManager.LayoutParams.MATCH_PARENT,
        WindowManager.LayoutParams.WRAP_CONTENT,
        getOverlayType(),
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
          | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
          | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
        PixelFormat.TRANSLUCENT
      );
    }
    captionOverlayParams.gravity = getCaptionGravity();
    captionOverlayParams.x = 0;
    captionOverlayParams.y = getCaptionYOffset();

    try {
      if (captionOverlayView.getParent() == null) {
        windowManager.addView(captionOverlayView, captionOverlayParams);
      } else {
        windowManager.updateViewLayout(captionOverlayView, captionOverlayParams);
      }
    } catch (Exception ignored) {
    }
  }

  private void removeCaptionOverlay() {
    if (windowManager != null && captionOverlayView != null && captionOverlayView.getParent() != null) {
      try {
        windowManager.removeView(captionOverlayView);
      } catch (Exception ignored) {
      }
    }
    captionOverlayView = null;
    floatingCaptionText = null;
    captionOverlayParams = null;
  }

  private void updateCaptionText(String text) {
    String clean = text == null ? "" : text.trim();
    if (!clean.isEmpty() && !isCaptionPlaceholder(clean)) {
      latestTranscript = clean;
    }

    if (captionText != null) {
      captionText.setText(clean.isEmpty() ? getListeningMessage() : clean);
      captionText.setTextSize((float) (17 * scale));
    }

    if (floatingCaptionText != null) {
      floatingCaptionText.setText(clean.isEmpty() ? getListeningMessage() : clean);
      floatingCaptionText.setTextSize((float) (18 * scale));
    }
  }

  private void refreshFloatingCaptionTheme() {
    if (floatingCaptionText == null) return;
    floatingCaptionText.setTextColor(getTextColor());
    floatingCaptionText.setBackground(createRoundedDrawable(getFloatingPanelColor(), dp(18), getBorderColor(), dp(1)));
  }

  private void startSpeechRecognizer() {
    if (!subtitlesActive || subtitlesPaused) return;

    if (!hasMicrophonePermission()) {
      stopSpeechRecognizer();
      updateCaptionText("Permiso de micrófono requerido");
      if (stateText != null) stateText.setText("Permiso pendiente");
      return;
    }

    if (!SpeechRecognizer.isRecognitionAvailable(this)) {
      updateCaptionText("Reconocimiento de voz no disponible");
      if (stateText != null) stateText.setText("No disponible");
      return;
    }

    mainHandler.post(() -> {
      try {
        stopSpeechRecognizer();
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
        speechRecognizer.setRecognitionListener(new CaptionRecognitionListener());
        speechRecognizer.startListening(createSpeechIntent());
      } catch (Exception exception) {
        scheduleRecognitionRestart();
      }
    });
  }

  private Intent createSpeechIntent() {
    Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, getRecognitionLanguage());
    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, getRecognitionLanguage());
    intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
    intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
    intent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 1600);
    intent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 1200);
    intent.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getPackageName());
    return intent;
  }

  private void scheduleRecognitionRestart() {
    if (!subtitlesActive || subtitlesPaused || manualStopRequested) return;
    mainHandler.postDelayed(() -> {
      if (subtitlesActive && !subtitlesPaused && !manualStopRequested) {
        startSpeechRecognizer();
      }
    }, 700);
  }

  private void stopSpeechRecognizer() {
    mainHandler.removeCallbacksAndMessages(null);
    if (speechRecognizer != null) {
      try {
        speechRecognizer.cancel();
        speechRecognizer.destroy();
      } catch (Exception ignored) {
      }
      speechRecognizer = null;
    }
  }

  private boolean hasMicrophonePermission() {
    return ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
  }

  private class CaptionRecognitionListener implements RecognitionListener {
    @Override public void onReadyForSpeech(Bundle params) {
      if (latestTranscript.trim().isEmpty()) updateCaptionText(getListeningMessage());
      if (stateText != null) stateText.setText("Escuchando");
    }
    @Override public void onBeginningOfSpeech() {
      if (stateText != null) stateText.setText("Subtitulando");
    }
    @Override public void onRmsChanged(float rmsdB) {}
    @Override public void onBufferReceived(byte[] buffer) {}
    @Override public void onEndOfSpeech() {}
    @Override public void onError(int error) {
      if (!subtitlesActive || subtitlesPaused || manualStopRequested) return;
      if (latestTranscript.trim().isEmpty()) updateCaptionText(getListeningMessage());
      scheduleRecognitionRestart();
    }
    @Override public void onResults(Bundle results) {
      updateFromBundle(results);
      scheduleRecognitionRestart();
    }
    @Override public void onPartialResults(Bundle partialResults) {
      updateFromBundle(partialResults);
    }
    @Override public void onEvent(int eventType, Bundle params) {}
  }

  private void updateFromBundle(Bundle bundle) {
    if (bundle == null) return;
    ArrayList<String> matches = bundle.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
    if (matches != null && !matches.isEmpty() && matches.get(0) != null) {
      updateCaptionText(matches.get(0));
      if (stateText != null) stateText.setText("Subtitulando");
    }
  }

  private boolean isCaptionPlaceholder(String text) {
    return text.equals("Escuchando audio…")
      || text.equals("Escuchando video por altavoz…")
      || text.equals("Escuchando clase o reunión…")
      || text.equals("Escuchando sonidos cercanos…")
      || text.equals("Subtítulos pausados")
      || text.equals("Permiso de micrófono requerido")
      || text.equals("Reconocimiento de voz no disponible");
  }

  private String getListeningMessage() {
    if ("video".equals(source)) return "Escuchando video por altavoz…";
    if ("classroom".equals(source)) return "Escuchando clase o reunión…";
    if ("music".equals(source)) return "Escuchando sonidos cercanos…";
    return "Escuchando audio…";
  }

  private int getCaptionGravity() {
    if ("top".equals(captionPosition)) return Gravity.TOP | Gravity.CENTER_HORIZONTAL;
    if ("center".equals(captionPosition)) return Gravity.CENTER;
    return Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
  }

  private int getCaptionYOffset() {
    if ("top".equals(captionPosition)) return dp(54);
    if ("center".equals(captionPosition)) return 0;
    return dp(96);
  }

  private void cycleTheme() {
    if ("dark".equals(theme)) {
      theme = "light";
    } else if ("light".equals(theme)) {
      theme = "highContrast";
    } else if ("highContrast".equals(theme)) {
      theme = "compact";
    } else {
      theme = "dark";
    }
  }

  private void refreshPanelTheme() {
    if (panelLayout == null) return;
    panelLayout.setBackground(createRoundedDrawable(getPanelColor(), dp(22), getBorderColor(), dp(1)));
    captionText.setTextColor(getTextColor());
    sourceText.setTextColor(getMutedTextColor());
    stateText.setTextColor(getMutedTextColor());
    refreshButtonStyles();
  }

  private void refreshButtonStyles() {
    applyButtonStyle(subtitlesButton);
    applyButtonStyle(pauseButton);
    applyButtonStyle(sizeButton);
    applyButtonStyle(styleButton);
  }

  private void applyButtonStyle(TextView button) {
    if (button == null) return;
    button.setTextColor(getTextColor());
    button.setBackground(createRoundedDrawable(getActionColor(), dp(12), getBorderColor(), dp(1)));
  }

  private String getLanguageLabel() {
    if ("es-ES".equals(captionLanguage)) return "Español España";
    if ("en-US".equals(captionLanguage)) return "Inglés";
    if ("auto".equals(captionLanguage)) return "Idioma automático";
    return "Español Perú";
  }

  private String getRecognitionLanguage() {
    if ("auto".equals(captionLanguage)) return Locale.getDefault().toLanguageTag();
    return captionLanguage;
  }

  private String getCaptionPositionLabel() {
    if ("top".equals(captionPosition)) return "Superior";
    if ("center".equals(captionPosition)) return "Centro";
    return "Inferior";
  }

  private String getSourceLabel() {
    if ("video".equals(source)) return "Fuente: video por altavoz";
    if ("music".equals(source)) return "Fuente: sonidos cercanos";
    if ("classroom".equals(source)) return "Fuente: clase o reunión";
    return "Fuente: micrófono";
  }

  private int getBubbleDimension() {
    if ("compact".equals(bubbleSize)) return dp(56);
    if ("large".equals(bubbleSize)) return dp(74);
    return dp(64);
  }

  private void applyInitialPosition() {
    DisplayMetrics metrics = getResources().getDisplayMetrics();
    int margin = dp(22);
    int bubbleDimension = getBubbleDimension();
    int rightX = Math.max(margin, metrics.widthPixels - bubbleDimension - margin);
    int bottomY = Math.max(dp(120), metrics.heightPixels - bubbleDimension - dp(220));

    if ("topLeft".equals(initialPosition)) {
      overlayParams.x = margin;
      overlayParams.y = dp(140);
      return;
    }

    if ("bottomLeft".equals(initialPosition)) {
      overlayParams.x = margin;
      overlayParams.y = bottomY;
      return;
    }

    if ("bottomRight".equals(initialPosition)) {
      overlayParams.x = rightX;
      overlayParams.y = bottomY;
      return;
    }

    overlayParams.x = rightX;
    overlayParams.y = dp(140);
  }

  private boolean isRightAligned() {
    return "topRight".equals(initialPosition) || "bottomRight".equals(initialPosition);
  }

  private int getPanelColor() {
    if ("light".equals(theme)) return Color.WHITE;
    if ("highContrast".equals(theme)) return Color.BLACK;
    if ("compact".equals(theme)) return Color.parseColor("#E60F172A");
    return Color.parseColor("#0F172A");
  }

  private int getFloatingPanelColor() {
    if ("light".equals(theme)) return Color.parseColor("#F8FAFC");
    if ("highContrast".equals(theme)) return Color.BLACK;
    if ("compact".equals(theme)) return Color.parseColor("#D90F172A");
    return Color.parseColor("#E60F172A");
  }

  private int getActionColor() {
    if ("light".equals(theme)) return Color.parseColor("#EEF2FF");
    if ("highContrast".equals(theme)) return Color.parseColor("#1F2937");
    if ("compact".equals(theme)) return Color.parseColor("#334155");
    return Color.parseColor("#1E293B");
  }

  private int getTextColor() {
    if ("light".equals(theme)) return Color.parseColor("#0F172A");
    if ("highContrast".equals(theme)) return Color.parseColor("#FDE047");
    return Color.WHITE;
  }

  private int getMutedTextColor() {
    if ("light".equals(theme)) return Color.parseColor("#475569");
    if ("highContrast".equals(theme)) return Color.parseColor("#FDE68A");
    return Color.parseColor("#CBD5E1");
  }

  private int getBorderColor() {
    if ("light".equals(theme)) return Color.parseColor("#CBD5E1");
    if ("highContrast".equals(theme)) return Color.parseColor("#FDE047");
    return Color.parseColor("#334155");
  }

  private void openReadingScreen() {
    try {
      Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("accesiaapp:///lectura"));
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      startActivity(intent);
      expanded = false;
      if (panelLayout != null) panelLayout.setVisibility(View.GONE);
    } catch (Exception exception) {
      Intent launchIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
      if (launchIntent != null) {
        launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(launchIntent);
      }
    }
  }

  private GradientDrawable createRoundedDrawable(int color, int radius, int strokeColor, int strokeWidth) {
    GradientDrawable drawable = new GradientDrawable();
    drawable.setColor(color);
    drawable.setCornerRadius(radius);
    if (strokeWidth > 0) drawable.setStroke(strokeWidth, strokeColor);
    return drawable;
  }

  private void showCloseTarget() {
    if (windowManager == null || closeTargetView != null) return;

    TextView target = new TextView(this);
    target.setText("×");
    target.setGravity(Gravity.CENTER);
    target.setTextSize(34);
    target.setTypeface(Typeface.DEFAULT_BOLD);
    target.setTextColor(Color.WHITE);
    target.setBackground(createRoundedDrawable(Color.parseColor("#DC2626"), dp(36), Color.parseColor("#FCA5A5"), dp(2)));
    closeTargetView = target;
    closeTargetParams = new WindowManager.LayoutParams(
      dp(72),
      dp(72),
      getOverlayType(),
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE,
      PixelFormat.TRANSLUCENT
    );
    closeTargetParams.gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
    closeTargetParams.y = dp(34);

    try {
      windowManager.addView(closeTargetView, closeTargetParams);
    } catch (Exception ignored) {
      closeTargetView = null;
    }
  }

  private void updateCloseTarget(boolean hovering) {
    if (closeTargetView == null || hoveringCloseTarget == hovering) return;
    hoveringCloseTarget = hovering;
    int color = hovering ? Color.parseColor("#991B1B") : Color.parseColor("#DC2626");
    closeTargetView.setBackground(createRoundedDrawable(color, dp(36), Color.parseColor("#FCA5A5"), dp(2)));
  }

  private void removeCloseTarget() {
    if (windowManager != null && closeTargetView != null) {
      try {
        windowManager.removeView(closeTargetView);
      } catch (Exception ignored) {
      }
    }
    closeTargetView = null;
    closeTargetParams = null;
    hoveringCloseTarget = false;
  }

  private boolean isOverCloseTarget(float rawY) {
    return rawY > getResources().getDisplayMetrics().heightPixels - dp(150);
  }

  private void removeOverlay() {
    if (windowManager != null && overlayView != null) {
      try {
        windowManager.removeView(overlayView);
      } catch (Exception ignored) {
      }
      overlayView = null;
    }
  }

  private int dp(int value) {
    return (int) (value * getResources().getDisplayMetrics().density + 0.5f);
  }

  private int clamp(int value, int min, int max) {
    return Math.max(min, Math.min(value, max));
  }

  private class DragTouchListener implements View.OnTouchListener {
    private int initialX;
    private int initialY;
    private float initialTouchX;
    private float initialTouchY;
    private boolean moved;

    @Override
    public boolean onTouch(View view, MotionEvent event) {
      if (overlayParams == null) return false;

      switch (event.getAction()) {
        case MotionEvent.ACTION_DOWN:
          initialX = overlayParams.x;
          initialY = overlayParams.y;
          initialTouchX = event.getRawX();
          initialTouchY = event.getRawY();
          moved = false;
          return true;
        case MotionEvent.ACTION_MOVE:
          int deltaX = (int) (event.getRawX() - initialTouchX);
          int deltaY = (int) (event.getRawY() - initialTouchY);
          if (Math.abs(deltaX) > dp(4) || Math.abs(deltaY) > dp(4)) {
            moved = true;
            showCloseTarget();
          }

          DisplayMetrics metrics = getResources().getDisplayMetrics();
          int nextX = initialX + deltaX;
          int nextY = initialY + deltaY;
          int maxX = Math.max(dp(16), metrics.widthPixels - getBubbleDimension());
          int maxY = Math.max(dp(80), metrics.heightPixels - dp(120));
          overlayParams.x = clamp(nextX, dp(8), maxX);
          overlayParams.y = clamp(nextY, dp(40), maxY);
          updateCloseTarget(isOverCloseTarget(event.getRawY()));

          if (windowManager != null && overlayView != null) {
            windowManager.updateViewLayout(overlayView, overlayParams);
          }
          return true;
        case MotionEvent.ACTION_UP:
        case MotionEvent.ACTION_CANCEL:
          boolean shouldClose = moved && isOverCloseTarget(event.getRawY());
          removeCloseTarget();
          if (shouldClose) {
            stopSelf();
            return true;
          }
          if (!moved) {
            toggleExpanded();
            if (windowManager != null && overlayView != null) {
              windowManager.updateViewLayout(overlayView, overlayParams);
            }
          }
          return true;
        default:
          return false;
      }
    }
  }

  private class BubbleIconView extends View {
    private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final RectF rect = new RectF();

    public BubbleIconView(android.content.Context context) {
      super(context);
      setLayerType(View.LAYER_TYPE_SOFTWARE, null);
    }

    @Override
    protected void onDraw(Canvas canvas) {
      super.onDraw(canvas);
      int width = getWidth();
      int height = getHeight();
      float radius = dp(22);
      rect.set(0, 0, width, height);
      paint.setShader(new LinearGradient(0, 0, width, height, new int[] {
        Color.parseColor("#0B1220"),
        Color.parseColor("#111827"),
        Color.parseColor("#F0B90B")
      }, null, Shader.TileMode.CLAMP));
      canvas.drawRoundRect(rect, radius, radius, paint);
      paint.setShader(null);
      paint.setStyle(Paint.Style.STROKE);
      paint.setStrokeWidth(dp(1));
      paint.setColor(Color.parseColor("#FDE68A"));
      canvas.drawRoundRect(rect, radius, radius, paint);
      paint.setStyle(Paint.Style.FILL);

      textPaint.setColor(Color.WHITE);
      textPaint.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
      textPaint.setTextAlign(Paint.Align.CENTER);
      textPaint.setTextSize("large".equals(bubbleSize) ? dp(22) : dp(19));
      Paint.FontMetrics metrics = textPaint.getFontMetrics();
      float centerY = height * 0.46f - (metrics.ascent + metrics.descent) / 2;
      canvas.drawText("CC", width / 2f, centerY, textPaint);

      paint.setColor(Color.WHITE);
      float barWidth = width * 0.5f;
      float left = (width - barWidth) / 2f;
      float top = height * 0.65f;
      canvas.drawRoundRect(new RectF(left, top, left + barWidth, top + dp(4)), dp(2), dp(2), paint);
      canvas.drawRoundRect(new RectF(left + width * 0.11f, top + dp(8), left + barWidth - width * 0.11f, top + dp(12)), dp(2), dp(2), paint);
    }
  }
}
