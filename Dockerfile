FROM ruby:3.2

WORKDIR /app
COPY . .

RUN apt-get update && apt-get install -y bubblewrap

RUN bundle install
COPY . .

CMD ["make", "prod"]
