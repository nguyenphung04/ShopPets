package com.pvn.dacn.dto;

public class AddToCartDTO {
    private String petId;
    private int quantity;


    public String getPetId() { return petId; }
    public void setPetId(String petId) { this.petId = petId; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}