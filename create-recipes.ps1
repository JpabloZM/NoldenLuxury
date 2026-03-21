$body1 = @{
    product_id = "f6597d39-e02b-48d9-8637-77cd185cafca"
    material_id = "aafac60f-ba5f-4212-8173-d0f2c4c23a07"
    quantity_needed = 30
} | ConvertTo-Json

$body2 = @{
    product_id = "f6597d39-e02b-48d9-8637-77cd185cafca"
    material_id = "e811afcc-6476-4556-9ae6-61332e48c71f"
    quantity_needed = 12
} | ConvertTo-Json

Write-Host "Creating recipe 1: Hilo negro (30 cm)..."
Invoke-WebRequest -Uri "http://localhost:3000/api/product-recipes/create" -Method POST -Body $body1 -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content

Write-Host "`nCreating recipe 2: Balines (12 piezas)..."
Invoke-WebRequest -Uri "http://localhost:3000/api/product-recipes/create" -Method POST -Body $body2 -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content

Write-Host "`nRecetas creadas exitosamente"
