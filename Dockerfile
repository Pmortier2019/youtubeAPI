FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
COPY frontend ./frontend
RUN apt-get update && apt-get install -y maven && \
    mvn package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/soundtracker-0.0.1.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
