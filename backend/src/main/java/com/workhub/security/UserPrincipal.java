package com.workhub.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Custom UserDetails implementation carrying userId, role, and orgId
 * through the Spring Security context.
 */
@Getter
public class UserPrincipal implements UserDetails {

    private final String userId;
    private final String email;
    private final String password;
    private final String role;
    private final String orgId;
    private final boolean active;

    public UserPrincipal(String userId, String email, String password,
                         String role, String orgId, boolean active) {
        this.userId = userId;
        this.email = email;
        this.password = password;
        this.role = role;
        this.orgId = orgId;
        this.active = active;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
