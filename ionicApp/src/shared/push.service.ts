import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Push, PushObject, PushOptions, EventResponse} from "@ionic-native/push";
import {RequestMethod, Http, RequestOptions, Response} from "@angular/http";
import {SERVER_URL, APP_LANG, FCM_SENDER_ID} from "../app/app.module";
import {Alert, AlertController, Platform} from "ionic-angular";
import {AuthService} from "./auth.service";
import {Error} from "tslint/lib/error";
import {TranslateService} from "@ngx-translate/core";

/**
 * Initializing push and notification settings.
 * @author Sergej Bardin
 */
@Injectable()
export class PushService {

    private pushObject: PushObject;
    private strPushError: string;
    private strError: string;

    constructor(public push: Push,
                private alertCtrl: AlertController,
                private auth: AuthService,
                private http: Http,
                private translate: TranslateService,
                private platform: Platform) {
        this.translate.setDefaultLang(APP_LANG);
        this.translate.get('Error.pushReg').subscribe(
            (value: string) => {
                this.strPushError = value;
            },
            (err: Error) => {
                console.error("Error: translate.get did fail for key Error.pushReg.", err);
            }
        );
        this.translate.get('Error.general').subscribe(
            (value: string) => {
                this.strError = value;
            },
            (err: Error) => {
                console.error("Error: translate.get did fail for key Error.general.", err);
            }
        );
        this.platform.ready().then(
            () => {
                const pushOptions: PushOptions = {
                    android: {
                        senderID: FCM_SENDER_ID,
                        vibrate: true
                    },
                    ios: {
                        alert: 'false',
                        badge: true,
                        sound: 'false'
                    }
                };
                this.pushObject = this.push.init(pushOptions);
                this.notificationSetup();
            },
            (err: Error) => {
                console.error("Platform did not become ready!", err);
                const alert: Alert = this.alertCtrl.create({
                    title: this.strError,
                    message: this.strPushError,
                    buttons: [{
                        text: 'Ok',
                        role: 'cancel'
                    }]
                });
                alert.present();
            });
    }

    /**
     *  Setup of the display settings of the push notification
     */
    public notificationSetup(): void {
        //noinspection TsLint
        this.push.hasPermission()
            .then((data: any) => {
                if (data.isEnabled) {
                    console.warn('Push permission granted');
                    this.pushObject.on('notification')
                        .subscribe((notification: EventResponse) => {
                            // Foreground handling
                            if (notification.additionalData.foreground) {
                                const alert: Alert = this.alertCtrl.create({
                                    title: notification.title,
                                    message: notification.message,
                                    buttons: [{
                                        text: 'Ok',
                                        role: 'cancel'
                                    }],
                                    enableBackdropDismiss: false
                                });
                                alert.present();

                                // dismiss after 10 seconds
                                setTimeout(
                                    () => {
                                        alert.dismiss();
                                    },
                                    10000);
                            }
                            // If background then display as typical notification
                        });

                } else {
                    console.warn("Not logged in or push permission NOT granted, reservation confirmation can not received!");
                }
            });
    }

    /**
     * Register push token at backend, when user is logged in
     */
    public pushSetup(): void {
        const pushOptions: PushOptions = {
            android: {
                senderID: FCM_SENDER_ID,
                vibrate: true
            },
            ios: {
                alert: 'false',
                badge: true,
                sound: 'false'
            }
        };
        this.pushObject = this.push.init(pushOptions);

        //noinspection TsLint - data format
        this.push.hasPermission()
            .then((data: any) => {
                if (this.auth.getLoggedIn() && data.isEnabled) {
                    //prepare RequestOptions
                    const options: RequestOptions = this.auth.prepareHttpOptions(RequestMethod.Put);

                    this.pushObject.on('registration')
                        .subscribe((registration: EventResponse) => {
                            this.http.get(`${SERVER_URL}/api/submitToken/${registration.registrationId}`, options)
                                .retry(2)
                                .subscribe(
                                    (res: Response) => {
                                        console.warn("Device registered at firebase and backend");
                                        this.notificationSetup();
                                    },
                                    (err: Error) => {
                                        console.error(err);
                                        const alert: Alert = this.alertCtrl.create({
                                            title: this.strError,
                                            message: this.strPushError,
                                            buttons: [{
                                                text: 'Ok',
                                                role: 'cancel'
                                            }]
                                        });
                                        alert.present();
                                    }
                                );
                        });
                    this.pushObject.on('error').subscribe((error: Error) => console.error("Error with receiving push from firebase", error));
                } else {
                    console.warn("Push permission NOT granted, reservation confirmation can not received!");
                }
            });
    }
}
