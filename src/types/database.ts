export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type Relationship = {
  foreignKeyName: string
  columns: string[]
  isOneToOne: boolean
  referencedRelation: string
  referencedColumns: string[]
}

export interface Database {
  public: {
    Tables: {
      facultades: {
        Row: { id: string; nombre: string; codigo: string; descripcion: string | null; created_at: string }
        Insert: { id?: string; nombre: string; codigo: string; descripcion?: string | null; created_at?: string }
        Update: { id?: string; nombre?: string; codigo?: string; descripcion?: string | null; created_at?: string }
        Relationships: Relationship[]
      }
      carreras: {
        Row: { id: string; nombre: string; codigo: string; facultad_id: string; created_at: string }
        Insert: { id?: string; nombre: string; codigo: string; facultad_id: string; created_at?: string }
        Update: { id?: string; nombre?: string; codigo?: string; facultad_id?: string; created_at?: string }
        Relationships: Relationship[]
      }
      ramos: {
        Row: { id: string; nombre: string; codigo: string; creditos: number | null; carrera_id: string; created_at: string }
        Insert: { id?: string; nombre: string; codigo: string; creditos?: number | null; carrera_id: string; created_at?: string }
        Update: { id?: string; nombre?: string; codigo?: string; creditos?: number | null; carrera_id?: string; created_at?: string }
        Relationships: Relationship[]
      }
      profesores: {
        Row: { id: string; nombre: string; email: string | null; departamento: string | null; created_at: string }
        Insert: { id?: string; nombre: string; email?: string | null; departamento?: string | null; created_at?: string }
        Update: { id?: string; nombre?: string; email?: string | null; departamento?: string | null; created_at?: string }
        Relationships: Relationship[]
      }
      ramo_profesor: {
        Row: { ramo_id: string; profesor_id: string }
        Insert: { ramo_id: string; profesor_id: string }
        Update: { ramo_id?: string; profesor_id?: string }
        Relationships: Relationship[]
      }
      profiles: {
        Row: { id: string; email: string; carrera_id: string | null; created_at: string }
        Insert: { id: string; email: string; carrera_id?: string | null; created_at?: string }
        Update: { id?: string; email?: string; carrera_id?: string | null; created_at?: string }
        Relationships: Relationship[]
      }
      reviews_profesores: {
        Row: {
          id: string; user_id: string; profesor_id: string; ramo_id: string | null
          claridad: number; puntualidad: number; justicia: number
          comentario: string | null; created_at: string
        }
        Insert: {
          id?: string; user_id: string; profesor_id: string; ramo_id?: string | null
          claridad: number; puntualidad: number; justicia: number
          comentario?: string | null; created_at?: string
        }
        Update: {
          id?: string; user_id?: string; profesor_id?: string; ramo_id?: string | null
          claridad?: number; puntualidad?: number; justicia?: number
          comentario?: string | null; created_at?: string
        }
        Relationships: Relationship[]
      }
      reviews_ramos: {
        Row: {
          id: string; user_id: string; ramo_id: string
          dificultad: number; carga: number; calidad_aprendizaje: number
          comentario: string | null; created_at: string
        }
        Insert: {
          id?: string; user_id: string; ramo_id: string
          dificultad: number; carga: number; calidad_aprendizaje: number
          comentario?: string | null; created_at?: string
        }
        Update: {
          id?: string; user_id?: string; ramo_id?: string
          dificultad?: number; carga?: number; calidad_aprendizaje?: number
          comentario?: string | null; created_at?: string
        }
        Relationships: Relationship[]
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
