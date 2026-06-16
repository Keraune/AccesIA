const fs = require('fs');
const path = require('path');
const {
  AndroidConfig,
  withAndroidManifest,
  withDangerousMod,
  withMainApplication,
} = require('@expo/config-plugins');

const ANDROID_PACKAGE = 'com.keraune.accesiaapp';
const SOURCE_FILES = [
  'AccesiaOverlayModule.java',
  'AccesiaOverlayPackage.java',
  'AccesiaOverlayService.java',
];

function addPermission(manifest, permissionName) {
  manifest['uses-permission'] = manifest['uses-permission'] || [];
  const alreadyExists = manifest['uses-permission'].some(
    (permission) => permission?.$?.['android:name'] === permissionName,
  );

  if (!alreadyExists) {
    manifest['uses-permission'].push({
      $: {
        'android:name': permissionName,
      },
    });
  }
}

function addOverlayService(manifest) {
  const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  application.service = application.service || [];

  const alreadyExists = application.service.some(
    (service) => service?.$?.['android:name'] === '.AccesiaOverlayService',
  );

  if (!alreadyExists) {
    application.service.push({
      $: {
        'android:name': '.AccesiaOverlayService',
        'android:exported': 'false',
        'android:stopWithTask': 'false',
      },
    });
  }
}

function copyNativeSources(projectRoot) {
  const javaDir = path.join(
    projectRoot,
    'android',
    'app',
    'src',
    'main',
    'java',
    ...ANDROID_PACKAGE.split('.'),
  );

  fs.mkdirSync(javaDir, { recursive: true });

  for (const fileName of SOURCE_FILES) {
    fs.copyFileSync(
      path.join(projectRoot, 'native', 'android', fileName),
      path.join(javaDir, fileName),
    );
  }
}

function addPackageToMainApplication(contents) {
  if (contents.includes('AccesiaOverlayPackage()')) {
    return contents;
  }

  return contents.replace(
    /return packages/g,
    'packages.add(AccesiaOverlayPackage())\n            return packages',
  );
}

module.exports = function withAccesiaAndroidOverlay(config) {
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    addPermission(manifest, 'android.permission.SYSTEM_ALERT_WINDOW');
    addPermission(manifest, 'android.permission.RECORD_AUDIO');
    addOverlayService(manifest);

    return config;
  });

  config = withMainApplication(config, (config) => {
    config.modResults.contents = addPackageToMainApplication(config.modResults.contents);
    return config;
  });

  config = withDangerousMod(config, [
    'android',
    async (config) => {
      copyNativeSources(config.modRequest.projectRoot);
      return config;
    },
  ]);

  return config;
};
