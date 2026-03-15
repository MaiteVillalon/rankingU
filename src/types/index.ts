import type { Database } from './database'

export type Facultad = Database['public']['Tables']['facultades']['Row']
export type Carrera = Database['public']['Tables']['carreras']['Row']
export type Ramo = Database['public']['Tables']['ramos']['Row']
export type Profesor = Database['public']['Tables']['profesores']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ReviewProfesor = Database['public']['Tables']['reviews_profesores']['Row']
export type ReviewRamo = Database['public']['Tables']['reviews_ramos']['Row']

export type CarreraConFacultad = Carrera & { facultades: Facultad }
export type RamoConCarrera = Ramo & { carreras: CarreraConFacultad }
export type ProfesorConRamos = Profesor & { ramo_profesor: { ramos: Ramo }[] }

export type ReviewProfesorConPerfil = ReviewProfesor & {
  profiles: Pick<Profile, 'email'>
}

export type ReviewRamoConPerfil = ReviewRamo & {
  profiles: Pick<Profile, 'email'>
}

export type ProfesorConStats = Profesor & {
  avg_claridad: number
  avg_puntualidad: number
  avg_justicia: number
  total_reviews: number
}

export type RamoConStats = Ramo & {
  avg_dificultad: number
  avg_carga: number
  avg_calidad_aprendizaje: number
  total_reviews: number
}
