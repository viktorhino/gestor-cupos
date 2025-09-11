-- Actualizar plantilla de mensaje "recibido" con mejoras
-- Cambiar terminacion_tamaño_tintas por características
-- Mejorar formato de imagen y terminaciones especiales

UPDATE message_templates 
SET template_content = 'Hola {{tratamiento}}, cordial saludo. Recibimos su trabajo {{nombre_trabajo}} para producir con las siguientes especificaciones: 
- {{tipo_trabajo}} {{caracteristicas}}
- {{millares}}
- {{terminaciones_especiales}}
- {{observaciones}}{{imagen_trabajo}}

A través de este medio le estaremos informando los avances que vayamos teniendo con su trabajo. Gracias por confiar en nosotros'
WHERE name = 'recibido';

-- Verificar que se actualizó correctamente
SELECT name, template_content 
FROM message_templates 
WHERE name = 'recibido';


