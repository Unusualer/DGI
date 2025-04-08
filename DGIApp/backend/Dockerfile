FROM gradle:7.6.1-jdk17 AS build
WORKDIR /app
COPY . .
RUN gradle build --no-daemon -x test

FROM openjdk:17-slim
WORKDIR /app
# Install font dependencies for Apache POI
RUN apt-get update && apt-get install -y --no-install-recommends \
    libfreetype6 \
    fontconfig \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"] 