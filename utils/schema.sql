CREATE TYPE user_role as enum ('staff', 'admin');

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  department TEXT,
  role user_role NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, department, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'department',
    'staff' 
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();



CREATE TABLE public.attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reference TEXT UNIQUE,
  title TEXT NOT NULL,
  original_file_url TEXT NOT NULL,
  requested_format TEXT NOT NULL DEFAULT 'pdf' CHECK (requested_format IN('word', 'pdf')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Resolved', 'Cancelled')),
  document_url TEXT ,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.reference_counters (
  year INTEGER PRIMARY KEY,
  last_value INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_counters ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE PLPGSQL;

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.attachments
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE OR REPLACE FUNCTION public.generate_attachment_reference()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
DECLARE
  current_year INTEGER := EXTRACT(YEAR FROM now());
  next_val INTEGER;
BEGIN
  INSERT INTO public.reference_counters (year, last_value)
  VALUES (current_year, 1)
  ON CONFLICT (year)
  DO UPDATE SET last_value = reference_counters.last_value + 1
  RETURNING last_value INTO next_val;

  new.reference := 'ATH.' || current_year || '.' || lpad(next_val::TEXT, 3, '0');
  RETURN new;
END;
$$ LANGUAGE PLPGSQL;

CREATE TRIGGER assign_reference_number
  BEFORE INSERT ON public.attachments
  FOR EACH ROW EXECUTE FUNCTION public.generate_attachment_reference();

CREATE POLICY "Users view own attachments, admins view all"
  ON public.attachments
  FOR SELECT 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Users can insert their own attachments"
  ON public.attachments
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own, admins update all"
  ON public.attachments
  FOR UPDATE 
  TO authenticated
  USING (
    auth.uid() = user_id OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );


INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false);

CREATE POLICY "Users can read own files, admins can read all"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'attachments' AND (
      (auth.uid()::TEXT = (string_to_array(name, '/'))[1]) OR
      (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
    )
  );

CREATE POLICY "Users can upload files to their own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'attachments' AND
    (auth.uid()::TEXT = (string_to_array(name, '/'))[1]) AND
    (lower(storage.extension(name)) IN (
      'jpg', 'jpeg', 'png', 'webp',
      'pdf',
      'doc', 'docx',
      'xls', 'xlsx'
  ))
  );

CREATE POLICY "Admins can upload PDFs anywhere"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'attachments' AND
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')) AND 
    (lower(storage.extension(name)) = 'pdf')
  );

CREATE POLICY "Admins can update and delete files"
  ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'attachments' AND
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  );

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    admin_status BOOLEAN;
BEGIN 
    SELECT EXISTS (
        SELECT 1 FROM public.profiles as u 
        WHERE u.id = auth.uid() AND u.role = 'admin'
    ) INTO admin_status ;

    RETURN admin_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Staff can download resolved documents"
ON storage.objects
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'attachments'
  AND (storage.foldername(name))[1] = 'resolved'
);