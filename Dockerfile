FROM node:18.20.8-alpine as builder

WORKDIR /quillsocial


COPY package.json yarn.lock .yarnrc.yml turbo.json git-init.sh git-setup.sh ./
COPY apps/web ./apps/web
COPY packages ./packages
COPY .yarn ./.yarn


ARG MAX_OLD_SPACE_SIZE=4096
ARG NODE_ENV

ENV NODE_ENV=${NODE_ENV} \
    NODE_OPTIONS=--max-old-space-size=${MAX_OLD_SPACE_SIZE}

RUN yarn set version 3.4.1


RUN yarn config set httpTimeout 1200000 
RUN yarn install

RUN yarn turbo run build --filter=@quillsocial/web


FROM node:18.20.8-alpine as builder-two

WORKDIR /quillsocial
ARG NEXT_PUBLIC_WEBAPP_URL=https://app.quillai.social

ENV NODE_ENV production

RUN yarn set version 3.4.1

COPY package.json .yarnrc.yml turbo.json ./
COPY .yarn ./.yarn
COPY --from=builder /quillsocial/yarn.lock ./yarn.lock

COPY --from=builder /quillsocial/node_modules ./node_modules
COPY --from=builder /quillsocial/packages ./packages
COPY --from=builder /quillsocial/apps/web ./apps/web
COPY --from=builder /quillsocial/packages/prisma/schema.prisma ./prisma/schema.prisma
COPY scripts scripts

# Save value used during this build stage. If NEXT_PUBLIC_WEBAPP_URL and BUILT_NEXT_PUBLIC_WEBAPP_URL differ at
# run-time, then start.sh will find/replace static values again.
ENV NEXT_PUBLIC_WEBAPP_URL=$NEXT_PUBLIC_WEBAPP_URL \
    BUILT_NEXT_PUBLIC_WEBAPP_URL=$NEXT_PUBLIC_WEBAPP_URL

# RUN scripts/replace-placeholder.sh http://NEXT_PUBLIC_WEBAPP_URL_PLACEHOLDER ${NEXT_PUBLIC_WEBAPP_URL}

FROM node:18.20.8-alpine as runner

WORKDIR /quillsocial
RUN yarn set version 3.4.1

COPY --from=builder-two /quillsocial ./

ARG NEXT_PUBLIC_WEBAPP_URL=https://app.quillai.social
ENV NEXT_PUBLIC_WEBAPP_URL=$NEXT_PUBLIC_WEBAPP_URL \
    BUILT_NEXT_PUBLIC_WEBAPP_URL=$NEXT_PUBLIC_WEBAPP_URL

ENV NODE_ENV production
EXPOSE 3000

CMD yarn start
