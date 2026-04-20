FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_API_URL=http://localhost:5001
ARG VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
ARG VITE_OPENAI_API_KEY=your_openai_api_key_here

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
