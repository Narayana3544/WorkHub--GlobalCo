package com.workhub.auth;

import com.workhub.auth.dto.AuthResponse;
import com.workhub.auth.dto.LoginRequest;
import com.workhub.auth.dto.RegisterRequest;
import com.workhub.organization.Organization;
import com.workhub.organization.OrganizationRepository;
import com.workhub.security.JwtTokenProvider;
import com.workhub.user.User;
import com.workhub.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final long accessTokenExpiryMs;

    public AuthService(UserRepository userRepository,
                       OrganizationRepository organizationRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       @Value("${workhub.jwt.access-token-expiry-ms}") long accessTokenExpiryMs) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.accessTokenExpiryMs = accessTokenExpiryMs;
    }

    /**
     * Register a new user. First user in an org gets ADMIN role.
     * Creates the organization if it doesn't exist.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Create or find organization
        String slug = request.getOrganizationName().toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");

        Organization org = organizationRepository.findBySlug(slug)
                .orElseGet(() -> {
                    Organization newOrg = new Organization();
                    newOrg.setName(request.getOrganizationName());
                    newOrg.setSlug(slug);
                    return organizationRepository.save(newOrg);
                });

        // First user in the org becomes ADMIN
        boolean isFirstUser = userRepository.countByOrgId(org.getId()) == 0;

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(isFirstUser ? "ADMIN" : "EMPLOYEE");
        user.setStatus("ACTIVE");
        user.setOrgId(org.getId());
        user = userRepository.save(user);

        return generateTokenResponse(user);
    }

    /**
     * Login with email and password.
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new BadCredentialsException("Account is inactive");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        return generateTokenResponse(user);
    }

    /**
     * Exchange a valid refresh token for a new access + refresh token pair.
     * Implements token rotation: old refresh token is deleted, new one is created.
     */
    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        String hashedToken = hashToken(rawRefreshToken);

        RefreshToken storedToken = refreshTokenRepository.findByHashedToken(hashedToken)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (storedToken.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(storedToken);
            throw new BadCredentialsException("Refresh token expired");
        }

        // Delete old refresh token (rotation)
        refreshTokenRepository.delete(storedToken);

        User user = userRepository.findById(storedToken.getUserId())
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new BadCredentialsException("Account is inactive");
        }

        return generateTokenResponse(user);
    }

    /**
     * Logout: delete all refresh tokens for the user.
     */
    @Transactional
    public void logout(String userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    private AuthResponse generateTokenResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getRole(), user.getOrgId());
        String rawRefreshToken = UUID.randomUUID().toString();

        // Store hashed refresh token in DB
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setHashedToken(hashToken(rawRefreshToken));
        refreshToken.setUserId(user.getId());
        refreshToken.setExpiresAt(Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenExpiryMs()));
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .tokenType("Bearer")
                .expiresIn(accessTokenExpiryMs / 1000)
                .userId(user.getId())
                .role(user.getRole())
                .orgId(user.getOrgId())
                .build();
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
