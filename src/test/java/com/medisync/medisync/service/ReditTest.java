package com.medisync.medisync.service;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;

@SpringBootTest
public class ReditTest {

    @Autowired
    private RedisTemplate redisTemplate;

    @Disabled
    @Test
    void testSendNoti()
    {
redisTemplate.opsForValue().set("noti", "Hi");
Object msg= redisTemplate.opsForValue().get("noti");
        System.out.println(msg);
    }
}
