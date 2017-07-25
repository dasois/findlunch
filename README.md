# FindLunch
This client server based application allows restaurants to register offers (e.g. for lunch) and helps customer to find these via their smartphone (based on their location).

## Webapp
The web application is based on several technologies:
  * Spring Boot
  * Spring Data JPA with Hibernate
  * Spring MVC
  * Thymeleaf Template Engine
  * Bootstrap
  * iText PDF
  
### Import into eclipse

In order to import the project into Eclipse, please follow these steps:

1. Open Eclipse
2. Right click on your project explorer and select "Import" --> "Import"
3. In the following menu select "Maven" --> "Existing Maven Projects"
4. Select the extracted "webapp" folder and click "Finish"

### Configure application

Before you can start the application please set up the MariaDB database with the database schema.
Afterwards, please open the "application.properties" file within eclispe (found under src/main/resources) and edit the database and tomcat configuration to match your environment.

### Run application

To start the application, right click on the "App" class found within the base package and select "Run as" --> "Java Application"

### profiles
The Webapp give the possibility to create a jar File depend on a given profile ("prod" or "testinstance"). Therefore navigate to "Run as" and select "Maven build..". Afterwards insert as goal "package" and the chosen profile ("prod" or "testinstance") then click the "Run" button.

## Ionic hybrid App (Android and iOS App)
The Ionic hybrid application is based on following technologies:
 * Ionic 3
 * Cordova v7
 * Google Play services Maps
 * Google Play services Places
 * Firebase Cloud Messaging

### Start App
Installing dependencies and prepare plugins:
```bash
    ionic cordova prepare
```

For running the application in an iOS/Android emulator make sure you have installed one!
##### iOS
 ```bash
     ionic cordova run ios --emulator
 ```
##### Android
 ```bash
      ionic cordova run android --emulator
  ```

To start the application on a device use '--device' instead of '--emulator'. More information at 
http://ionicframework.com/docs/intro/deploying/

## Android App
The Android application is based on the following technologies:
  * Spring for Android
  * Jackson
  * Google Play services Maps
  * Google Play services GCM
  * Google Maps Android API utility library
  * ZXing Android Embedded
  
### Import into Android Studio

In order to import the project into Android Studio, please follow these steps:

1. Open Android Studio
2. Navigate to "File" and select "Open...".
3. In the following menu select the extracted "FindLunchApp" folder and click "Ok"

### Clean Project

Before you start the application, please consider to clean the project to avoid issues. To do this, you have to navigate to "Build" and select "Clean Project". 

### Run application

To start the application, navigate to "Run" and select "run 'App'". 

### Using a custom Webapp

The Android app gives the ability to define host, port and protocol for the connection with the findlunch Webapp in a configuration file named "connection.txt", 
that is located on the external storage of your Android device. The file must contain the following information:

	host=findlunch.biz.tm
	port=8444
	https=true
	
### Pushnotification
See README in branch feature_pushNotification.