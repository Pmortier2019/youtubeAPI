FROM eclipse-temurin:21-jre
WORKDIR /app
COPY target/soundtracker-0.0.1.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
