package edu.hm.cs.projektstudium.findlunch.webapp.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonView;

import edu.hm.cs.projektstudium.findlunch.webapp.controller.view.OfferView;
import edu.hm.cs.projektstudium.findlunch.webapp.controller.view.RestaurantView;

/**
 * The Class CourseType.
 * @author Niklas Klotz
 *
 */
@Entity
@Table(name="course_types")
public class CourseTypes {

	/** The id. */
	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	@JsonView({OfferView.OfferRest.class})
	private int id;
	
	/** The course. */
	@Column(name="name")
	@JsonView({OfferView.OfferRest.class})
	private String name;
	
	@Column(name="restaurant_id")
	@JsonView({OfferView.OfferRest.class})
	private int restaurantId;
	
	@Column(name="sort_by")
	@JsonView({OfferView.OfferRest.class})
	private int sortBy;

	public CourseTypes(){
		
	}
	
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public int getRestaurantId() {
		return restaurantId;
	}

	public void setRestaurantId(int restaurantId) {
		this.restaurantId = restaurantId;
	}

	public int getSortBy() {
		return sortBy;
	}

	public void setSortBy(int sortBy) {
		this.sortBy = sortBy;
	}
	
}
