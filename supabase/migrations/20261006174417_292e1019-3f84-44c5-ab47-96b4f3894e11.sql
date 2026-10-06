CREATE TABLE public.fitness_records (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner_hash text NOT NULL,
 kind text NOT NULL CHECK (kind IN ('profile','daily','workout','weight','measurement')),
 record_date date NOT NULL,
 record_key text NOT NULL,
 payload jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(owner_hash,kind,record_key)
);
GRANT ALL ON public.fitness_records TO service_role;
ALTER TABLE public.fitness_records ENABLE ROW LEVEL SECURITY;
CREATE INDEX fitness_records_owner_date ON public.fitness_records(owner_hash,record_date DESC);
CREATE FUNCTION public.fitness_touch_updated() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END; $$;
CREATE TRIGGER fitness_touch BEFORE UPDATE ON public.fitness_records FOR EACH ROW EXECUTE FUNCTION public.fitness_touch_updated();