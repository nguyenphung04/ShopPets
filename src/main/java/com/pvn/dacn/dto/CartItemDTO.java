package com.pvn.dacn.dto;

public class CartItemDTO {
    private String id;
    private String petId;
    private String petName;
    private String petImage;
    private double price;
    private int quantity;
    private double subTotal;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getPetId() { return petId; }
    public void setPetId(String petId) { this.petId = petId; }
    public String getPetName() { return petName; }
    public void setPetName(String petName) { this.petName = petName; }
    public String getPetImage() { return petImage; }
    public void setPetImage(String petImage) { this.petImage = petImage; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public double getSubTotal() { return subTotal; }
    public void setSubTotal(double subTotal) { this.subTotal = subTotal; }
}