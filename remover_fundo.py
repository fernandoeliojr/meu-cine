from rembg import remove
from PIL import Image
import os

input_path = 'public/img/logo.jpg'
output_path = 'public/img/logo-sem-fundo.png'

if os.path.exists(input_path):
    print("Removendo fundo...")
    input_image = Image.open(input_path)
    output_image = remove(input_image)
    output_image.save(output_path)
    print(f"Sucesso! A imagem foi salva em: {output_path}")
else:
    print(f"Erro: Arquivo não encontrado em {input_path}")
