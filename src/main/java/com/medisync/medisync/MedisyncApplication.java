package com.medisync.medisync;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@Slf4j
@SpringBootApplication
public class MedisyncApplication {

	public static void main(String[] args) {

		log.info("🟢 Medisync app is starting...");
		SpringApplication.run(MedisyncApplication.class, args);
	}

}
