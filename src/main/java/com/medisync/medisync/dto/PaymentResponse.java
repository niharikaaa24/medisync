package com.medisync.medisync.dto;

import com.medisync.medisync.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentResponse {

    private String sessionId;
    private Status status;
    private String message;
    private String sessionUrl;
}
