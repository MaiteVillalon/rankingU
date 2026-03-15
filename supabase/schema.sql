-- ============================================================
-- RankingU PUCV — Schema
-- ============================================================

create extension if not exists "uuid-ossp";

-- Facultades
create table if not exists facultades (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  codigo      text unique not null,
  descripcion text,
  created_at  timestamptz default now()
);

-- Carreras
create table if not exists carreras (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  codigo      text unique not null,
  facultad_id uuid not null references facultades(id) on delete cascade,
  created_at  timestamptz default now()
);

-- Ramos
create table if not exists ramos (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  codigo     text not null,
  creditos   integer,
  carrera_id uuid not null references carreras(id) on delete cascade,
  created_at timestamptz default now(),
  unique(codigo, carrera_id)
);

-- Profesores
create table if not exists profesores (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  email        text unique,
  departamento text,
  created_at   timestamptz default now()
);

-- Relación N:M ramos ↔ profesores
create table if not exists ramo_profesor (
  ramo_id     uuid not null references ramos(id) on delete cascade,
  profesor_id uuid not null references profesores(id) on delete cascade,
  primary key (ramo_id, profesor_id)
);

-- Profiles (extiende auth.users)
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  carrera_id uuid references carreras(id),
  created_at timestamptz default now()
);

-- Reviews de profesores
create table if not exists reviews_profesores (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  profesor_id uuid not null references profesores(id) on delete cascade,
  ramo_id     uuid references ramos(id),
  claridad    integer not null check (claridad between 1 and 5),
  puntualidad integer not null check (puntualidad between 1 and 5),
  justicia    integer not null check (justicia between 1 and 5),
  comentario  text check (char_length(comentario) <= 500),
  created_at  timestamptz default now(),
  unique(user_id, profesor_id, ramo_id)
);

-- Reviews de ramos
create table if not exists reviews_ramos (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references profiles(id) on delete cascade,
  ramo_id              uuid not null references ramos(id) on delete cascade,
  dificultad           integer not null check (dificultad between 1 and 5),
  carga                integer not null check (carga between 1 and 5),
  calidad_aprendizaje  integer not null check (calidad_aprendizaje between 1 and 5),
  comentario           text check (char_length(comentario) <= 500),
  created_at           timestamptz default now(),
  unique(user_id, ramo_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table facultades         enable row level security;
alter table carreras           enable row level security;
alter table ramos              enable row level security;
alter table profesores         enable row level security;
alter table ramo_profesor      enable row level security;
alter table profiles           enable row level security;
alter table reviews_profesores enable row level security;
alter table reviews_ramos      enable row level security;

-- Lectura pública
create policy "public_read_facultades"    on facultades    for select using (true);
create policy "public_read_carreras"      on carreras      for select using (true);
create policy "public_read_ramos"         on ramos         for select using (true);
create policy "public_read_profesores"    on profesores    for select using (true);
create policy "public_read_ramo_profesor" on ramo_profesor for select using (true);
create policy "public_read_rev_prof"      on reviews_profesores for select using (true);
create policy "public_read_rev_ramos"     on reviews_ramos      for select using (true);

-- Reviews — solo usuarios autenticados pueden insertar (su propia review)
create policy "auth_insert_rev_prof"  on reviews_profesores for insert with check (auth.uid() = user_id);
create policy "auth_insert_rev_ramos" on reviews_ramos      for insert with check (auth.uid() = user_id);

-- Profiles
create policy "own_read_profile"   on profiles for select using (auth.uid() = id);
create policy "own_update_profile" on profiles for update using (auth.uid() = id);
create policy "own_insert_profile" on profiles for insert with check (auth.uid() = id);

-- ============================================================
-- Trigger: crear profile al registrarse
-- ============================================================

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
