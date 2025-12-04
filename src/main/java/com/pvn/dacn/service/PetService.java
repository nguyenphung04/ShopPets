package com.pvn.dacn.service;

import com.pvn.dacn.dto.PetCreateDTO;
import com.pvn.dacn.dto.PetUpdateDTO;
import com.pvn.dacn.entity.Category;
import com.pvn.dacn.entity.Pet;
import com.pvn.dacn.repository.CategoryRepository;
import com.pvn.dacn.repository.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class PetService {
    @Autowired
    private PetRepository petRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public Pet createPet(PetCreateDTO request, MultipartFile file) throws IOException {
        Pet pet = new Pet();

        pet.setName(request.getName());
        pet.setAge(request.getAge());
        pet.setGender(request.getGender());
        pet.setColor(request.getColor());
        pet.setPrice(request.getPrice());
        pet.setOrigin(request.getOrigin());
        pet.setHealth(request.getHealth());
        pet.setCharacteristic(request.getCharacteristic());

        if (file != null && !file.isEmpty()) {
            String imgUrl = cloudinaryService.uploadImage(file);
            pet.setImg_url(imgUrl);
        } else if (request.getImg_url() != null && !request.getImg_url().isEmpty()) {
            pet.setImg_url(request.getImg_url());
        } else {
            pet.setImg_url("https://via.placeholder.com/300?text=No+Image");
        }

        if (request.getCategoryId() != null && !request.getCategoryId().isEmpty()) {
            Category cat = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));
            pet.setCategory(cat);
        }

        return petRepository.save(pet);
    }

    public List<Pet> getPets(){
        return petRepository.findAll();
    }

    public Pet getPet(String id){
        return petRepository.findById(id).orElseThrow(()-> new RuntimeException("Cannot find"));
    }

    public Pet updatePet(String id, PetUpdateDTO request, MultipartFile file) throws IOException {
        Pet pet = getPet(id);

        if (request.getName() != null) pet.setName(request.getName());
        pet.setAge(request.getAge());
        pet.setGender(request.getGender());
        pet.setOrigin(request.getOrigin());

        if (request.getColor() != null) pet.setColor(request.getColor());
        if (request.getPrice() > 0) pet.setPrice(request.getPrice());
        if (request.getHealth() != null) pet.setHealth(request.getHealth());
        if (request.getCharacteristic() != null) pet.setCharacteristic(request.getCharacteristic());

        if (file != null && !file.isEmpty()) {
            String imgUrl = cloudinaryService.uploadImage(file);
            pet.setImg_url(imgUrl);
        } else if (request.getImg_url() != null && !request.getImg_url().isEmpty()) {
            pet.setImg_url(request.getImg_url());
        }

        if (request.getCategoryId() != null && !request.getCategoryId().isEmpty()) {
            Category cat = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));
            pet.setCategory(cat);
        }

        return petRepository.save(pet);
    }

    public void delPet(String id){
        petRepository.delete(getPet(id));
    }
}
