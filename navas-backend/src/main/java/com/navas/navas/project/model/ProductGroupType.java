package com.navas.navas.project.model;

public enum ProductGroupType {
    SINGLE("single"),
    SAME_PRICE("same-price"),
    DIFFERENT_PRICE("different-price");

    private final String value;

    ProductGroupType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }
}
