package com.medisync.medisync.entity;

import com.medisync.medisync.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Optional;

public class CustomUserDetails implements UserDetails {

    private String id;
    private String username;
    private String password;
    private Collection<? extends GrantedAuthority> authorities;


    public CustomUserDetails(User user, Collection<? extends GrantedAuthority> authorities) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.password = user.getPassword();
        this.authorities = authorities;
    }

    public CustomUserDetails(Optional<User> userOptional, Collection<? extends GrantedAuthority> authorities) {
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            this.id = user.getId();
            this.username = user.getUsername();
            this.password = user.getPassword();
            this.authorities = authorities;
        } else {
            throw new IllegalArgumentException("User Optional cannot be empty for CustomUserDetails.");
        }
    }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    public String getId() {
        return id;
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
}