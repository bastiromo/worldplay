#!/usr/bin/env bash
# Genera los medios de demostración de WorldPlay (vídeo HLS y audio MP3).
# Todo el contenido se sintetiza localmente con ffmpeg: no hay material de terceros,
# así que puede publicarse sin restricciones de derechos.
#
# Uso: bash scripts/generate-demo-media.sh   (requiere ffmpeg)
set -euo pipefail

OUT="$(cd "$(dirname "$0")/.." && pwd)/public/demo"
FONT="${DEMO_FONT:-/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf}"
DURATION=20

mkdir -p "$OUT/video" "$OUT/audio"

# --- Vídeo HLS -------------------------------------------------------------
# Segmentos fMP4 (.m4s): compatibles con hls.js y Safari, y sin la extensión .ts
# que las herramientas de TypeScript confundirían con código.
# name | fuente visual lavfi | frecuencia del tono de fondo
VIDEOS=(
  "aurora|gradients=s=640x360:r=24:n=4:c0=0x1c2b49:c1=0x3d6bc4:c2=0xffb547:c3=0x8a3b6e:speed=0.04:type=radial|196"
  "fractal|mandelbrot=s=640x360:r=24:maxiter=800:start_scale=2.5:end_scale=0.4,hue=s=0.45:h=200|220"
  "pulso|life=s=320x180:r=24:mold=12:ratio=0.12:death_color=0x0c1526:life_color=0xffb547:mold_color=0x3d6bc4,scale=640:360:flags=neighbor|247"
)

for entry in "${VIDEOS[@]}"; do
  IFS="|" read -r name source tone <<<"$entry"
  dir="$OUT/video/$name"
  rm -rf "$dir" && mkdir -p "$dir"
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "$source" \
    -f lavfi -i "sine=frequency=${tone}:sample_rate=44100,volume=0.08" \
    -t "$DURATION" \
    -vf "drawbox=x=16:y=16:w=282:h=34:color=0x0c1526@0.72:t=fill,\
drawtext=fontfile=${FONT}:text='Señal de prueba':fontcolor=0xe8eefb:fontsize=16:x=28:y=25,\
drawtext=fontfile=${FONT}:text='%{pts\:hms}':fontcolor=0xffb547:fontsize=16:x=166:y=25" \
    -c:v libx264 -preset veryfast -profile:v main -pix_fmt yuv420p -b:v 550k -maxrate 650k -bufsize 1100k \
    -g 48 -keyint_min 48 -sc_threshold 0 \
    -c:a aac -b:a 64k -ac 2 \
    -f hls -hls_time 4 -hls_playlist_type vod \
    -hls_segment_type fmp4 -hls_fmp4_init_filename init.mp4 \
    -hls_segment_filename "$dir/seg_%03d.m4s" "$dir/index.m3u8"
  echo "vídeo: $name"
done

# --- Audio MP3 -------------------------------------------------------------
# Arpegios sintetizados: nota que cambia cada 1/rate s con decaimiento exponencial.
# name | frecuencia base | notas por segundo
AUDIOS=(
  "brisa|220|4"
  "nocturno|164.81|3"
  "costa|261.63|5"
)

for entry in "${AUDIOS[@]}"; do
  IFS="|" read -r name base rate <<<"$entry"
  # Escala pentatónica recorrida en un patrón de 8 pasos: 0 4 7 9 12 9 7 2 semitonos.
  step="mod(floor(t*${rate}),8)"
  semi="if(eq(${step},0),0,if(eq(${step},1),4,if(eq(${step},2),7,if(eq(${step},3),9,if(eq(${step},4),12,if(eq(${step},5),9,if(eq(${step},6),7,2)))))))"
  freq="${base}*pow(2,(${semi})/12)"
  env="exp(-4*mod(t,1/${rate}))"
  expr="0.22*sin(2*PI*t*${freq})*${env} + 0.06*sin(2*PI*t*${base}/2) + 0.03*sin(2*PI*t*${base}*1.5)"
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "aevalsrc=exprs='${expr}':s=44100:d=30" \
    -af "afade=t=in:d=0.5,afade=t=out:st=29.5:d=0.5,aecho=0.8:0.7:240:0.25" \
    -c:a libmp3lame -b:a 96k -ac 1 "$OUT/audio/${name}.mp3"
  echo "audio: $name"
done

du -sh "$OUT"
