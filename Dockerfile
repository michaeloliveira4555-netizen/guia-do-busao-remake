# Usa a imagem oficial do Node.js 24 baseada em Debian Slim.
# A imagem fornece o Node.js e o npm em um ambiente Linux.
FROM node:24-bookworm-slim

# Define a pasta de trabalho dentro do container.
# Os próximos comandos serão executados a partir dela.
WORKDIR /app

# Copia os manifestos antes do restante do código.
# Isso permite aproveitar o cache do Docker quando somente os arquivos da aplicação forem alterados.
COPY package.json package-lock.json ./

# Copia o código do servidor.
COPY backend ./backend

# Copia os arquivos estáticos do frontend.
COPY frontend ./frontend

# Copia os dados usados pelo script opcional de carga inicial.
COPY linhas_onibus_sul_brasil.csv ./linhas_onibus_sul_brasil.csv

# Instala as versões registradas no package-lock.json.
# Dependências de desenvolvimento não são necessárias para executar a aplicação em produção.
RUN npm ci --omit=dev

# Copia apenas o código necessário para executar o servidor e entregar os arquivos do frontend.
COPY backend ./backend
COPY frontend ./frontend

# Documenta a porta utilizada pelo servidor Express.
# A publicação da porta será configurada no Compose.
EXPOSE 3000

# Inicia o servidor usando o script "start" do npm.
CMD ["npm", "start"]