package com.dgi.app.security.services;

import com.dgi.app.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private Long id;

    private String username;

    private String email;

    @JsonIgnore
    private String password;

    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Long id, String username, String email, String password,
            Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(User user) {
        // Add debugging here to see the role
        System.out.println(
                "DEBUG: Building UserDetailsImpl for user: " + user.getUsername() + " with role: " + user.getRole());

        // Create authorities with both formats - one with ROLE_ prefix and one without
        // This ensures both formats work in authorization checks
        SimpleGrantedAuthority roleWithPrefix = new SimpleGrantedAuthority(user.getRole().name());
        SimpleGrantedAuthority roleWithoutPrefix = new SimpleGrantedAuthority(
                user.getRole().name().replace("ROLE_", ""));

        // Create a list with both authority formats
        List<GrantedAuthority> authorities = List.of(roleWithPrefix, roleWithoutPrefix);

        // Log the exact authority strings being created
        System.out.println("DEBUG: User " + user.getUsername() + " has the following authorities:");
        authorities.forEach(auth -> System.out.println("DEBUG: Authority: " + auth.getAuthority()));

        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }
}