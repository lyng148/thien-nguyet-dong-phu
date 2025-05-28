@echo off

REM Build and run the backend
cd backend && mvn clean package && java -jar target/fees-0.0.1-SNAPSHOT.jar
