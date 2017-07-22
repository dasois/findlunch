import {Component} from "@angular/core";
import {NavController, NavParams, ToastController} from "ionic-angular";
import {Headers, Http, RequestMethod, RequestOptions} from "@angular/http";
import {HomePage} from "../home/home";
import {RegistryPage} from "../registry/registry";
import {AuthService} from "../../providers/auth-service";
import {SERVER_URL} from "../../app/app.module";
import {LoadingService} from "../../providers/loading-service";
import {OrderDetailsPage} from "../order-details/orderdetails";
import {Restaurant} from "../../model/Restaurant";
import {PushService} from "../../providers/push-service";
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'login-page',
    templateUrl: 'login.html'

})
export class LoginPage {

    popThisPage: boolean;
    private counterPasswordWrong: number = 0;
    private restaurant: Restaurant;
    private loginError;
    private loginSuccessful;

    constructor(private navCtrl: NavController,
                private toastCtrl: ToastController,
                private auth: AuthService,
                private http: Http,
                private navParams: NavParams,
                private loading: LoadingService,
                private push: PushService,
                private translate: TranslateService) {
        translate.setDefaultLang('de');
        this.popThisPage = navParams.get("comeBack");
        this.restaurant = null;
        this.translate.get('LoginPage.loginError').subscribe(
            (res: string) => { this.loginError = res }
        )
        this.translate.get('LoginPage.loginSuccessful').subscribe(
            key => { this.loginSuccessful = key }
        )
    }


    public login(userName: string, password: string) {
        this.counterPasswordWrong++;
        let loader = this.loading.prepareLoader();
        loader.present().then(res => {

            this.auth.login(userName, password).then(data => {
                if (data) {
                    const toast = this.toastCtrl.create({
                        message: this.loginSuccessful,
                        duration: 3000
                    });
                    toast.present();

                    this.push.pushSetup();

                    if (this.popThisPage) {
                        this.restaurant = this.navParams.get("restaurant");
                        this.navCtrl.push(OrderDetailsPage, {
                            restaurant: this.restaurant
                        });
                        loader.dismiss();

                    } else {
                        this.navCtrl.setRoot(HomePage);
                        loader.dismiss();
                    }
                } else {
                    loader.dismiss();
                    alert(this.loginError);
                }
            })
        })

    }

    public goToRegisterPage() {
        this.navCtrl.push(RegistryPage);
    }

    /**
     * Checks the input username
     * @param username = email adress of user
     */
    public isEmptyUser(username) {
        if (username && this.counterPasswordWrong >= 1) {
            return false;
        }
        return true;
    };

        /**
         * Requesting a password reset by the backend
         * @param username = email adress of user
         */
    public sendPasswordReset(username)
        {
            let headers = new Headers({
                'Content-Type': 'application/json'
            });

            let user = {
                username: username
            };

            let options = new RequestOptions({
                headers: headers,
                method: RequestMethod.Post,
                body: JSON.stringify(user)
            });

            this.http.get(`${SERVER_URL}/api/get_reset_token`, options)
                .subscribe(
                    (res) => {
                        let msg;
                        switch (res.json()) {
                            case 0:
                                msg = "Eine E-Mail mit der Passwortwiederherstellung wurde an Sie gesandt!"
                                break;
                            default:
                                msg = "Verbindungsfehler!"
                                break;
                        }
                        const toast = this.toastCtrl.create({
                            message: msg,
                            duration: 3000
                        });
                        toast.present();
                    }, (err) => {
                        console.error(err)
                    }
                )
        }

    }
