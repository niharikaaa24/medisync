package com.medisync.medisync.controller;
import com.medisync.medisync.entity.Appointment;
import com.medisync.medisync.entity.Status;
import com.medisync.medisync.service.AppointmentService;
import com.medisync.medisync.service.UserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.FieldError;
import com.medisync.medisync.dto.PaymentResponse;
import com.medisync.medisync.dto.PaymentRequest;
import org.springframework.web.client.RestTemplate;
import com.medisync.medisync.entity.User;
import java.math.BigDecimal;
import java.util.*;
import com.medisync.medisync.service.NotificationService;

@RestController
@RequestMapping("/appointment")
@Slf4j
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserService userService;
    private final NotificationService notificationService;
    private final RestTemplate restTemplate;

    private final String PAYMENT_SERVICE_URL = "http://localhost:8000/api/payments";

    @Autowired
    public AppointmentController(AppointmentService appointmentService, UserService userService, NotificationService notificationService, RestTemplate restTemplate) {
        this.appointmentService = appointmentService;
        this.userService = userService;
        this.notificationService = notificationService;
        this.restTemplate = restTemplate;
    }

    @GetMapping("/all")
    public ResponseEntity<List<Appointment>> getAllApp() {
        List<Appointment> appointments = appointmentService.findAllApp();
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Appointment>> getAppById(@PathVariable String id) {
        Optional<Appointment> appointment = appointmentService.findAppById(id);
        if (appointment.isPresent()) {
            return new ResponseEntity<>(appointment, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/patient")
    public ResponseEntity<List<Appointment>> getPatientAppointments() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return ResponseEntity.ok(appointmentService.getAppointmentsForPatient(username));
    }

    @GetMapping("/doctor")
    public ResponseEntity<List<Appointment>> getDoctorAppointments() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return ResponseEntity.ok(appointmentService.getAppointmentsForDoctor(username));
    }

    @PostMapping
    public ResponseEntity<?> createApp(@Valid @RequestBody Appointment appointment) {
        try {
            appointment.setStatus(Status.PENDING);
            Appointment savedAppointment = appointmentService.saveApp(appointment); // Notifications are now handled in the service

            String doctorName = userService.findUserById(savedAppointment.getDoctorId()).map(User::getUsername).orElse("Unknown Doctor");

            PaymentRequest productRequest = new PaymentRequest();
            productRequest.setName("Appointment with Dr. " + doctorName);
            productRequest.setAmount(BigDecimal.valueOf(1000L));
            productRequest.setCurrency("INR");
            productRequest.setAppointmentId(savedAppointment.getId());
            productRequest.setPatientId(savedAppointment.getPatientId());
            productRequest.setDoctorId(savedAppointment.getDoctorId());
            productRequest.setSuccessUrl("http://localhost:3000/payment-success");
            productRequest.setCancelUrl("http://localhost:3000/appointments");

            ResponseEntity<PaymentResponse> paymentResponseEntity = restTemplate.postForEntity(
                    PAYMENT_SERVICE_URL + "/checkout",
                    productRequest,
                    PaymentResponse.class
            );

            if (paymentResponseEntity.getStatusCode() == HttpStatus.OK && paymentResponseEntity.getBody() != null) {
                PaymentResponse paymentResponse = paymentResponseEntity.getBody();
                return new ResponseEntity<>(paymentResponse, HttpStatus.OK);
            } else {
                savedAppointment.setStatus(Status.CANCELLED);
                appointmentService.saveApp(savedAppointment);
                log.error("Failed to initiate payment. Status: {}", paymentResponseEntity.getStatusCode());
                return new ResponseEntity<>("Failed to initiate payment.", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            log.error("Error creating appointment or initiating payment: {}", e.getMessage(), e);
            Map<String, String> errorResponse = Collections.singletonMap("message", "Error creating appointment: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteApp(@PathVariable String id) {
        try {
            Optional<Appointment> appointmentToDeleteOpt = appointmentService.findAppById(id);
            if (appointmentToDeleteOpt.isPresent()) {
                appointmentService.deleteAppById(id); // The service should handle notifications
                return new ResponseEntity(HttpStatus.OK);
            } else {
                return new ResponseEntity(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            log.error("Error deleting appointment with ID {}: {}", id, e.getMessage(), e);
            return new ResponseEntity(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable String id, @RequestBody Appointment updatedAppointment) {
        Optional<Appointment> existingAppointmentOpt = appointmentService.findAppById(id);

        if (existingAppointmentOpt.isPresent()) {
            Appointment existingAppointment = existingAppointmentOpt.get();

            if (updatedAppointment.getAppointmentDate() != null && !updatedAppointment.getAppointmentDate().isBlank()) {
                existingAppointment.setAppointmentDate(updatedAppointment.getAppointmentDate());
            }
            if (updatedAppointment.getAppointmentTime() != null && !updatedAppointment.getAppointmentTime().isBlank()) {
                existingAppointment.setAppointmentTime(updatedAppointment.getAppointmentTime());
            }
            if (updatedAppointment.getReason() != null && !updatedAppointment.getReason().isBlank()) {
                existingAppointment.setReason(updatedAppointment.getReason());
            }
            if (updatedAppointment.getStatus() != null) {
                existingAppointment.setStatus(updatedAppointment.getStatus());
            }
            if (updatedAppointment.getDoctorId() != null && !updatedAppointment.getDoctorId().isBlank()) {
                existingAppointment.setDoctorId(updatedAppointment.getDoctorId());
            }
            if (updatedAppointment.getPatientId() != null && !updatedAppointment.getPatientId().isBlank()) {
                existingAppointment.setPatientId(updatedAppointment.getPatientId());
            }

            Appointment savedAppointment = appointmentService.saveApp(existingAppointment); // Notifications are now handled in the service
            return new ResponseEntity<>(savedAppointment, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }
}