FROM gradle:7.6.1-jdk17 AS build
WORKDIR /app
COPY . .
RUN gradle build --no-daemon -x test
RUN find /app/build/libs/ -name "*.jar" -exec cp {} /app/app.jar \;

FROM openjdk:17-slim
WORKDIR /app
COPY --from=build /app/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"] 