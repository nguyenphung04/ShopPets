package com.pvn.dacn.service;

import com.pvn.dacn.dto.CategoryCreateDTO;
import com.pvn.dacn.dto.CategoryUpdateDTO;
import com.pvn.dacn.entity.Category;
import com.pvn.dacn.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    public Category createRequest(CategoryCreateDTO request){
        Category category = new Category();
        category.setName(request.getName());
        return categoryRepository.save(category);
    }

    public List<Category> getCategories(){
        return categoryRepository.findAll();
    }

    public Category getCategory(String id){
        return categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Cannot find"));
    }

    public Category updateRequest(String id, CategoryUpdateDTO request){
        Category category = getCategory(id);

        category.setName(request.getName());
        return categoryRepository.save(category);
    }

    public void delCategory(String id){
        categoryRepository.delete(getCategory(id));
    }

}
