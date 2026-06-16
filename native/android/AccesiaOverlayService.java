package com.keraune.accesiaapp;

import android.app.Service;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.IBinder;
import android.provider.Settings;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.Nullable;

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

  private WindowManager windowManager;
  private View overlayView;
  private WindowManager.LayoutParams overlayParams;
  private TextView captionText;
  private TextView sourceText;
  private TextView stateText;
  private TextView pauseButton;
  private TextView styleButton;
  private TextView sizeButton;
  private TextView subtitlesButton;
  private LinearLayout panelLayout;
  private LinearLayout container;
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
    return START_STICKY;
  }

  @Override
  public void onDestroy() {
    running = false;
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

    container = new LinearLayout(this);
    container.setOrientation(LinearLayout.VERTICAL);
    container.setPadding(0, 0, 0, 0);

    FrameLayout bubbleFrame = new FrameLayout(this);
    int bubbleDimension = getBubbleDimension();
    bubbleFrame.setBackground(createRoundedDrawable(Color.parseColor("#FFFFFF"), dp(24), getBorderColor(), dp(1)));
    bubbleFrame.setPadding(dp(4), dp(4), dp(4), dp(4));

    ImageView bubbleIcon = new ImageView(this);
    int appIconRes = getApplicationInfo().icon;
    if (appIconRes != 0) {
      bubbleIcon.setImageResource(appIconRes);
    }
    bubbleIcon.setScaleType(ImageView.ScaleType.CENTER_CROP);
    FrameLayout.LayoutParams bubbleIconParams = new FrameLayout.LayoutParams(
      FrameLayout.LayoutParams.MATCH_PARENT,
      FrameLayout.LayoutParams.MATCH_PARENT
    );
    bubbleFrame.addView(bubbleIcon, bubbleIconParams);

    LinearLayout.LayoutParams bubbleParams = new LinearLayout.LayoutParams(bubbleDimension, bubbleDimension);
    container.addView(bubbleFrame, bubbleParams);

    panelLayout = new LinearLayout(this);
    panelLayout.setOrientation(LinearLayout.VERTICAL);
    panelLayout.setVisibility(View.GONE);
    panelLayout.setPadding(dp(14), dp(12), dp(14), dp(14));
    panelLayout.setBackground(createRoundedDrawable(getPanelColor(), dp(22), getBorderColor(), dp(1)));
    LinearLayout.LayoutParams panelParams = new LinearLayout.LayoutParams(dp(308), WindowManager.LayoutParams.WRAP_CONTENT);
    panelParams.topMargin = dp(10);
    panelParams.gravity = isRightAligned() ? Gravity.END : Gravity.START;

    stateText = createText("Burbuja lista", 13, true, getMutedTextColor());
    captionText = createText("Toca Subtítulos para iniciar.", (float) (17 * scale), true, getTextColor());
    sourceText = createText(getSourceLabel() + " · " + getLanguageLabel(), 12, true, getMutedTextColor());

    LinearLayout firstRow = createRow(dp(10));
    LinearLayout secondRow = createRow(dp(8));

    subtitlesButton = createActionButton("Subtítulos");
    pauseButton = createActionButton("Pausar");
    sizeButton = createActionButton("Tamaño");
    styleButton = createActionButton("Estilo");
    TextView closeButton = createActionButton("Cerrar");

    subtitlesButton.setOnClickListener((view) -> {
      subtitlesActive = true;
      subtitlesPaused = false;
      updateCaptionState();
    });

    pauseButton.setOnClickListener((view) -> {
      if (!subtitlesActive) {
        subtitlesActive = true;
      }
      subtitlesPaused = !subtitlesPaused;
      updateCaptionState();
    });

    sizeButton.setOnClickListener((view) -> {
      scale = scale >= 1.45 ? 1.0 : scale + 0.15;
      updateCaptionState();
      stateText.setText("Tamaño " + Math.round(scale * 100) + "%");
    });

    styleButton.setOnClickListener((view) -> {
      cycleTheme();
      refreshPanelTheme();
      updateCaptionState();
    });

    closeButton.setOnClickListener((view) -> stopSelf());

    firstRow.addView(subtitlesButton, new LinearLayout.LayoutParams(0, dp(42), 1));
    firstRow.addView(pauseButton, new LinearLayout.LayoutParams(0, dp(42), 1));
    secondRow.addView(sizeButton, new LinearLayout.LayoutParams(0, dp(42), 1));
    secondRow.addView(styleButton, new LinearLayout.LayoutParams(0, dp(42), 1));
    secondRow.addView(closeButton, new LinearLayout.LayoutParams(0, dp(42), 1));

    panelLayout.addView(stateText);
    panelLayout.addView(captionText);
    panelLayout.addView(sourceText);
    panelLayout.addView(firstRow);
    panelLayout.addView(secondRow);
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

  private void updateCaptionState() {
    if (captionText == null || stateText == null || sourceText == null) return;

    captionText.setTextSize((float) (17 * scale));

    if (!subtitlesActive) {
      stateText.setText("Subtítulos inactivos");
      captionText.setText("Toca Subtítulos para iniciar.");
      if (pauseButton != null) {
        pauseButton.setText("Pausar");
      }
    } else if (subtitlesPaused) {
      stateText.setText("Subtítulos pausados");
      captionText.setText("Pausado");
      if (pauseButton != null) {
        pauseButton.setText("Reanudar");
      }
    } else {
      stateText.setText("Subtítulos activos");
      captionText.setText("Esperando audio…");
      if (pauseButton != null) {
        pauseButton.setText("Pausar");
      }
    }

    sourceText.setText(getSourceLabel() + " · " + getLanguageLabel() + " · " + getCaptionPositionLabel());
    refreshButtonStyles();
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

  private String getCaptionPositionLabel() {
    if ("top".equals(captionPosition)) return "Superior";
    if ("center".equals(captionPosition)) return "Centro";
    return "Inferior";
  }

  private String getSourceLabel() {
    if ("video".equals(source)) return "Fuente: multimedia del dispositivo";
    if ("music".equals(source)) return "Fuente: sonido y música";
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

  private GradientDrawable createRoundedDrawable(int color, int radius, int strokeColor, int strokeWidth) {
    GradientDrawable drawable = new GradientDrawable();
    drawable.setColor(color);
    drawable.setCornerRadius(radius);
    if (strokeWidth > 0) {
      drawable.setStroke(strokeWidth, strokeColor);
    }
    return drawable;
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
          }

          DisplayMetrics metrics = getResources().getDisplayMetrics();
          int nextX = initialX + deltaX;
          int nextY = initialY + deltaY;
          int maxX = Math.max(dp(16), metrics.widthPixels - getBubbleDimension());
          int maxY = Math.max(dp(80), metrics.heightPixels - dp(120));
          overlayParams.x = clamp(nextX, dp(8), maxX);
          overlayParams.y = clamp(nextY, dp(40), maxY);

          if (windowManager != null && overlayView != null) {
            windowManager.updateViewLayout(overlayView, overlayParams);
          }
          return true;
        case MotionEvent.ACTION_UP:
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
}
