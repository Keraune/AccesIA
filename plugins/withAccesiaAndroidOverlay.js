const fs = require('fs');
const path = require('path');
const {
  AndroidConfig,
  withAndroidManifest,
  withAppBuildGradle,
  withDangerousMod,
  withMainApplication,
} = require('expo/config-plugins');

const OVERLAY_SERVICE_NAME = '.AccesiaOverlayService';
const ACCESSIBILITY_SERVICE_NAME = '.AccesiaAccessibilityService';
const PACKAGE_NAME = 'AccesiaOverlayPackage';
const QUERY_PACKAGES = [
  'com.google.android.youtube',
  'com.whatsapp',
  'com.android.chrome',
  'com.google.android.gm',
  'com.google.android.apps.maps',
  'com.android.camera',
  'com.google.android.dialer',
];

function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function addService(application, serviceConfig) {
  application.service = ensureArray(application.service);
  const exists = application.service.some((service) => service.$['android:name'] === serviceConfig.$['android:name']);
  if (!exists) {
    application.service.push(serviceConfig);
  }
}

function addOverlayAndAccessibilityServices(manifest) {
  const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);

  addService(application, {
    $: {
      'android:name': OVERLAY_SERVICE_NAME,
      'android:exported': 'false',
    },
  });

  addService(application, {
    $: {
      'android:name': ACCESSIBILITY_SERVICE_NAME,
      'android:exported': 'true',
      'android:permission': 'android.permission.BIND_ACCESSIBILITY_SERVICE',
    },
    'intent-filter': [
      {
        action: [
          {
            $: {
              'android:name': 'android.accessibilityservice.AccessibilityService',
            },
          },
        ],
      },
    ],
    'meta-data': [
      {
        $: {
          'android:name': 'android.accessibilityservice',
          'android:resource': '@xml/accesia_accessibility_service',
        },
      },
    ],
  });

  return manifest;
}

function addUsesPermission(manifest, permissionName) {
  manifest.manifest['uses-permission'] = ensureArray(manifest.manifest['uses-permission']);
  const exists = manifest.manifest['uses-permission'].some(
    (permission) => permission.$['android:name'] === permissionName,
  );

  if (!exists) {
    manifest.manifest['uses-permission'].push({
      $: {
        'android:name': permissionName,
      },
    });
  }

  return manifest;
}

function addQueries(manifest) {
  manifest.manifest.queries = ensureArray(manifest.manifest.queries);
  const queries = manifest.manifest.queries[0] ?? {};
  queries.package = ensureArray(queries.package);

  for (const packageName of QUERY_PACKAGES) {
    const exists = queries.package.some((item) => item.$['android:name'] === packageName);
    if (!exists) {
      queries.package.push({
        $: {
          'android:name': packageName,
        },
      });
    }
  }

  manifest.manifest.queries[0] = queries;
  return manifest;
}

function addPackageToMainApplication(contents) {
  if (contents.includes(`${PACKAGE_NAME}()`)) {
    return contents;
  }

  if (contents.includes('PackageList(this).packages.apply {')) {
    return contents.replace(
      /PackageList\(this\)\.packages\.apply \{([\s\S]*?)\n\s*\}/m,
      (match, body) => `PackageList(this).packages.apply {${body}\n          add(${PACKAGE_NAME}())\n        }`,
    );
  }

  if (contents.includes('PackageList(this).packages')) {
    return contents.replace(
      /PackageList\(this\)\.packages/m,
      `PackageList(this).packages.apply {\n          add(${PACKAGE_NAME}())\n        }`,
    );
  }

  return contents;
}

function writeAccessibilityServiceXml(platformProjectRoot) {
  const xmlDir = path.join(platformProjectRoot, 'app', 'src', 'main', 'res', 'xml');
  fs.mkdirSync(xmlDir, { recursive: true });
  fs.writeFileSync(
    path.join(xmlDir, 'accesia_accessibility_service.xml'),
    `<?xml version="1.0" encoding="utf-8"?>\n<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"\n  android:accessibilityEventTypes="typeAllMask"\n  android:accessibilityFeedbackType="feedbackGeneric"\n  android:accessibilityFlags="flagReportViewIds|flagRetrieveInteractiveWindows"\n  android:canRetrieveWindowContent="true"\n  android:canPerformGestures="true"\n  android:description="@string/accesia_accessibility_service_description"\n  android:notificationTimeout="100" />\n`,
  );
}

function ensureAccessibilityString(platformProjectRoot) {
  const stringsPath = path.join(platformProjectRoot, 'app', 'src', 'main', 'res', 'values', 'strings.xml');
  if (!fs.existsSync(stringsPath)) return;

  const value = 'accesia_accessibility_service_description';
  let contents = fs.readFileSync(stringsPath, 'utf8');
  if (contents.includes(value)) return;

  contents = contents.replace(
    '</resources>',
    `  <string name="${value}">Permite a AccesIA ejecutar acciones globales solicitadas por voz, como inicio, atrás, recientes, notificaciones y ajustes rápidos.</string>\n</resources>`,
  );
  fs.writeFileSync(stringsPath, contents);
}

module.exports = function withAccesiaAndroidOverlay(config) {
  config = withAndroidManifest(config, (configMod) => {
    let manifest = configMod.modResults;
    manifest = addUsesPermission(manifest, 'android.permission.SYSTEM_ALERT_WINDOW');
    manifest = addUsesPermission(manifest, 'android.permission.RECORD_AUDIO');
    manifest = addQueries(manifest);
    manifest = addOverlayAndAccessibilityServices(manifest);
    configMod.modResults = manifest;
    return configMod;
  });

  config = withMainApplication(config, (configMod) => {
    configMod.modResults.contents = addPackageToMainApplication(configMod.modResults.contents);
    return configMod;
  });

  config = withAppBuildGradle(config, (configMod) => configMod);

  config = withDangerousMod(config, [
    'android',
    async (configMod) => {
      const packageName = config.android?.package ?? 'com.keraune.accesiaapp';
      const targetDir = path.join(
        configMod.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'java',
        ...packageName.split('.'),
      );
      const sourceDir = path.join(configMod.modRequest.projectRoot, 'native', 'android');

      fs.mkdirSync(targetDir, { recursive: true });
      for (const fileName of fs.readdirSync(sourceDir).filter((name) => name.endsWith('.java'))) {
        fs.copyFileSync(path.join(sourceDir, fileName), path.join(targetDir, fileName));
      }

      writeAccessibilityServiceXml(configMod.modRequest.platformProjectRoot);
      ensureAccessibilityString(configMod.modRequest.platformProjectRoot);
      return configMod;
    },
  ]);

  return config;
};
