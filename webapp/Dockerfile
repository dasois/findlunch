FROM java:8
LABEL maintainer=“david.sautter@web.de”
VOLUME /tmp
EXPOSE 8443
ADD target/findLunch-webapp-prod.jar findLunch-webapp-prod.jar  
ENTRYPOINT ["java","-jar","findLunch-webapp-prod.jar"]