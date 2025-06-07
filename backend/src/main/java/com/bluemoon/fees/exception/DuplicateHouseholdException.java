package com.bluemoon.fees.exception;

public class DuplicateHouseholdException extends RuntimeException {
    public DuplicateHouseholdException(String message) {
        super(message);
    }
    
    public DuplicateHouseholdException(String message, Throwable cause) {
        super(message, cause);
    }
}
