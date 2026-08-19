#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

python3 "$ROOT/scripts/make-icons.py"
python3 "$ROOT/scripts/build-standalone.py"

WWW="$ROOT/android/app/src/main/assets/www"
rm -rf "$WWW"
mkdir -p "$WWW"
cp -f "$ROOT/Nitro-Surf.html" "$WWW/index.html"

for density in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
  mkdir -p "$ROOT/android/app/src/main/res/mipmap-$density"
  cp -f "$ROOT/icons/nitro-surf-192.png" "$ROOT/android/app/src/main/res/mipmap-$density/ic_launcher.png"
done

SDK="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$HOME/android-sdk}}"
if [[ ! -d "$SDK/platforms/android-34" ]]; then
  echo "Instale o Android SDK em $SDK (platforms;android-34 e build-tools;34.0.0)." >&2
  exit 1
fi

echo "sdk.dir=$SDK" > "$ROOT/android/local.properties"

export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-21-openjdk-amd64}"
export ANDROID_SDK_ROOT="$SDK"
export ANDROID_HOME="$SDK"

cd "$ROOT/android"
chmod +x ./gradlew
./gradlew --no-daemon assembleDebug

OUT="$ROOT/dist/Nitro-Surf.apk"
mkdir -p "$ROOT/dist"
cp -f "$ROOT/android/app/build/outputs/apk/debug/app-debug.apk" "$OUT"
echo "APK: $OUT"
