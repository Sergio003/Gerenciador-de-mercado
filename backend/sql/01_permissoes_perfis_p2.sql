
-- Projeto: Menor Preco Saqua
-- Laboratorio de Desenvolvimento de Aplicativos Hibridos
-- P2 - Controle de permissoes dos perfis

-- Impede a alteracao indevida de campos protegidos.
-- Permite ao usuario autenticado atualizar apenas o nome.
-- As politicas RLS existentes devem ser mantidas.

BEGIN;

REVOKE UPDATE ON TABLE public.profiles
FROM PUBLIC, anon, authenticated;

REVOKE UPDATE (id, role, created_at)
ON TABLE public.profiles
FROM PUBLIC, anon, authenticated;

GRANT UPDATE (name)
ON TABLE public.profiles
TO authenticated;

COMMIT;

-- A atribuicao do papel admin deve ser realizada
-- exclusivamente por um administrador autorizado
-- no SQL Editor do Supabase.
--
-- Exemplo:
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = 'UUID_DO_USUARIO_AUTORIZADO';

-- Verificacao das permissoes efetivas.

SELECT
    has_column_privilege(
        'authenticated',
        'public.profiles',
        'name',
        'UPDATE'
    ) AS pode_atualizar_nome,

    has_column_privilege(
        'authenticated',
        'public.profiles',
        'role',
        'UPDATE'
    ) AS pode_atualizar_papel,

    has_column_privilege(
        'authenticated',
        'public.profiles',
        'id',
        'UPDATE'
    ) AS pode_atualizar_id,

    has_column_privilege(
        'authenticated',
        'public.profiles',
        'created_at',
        'UPDATE'
    ) AS pode_atualizar_data_criacao;
