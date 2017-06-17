import {Component, ViewChild} from "@angular/core";
import {Events, Nav, Platform} from "ionic-angular";
import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";
import {SERVER_URL} from "../app/app.module";
import {Headers, Http, RequestOptions, RequestMethod} from "@angular/http";
import {AuthService} from "../providers/auth-service";
import {MenuService} from "../providers/menu-service";
import {ToastController, AlertController} from "ionic-angular";
import {Push, PushObject, PushOptions} from '@ionic-native/push';

import {HomePage} from '../pages/home/home';
import {RestaurantsPage} from '../pages/restaurants/restaurants';
import {ListPage} from '../pages/list/list';


declare var FCMPlugin;
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = RestaurantsPage;

  pages: Array<{ title: string, component: any }>;

  constructor(public platform: Platform,
              public statusBar: StatusBar,
              private http: Http,
              public splashScreen: SplashScreen,
              private events: Events,
              private auth: AuthService,
              public menu: MenuService,
              private toastCtrl: ToastController,
              public push: Push,
              public alertCtrl: AlertController) {

    this.auth.verifyUser();

    this.pushsetup();

    //Listener, der bei "pausieren und wieder öffnen" der App loggedIn Status am Server verifiziert
    document.addEventListener('resume', () => {
      this.auth.verifyUser();
    })

  }

  pushsetup() {
    const options: PushOptions = {
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

    const pushObject: PushObject = this.push.init(options);

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
        //console.log("Notification", notification);
      });

    pushObject.on('registration')
      .subscribe((registration: any) => {
        console.log("Registration Firebase Token", registration.registrationId);
        this.http.get(`${SERVER_URL}/api/submitToken/${registration.registrationId}`, options)
          .subscribe(
            res => console.log(res),
            err => console.error(err)
          )
      });

    pushObject.on('error').subscribe(error => console.log('Error with Push plugin' + error));
  }


  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  public logout() {
    this.auth.logout();
    const toast = this.toastCtrl.create({
      message: "Logout erfolgt",
      duration: 3000
    });
    toast.present();
  }

  onMenuClosed() {
    this.events.publish("menu", "close");
  }

  onMenuOpened() {
    this.events.publish("menu", "open");
  }
}
