import {Component, OnInit} from "@angular/core";
import {NavController, NavParams, Platform} from "ionic-angular";
import {OffersService} from "./OffersService";
import {OffersProductViewPage} from "../offers-product-view/offers-product-view";
import {OrderDetailsPage} from "../order-details/orderdetails";
import {Restaurant} from "../../model/Restaurant";
import {RestaurantViewPage} from "../restaurant-view/restaurant-view";
import {Observable} from "rxjs/Observable";
import {Http} from "@angular/http";
import {SERVER_URL} from "../../app/app.module";
import {CartService} from "../../services/CartService";
import {AuthService} from "../../providers/auth-service";
import {TranslateService} from "@ngx-translate/core";
import {LoadingService} from "../../providers/loading-service";


/**
 * Page for showing the offers of a specific restaurant in a list.
 * If the user clicks on an offer, she will get to the detail view of this offer.
 */
@Component({
    templateUrl: 'offers.html'
})
export class OffersPage implements OnInit {
    public restaurant: Restaurant;
    public offers: any;
    public categories;
    shownGroup = null;

    allergenics$: Observable<any>;
    additives$: Observable<any>;

    private errorFavorize;
    private errorDeFavorize;

    constructor(navParams: NavParams,
                public offerService: OffersService,
                private cartService: CartService,
                private navCtrl: NavController,
                private http: Http,
                public auth: AuthService,
                private platform: Platform,
                private loading: LoadingService,
                private translate: TranslateService) {
        translate.setDefaultLang('de');
        this.translate.get('Error.favorize').subscribe(
            (res: string) => {
                this.errorFavorize = res
            }
        )
        this.translate.get('Error.deFavorize').subscribe(
            (res: string) => {
                this.errorDeFavorize = res
            }
        )

        this.restaurant = navParams.get("restaurant");

        // disable animation, because it causes problems with displaying the map on iOS
        platform.ready().then(() => {
            platform.registerBackButtonAction(() => {
                this.navCtrl.pop({animate: false});
            })
        })
    }


    ngOnInit() {
        this.offerService.getOffers(this.restaurant.id).subscribe(
            offers => {
                this.offers = offers;
                this.categories = Object.keys(offers);
                this.shownGroup = this.categories[0] || null;
            },
            err => console.error(err)
        );

        this.allergenics$ = this.http.get(SERVER_URL + "/api/all_allergenic").map(res => res.json());
        this.additives$ = this.http.get(SERVER_URL + "/api/all_additives").map(res => res.json());
    }

    public onOfferClicked(event, offer) {
        this.navCtrl.push(OffersProductViewPage, {offer, restaurant: this.restaurant})
    }

    public onRestaurantClicked(event) {
        this.navCtrl.push(RestaurantViewPage, {restaurant: this.restaurant})
    }

    /**
     * Toggles the isFavorite status of the restaurant and also sends this to the server.
     */
    public toggleIsFavourite() {

        let loader = this.loading.prepareLoader();
        loader.present();
        // unset as favorite
        if (this.restaurant.isFavorite) {

            let options = this.auth.prepareHttpOptions("delete");
            this.http.delete(SERVER_URL + "/api/unregister_favorite/" + this.restaurant.id, options).subscribe(
                res => {
                    if (res.json() === 0) {
                        this.restaurant.isFavorite = false;
                        //dismiss loading spinner
                        loader.dismiss();


                    }
                    else throw new Error("Unknown return value from server: " + res.json())
                },
                err => {
                    alert(this.errorDeFavorize);
                    console.error(err);
                }
            )
        }
        // set as favorite
        else {
            let options = this.auth.prepareHttpOptions("put");
            this.http.put(SERVER_URL + "/api/register_favorite/" + this.restaurant.id, "", options).subscribe(
                res => {
                    if (res.json() === 0) {
                        this.restaurant.isFavorite = true;
                        //dismiss loading spinner
                        loader.dismiss();

                    }
                    else throw new Error("Unknown return value from server: " + res.json());
                },
                err => {
                    alert(this.errorFavorize);
                    console.error(err);
                })
        }
    }

    getCartItemCount() {
        return this.cartService.getCartItemCount(this.restaurant.id);
    }


    toggleDetails(data) {
        if (data.showDetails) {
            data.showDetails = false;
            data.icon = 'ios-add-circle-outline';
        } else {
            data.showDetails = true;
            data.icon = 'ios-remove-circle-outline';
        }
    }

    public toggleGroup(group) {
        if (this.isGroupShown(group)) {
            this.shownGroup = null;
        } else {
            this.shownGroup = group;
        }
    }

    isGroupShown(group) {
        return this.shownGroup === group;
    }

    public goToCheckout() {
        this.navCtrl.push(OrderDetailsPage, {
            restaurant: this.restaurant
        });
    }
}

