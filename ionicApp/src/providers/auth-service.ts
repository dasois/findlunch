import {Injectable} from "@angular/core";
import {Headers, Http, RequestOptions, RequestMethod} from "@angular/http";
import {SERVER_URL} from "../app/app.module";
import {Push, PushObject, PushOptions} from '@ionic-native/push';
import {AlertController} from "ionic-angular";




@Injectable()
export class AuthService {
      private loggedIn: boolean;
      private userName: string;

  constructor(  private http: Http,
                public push: Push,
                public alertCtrl: AlertController
) {

  }
  //TODO : für Doku, Push token erwähnen
  public login(username: string, password: string) {
    let encodedCredentials: string = btoa(username + ":" + password);
    let headers = new Headers({
      'Content-Type': 'application/json',
      "Authorization": "Basic " + encodedCredentials
    });

    let options = new RequestOptions({headers: headers});
    return new Promise(resolve => {
      this.http.get(SERVER_URL + "/api/login_user", options).subscribe(
        (res) => {
          window.localStorage.setItem("username", username);
          window.localStorage.setItem(username, encodedCredentials);
          this.userName = window.localStorage.getItem("username");
          this.loggedIn = true;
          this.pushSetup();
          resolve(true);
        }, (err) => {
          resolve(err.body);


        })
    })
  }


  /**
   * Registriert User und Loggt user direkt ein
   * @param userName
   * @param password
   * @returns {Promise<T>}
   */

public register(username: string, password: string) {
  let user = { username : username,
               password : password
  }


  let headers = new Headers({
    'Content-Type': 'application/json',
  });
  let options = new RequestOptions({ headers: headers });

  return new Promise( (resolve, reject) => {
    this.http.post(SERVER_URL+"/api/register_user", user , options).subscribe(
      (res) => {
        //Bei erfolgreicher Registrierung direkt Login
        this.login(username, password);
        resolve(true);
      }, (err) => {
        reject(err._body);

      })
  })
}


  public verifyUser() {
    //zuletzt eingeloggter user
    if(window.localStorage.getItem("username")!== null){

      let currentUser = window.localStorage.getItem("username");
      let headers = new Headers({
        'Content-Type': 'application/json',
        //token zum zuletzt eingeloggten user, gespeichert als value zum key der Variable currentuser
        "Authorization": "Basic " + window.localStorage.getItem(currentUser)
      });

      let options = new RequestOptions({headers: headers});
      return new Promise((resolve) => {
        this.http.get(SERVER_URL + "/api/login_user", options).subscribe(
          (res) => {
            this.loggedIn = true;
          }, (err) => {
            this.logout();
          })
      })
    }
  }

  public getLoggedIn(){
    return this.loggedIn;
  }

  public getUserName(){
    return this.userName;
  }

  public logout(){
    let currentUser = window.localStorage.getItem("username");
    //lösche key-value paar gespeichert unter dem zuletzt eingeloggten namen bzw Variable currentUser
    window.localStorage.removeItem(currentUser);
    //lösche den zuletzt eingeloggten usernamen gesetzt unter dem key-String "username"
    window.localStorage.removeItem("username");
    this.loggedIn = false;
    this.userName = "";
  }

    /**
     * Sets the firebase push configuration up.
     * Register the device token at the backend.
     * If the device receives a push message,
     * it will be displayed as a notification.
     */
    pushSetup() {
        let user = window.localStorage.getItem("username");
        let token = window.localStorage.getItem(user);
        let headers = new Headers({
            'Content-Type': 'application/json',
            "Authorization": "Basic " +token
        });

        let options = new RequestOptions({
            headers: headers,
            method: RequestMethod.Put
        });

        const pushOptions: PushOptions = {
            android: {
                senderID: '343682752512',
                icon: '',
                vibrate: true
            },
            ios: {
                alert: 'false',
                badge: true,
                sound: 'false'
            },
            windows: {}
        };

        const pushObject: PushObject = this.push.init(pushOptions);

        pushObject.on('notification')
            .subscribe((notification: any) => {

                // Foreground handling
                if (notification.additionalData.foreground) {
                    let youralert = this.alertCtrl.create({
                        title: notification.title,
                        message: notification.message,
                        buttons: [{
                            text: 'Okay',
                            role: 'cancel'
                        }],
                    });
                    youralert.present();
                }
            });

        pushObject.on('registration')
            .subscribe((registration: any) => {
                this.http.get(`${SERVER_URL}/api/submitToken/${registration.registrationId}`, options)
                    .subscribe(
                        res => res,
                        err => console.error(err)
                    )
            });

        pushObject.on('error').subscribe(error => console.log('Error with Push plugin' + error));
    }
}
