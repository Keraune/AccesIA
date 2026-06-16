const fs = require('fs');
const path = require('path');
const {
  AndroidConfig,
  withAndroidManifest,
  withAppBuildGradle,
  withDangerousMod,
  withMainApplication,
} = require('expo/config-plugins');

const SERVICE_NAME = '.AccesiaOverlayService';
const PACKAGE_NAME = 'AccesiaOverlayPackage';

function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function addOverlayService(manifest) {
  const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  application.service = ensureArray(application.service);

  const exists = application.service.some((service) => service.$['android:name'] === SERVICE_NAME);
  if (!exists) {
    application.service.push({
      $: {
        'android:name': SERVICE_NAME,
        'android:exported': 'false',
      },
    });
  }

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

module.exports = function withAccesiaAndroidOverlay(config) {
  config = withAndroidManifest(config, (configMod) => {
    let manifest = configMod.modResults;
    manifest = addUsesPermission(manifest, 'android.permission.SYSTEM_ALERT_WINDOW');
    manifest = addUsesPermission(manifest, 'android.permission.RECORD_AUDIO');
    manifest = addOverlayService(manifest);
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
      for (const fileName of ['AccesiaOverlayModule.java', 'AccesiaOverlayPackage.java', 'AccesiaOverlayService.java']) {
        fs.copyFileSync(path.join(sourceDir, fileName), path.join(targetDir, fileName));
      }

      return configMod;
    },
  ]);

  return config;
};
