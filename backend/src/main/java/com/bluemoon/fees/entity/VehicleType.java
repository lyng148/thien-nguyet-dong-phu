package com.bluemoon.fees.entity;

public enum VehicleType {
    XE_MAY("Xe máy"),
    OTO("Ô tô");
    
    private final String displayName;
    
    VehicleType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}
