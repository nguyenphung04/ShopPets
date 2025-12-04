package com.pvn.dacn.controller;

import com.pvn.dacn.dto.PetCreateDTO;
import com.pvn.dacn.dto.PetUpdateDTO;
import com.pvn.dacn.entity.Pet;
import com.pvn.dacn.service.PetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/pets")
public class PetController {
    @Autowired
    private PetService petService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPet(
            @ModelAttribute PetCreateDTO request,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        try {
            return ResponseEntity.ok(petService.createPet(request, file));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    List<Pet> getPets(){
        return petService.getPets();
    }

    @GetMapping("/{id}")
    Pet getPet(@PathVariable String id){
        return petService.getPet(id);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updatePet(
            @PathVariable String id,
            @ModelAttribute PetUpdateDTO request,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        try {
            return ResponseEntity.ok(petService.updatePet(id, request, file));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public void deletePet(@PathVariable String id){
        petService.delPet(id);
    }
}
