
# Usa a imagem oficial do Node.js 24 baseada em Debian Slim.
# A imagem fornece o Node.js e o npm em um ambiente Linux.
FROM node:24-bookworm-slim

# Define a pasta de trabalho dentro do container.
WORKDIR /app

# Copia os manifestos de dependências primeiro.
# Assim, alterações no código não invalidam o cache da instalação.
COPY package.json package-lock.json ./

# Instala as dependências necessárias para produção.
RUN npm ci --omit=dev

# Copia o código do servidor.
COPY backend ./backend

# Copia os arquivos estáticos do frontend.
COPY frontend ./frontend

# Copia os dados utilizados pelo script opcional de carga inicial.
COPY linhas_onibus_sul_brasil.csv ./linhas_onibus_sul_brasil.csv

# Documenta a porta utilizada pelo servidor Express.
EXPOSE 3000

# Inicia a aplicação.
CMD ["npm", "start"]