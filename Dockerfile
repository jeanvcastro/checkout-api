# Stage 1: Build Stage
FROM node:18-alpine as builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY tsconfig.json tsconfig.build.json .env ./
COPY src/ src/
RUN yarn build

RUN rm -rf node_modules \
    && yarn install --production --frozen-lockfile

# Stage 2: Run Stage
FROM node:18-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache \
    dumb-init \
    fontconfig \
    freetype \
    ttf-dejavu \
    ttf-droid \
    ttf-freefont \
    ttf-liberation \
    weasyprint

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/.env ./
COPY --from=builder /usr/src/app/dist/ ./

ENV NODE_ENV production
ENV APP_ENV production

EXPOSE 3333
# ENTRYPOINT ["dumb-init", "node", "infra/http/app.js"]
CMD ["sh"]
