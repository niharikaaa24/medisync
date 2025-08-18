package util;

import io.jsonwebtoken.security.Keys;
import java.util.Base64;
import io.jsonwebtoken.SignatureAlgorithm; // Import this

public class KeyGenerator {
    public static void main(String[] args) {

        byte[] keyBytes = Keys.secretKeyFor(SignatureAlgorithm.HS256).getEncoded();
        String base64Key = Base64.getEncoder().encodeToString(keyBytes);
        System.out.println("Generated JWT Secret Key (Base64 Encoded): " + base64Key);
        System.out.println("Key Length in bits: " + (keyBytes.length * 8));
    }
}