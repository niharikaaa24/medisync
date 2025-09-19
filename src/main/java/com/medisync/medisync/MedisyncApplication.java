package com.medisync.medisync;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@Slf4j
@EnableCaching
@SpringBootApplication
@EnableDiscoveryClient
public class MedisyncApplication {

	public static void main(String[] args) {

		log.info("🟢 Medisync app is starting...");
		SpringApplication.run(MedisyncApplication.class, args);
	}

}
