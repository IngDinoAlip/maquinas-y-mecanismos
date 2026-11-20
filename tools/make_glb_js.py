#!/usr/bin/env python3
"""Prepara el modelo 3D del motor para la página.

Uso:  python tools/make_glb_js.py RUTA/Motor.glb

1. Repara el .glb exportado por SolidWorks si trae la animación con los
   desplazamientos de los accesorios mal repartidos (los visores estrictos,
   como model-viewer/three.js, lo rechazan con "Invalid typed array length").
2. Genera  motor/motor-glb.js  (el modelo en base64), que la página carga bajo
   demanda. Así el visor 3D funciona incluso abriendo index.html desde el disco.
   No se guarda ninguna copia suelta del .glb dentro del proyecto.
"""
import base64, json, struct, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
TAM = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}
CTAM = {5126: 4, 5123: 2, 5125: 4, 5121: 1, 5122: 2, 5120: 1}


def leer_glb(datos):
    magia, version, _ = struct.unpack('<4sII', datos[:12])
    if magia != b'glTF' or version != 2:
        raise SystemExit('No es un .glb de glTF 2.0')
    largo_json, _ = struct.unpack('<II', datos[12:20])
    doc = json.loads(datos[20:20 + largo_json])
    return doc, datos[20 + largo_json:]


def reparar(doc):
    vistas, accesos = doc['bufferViews'], doc['accessors']
    tam = lambda a: TAM[a['type']] * CTAM[a['componentType']]
    fin = lambda a: (a.get('byteOffset', 0)
                     + (a['count'] - 1) * (vistas[a['bufferView']].get('byteStride') or tam(a)) + tam(a))
    malos = [i for i, a in enumerate(accesos) if fin(a) > vistas[a['bufferView']]['byteLength']]
    if not malos:
        return 0
    delta = min(accesos[i].get('byteOffset', 0) for i in malos)
    for v in sorted({accesos[i]['bufferView'] for i in malos}):
        vistas[v]['byteOffset'] = vistas[v].get('byteOffset', 0) + delta
    for i in malos:
        accesos[i]['byteOffset'] -= delta
    return len(malos)


def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    origen = Path(sys.argv[1])
    doc, bloque_bin = leer_glb(origen.read_bytes())
    arreglados = reparar(doc)
    js = json.dumps(doc, separators=(',', ':')).encode('utf8')
    js += b' ' * ((4 - len(js) % 4) % 4)
    salida = (struct.pack('<4sII', b'glTF', 2, 12 + 8 + len(js) + len(bloque_bin))
              + struct.pack('<II', len(js), 0x4E4F534A) + js + bloque_bin)
    (RAIZ / 'motor' / 'motor-glb.js').write_text(
        '/* modelo 3D del motor con su estudio de movimiento (glb en base64) */\n'
        'window.MOTOR_GLB="data:model/gltf-binary;base64,' + base64.b64encode(salida).decode() + '";\n',
        encoding='ascii')
    print(f'Listo. Accesorios corregidos: {arreglados}. {len(salida) / 1e6:.1f} MB')


if __name__ == '__main__':
    main()
