
-- BuildMyWebpage / Fleming Solutions
-- Saved Website Preview Reference Documents

create table if not exists public.project_reference_documents (
    id uuid primary key default gen_random_uuid(),

    project_id uuid not null
        references public.projects(id)
        on delete cascade,

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    title text not null,
    version_number integer not null default 1,

    -- Snapshot of the assembled preview shown to the customer.
    preview_html text not null,

    -- All data needed to understand/rebuild the visual direction.
    preview_data jsonb not null default '{}'::jsonb,

    -- Optional build notes you can add later.
    build_notes text,

    status text not null default 'reference'
        check (status in ('reference','approved','superseded','archived')),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint project_reference_version_unique
        unique (project_id, version_number)
);

create index if not exists project_reference_documents_project_id_idx
on public.project_reference_documents(project_id);

create index if not exists project_reference_documents_user_id_idx
on public.project_reference_documents(user_id);

create index if not exists project_reference_documents_created_at_idx
on public.project_reference_documents(created_at desc);

drop trigger if exists update_project_reference_documents_updated_at
on public.project_reference_documents;

create trigger update_project_reference_documents_updated_at
before update on public.project_reference_documents
for each row
execute function public.update_updated_at_column();

alter table public.project_reference_documents enable row level security;

drop policy if exists "Users can view references for their projects"
on public.project_reference_documents;

create policy "Users can view references for their projects"
on public.project_reference_documents
for select
to authenticated
using (
    user_id = auth.uid()
    and exists (
        select 1
        from public.projects
        where projects.id = project_reference_documents.project_id
          and projects.user_id = auth.uid()
    )
);

drop policy if exists "Users can create references for their projects"
on public.project_reference_documents;

create policy "Users can create references for their projects"
on public.project_reference_documents
for insert
to authenticated
with check (
    user_id = auth.uid()
    and exists (
        select 1
        from public.projects
        where projects.id = project_reference_documents.project_id
          and projects.user_id = auth.uid()
    )
);

drop policy if exists "Users can update references for their projects"
on public.project_reference_documents;

create policy "Users can update references for their projects"
on public.project_reference_documents
for update
to authenticated
using (
    user_id = auth.uid()
)
with check (
    user_id = auth.uid()
);

drop policy if exists "Users can delete references for their projects"
on public.project_reference_documents;

create policy "Users can delete references for their projects"
on public.project_reference_documents
for delete
to authenticated
using (
    user_id = auth.uid()
);
