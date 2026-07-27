package com.workhub.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String secret = "workhub-dev-secret-key-that-is-at-least-256-bits-long-for-hs256-signing";
    private final String audience = "workhub-client";

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(secret, 900000L, 604800000L, audience);
    }

    @Test
    @DisplayName("Generate access token and validate valid claims")
    void testGenerateAndValidateAccessToken() {
        String token = jwtTokenProvider.generateAccessToken("user-123", "EMPLOYEE", "org-456");

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("user-123", jwtTokenProvider.getUserIdFromToken(token));
        assertEquals("EMPLOYEE", jwtTokenProvider.getRoleFromToken(token));
        assertEquals("org-456", jwtTokenProvider.getOrgIdFromToken(token));
    }

    @Test
    @DisplayName("Reject token with wrong audience")
    void testAudienceMismatch() {
        // Create token provider with different audience
        JwtTokenProvider wrongAudProvider = new JwtTokenProvider(secret, 900000L, 604800000L, "wrong-client");

        String tokenWithWrongAud = wrongAudProvider.generateAccessToken("user-123", "EMPLOYEE", "org-456");

        // Validate using standard provider (expecting 'workhub-client')
        assertFalse(jwtTokenProvider.validateToken(tokenWithWrongAud));
        String reason = jwtTokenProvider.getValidationFailureReason(tokenWithWrongAud);
        assertTrue(reason.contains("audience mismatch"));
    }

    @Test
    @DisplayName("Reject tampered signature")
    void testTamperedSignature() {
        String token = jwtTokenProvider.generateAccessToken("user-123", "EMPLOYEE", "org-456");
        String tamperedToken = token.substring(0, token.length() - 5) + "abcde";

        assertFalse(jwtTokenProvider.validateToken(tamperedToken));
        String reason = jwtTokenProvider.getValidationFailureReason(tamperedToken);
        assertEquals("Invalid token signature", reason);
    }
}
