const PALABRAS_PROHIBIDAS = [
  // Insultos directos
  'idiota', 'imbécil', 'imbecil', 'estúpido', 'estupido', 'inútil', 'inutil',
  'incompetente', 'hdp', 'huevón', 'huevon', 'weon', 'weón', 'ctm', 'conchatumadre',
  'conchetumare', 'culiao', 'culiado', 'maricón', 'maricon', 'marico',
  'pendejo', 'tarado', 'retrasado', 'mongolo', 'mogólico', 'mogolico',
  'animal', 'bestia', 'bruto', 'burro', 'cabro chico', 'gil', 'gila',

  // Groserías generales
  'mierda', 'puta', 'puto', 'perra', 'perro', 'aweonao', 'aweonado',
  'concha', 'pico', 'pichula', 'pene', 'vagina', 'culo', 'teta', 'tetas',
  'cagado', 'cagada', 'cagar', 'poto',

  // Amenazas / violencia
  'matar', 'golpear', 'pegar', 'cagar a palos', 'romper', 'destruir',
  'amenaza', 'te voy a', 'te voy',

  // Discriminación
  'maricón', 'maricon', 'homosexual', 'lesbiana', // como insulto
  'negro', 'negra', // como insulto racial
  'indio', // como insulto
  'mapuche de mierda',

  // Contenido ilegal
  'droga', 'cocaína', 'cocaina', 'marihuana', 'cannabis', 'pasta base',
  'robar', 'hurtar', 'fraude', 'coima', 'soborno',
]

// Frases que en contexto educativo podrían ser legítimas — no bloquear
const EXCEPCIONES = [
  'no es inútil', 'no es inutil', 'para nada inútil', 'no es bestia',
]

export async function moderateComment(
  text: string
): Promise<{ approved: boolean; reason?: string }> {
  const lower = text.toLowerCase()

  // Verificar excepciones primero
  for (const excepcion of EXCEPCIONES) {
    if (lower.includes(excepcion)) return { approved: true }
  }

  for (const palabra of PALABRAS_PROHIBIDAS) {
    if (lower.includes(palabra.toLowerCase())) {
      return {
        approved: false,
        reason: 'El comentario contiene lenguaje inapropiado. Por favor mantén un tono respetuoso.',
      }
    }
  }

  // Verificar longitud mínima de contenido real
  if (text.trim().length < 10) {
    return {
      approved: false,
      reason: 'El comentario es demasiado corto. Escribe al menos 10 caracteres.',
    }
  }

  return { approved: true }
}
