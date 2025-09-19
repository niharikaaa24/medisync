
package com.medisync.medisync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LoginResponse {
    private String jwt;
    private String role;

    public LoginResponse(String jwt, String role) {
        this.jwt = jwt;
        this.role = role;
    }

}
