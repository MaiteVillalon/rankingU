-- ============================================================
-- RankingU PUCV — Seed data
-- ============================================================

-- Facultades PUCV
insert into facultades (nombre, codigo, descripcion) values
  ('Facultad de Ingeniería',                        'FING',  'Ingeniería civil en múltiples especialidades'),
  ('Facultad de Arquitectura y Urbanismo',          'FAU',   'Arquitectura, diseño y urbanismo'),
  ('Facultad de Ciencias',                          'FCIEN', 'Ciencias básicas: física, matemática, química, estadística'),
  ('Facultad de Ciencias Económicas y Administrativas', 'FCEA', 'Administración, comercio, contabilidad y economía'),
  ('Facultad de Derecho',                           'FDER',  'Derecho y ciencias jurídicas'),
  ('Facultad de Filosofía y Educación',             'FFE',   'Pedagogía, filosofía y humanidades'),
  ('Escuela de Periodismo',                         'EPER',  'Periodismo y comunicación social'),
  ('Instituto de Música',                           'IMUS',  'Interpretación, composición y educación musical')
on conflict (codigo) do nothing;

-- Carreras — Ingeniería
insert into carreras (nombre, codigo, facultad_id) values
  ('Ingeniería Civil Informática',   'ICI',  (select id from facultades where codigo = 'FING')),
  ('Ingeniería Civil Industrial',    'ICIN', (select id from facultades where codigo = 'FING')),
  ('Ingeniería Civil Electrónica',   'ICE',  (select id from facultades where codigo = 'FING')),
  ('Ingeniería Civil Mecánica',      'ICM',  (select id from facultades where codigo = 'FING')),
  ('Ingeniería Civil Biomédica',     'ICB',  (select id from facultades where codigo = 'FING')),
  ('Ingeniería Civil en Obras Civiles', 'ICOC', (select id from facultades where codigo = 'FING'))
on conflict (codigo) do nothing;

-- Carreras — FAU
insert into carreras (nombre, codigo, facultad_id) values
  ('Arquitectura', 'ARQ', (select id from facultades where codigo = 'FAU')),
  ('Diseño',       'DIS', (select id from facultades where codigo = 'FAU'))
on conflict (codigo) do nothing;

-- Carreras — FCEA
insert into carreras (nombre, codigo, facultad_id) values
  ('Ingeniería Comercial',        'ICOM', (select id from facultades where codigo = 'FCEA')),
  ('Contador Público y Auditor',  'CPA',  (select id from facultades where codigo = 'FCEA')),
  ('Administración de Empresas',  'ADE',  (select id from facultades where codigo = 'FCEA'))
on conflict (codigo) do nothing;

-- Carreras — Derecho
insert into carreras (nombre, codigo, facultad_id) values
  ('Derecho', 'DER', (select id from facultades where codigo = 'FDER'))
on conflict (codigo) do nothing;

-- Carreras — Filosofía y Educación
insert into carreras (nombre, codigo, facultad_id) values
  ('Pedagogía en Castellano y Comunicación', 'PCAST', (select id from facultades where codigo = 'FFE')),
  ('Pedagogía en Historia y Geografía',      'PHIST', (select id from facultades where codigo = 'FFE')),
  ('Pedagogía en Matemática',               'PMAT',  (select id from facultades where codigo = 'FFE')),
  ('Psicología',                            'PSI',   (select id from facultades where codigo = 'FFE'))
on conflict (codigo) do nothing;

-- Ramos comunes — ICI
insert into ramos (nombre, codigo, creditos, carrera_id) values
  ('Introducción a la Programación',       'ICI-1101', 10, (select id from carreras where codigo = 'ICI')),
  ('Programación Orientada a Objetos',     'ICI-1102', 10, (select id from carreras where codigo = 'ICI')),
  ('Estructuras de Datos',                 'ICI-2101', 10, (select id from carreras where codigo = 'ICI')),
  ('Bases de Datos',                       'ICI-2201', 10, (select id from carreras where codigo = 'ICI')),
  ('Sistemas Operativos',                  'ICI-2301', 10, (select id from carreras where codigo = 'ICI')),
  ('Redes de Computadores',                'ICI-2401', 10, (select id from carreras where codigo = 'ICI')),
  ('Ingeniería de Software',               'ICI-3101', 10, (select id from carreras where codigo = 'ICI')),
  ('Algoritmos y Complejidad',             'ICI-3201', 10, (select id from carreras where codigo = 'ICI')),
  ('Inteligencia Artificial',              'ICI-4101', 10, (select id from carreras where codigo = 'ICI')),
  ('Seguridad Computacional',              'ICI-4201', 10, (select id from carreras where codigo = 'ICI')),
  ('Cálculo Diferencial e Integral',       'MAT-ICI-1', 8, (select id from carreras where codigo = 'ICI')),
  ('Álgebra Lineal',                       'MAT-ICI-2', 8, (select id from carreras where codigo = 'ICI')),
  ('Probabilidades y Estadística',         'MAT-ICI-3', 8, (select id from carreras where codigo = 'ICI'))
on conflict (codigo, carrera_id) do nothing;

-- Algunos profesores de ejemplo
insert into profesores (nombre, departamento) values
  ('Juan Pérez González',      'Departamento de Computación'),
  ('María Torres Vidal',       'Departamento de Computación'),
  ('Carlos Rojas Fuentes',     'Departamento de Matemáticas'),
  ('Ana Sepúlveda Mora',       'Departamento de Computación'),
  ('Roberto Campos Díaz',      'Departamento de Redes'),
  ('Patricia Núñez Soto',      'Departamento de Matemáticas'),
  ('Andrés Valenzuela Riquelme', 'Departamento de Sistemas'),
  ('Claudia Herrera Muñoz',    'Departamento de Computación')
on conflict do nothing;
