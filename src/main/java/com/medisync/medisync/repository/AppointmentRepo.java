package com.medisync.medisync.repository;

import com.medisync.medisync.entity.Appointment;
import com.medisync.medisync.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepo extends MongoRepository<Appointment,String> {

    List<Appointment> findByDoctorId(String doctorId);

    List<Appointment> findByPatientId(String patientId);


}
