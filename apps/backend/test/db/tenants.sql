INSERT INTO rms.tenant(id,slug,issuer)
SELECT ('00000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid,
       'school-' || n, 'https://id.example.invalid/realms/school-' || n
FROM generate_series(1,43) AS n;
