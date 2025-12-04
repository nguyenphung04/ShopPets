package com.pvn.dacn.config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "dqkhy4odr");
        config.put("api_key", "926789777515269");
        config.put("api_secret", "vDBpRu94c3ifNWszDW97YQn_p-E");
        return new Cloudinary(config);
    }
}