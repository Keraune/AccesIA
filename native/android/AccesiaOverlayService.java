package com.keraune.accesiaapp;

import android.app.Service;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.IBinder;
import android.provider.Settings;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.Nullable;

public class AccesiaOverlayService extends Service {
  public static final String ACTION_START = "com.keraune.accesiaapp.overlay.START";
  public static final String ACTION_STOP = "com.keraune.accesiaapp.overlay.STOP";
  public static final String EXTRA_SOURCE = "source";
  public static final String EXTRA_THEME = "theme";
  public static final String EXTRA_SCALE = "scale";

  private WindowManager windowManager;
  private View overlayView;
  private WindowManager.LayoutParams overlayParams;
  private TextView captionText;
  private TextView sourceText;
  private TextView stateText;
  private LinearLayout panelLayout;
  private String source = "device";
  private String theme = "dark";
  private double scale = 1.18;
  private boolean expanded = false;
  private boolean subtitlesActive = false;
  private boolean subtitlesPaused = false;

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
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
      stopSelf();
      return START_NOT_STICKY;
    }

    showOverlay();
    return START_STICKY;
  }

  @Override
  public void onDestroy() {
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
    overlayParams.x = dp(22);
    overlayParams.y = dp(140);

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
    container.setGravity(Gravity.CENTER);
    container.setPadding(0, 0, 0, 0);

    TextView bubble = new TextView(this);
    bubble.setText("A");
    bubble.setTextColor(Color.WHITE);
    bubble.setTextSize(24);
    bubble.setGravity(Gravity.CENTER);
    bubble.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
    bubble.setBackground(createRoundedDrawable(Color.parseColor("#0F172A"), dp(28), Color.parseColor("#38BDF8"), dp(2)));
    LinearLayout.LayoutParams bubbleParams = new LinearLayout.LayoutParams(dp(62), dp(62));
    container.addView(bubble, bubbleParams);

    panelLayout = new LinearLayout(this);
    panelLayout.setOrientation(LinearLayout.VERTICAL);
    panelLayout.setVisibility(View.GONE);
    panelLayout.setPadding(dp(14), dp(12), dp(14), dp(14));
    panelLayout.setBackground(createRoundedDrawable(getPanelColor(), dp(22), getBorderColor(), dp(1)));
    LinearLayout.LayoutParams panelParams = new LinearLayout.LayoutParams(dp(308), WindowManager.LayoutParams.WRAP_CONTENT);
    panelParams.topMargin = dp(10);

    stateText = createText("AccesIA", 13, true, getMutedTextColor());
    captionText = createText("Toca Subtítulos para iniciar.", (float) (17 * scale), true, getTextColor());
    sourceText = createText(getSourceLabel(), 12, true, getMutedTextColor());

    LinearLayout firstRow = new LinearLayout(this);
    firstRow.setOrientation(LinearLayout.HORIZONTAL);
    firstRow.setGravity(Gravity.CENTER);
    firstRow.setPadding(0, dp(10), 0, 0);

    LinearLayout secondRow = new LinearLayout(this);
    secondRow.setOrientation(LinearLayout.HORIZONTAL);
    secondRow.setGravity(Gravity.CENTER);
    secondRow.setPadding(0, dp(8), 0, 0);

    TextView subtitles = createActionButton("Subtítulos");
    TextView pause = createActionButton("Pausar");
    TextView size = createActionButton("Tamaño");
    TextView style = createActionButton("Estilo");
    TextView close = createActionButton("Cerrar");

    subtitles.setOnClickListener((view) -> {
      subtitlesActive = true;
      subtitlesPaused = false;
      updateCaptionState();
    });

    pause.setOnClickListener((view) -> {
      if (!subtitlesActive) {
        subtitlesActive = true;
      }
      subtitlesPaused = !subtitlesPaused;
      updateCaptionState();
    });

    size.setOnClickListener((view) -> {
      scale = scale >= 1.45 ? 1.0 : scale + 0.15;
      captionText.setTextSize((float) (17 * scale));
      stateText.setText("Tamaño " + Math.round(scale * 100) + "%");
    });

    style.setOnClickListener((view) -> {
      cycleTheme();
      refreshPanelTheme();
    });

    close.setOnClickListener((view) -> stopSelf());

    firstRow.addView(subtitles, new LinearLayout.LayoutParams(0, dp(42), 1));
    firstRow.addView(pause, new LinearLayout.LayoutParams(0, dp(42), 1));
    secondRow.addView(size, new LinearLayout.LayoutParams(0, dp(42), 1));
    secondRow.addView(style, new LinearLayout.LayoutParams(0, dp(42), 1));
    secondRow.addView(close, new LinearLayout.LayoutParams(0, dp(42), 1));

    panelLayout.addView(stateText);
    panelLayout.addView(captionText);
    panelLayout.addView(sourceText);
    panelLayout.addView(firstRow);
    panelLayout.addView(secondRow);
    container.addView(panelLayout, panelParams);
    root.addView(container);

    bubble.setOnTouchListener(new DragTouchListener());
    return root;
  }

  private TextView createText(String text, float size, boolean bold, int color) {
    TextView textView = new TextView(this);
    textView.setText(text);
    textView.setTextColor(color);
    textView.setTextSize(size);
    textView.setPadding(0, dp(3), 0, dp(3));
    textView.setLineSpacing(dp(2), 1.0f);
    if (bold) {
      textView.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
    }
    return textView;
  }

  private TextView createActionButton(String text) {
    TextView button = new TextView(this);
    button.setText(text);
    button.setTextSize(12);
    button.setGravity(Gravity.CENTER);
    button.setTextColor(getTextColor());
    button.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
    button.setBackground(createRoundedDrawable(getActionColor(), dp(12), getBorderColor(), dp(1)));
    button.setPadding(dp(6), 0, dp(6), 0);
    return button;
  }

  private void toggleExpanded() {
    expanded = !expanded;
    panelLayout.setVisibility(expanded ? View.VISIBLE : View.GONE);
  }

  private void updateCaptionState() {
    if (captionText == null || stateText == null || sourceText == null) return;

    if (!subtitlesActive) {
      stateText.setText("Subtítulos inactivos");
      captionText.setText("Toca Subtítulos para iniciar.");
    } else if (subtitlesPaused) {
      stateText.setText("Subtítulos pausados");
      captionText.setText("Pausado");
    } else {
      stateText.setText("Subtítulos activos");
      captionText.setText("Esperando audio…");
    }

    sourceText.setText(getSourceLabel());
  }

  private void cycleTheme() {
    if ("dark".equals(theme)) {
      theme = "blue";
    } else if ("blue".equals(theme)) {
      theme = "light";
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
    stateText.setText("Estilo " + getThemeLabel());
  }

  private String getThemeLabel() {
    if ("light".equals(theme)) return "claro";
    if ("blue".equals(theme)) return "azul";
    return "oscuro";
  }

  private String getSourceLabel() {
    if ("video".equals(source)) return "Fuente: multimedia del dispositivo";
    if ("music".equals(source)) return "Fuente: sonido y música";
    if ("classroom".equals(source)) return "Fuente: clase o reunión";
    return "Fuente: micrófono";
  }

  private int getPanelColor() {
    if ("light".equals(theme)) return Color.WHITE;
    if ("blue".equals(theme)) return Color.parseColor("#1D4ED8");
    return Color.parseColor("#0F172A");
  }

  private int getActionColor() {
    if ("light".equals(theme)) return Color.parseColor("#EEF2FF");
    if ("blue".equals(theme)) return Color.parseColor("#1E40AF");
    return Color.parseColor("#1E293B");
  }

  private int getTextColor() {
    if ("light".equals(theme)) return Color.parseColor("#0F172A");
    return Color.WHITE;
  }

  private int getMutedTextColor() {
    if ("light".equals(theme)) return Color.parseColor("#475569");
    return Color.parseColor("#CBD5E1");
  }

  private int getBorderColor() {
    if ("light".equals(theme)) return Color.parseColor("#CBD5E1");
    return Color.parseColor("#334155");
  }

  private android.graphics.drawable.GradientDrawable createRoundedDrawable(int color, int radius, int strokeColor, int strokeWidth) {
    android.graphics.drawable.GradientDrawable drawable = new android.graphics.drawable.GradientDrawable();
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

  private class DragTouchListener implements View.OnTouchListener {
    private int initialX;
    private int initialY;
    private float initialTouchX;
    private float initialTouchY;
    private boolean moved;

    @Override
    public boolean onTouch(View view, MotionEvent event) {
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
          overlayParams.x = initialX + deltaX;
          overlayParams.y = initialY + deltaY;
          if (windowManager != null && overlayView != null) {
            windowManager.updateViewLayout(overlayView, overlayParams);
          }
          return true;
        case MotionEvent.ACTION_UP:
          if (!moved) {
            toggleExpanded();
          }
          return true;
        default:
          return false;
      }
    }
  }
}
