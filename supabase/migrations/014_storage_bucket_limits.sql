-- Enforce file size + MIME limits at bucket level (blocks direct Storage API bypass)
UPDATE storage.buckets
SET
  file_size_limit = 10485760,  -- 10MB
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/acad',
    'application/x-autocad',
    'image/vnd.dwg',
    'image/x-dwg',
    'application/dxf',
    'image/vnd.dxf',
    'application/step',
    'application/vnd.ms-pki.stl',
    'application/iges',
    'model/iges',
    'model/step',
    'image/jpeg',
    'image/png',
    'application/octet-stream'
  ]
WHERE id = 'quote-attachments';

UPDATE storage.buckets
SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream'
  ]
WHERE id = 'resumes';

UPDATE storage.buckets
SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml'
  ]
WHERE id IN ('product-images','notice-images');
