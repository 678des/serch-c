create policy "Enable read access for all users"
on "public"."articles"
as PERMISSIVE
for SELECT
to public
using (
    true
);

Alter TABLE "public"."articles"
enable row level security;

CREATE POLICY "Enable insert for service role only"
ON "public"."articles"
FOR INSERT
TO service_role
WITH CHECK (true);
