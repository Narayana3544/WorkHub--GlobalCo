package com.workhub.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT token provider using jjwt.
 * Generates access tokens with claims: sub (userId), role, org (orgId), aud, iat, exp.
 * Validates audience claim explicitly.
 */
@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final SecretKey key;
    private final long accessTokenExpiryMs;
    private final long refreshTokenExpiryMs;
    private final String audience;

    public JwtTokenProvider(
            @Value("${workhub.jwt.secret}") String secret,
            @Value("${workhub.jwt.access-token-expiry-ms}") long accessTokenExpiryMs,
            @Value("${workhub.jwt.refresh-token-expiry-ms}") long refreshTokenExpiryMs,
            @Value("${workhub.jwt.audience}") String audience) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiryMs = accessTokenExpiryMs;
        this.refreshTokenExpiryMs = refreshTokenExpiryMs;
        this.audience = audience;
    }

    /**
     * Generate an access token with all required claims.
     */
    public String generateAccessToken(String userId, String role, String orgId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenExpiryMs);

        return Jwts.builder()
                .subject(userId)
                .audience().add(audience).and()
                .claim("role", role)
                .claim("org", orgId)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    /**
     * Validate the token: signature, expiration, and audience claim.
     */
    public boolean validateToken(String token) {
        try {
            Claims claims = parseClaimsFromToken(token);
            // Explicit audience validation
            if (claims.getAudience() == null || !claims.getAudience().contains(audience)) {
                log.warn("JWT audience mismatch. Expected: {}, Got: {}", audience, claims.getAudience());
                return false;
            }
            return true;
        } catch (ExpiredJwtException ex) {
            log.warn("JWT token expired: {}", ex.getMessage());
        } catch (JwtException ex) {
            log.warn("Invalid JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.warn("JWT claims string is empty: {}", ex.getMessage());
        }
        return false;
    }

    public String getUserIdFromToken(String token) {
        return parseClaimsFromToken(token).getSubject();
    }

    public String getRoleFromToken(String token) {
        return parseClaimsFromToken(token).get("role", String.class);
    }

    public String getOrgIdFromToken(String token) {
        return parseClaimsFromToken(token).get("org", String.class);
    }

    public long getRefreshTokenExpiryMs() {
        return refreshTokenExpiryMs;
    }

    private Claims parseClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
