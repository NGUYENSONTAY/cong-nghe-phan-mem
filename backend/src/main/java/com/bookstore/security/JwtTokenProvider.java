package com.bookstore.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpirationInMs;

    private SecretKey getSigningKey() {
        try {
            // Temporarily use hardcoded key for testing
            String hardcodedKey = "CHSjD4eKd67qgzVm2fHENZyi3zG4k+KC/2NQO6jD9s3FN8XtZ4Ej6qlyyDG74NyXT1Bc9UYr4wnpa+vgqZ3+oA==";
            byte[] keyBytes = Base64.getDecoder().decode(hardcodedKey);
            SecretKey key = Keys.hmacShaKeyFor(keyBytes);
            
            logger.info("Using hardcoded JWT Secret Key for testing");
            logger.info("Key length: {} bits", keyBytes.length * 8);
            
            return key;
        } catch (IllegalArgumentException e) {
            logger.error("Invalid Base64 key, generating new one: {}", e.getMessage());
            // Fallback to generating a new key
            SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS512);
            String encodedKey = Base64.getEncoder().encodeToString(key.getEncoded());
            logger.error("Generated new JWT Secret Key (Base64): {}", encodedKey);
            logger.error("Please update application.properties with this key");
            return key;
        }
    }

    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        Date expiryDate = new Date(System.currentTimeMillis() + jwtExpirationInMs);

        return Jwts.builder()
                .setSubject(Long.toString(userPrincipal.getId()))
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public Long getUserIdFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return Long.parseLong(claims.getSubject());
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (SecurityException ex) {
            logger.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty.");
        }
        return false;
    }
} 