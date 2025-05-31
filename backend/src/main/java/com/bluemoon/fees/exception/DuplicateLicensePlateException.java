package com.bluemoon.fees.exception;

public class DuplicateLicensePlateException extends RuntimeException {
    public DuplicateLicensePlateException(String message) {
        super(message);
    }
    
    public DuplicateLicensePlateException(String message, Throwable cause) {
        super(message, cause);
    }
}
