FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Build frontend + backend
COPY src ./src
COPY frontend ./frontend
RUN mvn package -DskipTests -q

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/soundtracker-0.0.1.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
